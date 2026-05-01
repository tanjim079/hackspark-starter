const mongoose = require('../services/db');

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, unique: true },
    name: String,
    createdAt: { type: Date, default: Date.now },
    lastMessageAt: Date
});

module.exports = mongoose.model('Session', sessionSchema);