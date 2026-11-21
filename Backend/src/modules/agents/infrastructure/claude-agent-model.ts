import Anthropic, { toFile } from "@anthropic-ai/sdk";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AgentModel, type ModelMessage, type ModelReply, type ModelTool } from "../domain/agent-model";
import { GEMINI_PARTS } from "./gemini-agent-model";

const MODEL = "claude-opus-5-5";
/** A whole catalog plan can be long; streaming keeps such replies clear of HTTP timeouts. */
const MAX_TOKENS = 64_000;
/** Tries for a turn whose streamed tool input couldn't be parsed (rare); API errors are retried by the SDK. */
const PARSE_ATTEMPTS = 3;

/** Drops parts stored for Gemini (a chat may have started on it); Claude only accepts its own block types. */
function withoutGeminiParts(message: ModelMessage): ModelMessage {
  if (typeof message.content === "string") return message;
  const content = message.content.filter((block) => (block as { type: string }).type !== GEMINI_PARTS);
  return { ...message, content } as ModelMessage;
}

/**
 * Claude through the official SDK. The key comes from ANTHROPIC_API_KEY (Render dashboard / Backend/.env);
 * without it the API still starts, and only agent chats answer with a clear error.
 */
@Injectable()
export class ClaudeAgentModel implements AgentModel {
  readonly keyVariable = "ANTHROPIC_API_KEY";
  private client: Anthropic | null = null;

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return !!this.config.get<string>("ANTHROPIC_API_KEY");
  }

  async respond({ system, tools, messages }: { system: string; tools: ModelTool[]; messages: ModelMessage[] }): Promise<ModelReply> {
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.anthropic()
          .beta.messages.stream({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            // Thinking is always on for this model; effort sets how hard it works. Reading a catalog well is worth "high".
            output_config: { effort: "high" },
            // If a safety check declines a turn, the API retries it on a suitable model instead of stopping.
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            // The skills, tools and catalog repeat on every turn: cache them (a cached read costs a tenth).
            system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
            cache_control: { type: "ephemeral" },
            tools,
            messages: messages.map(withoutGeminiParts),
          })
          .finalMessage();
      } catch (error) {
        if (error instanceof Anthropic.APIError || attempt >= PARSE_ATTEMPTS) throw error;
      }
    }
  }

  async uploadFile(file: Buffer, fileName: string, mimeType: string): Promise<string> {
    const uploaded = await this.anthropic().files.upload({ file: await toFile(file, fileName, { type: mimeType }) });
    return uploaded.id;
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.anthropic().files.delete(fileId);
  }

  private anthropic(): Anthropic {
    if (this.client) return this.client;
    const apiKey = this.config.get<string>("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set on the server.");
    this.client = new Anthropic({ apiKey });
    return this.client;
  }
}
