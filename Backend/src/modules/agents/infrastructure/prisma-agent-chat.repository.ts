import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/shared/prisma/prisma.service";
import { AgentChatRepository, type MessageRole, type StoredMessage, type StoredPlan } from "../domain/agent-chat.repository";
import type { ModelContent } from "../domain/agent-model";

const json = (value: unknown) => value as Prisma.InputJsonValue;
const planColumns = { id: true, conversationId: true, status: true, plan: true, result: true, createdAt: true } as const;

@Injectable()
export class PrismaAgentChatRepository implements AgentChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  listConversations(agent: string) {
    return this.prisma.agentConversation.findMany({
      where: { agent },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { id: true, title: true, status: true, fileName: true, updatedAt: true },
    });
  }

  createConversation(agent: string, title: string) {
    return this.prisma.agentConversation.create({ data: { agent, title }, select: { id: true } });
  }

  findConversation(id: string) {
    return this.prisma.agentConversation.findUnique({
      where: { id },
      select: { id: true, agent: true, title: true, status: true, lastError: true, fileKey: true, fileName: true, claudeFileId: true, updatedAt: true },
    });
  }

  async tryStartRun(id: string): Promise<boolean> {
    const { count } = await this.prisma.agentConversation.updateMany({ where: { id, status: { not: "running" } }, data: { status: "running", lastError: null } });
    return count === 1;
  }

  async finishRun(id: string, error: string | null): Promise<void> {
    await this.prisma.agentConversation.update({ where: { id }, data: { status: error ? "failed" : "idle", lastError: error } });
  }

  async attachFile(id: string, file: { fileKey: string; fileName: string; claudeFileId: string }): Promise<void> {
    // The chat is named after its catalog.
    await this.prisma.agentConversation.update({ where: { id }, data: { ...file, title: file.fileName.replace(/\.pdf$/i, "") } });
  }

  async deleteConversation(id: string) {
    const found = await this.prisma.agentConversation.findUnique({ where: { id }, select: { fileKey: true, claudeFileId: true } });
    if (found) await this.prisma.agentConversation.delete({ where: { id } }); // messages and plans go with it (cascade)
    return found;
  }

  async appendMessage(conversationId: string, role: MessageRole, content: ModelContent, text: string | null): Promise<void> {
    // Touching the chat marks it as alive, so a long run isn't mistaken for a dead one.
    await this.prisma.$transaction([
      this.prisma.agentMessage.create({ data: { conversationId, role, content: json(content), text } }),
      this.prisma.agentConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
    ]);
  }

  async listMessages(conversationId: string): Promise<StoredMessage[]> {
    const rows = await this.prisma.agentMessage.findMany({ where: { conversationId }, orderBy: { createdAt: "asc" } });
    return rows.map((row) => ({ ...row, role: row.role as MessageRole, content: row.content as ModelContent }));
  }

  async savePlan(conversationId: string, plan: unknown) {
    const [, created] = await this.prisma.$transaction([
      this.prisma.agentPlan.updateMany({ where: { conversationId, status: "pending" }, data: { status: "superseded" } }),
      this.prisma.agentPlan.create({ data: { conversationId, plan: json(plan) }, select: { id: true } }),
    ]);
    return created;
  }

  findPlan(id: string): Promise<StoredPlan | null> {
    return this.prisma.agentPlan.findUnique({ where: { id }, select: planColumns });
  }

  listPlans(conversationId: string): Promise<StoredPlan[]> {
    return this.prisma.agentPlan.findMany({ where: { conversationId }, orderBy: { createdAt: "asc" }, select: planColumns });
  }

  async tryMovePlan(id: string, to: "executing" | "rejected"): Promise<boolean> {
    const { count } = await this.prisma.agentPlan.updateMany({ where: { id, status: "pending" }, data: { status: to } });
    return count === 1;
  }

  async finishPlan(id: string, status: "done" | "failed", result: unknown): Promise<void> {
    await this.prisma.agentPlan.update({ where: { id }, data: { status, result: json(result) } });
  }
}
