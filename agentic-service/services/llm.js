const axios = require('axios');

const API_KEY = process.env.LLM_API_KEY; // put in .env

async function askLLM(prompt) {
    try {
        const res = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY,
            {
                contents: [{ parts: [{ text: prompt }] }]
            }
        );

        return res.data.candidates[0].content.parts[0].text;
    } catch (err) {
        return "Error generating response";
    }
}

module.exports = { askLLM };