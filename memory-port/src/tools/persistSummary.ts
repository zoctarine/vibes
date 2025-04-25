import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_NAMES, CLIENT_API_KEY } from "../config/env.js";
import { SummaryStorage } from "../services/summaryStorage.js";

export function registerPersistSummaryTool(server: McpServer) {
  server.tool(
    TOOL_NAMES.PERSIST_SUMMARY_TO_STORAGE,
    "Saves a summary of the conversation to storage. This summary can be used as context for future conversations. It requires a summary key to identify the summary.",
    {
      summaryKey: z.string().describe("The key/filename to save the summary under"),
      summary: z.string().describe("A summary of the conversation so far, including key topics and hashtags, so it can serve as context for future conversations, or an initial prompt for a new conversation."),
      includeTags: z.boolean().optional().describe("Whether to include relevant tags in the summary"),
      overwrite: z.boolean().optional().default(true).describe("Whether to overwrite if a summary with this key already exists"),
    },
    async ({ summaryKey, summary = '', includeTags = false, overwrite = true }, exchange: any) => {
      try {
        console.error("Summary:", summary);
        console.error(`[LOG] Summary generated (${summary.length} characters). Saving to Supabase...`);

        // Save the summary to Supabase
        const compoundKey = await SummaryStorage.saveData(summaryKey, summary);

        // Return success message with the summary and storage information
        return {
          content: [
            {
              type: "text" as const,
              text: `Summary successfully generated and saved!\n\nClient ID: ${CLIENT_API_KEY}\nSummary Key: ${summaryKey}\n\nSummary:\n${summary}\n\nYou can load this summary as context in future conversations using the ${TOOL_NAMES.LOAD_SUMMARY_FROM_STORAGE} tool with the key: "${summaryKey}"`
            }
          ]
        };
      } catch (error) {
        // Handle errors
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true
        };
      }
    }
  );
}