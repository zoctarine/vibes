import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_NAMES } from "../config/env.js";

const summaryPrompt = `Summarize the previous conversation we had. Please provide a comprehensive summary that captures:

1. The main topic/purpose of our conversation
2. Key information I shared with you (details, preferences, constraints)
3. Important decisions or conclusions we reached
4. Any outstanding questions or tasks we discussed
5. The current status or next steps in our discussion

The summary should be detailed enough that we can continue our conversation seamlessly in this new chat, with all important context preserved. Format the information in a clear, structured way that makes it easy to reference specific points.

After you provide the summary, always call the "${TOOL_NAMES.PERSIST_SUMMARY_TO_STORAGE}" tool with the summary and summarykey as parameters. If no summaryKey is provided, generate a unique one and use that as the summaryKey.`;

// You can customize the summary prompt template here
export function registerSaveSummaryPrompt(server: McpServer) {
  server.prompt(
    "save-summary",
    {
      key: z.string().describe("The key to save this summary under"),
    },
    ({ key }) => {
      // This creates a prompt template that will guide the model
      return {
        description: "Generate a summary of the conversation",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: summaryPrompt
            }
          }
        ]
      };
    }
  );
}