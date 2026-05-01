const KEYWORDS = [
    "rental", "product", "category", "price", "discount",
    "available", "availability", "renter", "owner",
    "rentpi", "booking", "gear", "surge", "peak", "trending"
];

function isOnTopic(message) {
    const text = message.toLowerCase();
    return KEYWORDS.some(k => text.includes(k));
}

module.exports = { isOnTopic };