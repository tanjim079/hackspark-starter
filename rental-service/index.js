const express = require('express');
const axios = require('axios');

const app = express();

const BASE_URL = "https://technocracy.brittoo.xyz";
const TOKEN = process.env.CENTRAL_API_TOKEN;

// ✅ STATUS (keep for P1)
app.get('/status', (req, res) => {
    res.json({ service: 'rental-service', status: 'OK' });
});


// ✅ GET ALL PRODUCTS (with query params)
app.get('/rentals/products', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/data/products`, {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            },
            params: req.query   // forward ?category=&page=&limit=
        });

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
        const response = await axios.get(
            `${BASE_URL}/api/data/products/${req.params.id}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

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