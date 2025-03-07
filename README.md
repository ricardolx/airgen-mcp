# airgen-mcp MCP Server

Generate assets, icons, and svgs

This is a TypeScript-based MCP server that implements a simple notes system. It demonstrates core MCP concepts by providing:

- Resources representing text notes with URIs and metadata
- Tools for creating new notes
- Prompts for generating summaries of notes

## Features

### Tools
- `generate_image` - Create new image asset
  - Will make images, banners, logos, icons and svgs

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

Run the server
```bash
npm run server
```

## Installation

To use with Cursor `mcp.json`

```json
{ 
    "mcpServers": {
        "airgen-mcp": {
            "url": "{url}/sse"
        }
    }
}
```

