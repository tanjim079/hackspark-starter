const express = require('express');
const NodeCache = require('node-cache');
const api = require('./services/centralApi');
const { setCategories, getCategories } = require('./services/cache');
const { mergeIntervals } = require('./services/intervalUtils');

const app = express();
const cache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

// ===================== STATUS =====================
app.get('/status', (req, res) => {
    res.json({ service: 'rental-service', status: 'OK' });
});


// ===================== P5 =====================
app.get('/rentals/products', async (req, res) => {
    try {
        const cacheKey = `products_${JSON.stringify(req.query)}`;
        const cachedResponse = cache.get(cacheKey);
        
        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        const { category } = req.query;

        let categories = getCategories();
        if (!categories) {
            const response = await api.get('/api/data/categories');
            categories = response.data.categories;
            setCategories(categories);
        }

        if (category && !categories.includes(category)) {
            return res.status(400).json({
                error: "Invalid category",
                validCategories: categories
            });
        }

        const response = await api.get('/api/data/products', {
            params: req.query
        });

        cache.set(cacheKey, response.data);
        res.json(response.data);

    } catch (err) {
        res.status(err.response?.status || 500).json({ error: "Failed to fetch products" });
    }
});


// ===================== P3 =====================
app.get('/rentals/products/:id', async (req, res) => {
    try {
        const cacheKey = `product_${req.params.id}`;
        const cachedResponse = cache.get(cacheKey);
        
        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        const response = await api.get(`/api/data/products/${req.params.id}`);

        cache.set(cacheKey, response.data);
        res.json(response.data);

    } catch (err) {
        res.status(err.response?.status || 500).json({
            error: "Central API error",
            message: err.response?.data || err.message
        });
    }
});


// ===================== P7 =====================
app.get('/rentals/products/:id/availability', async (req, res) => {
    try {
        const { from, to } = req.query;
        const productId = Number(req.params.id);

        if (!from || !to) {
            return res.status(400).json({ error: "from and to required" });
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);

        const response = await api.get('/api/data/rentals', {
            params: { product_id: productId }
        });

        const intervals = response.data.data.map(r => ({
            start: r.rentalStart,
            end: r.rentalEnd
        }));

        const merged = mergeIntervals(intervals);

        let available = true;

        for (const i of merged) {
            const overlap =
                !(toDate < new Date(i.start) || fromDate > new Date(i.end));

            if (overlap) {
                available = false;
                break;
            }
        }

        const freeWindows = [];
        let current = new Date(fromDate);

        for (const i of merged) {
            const start = new Date(i.start);
            const end = new Date(i.end);

            if (end < fromDate) continue;
            if (start > toDate) break;

            if (current < start) {
                freeWindows.push({
                    start: current.toISOString().split("T")[0],
                    end: start.toISOString().split("T")[0]
                });
            }

            if (current < end) current = end;
        }

        if (current < toDate) {
            freeWindows.push({
                start: current.toISOString().split("T")[0],
                end: toDate.toISOString().split("T")[0]
            });
        }

        res.json({
            productId,
            from,
            to,
            available,
            busyPeriods: merged.map(i => ({
                start: i.start.split("T")[0],
                end: i.end.split("T")[0]
            })),
            freeWindows
        });

    } catch {
        res.status(500).json({ error: "availability error" });
    }
});


// ===================== P10 =====================
app.get('/rentals/products/:id/free-streak', async (req, res) => {
    try {
        const { year } = req.query;
        const productId = Number(req.params.id);

        const yearStart = new Date(`${year}-01-01`);
        const yearEnd = new Date(`${year}-12-31`);

        const response = await api.get('/api/data/rentals', {
            params: { product_id: productId }
        });

        const intervals = mergeIntervals(
            response.data.data.map(r => ({
                start: r.rentalStart,
                end: r.rentalEnd
            }))
        );

        let maxDays = 0;
        let bestStart = yearStart;
        let bestEnd = yearStart;

        let prevEnd = new Date(yearStart);

        for (const i of intervals) {
            const start = new Date(i.start);
            const end = new Date(i.end);

            if (end < yearStart) continue;
            if (start > yearEnd) break;

            const gap = (start - prevEnd) / (1000 * 60 * 60 * 24);

            if (gap > maxDays) {
                maxDays = gap;
                bestStart = prevEnd;
                bestEnd = start;
            }

            if (prevEnd < end) prevEnd = end;
        }

        const finalGap = (yearEnd - prevEnd) / (1000 * 60 * 60 * 24);
        if (finalGap > maxDays) {
            maxDays = finalGap;
            bestStart = prevEnd;
            bestEnd = yearEnd;
        }

        res.json({
            productId,
            year,
            longestFreeStreak: {
                from: bestStart.toISOString().split("T")[0],
                to: bestEnd.toISOString().split("T")[0],
                days: Math.floor(maxDays)
            }
        });

    } catch {
        res.status(500).json({ error: "free streak error" });
    }
});


// ===================== P8 =====================
app.get('/rentals/kth-busiest-date', async (req, res) => {
    try {
        const { from, to, k } = req.query;

        const kNum = Number(k);

        let allData = [];
        let current = new Date(from + "-01");
        const end = new Date(to + "-01");

        while (current <= end) {
            const monthStr = current.toISOString().slice(0, 7);

            const response = await api.get('/api/data/rentals/stats', {
                params: { group_by: 'date', month: monthStr }
            });

            allData.push(...response.data.data);
            current.setMonth(current.getMonth() + 1);
        }

        const heap = [];

        for (const item of allData) {
            heap.push(item);
            heap.sort((a, b) => a.count - b.count);
            if (heap.length > kNum) heap.shift();
        }

        const result = heap[0];

        res.json({
            from,
            to,
            k: kNum,
            date: result.date.split('T')[0],
            rentalCount: result.count
        });

    } catch {
        res.status(500).json({ error: "kth busiest error" });
    }
});


// ===================== P9 =====================
app.get('/rentals/users/:id/top-categories', async (req, res) => {
    try {
        const userId = req.params.id;
        const k = Number(req.query.k);

        const response = await api.get('/api/data/rentals', {
            params: { renter_id: userId }
        });

        const rentals = response.data.data;

        if (!rentals.length) {
            return res.json({ userId: Number(userId), topCategories: [] });
        }

        const productIds = [...new Set(rentals.map(r => r.productId))];

        let products = [];

        for (let i = 0; i < productIds.length; i += 50) {
            const batch = productIds.slice(i, i + 50);

            const batchResponse = await api.get('/api/data/products/batch', {
                params: { ids: batch.join(",") }
            });

            products.push(...batchResponse.data.data);
        }

        const map = {};
        products.forEach(p => map[p.id] = p.category);

        const count = {};
        rentals.forEach(r => {
            const cat = map[r.productId];
            if (cat) count[cat] = (count[cat] || 0) + 1;
        });

        const result = Object.entries(count)
            .map(([category, rentalCount]) => ({ category, rentalCount }))
            .sort((a, b) => b.rentalCount - a.rentalCount)
            .slice(0, k);

        res.json({
            userId: Number(userId),
            topCategories: result
        });

    } catch {
        res.status(500).json({ error: "top categories error" });
    }
});


// ===================== P12 =====================
app.get('/rentals/merged-feed', async (req, res) => {
    try {
        let { productIds, limit } = req.query;

        let ids = [...new Set(productIds.split(',').map(Number))];
        const limitNum = Number(limit);

        const lists = [];

        for (const id of ids) {
            const response = await api.get('/api/data/rentals', {
                params: { product_id: id }
            });
            lists.push(response.data.data);
        }

        const heap = [];

        lists.forEach((list, i) => {
            if (list.length > 0) {
                heap.push({
                    item: list[0],
                    listIndex: i,
                    pointer: 0
                });
            }
        });

        const sortHeap = () => {
            heap.sort((a, b) =>
                new Date(a.item.rentalStart) - new Date(b.item.rentalStart)
            );
        };

        sortHeap();

        const result = [];

        while (heap.length && result.length < limitNum) {
            const smallest = heap.shift();

            result.push({
                rentalId: smallest.item.id,
                productId: smallest.item.productId,
                rentalStart: smallest.item.rentalStart,
                rentalEnd: smallest.item.rentalEnd
            });

            const { listIndex, pointer } = smallest;
            const next = pointer + 1;

            if (lists[listIndex][next]) {
                heap.push({
                    item: lists[listIndex][next],
                    listIndex,
                    pointer: next
                });
                sortHeap();
            }
        }

        res.json({
            productIds: ids,
            limit: limitNum,
            feed: result
        });

    } catch {
        res.status(500).json({ error: "merged feed error" });
    }
});


// ===================== START =====================
app.listen(8002, () => console.log("rental-service running"));