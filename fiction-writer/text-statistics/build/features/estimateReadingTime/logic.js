export function estimateReadingTime(text, wordsPerMinute = 200) {
    if (!text || text.trim().length === 0) {
        throw new Error("Empty text provided");
    }
    if (wordsPerMinute <= 0) {
        throw new Error("Words per minute must be positive");
    }
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = wordCount / wordsPerMinute;
    if (minutes < 1) {
        return `${Math.ceil(minutes * 60)} seconds`;
    }
    else if (minutes < 60) {
        const mins = Math.floor(minutes);
        const secs = Math.ceil((minutes - mins) * 60);
        return `${mins} minute${mins !== 1 ? 's' : ''}${secs > 0 ? ` and ${secs} seconds` : ''}`;
    }
    else {
        const hours = Math.floor(minutes / 60);
        const mins = Math.ceil(minutes % 60);
        return `${hours} hour${hours !== 1 ? 's' : ''}${mins > 0 ? ` and ${mins} minutes` : ''}`;
    }
}
