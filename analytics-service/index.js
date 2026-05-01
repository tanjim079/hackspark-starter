const express = require('express');
const api = require('./services/centralApi');

const app = express();

// ================= STATUS =================
app.get('/status', (req, res) => {
    res.json({ service: 'analytics-service', status: 'OK' });
});


// ================= P11 =================
app.get('/analytics/peak-window', async (req, res) => {
    try {
        const { from, to } = req.query;

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
                params: { group_by: 'date', month: monthStr }
            });

            allData.push(...response.data.data);
            current.setMonth(current.getMonth() + 1);
        }

        // ===== fill missing days =====
        const map = {};
        allData.forEach(d => map[d.date] = d.count);

        const fullDates = [];
        let d = new Date(from + "-01");
        const last = new Date(to + "-31");

        while (d <= last) {
            const dateStr = d.toISOString().split("T")[0];
            fullDates.push({
                date: dateStr,
                count: map[dateStr] || 0
            });
            d.setDate(d.getDate() + 1);
        }

        if (fullDates.length < 7) {
            return res.status(400).json({ error: "Not enough data" });
        }

        // ===== sliding window =====
        let currentSum = 0;

        for (let i = 0; i < 7; i++) {
            currentSum += fullDates[i].count;
        }

        let maxSum = currentSum;
        let bestStart = 0;

        for (let i = 7; i < fullDates.length; i++) {
            currentSum += fullDates[i].count;
            currentSum -= fullDates[i - 7].count;

            if (currentSum > maxSum) {
                maxSum = currentSum;
                bestStart = i - 6;
            }
        }

        res.json({
            from,
            to,
            peakWindow: {
                from: fullDates[bestStart].date,
                to: fullDates[bestStart + 6].date,
                totalRentals: maxSum
            }
        });

    } catch {
        res.status(500).json({ error: "peak window error" });
    }
});


// ================= P13 =================
app.get('/analytics/surge-days', async (req, res) => {
    try {
        const { month } = req.query;

        const monthRegex = /^\d{4}-\d{2}$/;
        if (!monthRegex.test(month)) {
            return res.status(400).json({ error: "Invalid month format" });
        }

        const response = await api.get('/api/data/rentals/stats', {
            params: { group_by: 'date', month }
        });

        const raw = response.data.data;

        const map = {};
        raw.forEach(d => map[d.date] = d.count);

        const days = [];
        let d = new Date(month + "-01");

        while (d.getMonth() === new Date(month + "-01").getMonth()) {
            const dateStr = d.toISOString().split("T")[0];

            days.push({
                date: dateStr,
                count: map[dateStr] || 0
            });

            d.setDate(d.getDate() + 1);
        }

        const result = new Array(days.length).fill(null);
        const stack = [];

        for (let i = days.length - 1; i >= 0; i--) {
            while (
                stack.length &&
                days[stack[stack.length - 1]].count <= days[i].count
            ) {
                stack.pop();
            }

            if (stack.length) {
                const next = days[stack[stack.length - 1]];

                result[i] = {
                    date: days[i].date,
                    count: days[i].count,
                    nextSurgeDate: next.date,
                    daysUntil:
                        (new Date(next.date) - new Date(days[i].date)) /
                        (1000 * 60 * 60 * 24)
                };
            } else {
                result[i] = {
                    date: days[i].date,
                    count: days[i].count,
                    nextSurgeDate: null,
                    daysUntil: null
                };
            }

            stack.push(i);
        }

        res.json({ month, data: result });

    } catch {
        res.status(500).json({ error: "surge days error" });
    }
});


// ================= P14 =================
app.get('/analytics/recommendations', async (req, res) => {
    try {
        const { date, limit } = req.query;

        if (!date) {
            return res.status(400).json({ error: "date required" });
        }

        const limitNum = Number(limit);
        if (!limitNum || limitNum <= 0 || limitNum > 50) {
            return res.status(400).json({ error: "limit must be 1–50" });
        }

        const baseDate = new Date(date);
        if (isNaN(baseDate)) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        // ===== build 2-year windows =====
        const ranges = [];

        for (let i = 1; i <= 2; i++) {
            const d = new Date(baseDate);
            d.setFullYear(d.getFullYear() - i);

            const start = new Date(d);
            start.setDate(start.getDate() - 7);

            const end = new Date(d);
            end.setDate(end.getDate() + 7);

            ranges.push({ start, end });
        }

        // ===== fetch rentals =====
        let rentals = [];

        for (const r of ranges) {
            const response = await api.get('/api/data/rentals', {
                params: {
                    from: r.start.toISOString(),
                    to: r.end.toISOString()
                }
            });

            rentals.push(...response.data.data);
        }

        if (!rentals.length) {
            return res.json({ date, recommendations: [] });
        }

        // ===== count products =====
        const count = {};
        rentals.forEach(r => {
            count[r.productId] = (count[r.productId] || 0) + 1;
        });

        const top = Object.entries(count)
            .map(([productId, score]) => ({
                productId: Number(productId),
                score
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limitNum);

        const ids = top.map(t => t.productId);

        // ===== batch fetch products =====
        const response = await api.get('/api/data/products/batch', {
            params: { ids: ids.join(",") }
        });

        const productMap = {};
        response.data.data.forEach(p => {
            productMap[p.id] = p;
        });

        const recommendations = top.map(t => ({
            productId: t.productId,
            name: productMap[t.productId]?.name || "Unknown",
            category: productMap[t.productId]?.category || "Unknown",
            score: t.score
        }));

        res.json({ date, recommendations });

    } catch {
        res.status(500).json({ error: "recommendation error" });
    }
});


// ================= START =================
app.listen(8003, () => console.log("analytics-service running"));