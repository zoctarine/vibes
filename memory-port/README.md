# Conversation Summary Manager

This is an MCP (Model Context Protocol) server that provides conversation summary management capabilities. It allows you to:

- Generate and save conversation summaries
- Load existing summaries into a conversation
- List all available summaries
- Delete summaries

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

## Build and Run

Build the TypeScript code:
```
npm run build
```

Start the server:
```
npm start
```

For development (build & run):
```
npm run dev
```

## Connecting with an MCP Client

This server implements the Model Context Protocol and runs on stdio, which means it can be integrated with any MCP-compatible client. The server provides the following tools:

- `summarize-and-save`: Generate a conversation summary and save it
- `load-summary`: Load a previously saved summary
- `list-summaries`: List all saved summaries
- `delete-summary`: Delete a saved summary

## Features

- Securely stores conversation summaries in Supabase
- Isolates summaries by client API key
- Supports adding summaries to conversation context
- Tracks creation, update, and access timestamps
- Supports tagging summaries with relevant topics

## Architecture

This project uses:
- TypeScript for type safety
- MCP SDK for client-server communication
- Supabase for data storage
- Zod for schema validation

## Environment Variables

- `SUPABASE_URL`: URL of your Supabase project
- `SUPABASE_KEY`: Service role key for Supabase
- `MCP_CLIENT_API_KEY`: API key for client identification 