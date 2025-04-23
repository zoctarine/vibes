import { z } from "zod";
import { analyzeTextFull } from "./logic.js";
import { logger } from "../../utils/logger.js";
export function register(server) {
    server.tool("analyze-text-full", "Perform comprehensive text analysis including statistics, reading time, and page counts", { text: z.string().min(1).describe("The text to analyze") }, async ({ text }) => {
        logger.info("[analyze-text-full] called", { text });
        try {
            const analysis = analyzeTextFull(text);
            logger.info("[analyze-text-full] result", analysis);
            return {
                content: [{ type: "text", text: JSON.stringify(analysis, null, 2) }]
            };
        }
        catch (error) {
            logger.error("Error in analyze-text-full tool:", error);
            return {
                content: [{ type: "text", text: `An error occurred while analyzing the text: ${error instanceof Error ? error.message : String(error)}` }],
                isError: true
            };
        }
    });
    server.prompt("analyze-text-full", {
        text: z.string().min(1).describe("The text to analyze")
    }, ({ text }) => ({
        description: "Perform a comprehensive text analysis, including statistics, reading time, and page counts.",
        messages: [{
                role: "user",
                content: {
                    type: "text",
                    text: `Analyze the following text and provide a detailed report including character count, word count, sentence count, paragraph count, estimated reading time, and page counts for standard, manuscript, book, and academic formats.\n\n${text}`
                }
            }]
    }));
}
