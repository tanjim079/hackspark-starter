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

function isOnTopic(message) {
    const text = message.toLowerCase();
    return KEYWORDS.some(k => text.includes(k));
}

module.exports = { isOnTopic };
