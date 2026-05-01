const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Initialize DB table
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255)
    );
`).catch(err => console.error("DB Init error:", err));

const SECRET = process.env.JWT_SECRET || "supersecretkey";
const BASE_URL = process.env.CENTRAL_API_URL || "https://technocracy.brittoo.xyz";

// ===================== P1 =====================
app.get('/status', (req, res) => {
    res.json({ service: 'user-service', status: 'OK' });
});

// ===================== P2 =====================

// REGISTER
app.post('/users/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );
        
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET);

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// LOGIN
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET);

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ME (protected)
app.get('/users/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, SECRET);
        
        const result = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [decoded.id]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid token" });
        }

        res.json(result.rows[0]);
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