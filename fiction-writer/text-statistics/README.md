# Text Statistics MCP server

> [!NOTE] 
> Part of the [vibes](https://github.com/vibes) playground.
>
> *"Vibes" are a quick experiments, mostly built by AI with prompt guidance. Expect rough edges – it's not production-ready, likely buggy, and definitely not example code, but it works..somehow. Think of it as a snapshot from my AI coding playground.*

## The Idea
Have some control over how text statistics are calculated while analysing manuscripts... with AI

## The Result

MCP is rising in popularity. Why not try it out?

A modular TypeScript library and server for analyzing text, designed for integration with the Model Context Protocol (MCP). 

This project provides tools and APIs to extract detailed statistics and insights from text, including word and character counts, sentence and paragraph analysis, estimated reading time, and page count calculations for various formats.

## Features

- **Text Statistics**: Count characters, words, sentences, and paragraphs in any text.
- **Reading Time Estimation**: Calculate estimated reading time based on word count and customizable reading speed.
- **Page Count Calculation**: Estimate the number of pages for standard, manuscript, book, or academic formats.
- **Comprehensive Analysis**: Perform full text analysis combining all statistics and estimates in a single report.
- **MCP Integration**: Exposes all features as tools and prompts for use in MCP-compatible environments.


## Development

- Claude Sonnet 3.7 (40%), Github Copilot (20%)
- Written in TypeScript

> [!TIP]
> use the [Preparing Documentation](https://modelcontextprotocol.io/tutorials/building-mcp-with-llms#preparing-the-documentation) guide to help your ai assistent understand MCP better

## Build

NPM:

```bash
npm install
npm run build
```

Docker:

```bash
docker build -t mcp/fw/text-statistics .
```

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
        "args": ["build/index.js"]
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
        "args": ["run", "-i", "--rm", "mcp/fw/text-statistics"],
      }
    }
  }
}
```

## License

MIT
