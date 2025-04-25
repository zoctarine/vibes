import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_NAMES, CLIENT_API_KEY } from "../config/env.js";
import { SummaryStorage } from "../services/summaryStorage.js";

export function registerListSummariesTool(server: McpServer) {
  server.tool(
    TOOL_NAMES.LIST_SUMMARIES,
    "Lists all the saved summeries for the current client. Each summary is identified by a unique key.",

    {},
    async ({ }, exchange) => {
      try {
        const summaries = await SummaryStorage.listSummaries();

        if (summaries.length === 0) {
          return {
            content: [{ type: "text" as const, text: `No saved summaries found for client: ${CLIENT_API_KEY}` }]
          };
        }

        // Format the date objects for better display
        const formattedSummaries = summaries.map(summary => {
          const created = new Date(summary.created_at).toLocaleString();
          const updated = new Date(summary.updated_at).toLocaleString();
          return `- ${summary.summary_key} (Created: ${created}, Updated: ${updated})`;
        });

        return {
          content: [{
            type: "text" as const,
            text: `Available summaries for client ${CLIENT_API_KEY}:\n\n${formattedSummaries.join('\n')}\n\nUse the "${TOOL_NAMES.LOAD_SUMMARY_FROM_STORAGE}" tool with one of these keys to load a summary.`
          }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true
        };
      }
    }
  );
}