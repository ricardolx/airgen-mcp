#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources and tools by allowing:
 * - Listing notes as resources
 * - Reading individual notes
 * - Creating new notes via a tool
 * - Summarizing all notes via a prompt
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ImageContentSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response, Router } from "express";

const app = express();
const router = Router();

app.use(express.json());

/**
 * Type alias for a note object.
 */
type Note = { title: string; content: string };

/**
 * Simple in-memory storage for notes.
 * In a real implementation, this would likely be backed by a database.
 */
const notes: { [id: string]: Note } = {
  "1": { title: "First Note", content: "This is note 1" },
  "2": { title: "Second Note", content: "This is note 2" },
};

/**
 * Create an MCP server with capabilities
 */
const server = new Server(
  {
    name: "airgen-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler for listing available notes as resources.
 * Each note is exposed as a resource with:
 * - A note:// URI scheme
 * - Plain text MIME type
 * - Human readable name and description (now including the note title)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: Object.entries(notes).map(([id, note]) => ({
      uri: `note:///${id}`,
      mimeType: "text/plain",
      name: note.title,
      description: `A text note: ${note.title}`,
    })),
  };
});

// /**
//  * Handler for reading the contents of a specific note.
//  * Takes a note:// URI and returns the note content as plain text.
//  */
// server.setRequestHandler(ReadResourceRequestSchema, async request => {
//   const url = new URL(request.params.uri);
//   const id = url.pathname.replace(/^\//, "");
//   const note = notes[id];

//   if (!note) {
//     throw new Error(`Note ${id} not found`);
//   }

//   return {
//     contents: [
//       {
//         uri: request.params.uri,
//         mimeType: "text/plain",
//         text: note.content,
//       },
//     ],
//   };
// });

/**
 * Handler that lists available tools.
 * Exposes tools for creating notes and generating images.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_image",
        description: "Generate an image",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "Description of the image to generate",
            },
            format: {
              type: "string",
              description: "Image format (e.g., 'png', 'jpeg')",
              enum: ["png", "jpeg"],
              default: "png",
            },
          },
          required: ["prompt"],
        },
      },
    ],
  };
});

/**
 * Handler for tool execution.
 * Supports creating notes and generating images.
 */
server.setRequestHandler(CallToolRequestSchema, async request => {
  switch (request.params.name) {
    case "generate_image": {
      const prompt = String(request.params.arguments?.prompt);
      const format = String(request.params.arguments?.format || "png");

      if (!prompt) {
        throw new Error("Image prompt is required");
      }

      // Here you would implement actual image generation logic
      // For now, we'll return a placeholder response
      return {
        content: [
          {
            type: "image",
            data: "base64_encoded_image_data_would_go_here",
            mimeType: `image/${format}`,
          },
        ],
      };
    }

    default:
      throw new Error("Unknown tool");
  }
});

// /**
//  * Handler that lists available prompts.
//  * Exposes a single "summarize_notes" prompt that summarizes all notes.
//  */
// server.setRequestHandler(ListPromptsRequestSchema, async () => {
//   return {
//     prompts: [
//       {
//         name: "summarize_notes",
//         description: "Summarize all notes",
//       },
//     ],
//   };
// });

/**
 * Handler for the summarize_notes prompt.
 * Returns a prompt that requests summarization of all notes, with the notes' contents embedded as resources.
 */
// server.setRequestHandler(GetPromptRequestSchema, async request => {
//   if (request.params.name !== "summarize_notes") {
//     throw new Error("Unknown prompt");
//   }

//   const embeddedNotes = Object.entries(notes).map(([id, note]) => ({
//     type: "resource" as const,
//     resource: {
//       uri: `note:///${id}`,
//       mimeType: "text/plain",
//       text: note.content,
//     },
//   }));

//   return {
//     messages: [
//       {
//         role: "user",
//         content: {
//           type: "text",
//           text: "Please summarize the following notes:",
//         },
//       },
//       ...embeddedNotes.map(note => ({
//         role: "user" as const,
//         content: note,
//       })),
//       {
//         role: "user",
//         content: {
//           type: "text",
//           text: "Provide a concise summary of all the notes above.",
//         },
//       },
//     ],
//   };
// });

/**
 * Handler for image content requests.
 * Returns image data in base64 format with appropriate MIME type.
 */
// server.setRequestHandler(
//   ImageContentSchema,
//   async (request: {
//     params: { type: string; data?: string; mimeType?: string };
//   }) => {
//     // Validate the request has the required image type and data
//     if (request.params.type !== "image") {
//       throw new Error("Invalid content type. Expected 'image'");
//     }

//     if (!request.params.data || !request.params.mimeType) {
//       throw new Error("Image data and MIME type are required");
//     }

//     // Return the image content with its MIME type
//     return {
//       content: [
//         {
//           type: "image",
//           data: request.params.data, // Base64 encoded image data
//           mimeType: request.params.mimeType,
//         },
//       ],
//     };
//   }
// );

// /**
//  * Start the server using stdio transport.
//  * This allows the server to communicate via standard input/output streams.
//  */
// async function main() {
//   const transport = new StdioServerTransport();
//   await server.connect(transport);
// }

// main().catch((error) => {
//   console.error("Server error:", error);
//   process.exit(1);
// });

let transport: SSEServerTransport | null = null;

router.get("/sse", (req: Request, res: Response): void => {
  transport = new SSEServerTransport("/generate-asset", res);
  server.connect(transport);
});

router.post(
  "/generate-asset",
  async (req: Request, res: Response): Promise<void> => {
    if (!transport) {
      res.status(400).json({
        error: "No active SSE connection. Please connect to /sse first",
      });
      return;
    }
    await transport.handlePostMessage(req, res);
  }
);

app.use(router);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
