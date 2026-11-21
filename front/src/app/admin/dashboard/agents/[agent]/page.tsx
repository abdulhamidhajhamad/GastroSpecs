import { AgentChatPage } from "@/features/admin";

export default async function Page({ params }: { params: Promise<{ agent: string }> }) {
  return <AgentChatPage agent={(await params).agent} />;
}
