import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server
const server = new McpServer({
  name: "PromptEnhancer",
  version: "1.0.0",
  capabilities: {
    prompts: { listChanged: true },
    resources: { listChanged: true },
    tools: { listChanged: true }
  }
});

// Store the latest enhanced prompt
let latestEnhancedPrompt = "";
let originalPromptText = "";

// Function to apply your enhancement template
function applyEnhancementTemplate(originalPrompt:string) {
  // This is your actual template logic
  const template = `You are an AI assistant tasked with enhancing prompts to make them production-ready and adherent to best software development practices. Your goal is to take a basic prompt and improve it as if it were written by a senior software developer with extensive experience.

Here is the original prompt you will be enhancing:

<original_prompt>
${originalPrompt}
</original_prompt>

To enhance this prompt, follow these guidelines:

1. Maintain all original requirements and functionalities specified in the initial prompt.
2. Add clarity and specificity to any vague or ambiguous instructions.
3. Include error handling and edge case considerations where appropriate.
4. Incorporate best practices for code organization, modularity, and maintainability.
5. Add comments or documentation where it would improve understanding.
6. Consider performance optimizations if relevant.
7. Ensure the prompt adheres to coding standards and conventions.
8. Add any necessary input validation or data sanitization.
9. Include testing considerations or requirements if applicable.
10. Enhance security measures if relevant to the prompt's context.

Your task is to rewrite the original prompt, incorporating these enhancements while ensuring that all initial requirements are met. The enhanced prompt should read as if it were written by a senior developer for a production environment.

Present your enhanced prompt within markdown code block and nothing else, followed by explanation of the key improvements you made within <explanation> tags.

Remember, only add strictly necessary improvements to adhere to best software development practices. Do not alter the core functionality or requirements of the original prompt unless it's essential for making the prompt production-ready.
`;
  
  return template;
}

// Define the prompt template for enhancing user prompts
server.prompt(
  "enhance-prompt",
  { originalPrompt: z.string().describe("Your original software development prompt to be enhanced with best practices") },
  ({ originalPrompt }) => {
    // Store the original prompt
    originalPromptText = originalPrompt;
    
    // Apply the enhancement template
    const enhancedPrompt = applyEnhancementTemplate(originalPrompt);
    
    // Store for later reference via resource
    latestEnhancedPrompt = enhancedPrompt;
    
    // Return the enhanced prompt in a format the user can easily work with
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Here's your enhanced prompt. You can copy the entire block with one click:\n\n```\n" + enhancedPrompt + "\n```\n\nTo use it, just copy and paste it into a new message."
          }
        }
      ]
    };
  }
);

// Resource to access the latest enhanced prompt
server.resource(
  "latest-enhanced-prompt",
  "enhancement://latest",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: latestEnhancedPrompt || "No enhanced prompt has been generated yet."
    }]
  })
);

// Resource to access the original prompt
server.resource(
  "original-prompt",
  "enhancement://original",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: originalPromptText || "No original prompt has been stored yet."
    }]
  })
);

// Tool to directly enhance a prompt
server.tool(
  "enhance-prompt",
  "Enhance a software development prompt with best practices",
  { originalPrompt: z.string().describe("Your original software development prompt to be enhanced") },
  async ({ originalPrompt }) => {
    // Store the original prompt
    originalPromptText = originalPrompt;
    
    // Apply the enhancement template
    const enhancedPrompt = applyEnhancementTemplate(originalPrompt);
    
    // Store for later reference via resource
    latestEnhancedPrompt = enhancedPrompt;
    
    return {
      content: [
        {
          type: "text",
          text: "## Enhanced Prompt\n```\n" + enhancedPrompt + "\n```\n\n" +
                "**To use this prompt:**\n" +
                "1. Click anywhere in the code block above\n" +
                "2. Press Ctrl+A (Cmd+A on Mac) to select all\n" +
                "3. Press Ctrl+C (Cmd+C on Mac) to copy\n" +
                "4. Click the input field below\n" +
                "5. Press Ctrl+V (Cmd+V on Mac) to paste\n" +
                "6. Press Enter to send\n\n" +
                "You can also reference this prompt later by asking to 'show the latest enhanced prompt'."
        }
      ]
    };
  }
);

// Tool to show the latest enhanced prompt
server.tool(
  "show-latest-prompt",
  "Display the most recently enhanced prompt for easy copying",
  {},
  async () => {
    if (!latestEnhancedPrompt) {
      return {
        content: [{ 
          type: "text", 
          text: "No enhanced prompt has been generated yet. Use the enhance-prompt tool first." 
        }],
        isError: true
      };
    }
    
    return {
      content: [{ 
        type: "text", 
        text: "## Enhanced Prompt\n```\n" + latestEnhancedPrompt + "\n```\n\n" +
              "**To use this prompt:**\n" +
              "1. Click anywhere in the code block above\n" +
              "2. Press Ctrl+A (Cmd+A on Mac) to select all\n" +
              "3. Press Ctrl+C (Cmd+C on Mac) to copy\n" +
              "4. Click the input field below\n" +
              "5. Press Ctrl+V (Cmd+V on Mac) to paste\n" +
              "6. Press Enter to send"
      }]
    };
  }
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);