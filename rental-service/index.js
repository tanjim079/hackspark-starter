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

        const rentals = response.data.data;

        const intervals = rentals.map(r => ({
            start: r.rentalStart,
            end: r.rentalEnd
        }));

        const merged = mergeIntervals(intervals);

        let available = true;

        for (const interval of merged) {
            const overlap =
                !(toDate < new Date(interval.start) ||
                    fromDate > new Date(interval.end));

            if (overlap) {
                available = false;
                break;
            }
        }

        const freeWindows = [];
        let current = new Date(fromDate);

        for (const interval of merged) {
            const start = new Date(interval.start);
            const end = new Date(interval.end);

            if (end < fromDate) continue;
            if (start > toDate) break;

            if (current < start) {
                freeWindows.push({
                    start: current.toISOString().split("T")[0],
                    end: start.toISOString().split("T")[0]
                });
            }

            if (current < end) {
                current = new Date(end);
            }
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

        if (!year) {
            return res.status(400).json({ error: "year required" });
        }

        const yearStart = new Date(`${year}-01-01`);
        const yearEnd = new Date(`${year}-12-31`);

        const response = await api.get('/api/data/rentals', {
            params: { product_id: productId }
        });

        const rentals = response.data.data;

        const intervals = rentals.map(r => ({
            start: r.rentalStart,
            end: r.rentalEnd
        }));

        const merged = mergeIntervals(intervals);

        let maxDays = 0;
        let bestStart = yearStart;
        let bestEnd = yearStart;

        let prevEnd = new Date(yearStart);

        for (const interval of merged) {
            const start = new Date(interval.start);
            const end = new Date(interval.end);

            if (end < yearStart) continue;
            if (start > yearEnd) break;

            const gapDays = (start - prevEnd) / (1000 * 60 * 60 * 24);

            if (gapDays > maxDays) {
                maxDays = gapDays;
                bestStart = prevEnd;
                bestEnd = start;
            }

            if (prevEnd < end) {
                prevEnd = end;
            }
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

        if (!from || !to || !k) {
            return res.status(400).json({ error: "from, to, k required" });
        }

        const kNum = Number(k);
        if (kNum <= 0) {
            return res.status(400).json({ error: "k must be positive" });
        }

        const monthRegex = /^\d{4}-\d{2}$/;
        if (!monthRegex.test(from) || !monthRegex.test(to)) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        if (from > to) {
            return res.status(400).json({ error: "from cannot be after to" });
        }

        let allData = [];

        let current = new Date(from + "-01");
        const end = new Date(to + "-01");

        while (current <= end) {
            const monthStr = current.toISOString().slice(0, 7);

            const response = await api.get('/api/data/rentals/stats', {
                params: {
                    group_by: 'date',
                    month: monthStr
                }
            });

            allData.push(...response.data.data);
            current.setMonth(current.getMonth() + 1);
        }

        if (!allData.length) {
            return res.status(404).json({ error: "No data found" });
        }

        const heap = [];

        for (const item of allData) {
            heap.push(item);
            heap.sort((a, b) => a.count - b.count);
            if (heap.length > kNum) heap.shift();
        }

        if (heap.length < kNum) {
            return res.status(404).json({ error: "k exceeds available data" });
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

        if (!k || k <= 0) {
            return res.status(400).json({ error: "k must be positive" });
        }

        const response = await api.get('/api/data/rentals', {
            params: { renter_id: userId }
        });

        const rentals = response.data.data;

        if (!rentals.length) {
            return res.json({
                userId: Number(userId),
                topCategories: []
            });
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

        const productCategoryMap = {};
        for (const p of products) {
            productCategoryMap[p.id] = p.category;
        }

        const categoryCount = {};

        for (const r of rentals) {
            const category = productCategoryMap[r.productId];
            if (!category) continue;

            categoryCount[category] = (categoryCount[category] || 0) + 1;
        }

        const result = Object.entries(categoryCount)
            .map(([category, count]) => ({
                category,
                rentalCount: count
            }))
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


// ===================== START SERVER =====================
app.listen(8002, () => console.log("rental-service running"));