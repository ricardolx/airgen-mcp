export abstract class ToolCall {
  abstract performCall(): Promise<{ message: string; content: any }>;
}

export interface ToolCallResult {
  message: string;
  content: {
    base64: string;
    format: string;
  };
}
