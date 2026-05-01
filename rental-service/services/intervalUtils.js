function mergeIntervals(intervals) {
    if (!intervals.length) return [];

    intervals.sort((a, b) => new Date(a.start) - new Date(b.start));

    const merged = [intervals[0]];

    for (let i = 1; i < intervals.length; i++) {
        const last = merged[merged.length - 1];
        const current = intervals[i];

        if (new Date(current.start) <= new Date(last.end)) {
            last.end = new Date(
                Math.max(new Date(last.end), new Date(current.end))
            ).toISOString();
        } else {
            merged.push(current);
        }
    }

    return merged;
}

module.exports = { mergeIntervals };