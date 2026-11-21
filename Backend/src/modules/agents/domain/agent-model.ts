import type Anthropic from "@anthropic-ai/sdk";

/**
 * Port: the language model behind the agents (Claude, reached through OpenRouter or Anthropic directly).
 * The message shapes are the SDK's own types: they are plain data, and stored conversations must be
 * replayed exactly as the API returned them.
 */
export type ModelMessage = Anthropic.MessageParam;
export type ModelContent = Anthropic.MessageParam["content"];
export type ModelReply = Anthropic.Message;
export type ModelTool = Anthropic.Tool;

export abstract class AgentModel {
  /** The environment variable that holds the key, for error messages. */
  abstract readonly keyVariable: string;
  /** False when the server has no key for the model. */
  abstract isConfigured(): boolean;
  /** One model turn: the reply may contain text and tool calls. */
  abstract respond(request: { system: string; tools: ModelTool[]; messages: ModelMessage[] }): Promise<ModelReply>;
}
