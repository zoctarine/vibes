import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerPersistSummaryTool } from './persistSummary.js';
import { registerLoadSummaryTool } from './loadSummary.js';
import { registerListSummariesTool } from './listSummaries.js';
import { registerDeleteSummaryTool } from './deleteSummary.js';

// Register all tools with the server
export function registerAllTools(server: McpServer) {
  registerPersistSummaryTool(server);
  registerLoadSummaryTool(server);
  registerListSummariesTool(server);
  registerDeleteSummaryTool(server);
}

// Export individual tool registration functions for flexibility
export {
  registerPersistSummaryTool,
  registerLoadSummaryTool,
  registerListSummariesTool,
  registerDeleteSummaryTool
};