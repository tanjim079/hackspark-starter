const express = require('express');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.get('/status', async (req, res) => {
    const services = {
        'user-service': 'http://user-service:8001/status',
        'rental-service': 'http://rental-service:8002/status',
        'analytics-service': 'http://analytics-service:8003/status',
        'agentic-service': 'http://agentic-service:8004/status',
    };

    const results = {};

    await Promise.all(
        Object.entries(services).map(async ([name, url]) => {
            try {
                const response = await axios.get(url);
                results[name] = response.data.status;
            } catch (err) {
                results[name] = 'UNREACHABLE';
            }
        })
    );

    res.json({
        service: 'api-gateway',
        status: 'OK',
        downstream: results
    });
});

// Proxy endpoints
app.use(createProxyMiddleware({ 
    target: 'http://user-service:8001', 
    changeOrigin: true,
    pathFilter: '/users'
}));
app.use(createProxyMiddleware({ 
    target: 'http://rental-service:8002', 
    changeOrigin: true,
    pathFilter: '/rentals'
}));
app.use(createProxyMiddleware({ 
    target: 'http://analytics-service:8003', 
    changeOrigin: true,
    pathFilter: '/analytics'
}));
app.use(createProxyMiddleware({
    target: 'http://agentic-service:8004',
    changeOrigin: true,
    pathFilter: '/chat'
}));

app.listen(8000, () => {
    console.log('api-gateway running on port 8000');
});