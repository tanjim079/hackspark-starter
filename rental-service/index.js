const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

const BASE_URL = process.env.CENTRAL_API_URL;
const TOKEN = process.env.CENTRAL_API_TOKEN;

// ✅ STATUS (keep for P1)
app.get('/status', (req, res) => {
    res.json({ service: 'rental-service', status: 'OK' });
});


// ✅ GET ALL PRODUCTS (with query params)
app.get('/rentals/products', async (req, res) => {
    try {
        const cacheKey = `products_${JSON.stringify(req.query)}`;
        const cachedResponse = cache.get(cacheKey);
        
        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        const response = await axios.get(`${BASE_URL}/api/data/products`, {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            },
            params: req.query   // forward ?category=&page=&limit=
        });

        cache.set(cacheKey, response.data);
        res.json(response.data);

    } catch (err) {
        res.status(err.response?.status || 500).json({
            error: "Central API error",
            message: err.response?.data || err.message
        });
    }
});


// ✅ GET PRODUCT BY ID
app.get('/rentals/products/:id', async (req, res) => {
    try {
        const cacheKey = `product_${req.params.id}`;
        const cachedResponse = cache.get(cacheKey);
        
        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        const response = await axios.get(
            `${BASE_URL}/api/data/products/${req.params.id}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        cache.set(cacheKey, response.data);
        res.json(response.data);

    } catch (err) {
        res.status(err.response?.status || 500).json({
            error: "Central API error",
            message: err.response?.data || err.message
        });
    }
});

app.listen(8002, () => {
    console.log("rental-service running on 8002");
});