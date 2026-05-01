const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const users = []; // temporary in-memory DB
const SECRET = "supersecretkey";

// ✅ P1 status (keep this)
app.get('/status', (req, res) => {
    res.json({ service: 'user-service', status: 'OK' });
});

// ✅ REGISTER
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

// ✅ LOGIN
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

// ✅ ME (protected)
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

app.listen(8001, () => {
    console.log("user-service running on 8001");
});