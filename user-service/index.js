const express = require('express');
const app = express();

app.get('/status', (req, res) => {
    res.json({
        service: 'user-service',
        status: 'OK'
    });
});

app.listen(8001, () => {
    console.log('user-service running on port 8001');
});