const axios = require('axios');

const api = axios.create({
    baseURL: "https://technocracy.brittoo.xyz",
    headers: {
        Authorization: `Bearer ${process.env.CENTRAL_API_TOKEN}`
    }
});

module.exports = api;