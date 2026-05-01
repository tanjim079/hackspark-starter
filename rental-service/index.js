const express = require('express');
const app = express();

app.get('/status', (req, res) => {
    res.json({
        service: 'rental-service',
        status: 'OK'
    });
});

app.listen(8002, () => {
    console.log('rental-service running on port 8002');
});