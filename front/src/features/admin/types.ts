import type { Money } from "./lib/money";

/**
 * Shapes returned by the admin API (backend: modules/sourcing and modules/catalog, admin routes).
 * Admin-only data: suppliers and prices never reach the public site.
 */

export type SupplierSummary = { id: string; name: string; country: string | null; city: string | null; contactCount: number; productCount: number };

export type ContactFields = {
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  wechat: string | null;
  notes: string | null;
};

export type Contact = ContactFields & { id: string };

export type SupplierFields = {
  name: string;
  nameLocal: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

export type ProductRef = { id: string; code: string; nameEn: string; published: boolean; imageUrl: string | null };

type OfferFields = { id: string; supplierModel: string; price: Money | null; catalogPage: number | null };

export type SupplierDetail = SupplierFields & { id: string; contacts: Contact[]; offers: (OfferFields & { product: ProductRef })[] };

export type ProductOffer = OfferFields & { supplier: { id: string; name: string } };

export type ProductSourcing = ProductRef & { offers: ProductOffer[] };

export const ENERGY_TYPES = ["electric", "gas", "dual"] as const;
export const GAS_TYPES = ["lpg", "natural_gas"] as const;

export type SpecRow = { labelEn: string; labelAr: string; value: string };

export type AdminProduct = {
  id: string;
  code: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  summaryEn: string | null;
  summaryAr: string | null;
  categoryId: string;
  widthMm: number | null;
  depthMm: number | null;
  heightMm: number | null;
  weightKg: number | null;
  energyType: (typeof ENERGY_TYPES)[number] | null;
  gasTypes: (typeof GAS_TYPES)[number][];
  powerKw: number | null;
  voltage: number | null;
  phases: number | null;
  frequencyHz: number | null;
  currentAmps: number | null;
  currentAmpsCalculated: boolean;
  certifications: string[];
  specs: SpecRow[];
  published: boolean;
  displayRank: number;
  images: { id: string; url: string }[];
};

export type AdminCategory = { id: string; slug: string; nameEn: string; nameAr: string; imageUrl: string | null };
export type AdminCategoryNode = AdminCategory & { children: AdminCategory[] };

// --- AI agents ---------------------------------------------------------------------------------------

export type Agent = { name: string; title: string; description: string; active: boolean };

export type RunStatus = "idle" | "running" | "failed";

export type ConversationSummary = { id: string; title: string; status: RunStatus; fileName: string | null; updatedAt: string };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "event";
  text: string | null;
  /** Tools the agent called in this step (shown as "searched suppliers…"). */
  tools: string[];
  attachment: boolean;
  createdAt: string;
};

export type PlanItem = {
  supplierModel: string;
  catalogPage: number;
  action: "create" | "link";
  existingProductId?: string;
  categorySlug?: string;
  product?: Partial<Omit<AdminProduct, "id" | "code" | "slug" | "images">>;
  image?: { page: number };
  priceAmount?: number | null;
  priceCurrency?: string | null;
  notes?: string;
};

export type ImportPlan = {
  supplier: Partial<SupplierFields> & { existingSupplierId?: string; name: string };
  contacts: Partial<ContactFields>[];
  products: PlanItem[];
  report: string;
};

export type ImportItemResult = {
  supplierModel: string;
  catalogPage: number;
  status: "created" | "linked" | "skipped" | "failed";
  productId?: string;
  code?: string;
  message?: string;
  warnings: string[];
};

export type AgentPlan = {
  id: string;
  status: "pending" | "approved" | "rejected" | "superseded" | "executing" | "done" | "failed";
  plan: ImportPlan;
  result: { items?: ImportItemResult[]; error?: string } | null;
  createdAt: string;
};

export type Conversation = {
  id: string;
  agent: string;
  title: string;
  status: RunStatus;
  lastError: string | null;
  fileName: string | null;
  messages: ChatMessage[];
  plans: AgentPlan[];
};

/** A request sent through the public site's forms. */
export type Lead = {
  id: string;
  source: "quote" | "contact" | "catalog_download";
  name: string | null;
  company: string | null;
  projectType: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  createdAt: string;
};
