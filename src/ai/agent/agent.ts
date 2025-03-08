import { ChatCompletionMessageParam } from "openai/resources/";
import { getOpenAIClient, OpenAIModels } from "../openai/openai";
import { agentPrompt } from "./prompts/agent";
import { ToolCall } from "./tools";
import { AssetGenerator, generateAssetTool } from "./tools/generateAsset";
import { RemoveBackgroundTool, removeBackgroundTool } from "./tools/removeBackground";
import { ConvertToVectorTool, convertToVectorTool } from "./tools/convertToVector";
import { ChatCompletionMessage } from "openai/src/resources/index.js";
import { ResizeImageTool, resizeImageTool } from "./tools/resizeImage";

export const AssetAgentTools: {
  [key: string]: new (...args: any[]) => ToolCall;
} = {
  [AssetGenerator.tool_name]: AssetGenerator,
  [ResizeImageTool.tool_name]: ResizeImageTool,
  [RemoveBackgroundTool.tool_name]: RemoveBackgroundTool,
  [ConvertToVectorTool.tool_name]: ConvertToVectorTool,
};

export const invokeAgent = async (prompt: string) => {
  const messages: Array<ChatCompletionMessageParam> = [
    { role: "system", content: agentPrompt },
    { role: "user", content: prompt },
  ];

  return await agentLoop(messages);
};

/**
 * Main agent loop
 * @param messages - The messages to pass to the agent
 * @param base64 - The base64 encoded image to pass to the agent
 * @param format - The format of the image to pass to the agent
 * @returns The base64 encoded image and the format of the image
 */
export const agentLoop = async (
  messages: Array<ChatCompletionMessageParam>,
  base64?: string,
  format?: string
): Promise<{ base64: string; format: string }> => {
  const responseMessage = await callLlm(messages);
  messages.push(responseMessage);

  const tools = responseMessage.tool_calls;
  console.log("[ Tools ]", tools?.length || 0);

  let toolCall: ToolCall;

  if (tools) {
    for (const tool of tools) {
      const toolName = tool.function.name;
      console.log("[ Tool ] 🔨 - ", toolName);

      const ToolClass = AssetAgentTools[toolName];
      if (ToolClass) {
        const args = JSON.parse(tool.function.arguments);
        toolCall = new ToolClass(...args);
      } else {
        messages.push({
          role: "tool",
          content: "No tool call found",
          tool_call_id: tool.id,
        });
        continue;
      }

      const result = await toolCall.performCall();

      base64 = result.content.base64;
      format = result.content.format;

      messages.push({
        role: "tool",
        content: result.message,
        tool_call_id: tool.id,
      });
    }
    return await agentLoop(messages, base64, format);
  }
  return { base64: base64 || "", format: format || "" };
};

export const callLlm = async (
  messages: Array<ChatCompletionMessageParam>
): Promise<ChatCompletionMessage> => {
  const openAIClient = await getOpenAIClient();

  console.log("[ Calling LLM with messages ]", messages.length);
  const response = await openAIClient.chat.completions.create({
    model: OpenAIModels.GPT_4o_MINI,
    messages,
    tools: [
      generateAssetTool,
      resizeImageTool,
      removeBackgroundTool,
      convertToVectorTool,
    ],
  });

  console.log("[ Response Usage ]", response.usage?.total_tokens);

  const tools = response.choices[0].message.tool_calls;
  if (tools) {
    console.log(
      "[ Response with Tools ]",
      tools.map(tool => tool.function.name).join(", ")
    );
  }

  return response.choices[0].message;
};
