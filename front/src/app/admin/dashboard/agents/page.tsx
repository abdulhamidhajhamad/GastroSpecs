import Link from "next/link";

type Agent = {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
};

// Empty until the agents are defined. Later this list comes from the backend.
const agents: Agent[] = [];

const statusStyles: Record<Agent["status"], string> = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  draft: "bg-ink/5 text-muted",
};

export default function AgentsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/admin/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>

      <header className="mt-4 border-b border-ink/10 pb-6">
        <p className="mono-label text-xs text-steel">Dashboard</p>
        <h1 className="mt-1 text-3xl font-semibold">AI agents</h1>
      </header>

      {agents.length === 0 ? (
        <div className="mt-10 border border-dashed border-ink/20 bg-paper px-6 py-16 text-center">
          <h2 className="text-xl font-medium">No agents yet</h2>
          <p className="mt-2 text-sm text-muted">Agents you add will show up here.</p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <li key={agent.id} className="border border-ink/10 bg-paper p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-medium">{agent.name}</h2>
                <span className={`mono-label px-2 py-1 text-[0.6875rem] ${statusStyles[agent.status]}`}>
                  {agent.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{agent.description}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
