const axios = require('axios');

const BASE_URL = "https://technocracy.brittoo.xyz";
const TOKEN = process.env.CENTRAL_API_TOKEN;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Bearer ${TOKEN}`
    }
});

module.exports = api;