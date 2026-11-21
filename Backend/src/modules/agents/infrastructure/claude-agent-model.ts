import Anthropic from "@anthropic-ai/sdk";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AgentModel, type ModelMessage, type ModelReply, type ModelTool } from "../domain/agent-model";

/** OpenRouter speaks Anthropic's Messages API at this address (the SDK adds /v1/messages). */
const OPENROUTER_URL = "https://openrouter.ai/api";
const DEFAULT_MODEL = { openrouter: "anthropic/claude-opus-5.5", anthropic: "claude-opus-5-5" };
/** A whole catalog plan can be long; streaming keeps such replies clear of HTTP timeouts. */
const MAX_TOKENS = 64_000;
/** Tries for a turn whose streamed tool input couldn't be parsed (rare); API errors are retried by the SDK. */
const PARSE_ATTEMPTS = 3;

/**
 * Claude Opus through the official Anthropic SDK. With OPENROUTER_API_KEY it goes through OpenRouter (one
 * account, credits); with ANTHROPIC_API_KEY instead, straight to Anthropic. AGENT_MODEL_ID overrides the
 * model. Without a key the API still starts, and only agent chats answer with a clear error.
 */
@Injectable()
export class ClaudeAgentModel implements AgentModel {
  private client: Anthropic | null = null;

  constructor(private readonly config: ConfigService) {}

  get keyVariable() {
    return this.anthropicKey() && !this.openRouterKey() ? "ANTHROPIC_API_KEY" : "OPENROUTER_API_KEY";
  }

  isConfigured(): boolean {
    return !!(this.openRouterKey() || this.anthropicKey());
  }

  async respond({ system, tools, messages }: { system: string; tools: ModelTool[]; messages: ModelMessage[] }): Promise<ModelReply> {
    const model = this.config.get<string>("AGENT_MODEL_ID") || DEFAULT_MODEL[this.openRouterKey() ? "openrouter" : "anthropic"];
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.anthropic()
          .messages.stream({
            model,
            max_tokens: MAX_TOKENS,
            // Thinking is always on for Opus 5.5; effort sets how hard it works. Reading a catalog well is worth "high".
            output_config: { effort: "high" },
            // The skills, tools and catalog repeat on every turn: cache them (a cached read costs a tenth).
            system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
            cache_control: { type: "ephemeral" },
            tools,
            messages,
          })
          .finalMessage();
      } catch (error) {
        if (error instanceof Anthropic.APIError || attempt >= PARSE_ATTEMPTS) throw error;
      }
    }
  }

  private openRouterKey = () => this.config.get<string>("OPENROUTER_API_KEY");
  private anthropicKey = () => this.config.get<string>("ANTHROPIC_API_KEY");

  private anthropic(): Anthropic {
    if (this.client) return this.client;
    const openRouterKey = this.openRouterKey();
    const anthropicKey = this.anthropicKey();
    if (openRouterKey) {
      // OpenRouter wants its key as a Bearer token; an x-api-key would be taken for an Anthropic key.
      this.client = new Anthropic({ baseURL: OPENROUTER_URL, authToken: openRouterKey, apiKey: null });
    } else if (anthropicKey) {
      this.client = new Anthropic({ apiKey: anthropicKey });
    } else {
      throw new Error("No AI key on the server (OPENROUTER_API_KEY).");
    }
    return this.client;
  }
}
