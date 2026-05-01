const axios = require('axios');

const API_KEY  = process.env.LLM_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function askLLM(prompt) {
    try {
        const res = await axios.post(
            GROQ_URL,
            {
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return res.data.choices[0].message.content;
    } catch (err) {
        const detail = err.response?.data?.error?.message || err.message;
        console.error('[LLM ERROR]', detail);
        return "Error generating response";
    }
}

module.exports = { askLLM };
