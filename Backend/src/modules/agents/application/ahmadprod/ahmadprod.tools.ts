import type { ModelTool } from "../../domain/agent-model";

/**
 * ahmadprod's tools. Three only read; the fourth only saves a plan for the admin to approve.
 * None of them can add or change catalog data.
 */

const text = (description: string) => ({ type: "string", description });
const number = (description: string) => ({ type: "number", description });
const integer = (description: string) => ({ type: "integer", description });
const nullable = <T extends object>(schema: T) => ({ anyOf: [schema, { type: "null" }] });

const query = {
  type: "object" as const,
  properties: { query: text("Words to search for, e.g. a company name, a machine type or a model code.") },
  required: ["query"],
  additionalProperties: false,
};

const productSchema = {
  type: "object",
  description: "The new product, in GastroSpecs fields and units (see the skills). Leave out anything the catalog doesn't give.",
  properties: {
    nameEn: text("English name, no brand or model code, e.g. '8-head touchscreen electric pressure fryer'."),
    nameAr: text("Modern Standard Arabic name, e.g. 'قلاية ضغط كهربائية 8 رؤوس بشاشة لمس'."),
    summaryEn: text("One or two factual sentences in English."),
    summaryAr: text("The same in Arabic."),
    widthMm: integer("Outer width in mm."),
    depthMm: integer("Outer depth in mm."),
    heightMm: integer("Outer height in mm."),
    weightKg: number("Net weight in kg."),
    energyType: { type: "string", enum: ["electric", "gas", "dual"] },
    gasTypes: { type: "array", items: { type: "string", enum: ["lpg", "natural_gas"] }, description: "Gas and dual machines only." },
    powerKw: number("Electric power, or rated heat input for gas, in kW."),
    voltage: integer("Supply voltage, e.g. 380."),
    phases: { type: "integer", enum: [1, 3] },
    frequencyHz: { type: "integer", enum: [50, 60] },
    currentAmps: number("Only if the catalog states it."),
    certifications: { type: "array", items: { type: "string" }, description: 'e.g. ["CE"].' },
    specs: {
      type: "array",
      description: "Other specs worth showing (oil capacity, temperature range, tray size…).",
      items: {
        type: "object",
        properties: { labelEn: { type: "string" }, labelAr: { type: "string" }, value: { type: "string" } },
        required: ["labelEn", "labelAr", "value"],
        additionalProperties: false,
      },
    },
  },
  required: ["nameEn", "nameAr"],
  additionalProperties: false,
};

const contactSchema = {
  type: "object",
  properties: {
    name: text("Full name."),
    role: text("Job title."),
    email: text("Email."),
    phone: text("Phone in international format."),
    whatsapp: text("WhatsApp number."),
    wechat: text("WeChat id."),
    notes: text("Anything useful about this person."),
  },
  required: ["name"],
  additionalProperties: false,
};

export const AHMADPROD_TOOLS: ModelTool[] = [
  {
    name: "list_categories",
    description: "Lists GastroSpecs categories: each main category with its subcategories (slug, English and Arabic names). Products go in a subcategory.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "search_suppliers",
    description: "Finds GastroSpecs suppliers whose name contains the query (any case, any language). Use it before proposing a supplier.",
    input_schema: query,
  },
  {
    name: "search_products",
    description:
      "Finds GastroSpecs products by our code, a name, or a supplier's model code, with their key specs and current suppliers. Use it to avoid duplicates: the same machine from another supplier should be linked, not created again.",
    input_schema: query,
  },
  {
    name: "propose_import_plan",
    description:
      "Saves your complete import plan for the catalog, for the admin to approve or reject. Nothing is added until the admin approves. Calling it again replaces the previous pending plan. Every field is checked; if something is wrong you get the list of problems to fix.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        supplier: {
          type: "object",
          description: "The supplier: existingSupplierId if search_suppliers found it, plus its details from the catalog.",
          properties: {
            existingSupplierId: text("Id from search_suppliers, when the supplier already exists."),
            name: text("Company name in English."),
            nameLocal: text("Company name in its own language, e.g. Chinese."),
            country: text("Country."),
            city: text("City."),
            address: text("Address."),
            website: text("Website."),
            email: text("Email."),
            phone: text("Phone."),
            notes: text("Short note about the supplier, e.g. what they make."),
          },
          required: ["name"],
          additionalProperties: false,
        },
        contacts: { type: "array", items: contactSchema, description: "Real people from the catalog or the admin; [] when none." },
        products: {
          type: "array",
          description: "Every product of the catalog, in catalog order.",
          items: {
            type: "object",
            properties: {
              supplierModel: text("The supplier's model code exactly as printed, e.g. 'CNIX-E2000'."),
              catalogPage: integer("PDF page number, 1 = first page of the file."),
              action: { type: "string", enum: ["create", "link"], description: "create = new GastroSpecs product; link = same machine as an existing product." },
              existingProductId: text("For action 'link': the product id from search_products."),
              categorySlug: text("For action 'create': a subcategory slug from list_categories."),
              product: productSchema,
              image: {
                type: "object",
                description: "Where this product's photo is: PDF page and box as fractions of the page (0,0 = top-left).",
                properties: {
                  page: integer("PDF page, 1-based."),
                  box: {
                    type: "object",
                    properties: { left: number("0-1"), top: number("0-1"), right: number("0-1"), bottom: number("0-1") },
                    required: ["left", "top", "right", "bottom"],
                    additionalProperties: false,
                  },
                },
                required: ["page", "box"],
                additionalProperties: false,
              },
              priceAmount: nullable(integer("Our cost in cents, only if given.")),
              priceCurrency: nullable(text("ISO code, e.g. USD, only with priceAmount.")),
              notes: text("Anything the admin should check for this product (logo on machine, unclear value…)."),
            },
            required: ["supplierModel", "catalogPage", "action"],
            additionalProperties: false,
          },
        },
        report: text("Your report to the admin in Arabic, in the format from the skills."),
      },
      required: ["supplier", "contacts", "products", "report"],
      additionalProperties: false,
    },
  },
];
