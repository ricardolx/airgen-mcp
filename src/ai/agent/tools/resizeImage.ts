import sharp from "sharp";
import { ToolCall, ToolCallResult } from ".";
import { ChatCompletionTool } from "openai/resources";

export const resizeImageTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "resize_image",
    description: "Resize an image to a specific width and height",
    parameters: {
      type: "object",
      properties: {
        imageBase64: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
      },
      required: ["imageBase64", "width", "height"],
    },
  },
};

export class ResizeImageTool extends ToolCall {
  static tool_name = "resize_image";

  constructor(
    private imageBase64: string,
    private width: number,
    private height: number
  ) {
    super();
  }

  performCall = async () => {
    console.log("[ Resize Image ]", { w: this.width, h: this.height });
    return await resizeBase64Image(
      this.imageBase64,
      "image/base64",
      this.width,
      this.height
    );
  };
}

/**
 * Resizes an image from a base64 string
 * @param imageBase64 The base64 encoded image string (without the data URL prefix)
 * @param width The target width
 * @param height The target height (optional - will maintain aspect ratio if omitted)
 * @returns A Promise resolving to the resized image as a base64 string
 */
async function resizeBase64Image(
  imageBase64: string,
  format: string,
  width: number,
  height?: number
): Promise<ToolCallResult> {
  try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, "base64");

    // Create a Sharp instance and resize
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(width, height, {
        fit: height ? "cover" : "inside", // If height is provided, use 'cover', otherwise just fit inside width
        withoutEnlargement: true, // Prevents enlarging if image is smaller than specified dimensions
      })
      .toBuffer();

    return {
      message: `Image has been resized to width: ${width}, height: ${height}`,
      content: { base64: resizedImageBuffer.toString("base64"), format },
    };
  } catch (error) {
    console.error("Error resizing image:", error);
    throw error;
  }
}
