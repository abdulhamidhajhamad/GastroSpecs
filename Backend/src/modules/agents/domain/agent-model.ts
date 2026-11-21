import type Anthropic from "@anthropic-ai/sdk";

/**
 * Port: the language model behind the agents (Claude). The message shapes are the SDK's own types:
 * they are plain data, and stored conversations must be replayed exactly as the API returned them.
 */
export type ModelMessage = Anthropic.Beta.BetaUserMessageParam | Anthropic.Beta.BetaAssistantMessageParam;
export type ModelContent = Anthropic.Beta.BetaMessageContentParam;
export type ModelReply = Anthropic.Beta.BetaMessage;
export type ModelTool = Anthropic.Beta.BetaTool;

export abstract class AgentModel {
  /** The environment variable holding this model's API key, for error messages. */
  abstract readonly keyVariable: string;
  /** False when the server has no credentials for the model (e.g. no API key set). */
  abstract isConfigured(): boolean;
  /** One model turn: the reply may contain text and tool calls. */
  abstract respond(request: { system: string; tools: ModelTool[]; messages: ModelMessage[] }): Promise<ModelReply>;
  /** Uploads a file (e.g. a catalog PDF) so messages can refer to it by id instead of resending it. */
  abstract uploadFile(file: Buffer, fileName: string, mimeType: string): Promise<string>;
  abstract deleteFile(fileId: string): Promise<void>;
}
