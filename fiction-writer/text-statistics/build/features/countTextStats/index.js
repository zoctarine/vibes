import { z } from "zod";
import { countTextStats } from "./logic.js";
import { logger } from "../../utils/logger.js";
export function register(server) {
    server.tool("count-text-stats", "Count characters, words, sentences, and paragraphs in text", { text: z.string().min(1).describe("The text to analyze") }, async ({ text }) => {
        logger.info("[count-text-stats] called", { text });
        try {
            const stats = countTextStats(text);
            logger.info("[count-text-stats] result", stats);
            return {
                content: [{ type: "text", text: JSON.stringify(stats, null, 2) }]
            };
        }
        catch (error) {
            logger.error("Error in count-text-stats tool:", error);
            return {
                content: [{ type: "text", text: `An error occurred while analyzing the text: ${error instanceof Error ? error.message : String(error)}` }],
                isError: true
            };
        }
    });
    server.prompt("count-text-stats", {
        text: z.string().min(1).describe("The text to analyze")
    }, ({ text }) => ({
        description: "Count characters, words, sentences, and paragraphs in the provided text.",
        messages: [{
                role: "user",
                content: {
                    type: "text",
                    text: `Count the number of characters, words, sentences, and paragraphs in the following text and return the results as a summary.\n\n${text}`
                }
            }]
    }));
}
