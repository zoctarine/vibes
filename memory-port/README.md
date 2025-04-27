# Memory Port - portable conversation summary 

> [!NOTE] 
> Part of the [vibes](https://github.com/vibes) playground.
>
> *"Vibes" are quick experiments, mostly built by AI with prompt guidance. Expect rough edges – it's not production-ready, likely buggy, and definitely not example code, but it works..somehow. Think of it as a snapshot from my AI coding playground.*

## The Idea
Continue conversations in a new client, or in a new chat session, with some memory of the previous conversation.

## The Result
This is an MCP (Model Context Protocol) server that provides conversation summary management capabilities. It allows you to:

- Generate and save conversation summaries
- Load existing summaries into a conversation
- List all available summaries
- Delete summaries

You can simply say:

```
save summary as MyProject1
```

and later, in a different chat, or different client, say

```
load summary MyProject1
```

or, why not

```
load summary MyProject1 and show it to me
```


## AI Tools
- ![Claude Desktop](https://img.shields.io/badge/Claude_Desktop-40%25-blue?style=social)
- ![Github Copilot](https://img.shields.io/badge/Github_Copilot-20%25-blue?style=social)

> [!TIP]
> use the [Preparing Documentation](https://modelcontextprotocol.io/tutorials/building-mcp-with-llms#preparing-the-documentation) guide to help your ai assistent understand MCP better



## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- A [Supabase](https://supabase.com/) account and project

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your Supabase database:
   - Create a new Supabase project
   - Run the SQL in `setup-schema.sql` in your Supabase SQL editor

4. Set up environment variables:
   - Copy `env.example` to `.env`
   - Add your Supabase URL and key
   - Create a client API key for MCP

   ```
   cp env.example .env
   # Edit the .env file with your values
   ```


## Build

NPM:

```bash
npm install
npm run build
```

Docker:

```bash
docker build -t mcp/memory-port .
```


## Connecting with an MCP Client

This server implements the Model Context Protocol and runs on stdio, which means it can be integrated with any MCP-compatible client. The server provides the following tools:

- `persist-summary-to-storage`: Generate a conversation summary and save it
- `load-summary-from-storage`: Load a previously saved summary
- `list-summaries`: List all saved summaries
- `delete-summary`: Delete a saved summary

Because not all clients have the *sampling* capability (yet) two prompts were created to instruct the model to explicitly call the 2 persis and load functions
- `save-summary`: A prompt that generates a summary and then calls the tool 
- `load-summary`: A prompt that loads a summary and then instructs the model to keep it as context

## Technologies

This project uses:
- TypeScript for type safety
- MCP SDK for client-server communication
- Supabase for data storage
- Zod for schema validation


## Usage with VS Code

Follow the instructions here: https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server 

or, if you just want to get started, add the following JSON block to your User Settings (JSON) file in VS Code. (You can do this by pressing Ctrl + Shift + P and typing Preferences: Open User Settings (JSON)) or to your workspace settings (add it to a file called .vscode/mcp.json in your workspace)


NPM

```json
{
  "mcp": {
    "servers": {
      "fw-text-statistics": {
        "command": "node",
        "args": ["dist/index.js"], // your full path here
         "env":{
            "ENC_KEY": "not supported yet"
         }
      }
    }
  }
}
```

Docker

```json
{
  "mcp": {
    "servers": {
      "fw-text-statistics": {
        "command": "docker",
        "args": ["run", "-i", "--rm", "mcp/memory-port"],
      }
    }
  }
}
```


## Environment Variables

- `SUPABASE_URL`: URL of your Supabase project
- `SUPABASE_KEY`: Service role key for Supabase
- `MCP_CLIENT_API_KEY`: API key for client identification ***(if you want to use same chat memory in different clients, use the same MCP_CLIENT_API_KEY for all of them)***

## Next Steps
- encrypt at rest (use client configured enc key)
- use different storage providers
- use *sampling* if suppoted, when generating summaries and updateing context

# License

MIT
