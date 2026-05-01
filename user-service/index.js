const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(express.json());

const users = []; // temporary in-memory DB
const SECRET = "supersecretkey";
const BASE_URL = "https://technocracy.brittoo.xyz";

// ===================== P1 =====================
app.get('/status', (req, res) => {
    res.json({ service: 'user-service', status: 'OK' });
});

// ===================== P2 =====================

// REGISTER
app.post('/users/register', async (req, res) => {
    const { name, email, password } = req.body;

    const existing = users.find(u => u.email === email);
    if (existing) {
        return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword
    };

    users.push(user);

    const token = jwt.sign({ id: user.id, email }, SECRET);

    res.json({ token });
});

// LOGIN
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email }, SECRET);

    res.json({ token });
});

// ME (protected)
app.get('/users/me', (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, SECRET);

        res.json(decoded);
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});


// ===================== P6 =====================
// Loyalty Discount

app.get('/users/:id/discount', async (req, res) => {
    try {
        const userId = req.params.id;

        const response = await axios.get(
            `${BASE_URL}/api/data/users/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CENTRAL_API_TOKEN}`
                }
            }
        );

        const score = response.data.securityScore;

        let discount = 0;

        if (score >= 80) discount = 20;
        else if (score >= 60) discount = 15;
        else if (score >= 40) discount = 10;
        else if (score >= 20) discount = 5;
        else discount = 0;

        res.json({
            userId: Number(userId),
            securityScore: score,
            discountPercent: discount
        });

    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(500).json({ error: "Failed to fetch user data" });
    }
});


// ===================== START SERVER =====================

app.listen(8001, () => {
    console.log("user-service running on 8001");
});