import { z } from "zod";
import { calculatePageCount } from "./logic.js";
import { logger } from "../../utils/logger.js";
export function register(server) {
    server.tool("calculate-page-count", "Calculate the number of standard pages based on word count", {
        text: z.string().min(1).describe("The text to analyze"),
        wordsPerPage: z.number().positive().optional().describe("Words per page (default: 250)"),
        format: z.enum(["standard", "manuscript", "book", "academic"]).optional().describe("Page format (standard: 250, manuscript: 300, book: 400, academic: 500)")
    }, async ({ text, wordsPerPage, format }) => {
        logger.info("[calculate-page-count] called", { text, wordsPerPage, format });
        try {
            const pageCount = calculatePageCount(text, wordsPerPage, format);
            logger.info("[calculate-page-count] result", { pageCount });
            return {
                content: [{ type: "text", text: `Standard page count: ${pageCount.toFixed(2)} pages at ${wordsPerPage || (format === "manuscript" ? 300 : format === "book" ? 400 : format === "academic" ? 500 : 250)} words per page.` }]
            };
        }
        catch (error) {
            logger.error("Error in calculate-page-count tool:", error);
            return {
                content: [{ type: "text", text: `An error occurred while calculating page count: ${error instanceof Error ? error.message : String(error)}` }],
                isError: true
            };
        }
    });
    server.prompt("calculate-page-count", {
        text: z.string().min(1).describe("The text to analyze"),
        wordsPerPage: z.string().optional().describe("Words per page (default: 250)"),
        format: z.string().optional().describe("Page format (standard, manuscript, book, academic)")
    }, ({ text, wordsPerPage, format }) => {
        const wpp = wordsPerPage ? parseInt(wordsPerPage, 10) : undefined;
        const fmt = format ? format : undefined;
        return {
            description: "Calculate the number of pages for the provided text.",
            messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: `Calculate the number of pages for the following text${fmt ? ` using the ${fmt} format` : ''}${wpp ? ` (${wpp} words per page)` : ''}.\n\n${text}`
                    }
                }]
        };
    });
}
