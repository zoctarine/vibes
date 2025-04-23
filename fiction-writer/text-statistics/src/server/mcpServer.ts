import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { register as registerCountTextStats } from "../features/countTextStats/index.js";
import { register as registerEstimateReadingTime } from "../features/estimateReadingTime/index.js";
import { register as registerCalculatePageCount } from "../features/calculatePageCount/index.js";
import { register as registerAnalyzeTextFull } from "../features/analyzeTextFull/index.js";

export function createMcpServer() {
  const server = new McpServer({
    name: "Text Analysis Server",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: { listChanged: true },
      prompts: {}
    }
  });
  registerCountTextStats(server);
  registerEstimateReadingTime(server);
  registerCalculatePageCount(server);
  registerAnalyzeTextFull(server);
  return server;
}