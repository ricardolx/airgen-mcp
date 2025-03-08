![image](https://github.com/user-attachments/assets/95eacfca-feee-4719-83e0-f67e7b5890b5)# airgen-mcp MCP Server

Generate assets, icons, and svgs

This is a TypeScript-based MCP server that implements an asset generation agent. It uses core MCP concepts by providing: A tool for generating assets

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
