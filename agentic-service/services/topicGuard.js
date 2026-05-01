// Root-word fragments so plurals and conjugations all match:
// "rent"    → rental, rentals, rented, renting
// "categor" → category, categories
// "availab" → available, availability
// "recommend" → recommend, recommendations
const KEYWORDS = [
    "rent",
    "product",
    "categor",
    "price",
    "discount",
    "availab",
    "renter",
    "owner",
    "rentpi",
    "booking",
    "gear",
    "surge",
    "peak",
    "trending",
    "recommend",
    "season"
];

function isOnTopic(msg) {
    const keywords = [
        "rental", "product", "category", "discount",
        "availability", "rent", "price", "surge", "peak", "trend"
    ];
    return keywords.some(k => msg.toLowerCase().includes(k));
}
module.exports = { isOnTopic };
