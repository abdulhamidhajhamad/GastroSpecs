import type { ModelContent } from "./agent-model";

export type RunStatus = "idle" | "running" | "failed";
export type PlanStatus = "pending" | "approved" | "rejected" | "superseded" | "executing" | "done" | "failed";
/** "user" / "assistant" go to the model as they are; "event" is our own note (approval, import report). */
export type MessageRole = "user" | "assistant" | "event";

export type Conversation = {
  id: string;
  agent: string;
  title: string;
  status: RunStatus;
  lastError: string | null;
  fileKey: string | null;
  fileName: string | null;
  claudeFileId: string | null;
  updatedAt: Date;
};

export type StoredMessage = {
  id: string;
  role: MessageRole;
  content: ModelContent;
  text: string | null;
  createdAt: Date;
};

export type StoredPlan = {
  id: string;
  conversationId: string;
  status: PlanStatus;
  plan: unknown;
  result: unknown;
  createdAt: Date;
};

/**
 * Port for agent chats. Messages are append-only: a conversation is replayed to the model exactly as
 * stored, which the API requires (its thinking blocks are only valid in the history that produced them).
 * The `try…` methods change state only from the expected state, atomically, so two clicks or two
 * requests can never start the same run or import twice.
 */
export abstract class AgentChatRepository {
  abstract listConversations(agent: string): Promise<Pick<Conversation, "id" | "title" | "status" | "fileName" | "updatedAt">[]>;
  abstract createConversation(agent: string, title: string): Promise<{ id: string }>;
  abstract findConversation(id: string): Promise<Conversation | null>;
  /** Marks the chat as running unless it already is. False when another run is going on. */
  abstract tryStartRun(id: string): Promise<boolean>;
  abstract finishRun(id: string, error: string | null): Promise<void>;
  abstract attachFile(id: string, file: { fileKey: string; fileName: string; claudeFileId: string }): Promise<void>;
  /** Removes the chat with its messages and plans; returns its file so it can be deleted too. */
  abstract deleteConversation(id: string): Promise<Pick<Conversation, "fileKey" | "claudeFileId"> | null>;

  abstract appendMessage(conversationId: string, role: MessageRole, content: ModelContent, text: string | null): Promise<void>;
  abstract listMessages(conversationId: string): Promise<StoredMessage[]>;

  /** Saves a new pending plan; any earlier pending plan of the chat becomes "superseded". */
  abstract savePlan(conversationId: string, plan: unknown): Promise<{ id: string }>;
  abstract findPlan(id: string): Promise<StoredPlan | null>;
  abstract listPlans(conversationId: string): Promise<StoredPlan[]>;
  /** pending → `to`, atomically. False when the plan is no longer pending. */
  abstract tryMovePlan(id: string, to: "executing" | "rejected"): Promise<boolean>;
  abstract finishPlan(id: string, status: "done" | "failed", result: unknown): Promise<void>;
}
