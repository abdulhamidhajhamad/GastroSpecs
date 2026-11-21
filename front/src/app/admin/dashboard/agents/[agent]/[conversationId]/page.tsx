import { AgentChatPage } from "@/features/admin";

export default async function Page({ params }: { params: Promise<{ agent: string; conversationId: string }> }) {
  const { agent, conversationId } = await params;
  return <AgentChatPage agent={agent} conversationId={conversationId} />;
}
