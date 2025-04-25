import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_NAMES } from "../config/env.js";
import { SummaryStorage } from "../services/summaryStorage.js";

export function registerDeleteSummaryTool(server: McpServer) {
  server.tool(
    TOOL_NAMES.DELETE_SUMMARY,
    {
      summaryKey: z.string().describe("The key/filename of the summary to delete"),
      confirm: z.boolean().default(true).describe("Confirmation to delete the summary")
    },
    async ({ summaryKey, confirm }, exchange) => {
      if (!confirm) {
        return {
          content: [{ type: "text" as const, text: "Deletion cancelled. Set 'confirm' to true to proceed with deletion." }]
        };
      }

      try {
        // Delete the summary
        await SummaryStorage.deleteData(summaryKey);

        return {
          content: [{
            type: "text" as const,
            text: `Summary "${summaryKey}" has been successfully deleted.`
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