import { z } from "zod";
import { estimateReadingTime } from "./logic.js";
import { logger } from "../../utils/logger.js";
export function register(server) {
    server.tool("estimate-reading-time", "Calculate estimated reading time based on word count and reading speed", {
        text: z.string().min(1).describe("The text to analyze"),
        wordsPerMinute: z.number().positive().optional().describe("Reading speed in words per minute (default: 200)")
    }, async ({ text, wordsPerMinute = 200 }) => {
        logger.info("[estimate-reading-time] called", { text, wordsPerMinute });
        try {
            const readingTime = estimateReadingTime(text, wordsPerMinute);
            logger.info("[estimate-reading-time] result", { readingTime });
            return {
                content: [{ type: "text", text: `Estimated reading time: ${readingTime} at ${wordsPerMinute} words per minute.` }]
            };
        }
        catch (error) {
            logger.error("Error in estimate-reading-time tool:", error);
            return {
                content: [{ type: "text", text: `An error occurred while estimating reading time: ${error instanceof Error ? error.message : String(error)}` }],
                isError: true
            };
        }
    });
    server.prompt("estimate-reading-time", {
        text: z.string().min(1).describe("The text to analyze"),
        wordsPerMinute: z.string().optional().describe("Reading speed in words per minute (default: 200)")
    }, ({ text, wordsPerMinute }) => {
        const wpm = wordsPerMinute ? parseInt(wordsPerMinute, 10) : undefined;
        return {
            description: "Estimate the reading time for the provided text.",
            messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: `Estimate the reading time for the following text${wpm ? ` at ${wpm} words per minute` : ''}.\n\n${text}`
                    }
                }]
        };
    });
}
