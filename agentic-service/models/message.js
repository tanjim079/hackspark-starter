const mongoose = require('../services/db');

const messageSchema = new mongoose.Schema({
    sessionId: String,
    role: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);