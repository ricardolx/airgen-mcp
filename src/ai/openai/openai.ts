import OpenAI from "openai";
import { getSecret } from "../../config/env";

let openAiClient: OpenAI | null = null;

export const getOpenAIClient = async () => {
  if (!openAiClient) {
    const apiKey = await getSecret("OPENAI_API_KEY");
    openAiClient = new OpenAI({
      apiKey,
    });
  }
  return openAiClient;
};

export const OpenAIImageModels = {
  DALL_E_3: "dall-e-3",
  DALL_E_2: "dall-e-2",
} as const;

export const OpenAIImageSizes = {
  SMALL: "1024x1024",
  MEDIUM: "1792x1024",
} as const;

export const OpenAIModels = {
  GPT_4_5_PREVIEW: "gpt-4.5-preview",
  GPT_4o: "gpt-4o",
  GPT_4o_MINI: "gpt-4o-mini",
  GPT_o1: "o1",
  GPT_o1_MINI: "o1-mini",
  GPT_o3_MINI: "o3-mini",
};
