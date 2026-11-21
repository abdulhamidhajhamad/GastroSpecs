import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { orNotFound } from "@/shared/http/or-not-found";
import { ObjectStorage } from "@/shared/storage/object-storage";
import { discardQuietly } from "@/shared/storage/store-image";
import { AgentChatRepository, type StoredMessage } from "../domain/agent-chat.repository";
import { AgentModel, type ModelContent, type ModelMessage, type ModelReply } from "../domain/agent-model";
import { AGENTS, isAgentId } from "../domain/agents";
import { CatalogPhotos, type CatalogPhotoReader } from "../domain/catalog-photos";
import { AhmadprodAgent } from "./ahmadprod/ahmadprod.agent";
import { importReport } from "./import-report";
import { ImportPlanExecutor } from "./import-plan.executor";

/** Model turns allowed for one admin message: plenty for search → plan → report, and a stop if it loops. */
const MAX_STEPS = 20;
/** A run that hasn't written anything for this long died with the server (deploy, restart). */
const STALE_RUN_MS = 20 * 60 * 1000;
/** The API reads PDFs up to 32 MB per request. */
const MAX_CATALOG_BYTES = 32 * 1024 * 1024;

type Upload = { buffer: Buffer; size: number; originalname?: string };

const textOf = (reply: ModelReply) =>
  reply.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("\n\n")
    .trim();

/** Stored messages → what the model sees. Our events become short user notes so the agent knows what happened. */
const toModelMessages = (messages: StoredMessage[]): ModelMessage[] =>
  messages.map((m) => (m.role === "event" ? { role: "user", content: [{ type: "text", text: `[GastroSpecs] ${m.text ?? ""}` }] } : { role: m.role, content: m.content }));

/**
 * Chats between admins and agents. The agent replies in the background (a catalog can take minutes); the
 * dashboard polls the conversation. Writes to the catalog happen only in `approvePlan`, by our own code.
 */
@Injectable()
export class AgentChatService {
  private readonly logger = new Logger(AgentChatService.name);
  /** The last opened catalog, so previewing a plan's photos one by one doesn't re-read the PDF each time. */
  private previewCatalog: { key: string; reader: Promise<CatalogPhotoReader> } | null = null;

  constructor(
    private readonly chats: AgentChatRepository,
    private readonly model: AgentModel,
    private readonly ahmadprod: AhmadprodAgent,
    private readonly executor: ImportPlanExecutor,
    private readonly photos: CatalogPhotos,
    private readonly storage: ObjectStorage,
  ) {}

  listAgents() {
    return Object.values(AGENTS);
  }

  listConversations(agent: string) {
    return this.chats.listConversations(this.agentOf(agent));
  }

  createConversation(agent: string, title?: string) {
    return this.chats.createConversation(this.agentOf(agent), title?.trim() || "New chat");
  }

  async getConversation(id: string) {
    const conversation = orNotFound(await this.chats.findConversation(id), "Conversation");
    const [messages, plans] = await Promise.all([this.chats.listMessages(id), this.chats.listPlans(id)]);
    const stale = conversation.status === "running" && Date.now() - conversation.updatedAt.getTime() > STALE_RUN_MS;
    const { claudeFileId: _f, fileKey: _k, ...visible } = conversation;
    return {
      ...visible,
      status: stale ? "failed" : conversation.status,
      lastError: stale ? "The run stopped (the server restarted). Send your message again." : conversation.lastError,
      messages: messages.flatMap((m) => this.display(m)),
      plans: plans.map(({ conversationId: _c, ...plan }) => plan),
    };
  }

  /** Saves the admin's message (and catalog, if attached) and lets the agent answer in the background. */
  async sendMessage(id: string, text: string | undefined, file?: Upload) {
    const conversation = orNotFound(await this.chats.findConversation(id), "Conversation");
    // Checked before anything is uploaded, so a missing key never leaves files behind.
    if (!this.model.isConfigured()) {
      throw new ServiceUnavailableException(
        `The agent isn't connected to its AI model yet: ${this.model.keyVariable} is missing on the server. Add it to Backend/.env (or Render) and restart the API.`,
      );
    }
    const message = text?.trim();
    if (!message && !file) throw new BadRequestException("Write a message or attach a catalog");
    if (file && conversation.fileKey) throw new ConflictException("This chat already has a catalog. Start a new chat for another one.");
    if (file) this.checkCatalog(file);
    if (!(await this.chats.tryStartRun(id))) throw new ConflictException("ahmadprod is still working on the last message");

    // Files uploaded so far, removed again if a later step fails.
    const uploaded: { fileKey?: string; claudeFileId?: string } = {};
    try {
      const content: ModelContent = [];
      if (file) {
        const fileName = file.originalname?.slice(0, 200) || "catalog.pdf";
        uploaded.claudeFileId = await this.model.uploadFile(file.buffer, fileName, "application/pdf");
        uploaded.fileKey = `agent-files/${id}/${randomUUID()}.pdf`;
        await this.storage.put(uploaded.fileKey, file.buffer, "application/pdf");
        await this.chats.attachFile(id, { fileKey: uploaded.fileKey, fileName, claudeFileId: uploaded.claudeFileId });
        content.push({ type: "document", source: { type: "file", file_id: uploaded.claudeFileId }, title: fileName });
      }
      content.push({ type: "text", text: message || "Here is the catalog. Please import it." });
      await this.chats.appendMessage(id, "user", content, message || null);
    } catch (error) {
      if (uploaded.fileKey) await discardQuietly(this.storage, uploaded.fileKey);
      if (uploaded.claudeFileId) await this.model.deleteFile(uploaded.claudeFileId).catch(() => undefined);
      await this.chats.finishRun(id, null);
      throw error;
    }

    void this.run(id);
  }

  async approvePlan(planId: string) {
    const plan = orNotFound(await this.chats.findPlan(planId), "Plan");
    const conversation = orNotFound(await this.chats.findConversation(plan.conversationId), "Conversation");
    if (conversation.status === "running") throw new ConflictException("Wait for ahmadprod to finish its reply");
    if (!(await this.chats.tryMovePlan(planId, "executing"))) throw new ConflictException("This plan is no longer waiting for approval");
    void this.execute(planId, plan.plan, conversation.id, conversation.fileKey);
  }

  async rejectPlan(planId: string) {
    const plan = orNotFound(await this.chats.findPlan(planId), "Plan");
    if (!(await this.chats.tryMovePlan(planId, "rejected"))) throw new ConflictException("This plan is no longer waiting for approval");
    await this.chats.appendMessage(plan.conversationId, "event", [], "The admin rejected the plan. Nothing was added.");
  }

  /** A preview of the photo a plan item would get, before anything is approved. */
  async previewPhoto(planId: string, index: number): Promise<Buffer> {
    const plan = orNotFound(await this.chats.findPlan(planId), "Plan");
    const conversation = orNotFound(await this.chats.findConversation(plan.conversationId), "Conversation");
    const image = (plan.plan as { products?: { image?: { page: number; box: never } }[] }).products?.[index]?.image;
    if (!image || !conversation.fileKey) throw new NotFoundException("This item has no photo");

    const key = conversation.fileKey;
    if (this.previewCatalog?.key !== key) this.previewCatalog = { key, reader: this.storage.get(key).then((pdf) => this.photos.open(pdf)) };
    const reader = await this.previewCatalog.reader;
    return (await reader.crop(image.page, image.box, 480)).image;
  }

  async deleteConversation(id: string) {
    const files = orNotFound(await this.chats.deleteConversation(id), "Conversation");
    if (files.fileKey) await discardQuietly(this.storage, files.fileKey);
    if (files.claudeFileId) await this.model.deleteFile(files.claudeFileId).catch(() => undefined);
  }

  // --- Background work ---------------------------------------------------------------------------------

  /**
   * The agent loop: ask the model, run the tools it calls, repeat until it answers. Each step is stored as
   * it happens, so the dashboard shows progress and the history stays exactly as the API returned it.
   */
  private async run(id: string) {
    try {
      for (let step = 0; step < MAX_STEPS; step++) {
        const reply = await this.model.respond({
          system: this.ahmadprod.system,
          tools: this.ahmadprod.tools,
          messages: toModelMessages(await this.chats.listMessages(id)),
        });

        // A refused or truncated turn may hold a half-written tool call: don't store or run it.
        if (reply.stop_reason === "refusal") {
          await this.chats.appendMessage(id, "event", [], "ahmadprod declined to continue this request.");
          break;
        }
        if (reply.stop_reason === "max_tokens") throw new Error("The reply was too long. Ask for a smaller part of the catalog.");

        await this.chats.appendMessage(id, "assistant", reply.content, textOf(reply) || null);
        if (reply.stop_reason === "pause_turn") continue;
        if (reply.stop_reason !== "tool_use") break;

        const calls = reply.content.filter((block) => block.type === "tool_use");
        const results = await Promise.all(
          calls.map(async (call) => {
            const outcome = await this.ahmadprod.run(call.name, call.input as Record<string, unknown>, id).catch((error: Error) => ({
              content: `The tool failed: ${error.message}`,
              isError: true,
            }));
            return { type: "tool_result" as const, tool_use_id: call.id, content: outcome.content, is_error: outcome.isError };
          }),
        );
        await this.chats.appendMessage(id, "user", results, null);
      }
      await this.chats.finishRun(id, null);
    } catch (error) {
      this.logger.error(`Agent run ${id} failed`, error as Error);
      await this.chats.finishRun(id, (error as Error).message).catch(() => undefined);
    }
  }

  private async execute(planId: string, plan: unknown, conversationId: string, fileKey: string | null) {
    try {
      const result = await this.executor.execute(plan, await this.ahmadprod.subcategories(), fileKey);
      const failed = result.items.every((item) => item.status === "failed");
      await this.chats.finishPlan(planId, failed ? "failed" : "done", result);
      await this.chats.appendMessage(conversationId, "event", [], importReport(result));
    } catch (error) {
      this.logger.error(`Plan ${planId} failed`, error as Error);
      await this.chats.finishPlan(planId, "failed", { error: (error as Error).message });
      await this.chats.appendMessage(conversationId, "event", [], `The import failed before adding products: ${(error as Error).message}`);
    }
  }

  // --- Helpers -----------------------------------------------------------------------------------------

  private agentOf(agent: string) {
    if (!isAgentId(agent)) throw new NotFoundException("Agent not found");
    return agent;
  }

  private checkCatalog(file: Upload) {
    if (file.size > MAX_CATALOG_BYTES) throw new BadRequestException("The catalog must be 32 MB or smaller");
    if (file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-") throw new BadRequestException("The catalog must be a PDF file");
  }

  /** What the chat shows for a stored message; tool results and empty steps are hidden, tool calls summarized. */
  private display(m: StoredMessage) {
    const tools =
      m.role === "assistant" && Array.isArray(m.content)
        ? m.content.flatMap((block) => (typeof block === "object" && block.type === "tool_use" ? [block.name] : []))
        : [];
    if (!m.text && tools.length === 0 && m.role !== "user") return [];
    if (m.role === "user" && !m.text && !this.hasDocument(m)) return [];
    return [{ id: m.id, role: m.role, text: m.text, tools, attachment: this.hasDocument(m), createdAt: m.createdAt }];
  }

  private hasDocument(m: StoredMessage) {
    return m.role === "user" && Array.isArray(m.content) && m.content.some((block) => typeof block === "object" && block.type === "document");
  }
}
