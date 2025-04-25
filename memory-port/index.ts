import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const result = dotenv.config({ path: resolve(__dirname, '.env') });
console.error("Starting server...");
console.error('Dotenv config result:', result);
console.error('SUPABASE_URL:', process.env.SUPABASE_URL);

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const CLIENT_API_KEY = process.env.MCP_CLIENT_API_KEY || '';

const tools = {
  PERSIST_SUMMARY_TO_STORAGE: "persist-summary-to-storage",
  LOAD_SUMMARY_FROM_STORAGE: "load-summary-from-storage",
  LIST_SUMMARIES: "list-summaries",
  DELETE_SUMMARY: "delete-summary"
}

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set');
  process.exit(1);
}

if (!CLIENT_API_KEY) {
  console.error('Error: MCP_CLIENT_API_KEY environment variable must be set');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Create an MCP server with appropriate capabilities
const server = new McpServer({
  name: "Conversation Summary Manager",
  version: "1.0.0",
  capabilities: {
    tools: { listChanged: true },
    resources: { listChanged: true },
    sampling: true
  },
  metadata: {
    toolUsageGuidance: `Only use ${tools.PERSIST_SUMMARY_TO_STORAGE} and ${tools.LOAD_SUMMARY_FROM_STORAGE} tools when explicitly requested by the user with clear intent`
  }
});


// Storage service implementation using Supabase
class SummaryStorage {
  // Table name in Supabase
  static tableName = 'conversation_summaries';

  // Save a summary to Supabase
  static async saveData(summaryKey: string, data: string): Promise<string> {
    try {
      // Create compound key with client API key
      const compoundKey = `${CLIENT_API_KEY}/${summaryKey}`;

      // Check if entry already exists
      const { data: existingData, error: checkError } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('client_id', CLIENT_API_KEY)
        .eq('summary_key', summaryKey)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingData) {
        // Update existing entry
        const { error } = await supabase
          .from(this.tableName)
          .update({
            content: data,
            updated_at: new Date().toISOString()
          })
          .eq('client_id', CLIENT_API_KEY)
          .eq('summary_key', summaryKey);

        if (error) throw error;
      } else {
        // Insert new entry
        const { error } = await supabase
          .from(this.tableName)
          .insert({
            client_id: CLIENT_API_KEY,
            summary_key: summaryKey,
            content: data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      console.error(`[STORAGE] Saved summary with key: ${summaryKey}`);
      return compoundKey;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to save summary: ${message}`);
      throw new Error(`Failed to save summary: ${message}`);
    }
  }

  // Load a summary from Supabase
  static async loadData(summaryKey: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('content')
        .eq('client_id', CLIENT_API_KEY)
        .eq('summary_key', summaryKey)
        .single();

      if (error) throw error;
      if (!data) throw new Error(`No summary found with key: ${summaryKey}`);

      console.error(`[STORAGE] Loaded summary with key: ${summaryKey}`);

      // Update the last accessed timestamp
      await supabase
        .from(this.tableName)
        .update({ last_accessed: new Date().toISOString() })
        .eq('client_id', CLIENT_API_KEY)
        .eq('summary_key', summaryKey);

      return data.content;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to load summary: ${message}`);
      throw new Error(`Failed to load summary: ${message}`);
    }
  }

  // List all summaries for the current client
  static async listSummaries() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('summary_key, created_at, updated_at')
        .eq('client_id', CLIENT_API_KEY)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to list summaries: ${message}`);
      throw new Error(`Failed to list summaries: ${message}`);
    }
  }

  // Delete a summary
  static async deleteData(summaryKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('client_id', CLIENT_API_KEY)
        .eq('summary_key', summaryKey);

      if (error) throw error;

      console.error(`[STORAGE] Deleted summary with key: ${summaryKey}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to delete summary: ${message}`);
      throw new Error(`Failed to delete summary: ${message}`);
    }
  }
}

// Tool to summarize and save conversation
server.tool(tools.PERSIST_SUMMARY_TO_STORAGE,
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
            text: `Summary successfully generated and saved!\n\nClient ID: ${CLIENT_API_KEY}\nSummary Key: ${summaryKey}\n\nSummary:\n${summary}\n\nYou can load this summary as context in future conversations using the ${tools.LOAD_SUMMARY_FROM_STORAGE} tool with the key: "${summaryKey}"`
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

// Tool to load a summary and add it as context
server.tool(
  tools.LOAD_SUMMARY_FROM_STORAGE,
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

// Tool to list all available summaries
server.tool(
  tools.LIST_SUMMARIES,
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
          text: `Available summaries for client ${CLIENT_API_KEY}:\n\n${formattedSummaries.join('\n')}\n\nUse the "${tools.LOAD_SUMMARY_FROM_STORAGE}" tool with one of these keys to load a summary.`
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

// Add a summarization prompt to the server
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
            text: `Please create a concise summary of our conversation so far.  After you provide the summary, call the "${tools.PERSIST_SUMMARY_TO_STORAGE}" tool with the summary and summarykey as parameters.`
          }
        }
      ]
    };
  }
);

// Add a summarization prompt to the server
server.prompt(
  "load-summary",
  {
    key: z.string().describe("The key to save this summary under"),
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
            text: `Call the load-summary tool with the key "${key}". Please acknowledge that you've received this context and briefly mention what the previous conversation was about based on the summary.`
          }
        }
      ]
    };
  }
);

// Tool to delete a summary
server.tool(
  tools.DELETE_SUMMARY,
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

      // Unregister the resource
      // In practice, you might need to handle this more explicitly

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
// Startup function to create schema if needed
async function ensureSchemaExists() {
  try {
    // Check if the table exists
    const { error } = await supabase
      .from('conversation_summaries')
      .select('id')
      .limit(1);

    // If we get a specific error about the table not existing
    if (error && error.code === '42P01') {
      console.error('Table does not exist. Creating schema...');

      // For Supabase, you typically set up tables via the web interface
      // or migrations. This is a simplified example that might not work
      // with all Supabase configurations.
      const { error: createError } = await supabase.rpc('create_summaries_table');

      if (createError) {
        console.error('Error creating table:', createError);
        console.error('Please create the following table in Supabase:');
        console.error(`
          CREATE TABLE conversation_summaries (
            id SERIAL PRIMARY KEY,
            client_id TEXT NOT NULL,
            summary_key TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL,
            last_accessed TIMESTAMPTZ,
            UNIQUE(client_id, summary_key)
          );
          CREATE INDEX idx_client_id ON conversation_summaries(client_id);
        `);
      }
    }
  } catch (err) {
    console.error('Error checking schema:', err);
  }
}

// Start the server
async function startServer() {
  // Check schema on startup
  await ensureSchemaExists();

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`Conversation Summary Manager server started with client ID: ${CLIENT_API_KEY}`);
}

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});