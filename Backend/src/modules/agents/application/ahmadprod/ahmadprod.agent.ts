import { Injectable } from "@nestjs/common";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GetCategoryTreeUseCase } from "@/modules/catalog/application/get-category-tree.use-case";
import { ProductAdminUseCases } from "@/modules/catalog/application/admin/product-admin.use-cases";
import { OfferUseCases } from "@/modules/sourcing/application/offer.use-cases";
import { SupplierUseCases } from "@/modules/sourcing/application/supplier.use-cases";
import { AgentChatRepository } from "../../domain/agent-chat.repository";
import { checkPlan, type SubcategoryIds } from "../import-plan";
import { AHMADPROD_TOOLS } from "./ahmadprod.tools";

/** Products search_products describes in full; enough to spot a duplicate, small enough to stay fast. */
const SEARCH_DETAILS = 8;

/**
 * The skills (skills/*.md, in name order) are ahmadprod's system prompt. Read once at startup; edit the
 * files to change how it works. They never change during a run, so the API can cache them.
 */
const SYSTEM_PROMPT = readdirSync(join(__dirname, "skills"))
  .filter((file) => file.endsWith(".md"))
  .sort()
  .map((file) => readFileSync(join(__dirname, "skills", file), "utf8").trim())
  .join("\n\n---\n\n");

/** A tool's answer: text for the model, flagged as an error when the call failed. */
export type ToolOutcome = { content: string; isError?: boolean };

/** ahmadprod: its skills, its tools and what each tool does. */
@Injectable()
export class AhmadprodAgent {
  readonly system = SYSTEM_PROMPT;
  readonly tools = AHMADPROD_TOOLS;

  constructor(
    private readonly categories: GetCategoryTreeUseCase,
    private readonly suppliers: SupplierUseCases,
    private readonly offers: OfferUseCases,
    private readonly products: ProductAdminUseCases,
    private readonly chats: AgentChatRepository,
  ) {}

  /** Subcategory slug → id, for checking plans. */
  async subcategories(): Promise<SubcategoryIds> {
    const tree = await this.categories.execute();
    return new Map(tree.flatMap((main) => main.children.map((sub) => [sub.slug, sub.id] as const)));
  }

  async run(name: string, input: Record<string, unknown>, conversationId: string): Promise<ToolOutcome> {
    switch (name) {
      case "list_categories":
        return this.listCategories();
      case "search_suppliers":
        return this.searchSuppliers(String(input.query ?? ""));
      case "search_products":
        return this.searchProducts(String(input.query ?? ""));
      case "propose_import_plan":
        return this.proposePlan(input, conversationId);
      default:
        return { content: `Unknown tool "${name}".`, isError: true };
    }
  }

  private async listCategories(): Promise<ToolOutcome> {
    const tree = await this.categories.execute();
    const lines = tree.flatMap((main) => [
      `${main.name.en} (${main.name.ar})`,
      ...main.children.map((sub) => `  - ${sub.slug}: ${sub.name.en} / ${sub.name.ar}`),
    ]);
    return { content: lines.join("\n") };
  }

  private async searchSuppliers(query: string): Promise<ToolOutcome> {
    const found = await this.suppliers.list(query.trim() || undefined);
    if (!found.length) return { content: `No supplier matches "${query}".` };
    return { content: JSON.stringify(found.map(({ contactCount: _c, ...supplier }) => supplier)) };
  }

  private async searchProducts(query: string): Promise<ToolOutcome> {
    const found = (await this.offers.search(query.trim() || undefined)).slice(0, SEARCH_DETAILS);
    if (!found.length) return { content: `No GastroSpecs product matches "${query}".` };

    const slugs = new Map([...(await this.subcategories())].map(([slug, id]) => [id, slug]));
    const described = await Promise.all(
      found.map(async (ref) => {
        const p = await this.products.get(ref.id);
        return {
          id: p.id,
          code: p.code,
          nameEn: p.nameEn,
          category: slugs.get(p.categoryId),
          sizeMm: [p.widthMm, p.depthMm, p.heightMm].join(" × "),
          weightKg: p.weightKg,
          energy: [p.energyType, ...p.gasTypes].filter(Boolean).join(", "),
          powerKw: p.powerKw,
          supply: [p.voltage && `${p.voltage} V`, p.phases && `${p.phases} ph`, p.frequencyHz && `${p.frequencyHz} Hz`].filter(Boolean).join(", "),
          specs: p.specs.map((s) => `${s.labelEn}: ${s.value}`),
          suppliers: ref.offers.map((o) => `${o.supplier.name} (${o.supplierModel})`),
        };
      }),
    );
    return { content: JSON.stringify(described) };
  }

  private async proposePlan(input: Record<string, unknown>, conversationId: string): Promise<ToolOutcome> {
    const checked = await checkPlan(input, await this.subcategories());
    if ("errors" in checked) {
      return { content: `The plan was not saved. Fix these and call propose_import_plan again with the whole plan:\n- ${checked.errors.join("\n- ")}`, isError: true };
    }
    const { id } = await this.chats.savePlan(conversationId, input);
    return {
      content: `Plan saved (${id}) with ${checked.plan.products.length} products. The admin sees your report at the top of the plan, with Approve and Reject buttons. Reply with one short Arabic line pointing them to it (don't repeat the report), then stop. Don't call this tool again unless the admin asks for changes.`,
    };
  }
}
