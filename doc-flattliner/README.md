# DocFlattliner - Flattening documentation since 2025

> [!NOTE] 
> Part of the [vibes](https://github.com/vibes) playground.
>
> *"Vibes" are quick experiments, mostly built by AI with prompt guidance. Expect rough edges – it's not production-ready, likely buggy, and definitely not example code, but it works..somehow. Think of it as a snapshot from my AI coding playground.*

## The Idea
Easily convert documentation website to single .md files so we can give them to AI chats. And use AI to compress/summarize large files

.. should have UI as well... sometime... soon

## The Result
A tool to crawl websites and convert them to markdown documentation.


## AI Tools
- ![Claude Desktop](https://img.shields.io/badge/Claude_Desktop-45%25-blue?style=social)
- ![GitHub Copilot](https://img.shields.io/badge/Github_Copilot-45%25-blue?style=social)


## Features

- Crawls links within the same domain
- Converts HTML content to Markdown
- Preserves links as local anchors within the document
- Handles page titles as headers
- Supports custom depth for crawling
- Two modes: flat (sections at end) or nested (inline content)

## Installation

```bash
npm install
```

## Usage

```bash
npm run doc -- <root-url> [max-depth] [output-file] [--mode=nested|flat] [--compress=<level>]
```

### Parameters

- **root-url**: The URL to start crawling from (required)
- **max-depth**: Maximum depth of crawling (default: 2)
- **output-file**: Name of the output file (default: flattened-doc.md)
- **mode**: Either 'nested' or 'flat' (default: flat)
  - **flat**: All content is placed at the end of the document
  - **nested**: Content appears inline where links are found
- **compress**: Compress the output markdown file to reduce size (optional). Requires specifying one of the following levels:
  - **light**: Minimal compression, preserving most details
  - **medium**: Balanced compression, reducing size while keeping key information
  - **aggressive**: Maximum compression, focusing on essential content

> **Note**: The `--compress` option requires a Gemini API key to be set in the `.env` file. (see env.example)

### Examples

```bash
# Basic usage with defaults (depth 2, flat mode)
npm run doc -- https://example.com

# Specify depth and output file
npm run doc -- https://example.com 3 documentation.md

# Use nested mode
npm run doc -- https://example.com 2 documentation.md --mode=nested

# Compress the output file with medium compression
npm run doc -- https://example.com 2 documentation.md --compress=medium
```

## License

MIT


node two-pass-compression.js your-large-file.md --level=light --delay=4000
