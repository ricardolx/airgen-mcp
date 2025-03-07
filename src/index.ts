import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { Request, Response } from "express";
import { invokeAgent } from "./ai/agent/agent.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Create an MCP server with capabilities
 */
const server = new McpServer(
  {
    name: "airgen-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {
        generate_image: {
          description: "Generate an image",
          inputSchema: {
            type: "object",
            properties: {
              prompt: { type: "string" },
            },
            required: ["prompt"],
          },
        },
      },
      prompts: {},
    },
  }
);

server.server.onerror = (e: Error) => {
  console.error("error", e);
};

server.tool("generate_image", { prompt: z.string() }, async ({ prompt }) => {
  console.log("generate_image", prompt);
  const result = await invokeAgent(prompt);

  return {
    content: [
      {
        type: "image",
        data: result.base64,
        mimeType: result.format,
      },
    ],
  };
});

const transports = new Map<string, SSEServerTransport>();

const app = express();
app.use(express.json());

app.get("/sse", (req: Request, res: Response): void => {
  const transport = new SSEServerTransport("/messages", res);

  console.log("[ SSE ] called");
  const sessionId = transport.sessionId;

  transports.set(sessionId, transport);
  server.connect(transport);

  res.on("close", () => {
    transports.delete(sessionId);
  });
});

app.post("/messages", async (req: Request, res: Response): Promise<void> => {
  console.log("[ Messages ] called");
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    res.status(400).json({ error: "sessionId query parameter is required" });
    return;
  }

  const transport = transports.get(sessionId);
  if (!transport) {
    res.status(400).json({
      error:
        "No active SSE connection found for this session. Please connect to /sse first",
    });
    return;
  }

  try {
    return await transport.handlePostMessage(req, res, req.body);
  } catch (error: any) {
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: error.message || "Unknown error occurred" });
  }
});

app.listen(3000, () => {
  console.log("Server running ‼️");
});
