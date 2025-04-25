import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_NAMES, CLIENT_API_KEY } from "../config/env.js";
import { SummaryStorage } from "../services/summaryStorage.js";

export function registerLoadSummaryTool(server: McpServer) {
  server.tool(
    TOOL_NAMES.LOAD_SUMMARY_FROM_STORAGE,
    {
      summaryKey: z.string().describe("The key/filename of the summary to load"),
      includeInContext: z.boolean().optional().default(true).describe("Whether to add the summary to the current context")
    },
    async ({ summaryKey, includeInContext = true }, exchange: any) => {
      try {
        console.error(`[LOG] Loading summary with key: ${summaryKey}...`);

        const summary = await SummaryStorage.loadData(summaryKey);

        // Create response content
        const responseContent = [];

        // Basic response that always gets included
        responseContent.push({
          type: "text" as const,
          text: `Summary loaded successfully!\n\nClient: ${CLIENT_API_KEY}\nSummary Key: ${summaryKey}\n\n${includeInContext ? "The summary has been added to the conversation context." : "Summary content:"}\n\n${summary}`
        });

        return {
          content: responseContent
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