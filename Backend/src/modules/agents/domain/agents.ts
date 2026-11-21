/** The AI agents shown on the dashboard's "AI agents" page. Add one here, with its skills and tools. */
export const AGENTS = {
  ahmadprod: {
    name: "ahmadprod",
    title: "Product importer",
    description:
      "Send it a supplier's catalog: it checks the supplier and our products, then prepares the supplier, contacts, products, specs and photos for your approval.",
  },
} as const;

export type AgentId = keyof typeof AGENTS;

export const isAgentId = (value: string): value is AgentId => Object.hasOwn(AGENTS, value);
