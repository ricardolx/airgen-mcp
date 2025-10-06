# Airgen MCP Server

Generate assets, icons, and svgs

This is a TypeScript-based MCP server that implements an asset generation agent. It uses core MCP concepts by providing tools for: 

- Generating image assets given a provided description
- Removing image backgrounds
- Resizing images
- Converting assets to vectors or SVGs
  
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

### Coming soon

#### Authorization

MCP is proposed to suport OAuth 2.1 (https://spec.modelcontextprotocol.io/specification/draft/basic/authorization/)
