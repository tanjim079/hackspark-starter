const KEYWORDS = [
    "rental", "product", "category", "price", "discount",
    "available", "availability", "renter", "owner",
    "rentpi", "booking", "gear", "surge", "peak", "trending"
];

function isOnTopic(msg) {
    const keywords = [
        "rental", "product", "category", "discount",
        "availability", "rent", "price", "surge", "peak", "trend"
    ];
    return keywords.some(k => msg.toLowerCase().includes(k));
}
module.exports = { isOnTopic };