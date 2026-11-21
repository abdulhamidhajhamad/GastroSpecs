# How GastroSpecs data is built

## Categories

Two levels. Main categories (Cooking, Frying, Dishwashing, Refrigeration, Ovens, Display, Holding & warming,
Stainless steel, Preparation) contain subcategories (Pressure fryers, Open fryers, Food warmers…).
**A product always goes in a subcategory**, given by its `categorySlug` from `list_categories`.
The main category decides our product code prefix (Frying → `GS-FRY-0001`). You never choose codes:
GastroSpecs gives them when the plan is carried out.

## Products

One product = **one machine a customer can order**. Rules:

- **Each model is its own product.** The electric and the gas version of a fryer are two products, even when
  the catalog shows them side by side. A 2-tank and a 1-tank version are two products.
- **The same machine from two suppliers is one product.** If `search_products` finds a GastroSpecs product
  with the same type and essentially the same specs (dimensions within a few mm, same power, same energy),
  use `action: "link"` with its `existingProductId` instead of creating a duplicate.
- New products are saved as **drafts** (hidden from the site). The admin reviews and publishes them.

### Fields (fixed units)

| Field | Meaning |
|---|---|
| `nameEn`, `nameAr` | Name in English and Modern Standard Arabic. Required. |
| `summaryEn`, `summaryAr` | One or two plain sentences on what it is and its main features. |
| `widthMm`, `depthMm`, `heightMm` | Outer size in millimetres (W × D × H). Integers. |
| `weightKg` | Net weight in kg. |
| `energyType` | `electric`, `gas`, or `dual` (gas heating that also needs mains power for controls/fans). |
| `gasTypes` | For gas/dual only: `lpg`, `natural_gas`, or both. |
| `powerKw` | Electric power, or rated heat input for gas machines, in kW. |
| `voltage`, `phases`, `frequencyHz` | Supply: e.g. 380, 3, 50. `phases` is 1 or 3. |
| `currentAmps` | Only if the catalog states it. Otherwise leave it out: GastroSpecs calculates it. |
| `certifications` | e.g. `["CE"]`. Use what the catalog states; if it states nothing, use `["CE"]` (all our equipment is supplied CE-certified) and mention it in the report. |
| `specs` | Anything else worth showing: `[{ labelEn, labelAr, value }]`, e.g. oil capacity, temperature range, tray size, number of baskets, capacity per batch. |

Things that are **not** fields: price shown to customers, "export worldwide" (true for everything, the site
adds it), the supplier (that is the plan's `supplier` and each product's `supplierModel`).

## Suppliers

A supplier is a company we buy from: name in English, name in its own language (e.g. Chinese), country,
city, address, website, email, phone, and our notes. GastroSpecs spots the same company written
differently ("Co., Ltd." or not, any case), so don't worry about exact spelling, but reuse
`existingSupplierId` when `search_suppliers` finds it.

Contacts are people at the supplier (name, role, email, phone, WhatsApp, WeChat). Add them only if the
catalog or the admin gives them. Never invent a contact.

## Offers (supplier ↔ product)

For each product in the plan, `supplierModel` is the supplier's own model code exactly as printed
(`CNIX-E2000`), and `catalogPage` is the PDF page number (1 = first page of the file, not the number printed
on the page). Prices are usually not in catalogs; set `priceAmount` (in cents) and `priceCurrency` only if
the catalog or the admin gives a price.
