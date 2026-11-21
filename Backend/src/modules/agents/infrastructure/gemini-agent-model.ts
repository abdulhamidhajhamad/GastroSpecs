import { ApiError, FileState, FinishReason, GoogleGenAI, type Content, type GenerateContentResponse, type Part } from "@google/genai";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { AgentModel, type ModelMessage, type ModelReply, type ModelTool } from "../domain/agent-model";

/** A free-tier model that reads PDFs and pictures and calls tools; GEMINI_MODEL overrides it. */
const DEFAULT_MODEL = "gemini-3.8-flash";
const MAX_OUTPUT_TOKENS = 65_536;
/** The free tier has per-minute limits: wait and try again a few times before giving up. */
const ATTEMPTS = 6;
const RETRY_STATUSES = new Set([429, 500, 503]);
const FILE_READY_TIMEOUT_MS = 120_000;

/**
 * Gemini's reply parts, stored untouched with each answer. Gemini must get its own parts back exactly as it
 * sent them (they carry "thought signatures"), so they are replayed as they are; the plain text and
 * tool_use blocks next to them are what the rest of the app reads.
 */
export const GEMINI_PARTS = "gemini_parts";
type StoredBlock = { type: string; [key: string]: unknown };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Stored file id: "<name> <uri>" (the name to delete it, the uri to read it). */
const fileRef = (id: string) => {
  const [name, uri] = id.split(" ");
  return { name, uri: uri ?? name };
};

/** Results are plain text for the model; Gemini wants an object. */
const resultText = (content: unknown) =>
  typeof content === "string"
    ? content
    : Array.isArray(content)
      ? content.map((block: { text?: string }) => block.text ?? "").join("\n")
      : JSON.stringify(content ?? "");

/**
 * Gemini as the agent's model, through Google's official SDK (@google/genai). It speaks the same stored
 * conversation format as Claude: messages are translated on the way in and replies on the way out.
 * Uploaded files are kept by Google for 48 hours, so a chat about a catalog works for two days.
 */
@Injectable()
export class GeminiAgentModel implements AgentModel {
  readonly keyVariable = "GEMINI_API_KEY";
  private client: GoogleGenAI | null = null;

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return !!this.config.get<string>("GEMINI_API_KEY");
  }

  async respond({ system, tools, messages }: { system: string; tools: ModelTool[]; messages: ModelMessage[] }): Promise<ModelReply> {
    const model = this.config.get<string>("GEMINI_MODEL") || DEFAULT_MODEL;
    const request = {
      model,
      contents: this.toContents(messages),
      config: {
        systemInstruction: system,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        tools: [{ functionDeclarations: tools.map((tool) => ({ name: tool.name, description: tool.description, parametersJsonSchema: tool.input_schema })) }],
      },
    };

    for (let attempt = 1; ; attempt++) {
      try {
        const response = await this.gemini().models.generateContent(request);
        const reply = this.toReply(response, model);
        // A badly formed tool call is worth one more try rather than a failed run.
        if (reply === "retry" && attempt < ATTEMPTS) continue;
        if (reply === "retry") throw new Error("Gemini kept sending malformed tool calls.");
        return reply;
      } catch (error) {
        const retryable = error instanceof ApiError && RETRY_STATUSES.has(error.status);
        if (!retryable || attempt >= ATTEMPTS) throw error;
        await sleep(5000 * attempt);
      }
    }
  }

  async uploadFile(file: Buffer, fileName: string, mimeType: string): Promise<string> {
    const ai = this.gemini();
    let uploaded = await ai.files.upload({ file: new Blob([new Uint8Array(file)], { type: mimeType }), config: { mimeType, displayName: fileName } });
    // Large PDFs are processed for a moment before they can be read.
    const started = Date.now();
    while (uploaded.state === FileState.PROCESSING && Date.now() - started < FILE_READY_TIMEOUT_MS) {
      await sleep(2000);
      uploaded = await ai.files.get({ name: uploaded.name! });
    }
    if (uploaded.state === FileState.FAILED || !uploaded.uri) throw new Error("Gemini could not read this file.");
    return `${uploaded.name} ${uploaded.uri}`;
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.gemini().files.delete({ name: fileRef(fileId).name });
  }

  /** Stored messages → Gemini contents. Gemini's own replies are replayed from their stored parts. */
  private toContents(messages: ModelMessage[]): Content[] {
    const toolNames = new Map<string, string>();
    const contents: Content[] = [];

    for (const message of messages) {
      const blocks = (typeof message.content === "string" ? [{ type: "text", text: message.content }] : message.content) as StoredBlock[];
      for (const block of blocks) if (block.type === "tool_use") toolNames.set(block.id as string, block.name as string);

      const stored = blocks.find((block) => block.type === GEMINI_PARTS);
      if (message.role === "assistant" && stored) {
        contents.push({ role: "model", parts: stored.parts as Part[] });
        continue;
      }

      const parts: Part[] = blocks.flatMap((block): Part[] => {
        switch (block.type) {
          case "text":
            return block.text ? [{ text: block.text as string }] : [];
          case "document": {
            const source = block.source as { type: string; file_id?: string };
            return source.type === "file" && source.file_id ? [{ fileData: { fileUri: fileRef(source.file_id).uri, mimeType: "application/pdf" } }] : [];
          }
          case "tool_use":
            return [{ functionCall: { id: block.id as string, name: block.name as string, args: block.input as Record<string, unknown> } }];
          case "tool_result": {
            const id = block.tool_use_id as string;
            const output = resultText(block.content);
            return [{ functionResponse: { id, name: toolNames.get(id) ?? "unknown", response: block.is_error ? { error: output } : { output } } }];
          }
          default:
            return []; // other models' private blocks (e.g. Claude's thinking) mean nothing to Gemini
        }
      });
      if (parts.length) contents.push({ role: message.role === "assistant" ? "model" : "user", parts });
    }
    return contents;
  }

  /** Gemini's answer → the reply shape the agent loop reads (text, tool_use, stop_reason). */
  private toReply(response: GenerateContentResponse, model: string): ModelReply | "retry" {
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    if (candidate?.finishReason === FinishReason.MALFORMED_FUNCTION_CALL) return "retry";

    const content: StoredBlock[] = [];
    for (const part of parts) {
      if (part.text && !part.thought) content.push({ type: "text", text: part.text });
      if (part.functionCall) {
        // Gemini may leave ids out; the call needs one so its result can be matched to it.
        part.functionCall.id ||= `call_${randomUUID()}`;
        content.push({ type: "tool_use", id: part.functionCall.id, name: part.functionCall.name, input: part.functionCall.args ?? {} });
      }
    }
    content.push({ type: GEMINI_PARTS, parts });

    const blocked = [FinishReason.SAFETY, FinishReason.PROHIBITED_CONTENT, FinishReason.BLOCKLIST, FinishReason.SPII].includes(candidate?.finishReason as FinishReason);
    const stopReason = blocked || (!candidate && response.promptFeedback?.blockReason)
      ? "refusal"
      : content.some((block) => block.type === "tool_use")
        ? "tool_use"
        : candidate?.finishReason === FinishReason.MAX_TOKENS
          ? "max_tokens"
          : "end_turn";

    return { id: response.responseId ?? randomUUID(), type: "message", role: "assistant", model, content, stop_reason: stopReason } as unknown as ModelReply;
  }

  private gemini(): GoogleGenAI {
    if (this.client) return this.client;
    const apiKey = this.config.get<string>("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set on the server.");
    this.client = new GoogleGenAI({ apiKey });
    return this.client;
  }
}
