# Prompt Enhancer MCP Server

> [!NOTE] 
> Part of the [vibes](https://github.com/vibes) playground.
>
> *"Vibes" are a quick experiments, mostly built by AI with prompt guidance. Expect rough edges – it's not production-ready, likely buggy, and definitely not example code, but it works..somehow. Think of it as a snapshot from my AI coding playground.*

## The Idea
See how easy it is to make a MCP tool to enhance prompts.

## The Result

A Model Context Protocol (MCP) server that enhances prompts by applying best software development practices. Will be enhanced with different prompts

## Development

- Claude Desktop (40%), Cursor(40%)
- Written in TypeScript
- Helpful: console.anthropic.com/workbench

> [!TIP]
> use the [Preparing Documentation](https://modelcontextprotocol.io/tutorials/building-mcp-with-llms#preparing-the-documentation) guide to help your ai assistent understand MCP better

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the server:
```bash
npm start
```

For development with hot-reload:
```bash
npm run dev
```

## Usage

The server provides two main functionalities:

1. A prompt template "enhance-prompt"
2. A tool "enhance-prompt"
3. A resource "show-last-promtp"

Both accept an original prompt as input and return an enhanced version that incorporates best software development practices.

### Integration

This server implements the Model Context Protocol (MCP) and communicates through standard input/output. It can be integrated with any MCP-compatible client. 


## License

MIT
