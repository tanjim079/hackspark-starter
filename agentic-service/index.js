const express = require('express');
const app = express();

app.get('/status', (req, res) => {
    res.json({
        service: 'agentic-service',
        status: 'OK'
    });
});

app.listen(8004, () => {
    console.log('agentic-service running on port 8004');
});