import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { validateEnv, CLIENT_API_KEY } from "./config/env.js";
import { registerAllTools } from "./tools/index.js";
import { registerSaveSummaryPrompt } from "./prompts/saveSummary.js";
import { registerLoadSummaryPrompt } from "./prompts/loadSummary.js";
import { ensureSchemaExists } from "./utils/database.js";

// Create an MCP server with appropriate capabilities
export function createServer() {
  // Create a new server instance
  const server = new McpServer({
    name: "Conversation Summary Manager",
    version: "1.0.0",
    capabilities: {
      tools: { listChanged: true },
      resources: { listChanged: true },
      sampling: true
    },
    metadata: {
      toolUsageGuidance: `Only use persist-summary-to-storage and load-summary-from-storage tools when explicitly requested by the user with clear intent`
    }
  });
  
  // Register tools
  registerAllTools(server);
  
  // Register prompts
  registerSaveSummaryPrompt(server);
  registerLoadSummaryPrompt(server);
  
  return server;
}

// Start the server
export async function startServer() {
  try {
    // Validate environment variables
    validateEnv();
    
    // Check schema on startup
    await ensureSchemaExists();

    const server = createServer();
    
    // Start server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error(`Conversation Summary Manager server started with client ID: ${CLIENT_API_KEY}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}