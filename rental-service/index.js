const express = require('express');
const api = require('./services/centralApi');
const { setCategories, getCategories } = require('./services/cache');
const { mergeIntervals } = require('./services/intervalUtils');

const app = express();

// ===================== STATUS =====================
app.get('/status', (req, res) => {
    res.json({ service: 'rental-service', status: 'OK' });
});


// ===================== P5 =====================
app.get('/rentals/products', async (req, res) => {
    try {
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

        res.json(response.data);

    } catch {
        res.status(500).json({ error: "Failed to fetch products" });
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
            date: result.date,
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

        if (!productIds || !limit) {
            return res.status(400).json({ error: "productIds and limit required" });
        }

        const ids = [...new Set(productIds.split(",").map(Number))];
        const k = ids.length;

        if (k === 0 || k > 10) {
            return res.status(400).json({ error: "1-10 productIds required" });
        }

        limit = Number(limit);
        if (limit <= 0 || limit > 100) {
            return res.status(400).json({ error: "limit must be 1-100" });
        }

        const streams = await Promise.all(
            ids.map(id =>
                api.get('/api/data/rentals', { params: { product_id: id } })
            )
        );

        const lists = streams.map(r => r.data.data);

        const ptr = new Array(k).fill(0);
        const result = [];

        while (result.length < limit) {
            let minIdx = -1;
            let minDate = null;

            for (let i = 0; i < k; i++) {
                if (ptr[i] < lists[i].length) {
                    const item = lists[i][ptr[i]];

                    if (!minDate || new Date(item.rentalStart) < new Date(minDate)) {
                        minDate = item.rentalStart;
                        minIdx = i;
                    }
                }
            }

            if (minIdx === -1) break;

            const item = lists[minIdx][ptr[minIdx]];
            result.push({
                rentalId: item.id,
                productId: item.productId,
                rentalStart: item.rentalStart,
                rentalEnd: item.rentalEnd
            });

            ptr[minIdx]++;
        }

        res.json({ productIds: ids, limit, feed: result });

    } catch {
        res.status(500).json({ error: "merged feed error" });
    }
});


// ===================== START =====================
app.listen(8002, () => console.log("rental-service running"));