const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

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

// ✅ P1 status (keep this)
app.get('/status', (req, res) => {
    res.json({ service: 'user-service', status: 'OK' });
});

// ✅ REGISTER
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

// ✅ LOGIN
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

// ✅ ME (protected)
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

app.listen(8001, () => {
    console.log("user-service running on 8001");
});