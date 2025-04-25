import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_NAMES } from "../config/env.js";

// You can customize the load summary prompt template here
export function registerLoadSummaryPrompt(server: McpServer) {
  server.prompt(
    "load-summary",
    {
      key: z.string().describe("The key of the summary to load"),
    },
    ({ key }) => {
      // This creates a prompt template that will guide the model
      return {
        description: "Add the returned summary to context",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Call the ${TOOL_NAMES.LOAD_SUMMARY_FROM_STORAGE} tool with the key "${key}". Please acknowledge that you've received this context and briefly mention what the previous conversation was about based on the summary.`
            }
          }
        ]
      };
    }
  );
}