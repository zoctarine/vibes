# Text Statistics

A modular TypeScript library and server for analyzing text, designed for integration with the Model Context Protocol (MCP). This project provides tools and APIs to extract detailed statistics and insights from text, including word and character counts, sentence and paragraph analysis, estimated reading time, and page count calculations for various formats.

## Features

- **Text Statistics**: Count characters, words, sentences, and paragraphs in any text.
- **Reading Time Estimation**: Calculate estimated reading time based on word count and customizable reading speed.
- **Page Count Calculation**: Estimate the number of pages for standard, manuscript, book, or academic formats.
- **Comprehensive Analysis**: Perform full text analysis combining all statistics and estimates in a single report.
- **MCP Integration**: Exposes all features as tools and prompts for use in MCP-compatible environments.

## Usage

This package is intended for use as a backend service or as a library in larger applications. It is structured around registering features with an MCP server.

### Example

```typescript
import { createMcpServer } from "./src/server/mcpServer";

const server = createMcpServer();
server.listen(3000);
```

## Project Structure

- `src/features/countTextStats`: Basic text statistics (characters, words, sentences, paragraphs)
- `src/features/estimateReadingTime`: Reading time estimation logic
- `src/features/calculatePageCount`: Page count estimation for different formats
- `src/features/analyzeTextFull`: Comprehensive analysis combining all features
- `src/server/mcpServer.ts`: MCP server setup and feature registration

## Installation

```bash
npm install
```

## Development

- Written in TypeScript
- Designed for extensibility and integration with MCP
- To run or extend, see the `src/` directory for feature modules

## License

MIT

---
*Part of the [fiction-writer](https://github.com/vibes/fiction-writer) suite.*