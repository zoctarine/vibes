export function calculatePageCount(text, wordsPerPage, format) {
    if (!text || text.trim().length === 0) {
        throw new Error("Empty text provided");
    }
    let effectiveWordsPerPage = wordsPerPage;
    if (!effectiveWordsPerPage && format) {
        switch (format) {
            case "standard":
                effectiveWordsPerPage = 250;
                break;
            case "manuscript":
                effectiveWordsPerPage = 300;
                break;
            case "book":
                effectiveWordsPerPage = 400;
                break;
            case "academic":
                effectiveWordsPerPage = 500;
                break;
        }
    }
    effectiveWordsPerPage = effectiveWordsPerPage || 250;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    return wordCount / effectiveWordsPerPage;
}
