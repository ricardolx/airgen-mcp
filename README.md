# airgen-mcp MCP Server

Generate assets, icons, and svgs

This is a TypeScript-based MCP server that implements a simple notes system. It demonstrates core MCP concepts by providing:

- Resources representing text notes with URIs and metadata
- Tools for creating new notes
- Prompts for generating summaries of notes

## Features

### Resources
- List and access notes via `note://` URIs
- Each note has a title, content and metadata
- Plain text mime type for simple content access

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

For development with auto-rebuild:
```bash
npm run watch
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

