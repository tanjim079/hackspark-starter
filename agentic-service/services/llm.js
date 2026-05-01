const axios = require('axios');

const API_KEY = process.env.LLM_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

async function askLLM(prompt) {
    try {
        const res = await axios.post(
            GEMINI_URL,
            { contents: [{ parts: [{ text: prompt }] }] }
        );
        return res.data.candidates[0].content.parts[0].text;
    } catch (err) {
        const detail = err.response?.data?.error?.message || err.message;
        console.error('[LLM ERROR]', detail);
        return "Error generating response";
    }
}

module.exports = { askLLM };
