const express = require('express');
const axios = require('axios');

const { isOnTopic } = require('./services/topicGuard');
const { detectIntent } = require('./services/router');
const { askLLM } = require('./services/llm');

const Session = require('./models/session');
const Message = require('./models/message');

require('./services/db'); // connect Mongo

const app = express();
app.use(express.json());


// ================= STATUS =================
app.get('/status', (req, res) => {
    res.json({ service: 'agentic-service', status: 'OK' });
});


// ================= CHAT =================
app.post('/chat', async (req, res) => {
    try {
        const { sessionId, message } = req.body;

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

        // ===== 4. FETCH DATA =====
        try {
            if (intent === "topCategory") {
                const response = await axios.get(
                    'https://technocracy.brittoo.xyz/api/data/rentals/stats?group_by=category',
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.CENTRAL_API_TOKEN}`
                        }
                    }
                );
                data = response.data.data;
            }

            else if (intent === "recommendations") {
                const today = new Date().toISOString().split("T")[0];

                const response = await axios.get(
                    `http://analytics-service:8003/analytics/recommendations?date=${today}&limit=5`
                );
                data = response.data;
            }

            else if (intent === "peak") {
                const response = await axios.get(
                    'http://analytics-service:8003/analytics/peak-window?from=2024-01&to=2024-06'
                );
                data = response.data;
            }

            else if (intent === "surge") {
                const response = await axios.get(
                    'http://analytics-service:8003/analytics/surge-days?month=2024-03'
                );
                data = response.data;
            }

            else {
                data = "No structured data available";
            }

        } catch (err) {
            return res.json({
                sessionId,
                reply: "Data not available right now."
            });
        }

        // ===== 5. BUILD PROMPT =====
        const historyText = history
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');

        const prompt = `
You are RentPi assistant.

Conversation:
${historyText}

User: ${message}

Data:
${JSON.stringify(data)}

Rules:
- Use ONLY the data
- Do NOT guess
- If data missing → say not available
`;

        // ===== 6. LLM =====
        const reply = await askLLM(prompt);

        // ===== 7. SAVE MESSAGES =====
        await Message.create({
            sessionId,
            role: "user",
            content: message
        });

        await Message.create({
            sessionId,
            role: "assistant",
            content: reply
        });

        // ===== 8. SESSION HANDLING =====
        let session = await Session.findOne({ sessionId });

        if (!session) {
            // generate session name
            const namePrompt = `Give a short 3-5 word title: ${message}`;
            const name = await askLLM(namePrompt);

            await Session.create({
                sessionId,
                name,
                lastMessageAt: new Date()
            });
        } else {
            session.lastMessageAt = new Date();
            await session.save();
        }

        // ===== RESPONSE =====
        res.json({
            sessionId,
            reply
        });

    } catch (err) {
        res.status(500).json({ error: "chat error" });
    }
});


// ================= GET SESSIONS =================
app.get('/chat/sessions', async (req, res) => {
    const sessions = await Session.find().sort({ lastMessageAt: -1 });

    res.json({
        sessions: sessions.map(s => ({
            sessionId: s.sessionId,
            name: s.name,
            lastMessageAt: s.lastMessageAt
        }))
    });
});


// ================= GET HISTORY =================
app.get('/chat/:sessionId/history', async (req, res) => {
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId });
    const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });

    res.json({
        sessionId,
        name: session?.name,
        messages
    });
});


// ================= DELETE SESSION =================
app.delete('/chat/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    await Session.deleteOne({ sessionId });
    await Message.deleteMany({ sessionId });

    res.json({ message: "Session deleted" });
});


// ================= START =================
app.listen(8004, () => {
    console.log("agentic-service running on 8004");
});