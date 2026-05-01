function detectIntent(message) {
    const m = message.toLowerCase();

    if (m.includes("most rented category")) return "topCategory";
    if (m.includes("availability")) return "availability";
    if (m.includes("recommend")) return "recommendations";
    if (m.includes("peak")) return "peak";
    if (m.includes("surge")) return "surge";

    return "unknown";
}

module.exports = { detectIntent };