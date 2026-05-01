const express = require('express');
const axios = require('axios');

const { isOnTopic } = require('./services/topicGuard');
const { detectIntent } = require('./services/router');
const { askLLM } = require('./services/llm');

const Session = require('./models/session');
const Message = require('./models/message');

require('./services/db');

const app = express();
app.use(express.json());

const CENTRAL_API_URL    = process.env.CENTRAL_API_URL;
const CENTRAL_API_TOKEN  = process.env.CENTRAL_API_TOKEN;
const ANALYTICS_URL      = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:8003';
const RENTAL_URL         = process.env.RENTAL_SERVICE_URL    || 'http://rental-service:8002';


// ================= STATUS =================
app.get('/status', (req, res) => {
    res.json({ service: 'agentic-service', status: 'OK' });
});


// ================= CHAT =================
app.post('/chat', async (req, res) => {
    try {
        const { sessionId, message } = req.body;

        // ===== 0. INPUT VALIDATION =====
        if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
            return res.status(400).json({ error: "sessionId is required" });
        }
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ error: "message is required" });
        }

        // ===== 1. TOPIC GUARD =====
        if (!isOnTopic(message)) {
            return res.json({
                sessionId,
                reply: "Sorry, I only answer RentPi-related questions."
            });
        }

        // ===== 2. LOAD HISTORY =====
        const history = await Message.find({ sessionId }).sort({ timestamp: 1 });

        // ===== 3. INTENT =====
        const intent = detectIntent(message);

        let data = null;

        // ===== 4. FETCH REAL DATA =====
        try {
            if (intent === "topCategory") {
                const response = await axios.get(
                    `${CENTRAL_API_URL}/api/data/rentals/stats`,
                    {
                        params: { group_by: 'category' },
                        headers: { Authorization: `Bearer ${CENTRAL_API_TOKEN}` }
                    }
                );
                data = response.data.data;
            }

            else if (intent === "recommendations") {
                const today = new Date().toISOString().split("T")[0];
                const response = await axios.get(
                    `${ANALYTICS_URL}/analytics/recommendations`,
                    { params: { date: today, limit: 5 } }
                );
                data = response.data;
            }

            else if (intent === "peak") {
                const response = await axios.get(
                    `${ANALYTICS_URL}/analytics/peak-window`,
                    { params: { from: '2024-01', to: '2024-06' } }
                );
                data = response.data;
            }

            else if (intent === "surge") {
                const now = new Date();
                const month = now.toISOString().slice(0, 7);
                const response = await axios.get(
                    `${ANALYTICS_URL}/analytics/surge-days`,
                    { params: { month } }
                );
                data = response.data;
            }

            else {
                data = "No structured data available for this question.";
            }

        } catch (err) {
            return res.json({
                sessionId,
                reply: "Data not available right now. Please try again later."
            });
        }

        // ===== 5. BUILD PROMPT =====
        const historyText = history
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');

        const prompt = `You are a helpful assistant for RentPi, a rental marketplace platform.

${historyText ? `Conversation so far:\n${historyText}\n` : ''}
User: ${message}

Relevant data:
${JSON.stringify(data, null, 2)}

Rules:
- Answer using ONLY the data above.
- Do NOT invent, guess, or extrapolate beyond the data.
- If the data does not contain enough information, say "I don't have enough data to answer that."
- Be concise and friendly.`;

        // ===== 6. LLM =====
        const reply = await askLLM(prompt);

        // ===== 7. SAVE MESSAGES =====
        await Message.create({ sessionId, role: "user",      content: message });
        await Message.create({ sessionId, role: "assistant", content: reply   });

        // ===== 8. SESSION UPSERT =====
        let session = await Session.findOne({ sessionId });

        if (!session) {
            const namePrompt = `Give a short 3-5 word chat title for this message. Reply with ONLY the title, nothing else: "${message}"`;
            const name = await askLLM(namePrompt);

            await Session.create({
                sessionId,
                name: name.trim().slice(0, 80),
                lastMessageAt: new Date()
            });
        } else {
            session.lastMessageAt = new Date();
            await session.save();
        }

        res.json({ sessionId, reply });

    } catch (err) {
        console.error('chat error:', err.message);
        res.status(500).json({ error: "Internal error" });
    }
});


// ================= LIST SESSIONS =================
app.get('/chat/sessions', async (req, res) => {
    try {
        const sessions = await Session.find().sort({ lastMessageAt: -1 });

        res.json({
            sessions: sessions.map(s => ({
                sessionId:     s.sessionId,
                name:          s.name,
                lastMessageAt: s.lastMessageAt
            }))
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sessions" });
    }
});


// ================= SESSION HISTORY =================
app.get('/chat/:sessionId/history', async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session  = await Session.findOne({ sessionId });
        const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        res.json({
            sessionId,
            name:     session.name,
            messages: messages.map(m => ({
                role:      m.role,
                content:   m.content,
                timestamp: m.timestamp
            }))
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});


// ================= DELETE SESSION =================
app.delete('/chat/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        await Session.deleteOne({ sessionId });
        await Message.deleteMany({ sessionId });

        res.json({ message: "Session deleted", sessionId });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete session" });
    }
});


// ================= START =================
app.listen(8004, () => {
    console.log("agentic-service running on port 8004");
});
