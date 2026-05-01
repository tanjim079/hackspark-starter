const express = require('express');
const app = express();

app.get('/status', (req, res) => {
    res.json({
        service: 'analytics-service',
        status: 'OK'
    });
});

app.listen(8003, () => {
    console.log('analytics-service running on port 8003');
});