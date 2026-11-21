# GastroSpecs Backend

NestJS + Prisma + PostgreSQL. Serves the public catalog and the admin API.

NestJS 12 (ESM packages) in a CommonJS app: `tsconfig` uses `"module": "nodenext"`, and Node loads the ESM
packages through `require(esm)`, so **Node 22.12 or newer** is required (pinned in `package.json` engines).
TypeScript 6.

## Architecture

Clean architecture per feature (vertical slice). Each module under `src/modules/<feature>/` has four layers:

```
domain/          Pure business — entities and repository interfaces (ports). No framework.
application/     Use cases and DTOs. Orchestrates domain, independent of HTTP and DB.
infrastructure/  Adapters for the outside world — Prisma repositories, external services.
presentation/    Controllers. Thin HTTP layer; delegates to use cases.
<feature>.module.ts   Wires the layers together (DI bindings).
```

Dependencies only ever point inward:  `presentation → application → domain ← infrastructure`.
The domain never imports from the outer layers, which is what makes the DB swappable.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in a strong JWT_SECRET
cp .env.example .env

# 3. Start Postgres (Docker)
npm run db:up

# 4. Create the schema, the catalog taxonomy and the owner account
#    (credentials go on the command line only, so the password never lands in a file)
npm run prisma:migrate -- --name init
OWNER_EMAIL=you@gastrospecs.com OWNER_PASSWORD='a-strong-password' npm run prisma:seed

# 5. Run the API in watch mode
npm run dev
# → http://localhost:4000/api
```

## Deploy (Render, free plan)

Settings live in `render.yaml` at the repo root. Render deploys the `main` branch only.

1. Render → **New → Blueprint** → pick the GitHub repo. It reads `render.yaml`.
2. Fill in the secrets it asks for: `DATABASE_URL`, `DIRECT_URL` (Neon), `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
3. Custom domain: add `api.gastrospecs.com` in Render, then the CNAME it shows in Cloudflare DNS.
4. Keep-alive: free services sleep after 15 min without traffic (about a minute to wake). Create a free job on
   cron-job.org (or UptimeRobot) that calls `https://api.gastrospecs.com/api/health` every 10 minutes.
   `/api/health` never touches the database, so Neon still sleeps and keeps within its free compute hours.

Free-plan limits: 750 instance hours per month per Render workspace (enough for this one service only),
and Render may restart free services at any time. Move to a paid plan by changing `plan` in `render.yaml`.

## Run everything in Docker

```bash
docker compose up        # DB + API on http://localhost:4000
docker compose down      # stop; the DB volume persists
```

## Endpoints

Public catalog routes take `?locale=en|ar` (default `en`).

| Method | Path                                | Who    | What                                                   |
| ------ | ----------------------------------- | ------ | ------------------------------------------------------ |
| GET    | /api/health                         | public | Liveness check for Render and the keep-alive pinger.   |
| POST   | /api/auth/sign-in                   | admin  | Sign in; sets the session cookie.                      |
| POST   | /api/auth/sign-out                  | admin  | Clears the session cookie.                             |
| GET    | /api/auth/me                        | admin  | The signed-in admin (dashboard checks it first).       |
| GET    | /api/catalog/categories             | public | Main categories with their subcategories.              |
| GET    | /api/catalog/categories/:slug       | public | A category's products, grouped by subcategory.         |
| GET    | /api/catalog/business-types         | public | Business types (Fried chicken, Hotel…).                |
| GET    | /api/catalog/business-types/:slug   | public | A business type's products, grouped by subcategory.    |
| GET    | /api/catalog/products               | public | Slug and last change of every published product (sitemap). |
| GET    | /api/catalog/products/:slug         | public | One product: code, key specs, extra specs, images. No supplier data. |
| POST   | /api/leads                          | public | Save a lead (PDF download or quote). Email or phone.   |
| GET    | /api/leads                          | admin  | All leads, newest first.                               |
| POST   | /api/auth/change-password           | admin  | Change your own password.                              |
| GET    | /api/admin/catalog/categories       | admin  | Category tree, both languages, with image URLs.        |
| PUT    | /api/admin/catalog/categories/:id/image | admin | Upload or replace a category image (field `file`). |
| DELETE | /api/admin/catalog/categories/:id/image | admin | Remove a category image.                           |
| GET    | /api/admin/catalog/products/:id     | admin  | Every field of a product, published or not.            |
| POST   | /api/admin/catalog/products         | admin  | Create; answers the new code (`GS-FRY-0001`) and slug. Amps and display rank are worked out. |
| PATCH  | /api/admin/catalog/products/:id     | admin  | Change any fields (`null` clears). Code never changes.  |
| DELETE | /api/admin/catalog/products/:id     | admin  | Delete with its photos and supplier links.             |
| POST   | /api/admin/catalog/products/:id/images  | admin | Add a product image (field `file`).                |
| DELETE | /api/admin/catalog/products/:id/images/:imageId | admin | Remove a product image.                    |
| GET    | /api/admin/sourcing/suppliers?q=    | admin  | Suppliers (name search) with contact / product counts. |
| GET    | /api/admin/sourcing/suppliers/:id   | admin  | A supplier with notes, contacts and products + cost.   |
| POST   | /api/admin/sourcing/suppliers       | admin  | Create. 409 with `supplierId` if the company exists (however it is spelled). |
| PATCH / DELETE | /api/admin/sourcing/suppliers/:id | admin | Edit / delete (contacts and links go too; products stay). |
| POST   | /api/admin/sourcing/suppliers/:id/contacts | admin | Add a contact.                                 |
| PATCH / DELETE | /api/admin/sourcing/contacts/:id | admin | Edit / remove a contact.                           |
| GET    | /api/admin/sourcing/products?q=     | admin  | Search by our code, name or a supplier model → products with every supplier and price (cheapest first). |
| GET    | /api/admin/sourcing/products/:id/offers | admin | A product's suppliers, cheapest first.            |
| POST   | /api/admin/sourcing/offers          | admin  | Link a supplier to a product: model, cost (cents + currency, optional), catalog page. |
| PATCH / DELETE | /api/admin/sourcing/offers/:id | admin | Edit (e.g. the price) / unlink.                      |

Admin routes need the `gs_admin_session` cookie set by sign-in: httpOnly (page scripts can't read it),
SameSite=Strict (other sites can't send it), path `/api`. In production `COOKIE_DOMAIN=.gastrospecs.com` lets
the site and `api.` share it, and it is marked Secure (HTTPS only).

## Images (Cloudflare R2)

Files live in the R2 bucket, organized by owner:

```
categories/<categoryId>/<random>.webp
products/<productId>/<random>.webp
```

- The database stores the **key** only; `R2_PUBLIC_URL` turns it into a URL. Changing domain = one `.env` line.
- Uploads are checked by their real file signature (JPEG, PNG, WebP, AVIF), up to 10 MB.
- Replacing or removing an image deletes the old file. Cloudflare's edge may keep serving it for up to a day.

## AI agents (ahmadprod)

`modules/agents` runs dashboard agents on Claude (`ANTHROPIC_API_KEY`; without it the API runs and the
chat says the key is missing). **ahmadprod** imports supplier catalogs:

1. The admin sends a catalog PDF in the chat (stored in R2 under `agent-files/`, and uploaded to Claude).
2. The agent reads it and uses read-only tools (`list_categories`, `search_suppliers`, `search_products`),
   then saves one plan with `propose_import_plan`. It cannot write anything itself.
3. The admin reviews the plan (with photo previews cut from the catalog) and approves or rejects it.
4. On approval, `ImportPlanExecutor` (plain code, no AI) re-checks the plan with the same DTOs as the
   dashboard and adds it through the normal use cases: supplier, contacts, draft products, supplier links,
   photos. Models the supplier already has are skipped, so running a plan twice duplicates nothing.

Its skills are the Markdown files in `modules/agents/application/ahmadprod/skills/` (copied to `dist` by
`nest-cli.json`); edit them to change how it works. Photos are cut with pdf-lib + sharp from catalogs whose
pages are pictures; other pages get a note to add the photo by hand.

| Method | Path | What |
| ------ | ---- | ---- |
| GET | /api/admin/agents | The agents. |
| GET / POST | /api/admin/agents/:agent/conversations | List / start chats. |
| GET / DELETE | /api/admin/agents/conversations/:id | A chat with messages and plans (poll while running) / delete it with its file. |
| POST | /api/admin/agents/conversations/:id/messages | Multipart `text` + optional `file` (PDF ≤ 32 MB). 202: the agent answers in the background. |
| POST | /api/admin/agents/plans/:id/approve · /reject | Approve (202, runs in the background) or reject a pending plan. |
| GET | /api/admin/agents/plans/:id/photos/:index | Preview of the photo a plan item would get. |

## Data model

- `categories` is a two-level tree (`parentId`). Products attach to a subcategory. Main categories carry
  `codePrefix` (e.g. `FRY`), the middle of our product codes.
- `business_types` ↔ `categories` through `business_type_categories`: the subcategories a venue's page shows.
- `products` has our own `code` (`GS-FRY-0001`), key specs as columns (dimensions, weight, energy, gas types,
  kW, voltage, phases, Hz, amps, certifications) and `displayRank` (higher shows first in a category).
- `product_variants` holds sizes (cooking line 90 / 120 / 150). `product_images` holds photos.
- `suppliers` (with `notes`) and their people in `supplier_contacts`. Admin-only, never shown on the site.
- `supplier_products` links a product to every supplier that makes it: their model code, our cost
  (`priceAmount` in cents, optional) and the catalog page. A product appears once on the site however many
  suppliers it has.
- `leads` records who downloaded a catalog or asked for a quote.

## Adding a feature

1. `src/modules/<feature>/` with the four subfolders above.
2. Entity + repository interface in `domain/`.
3. Use case(s) + DTOs in `application/`.
4. Prisma adapter in `infrastructure/`.
5. Controller in `presentation/`.
6. A `<feature>.module.ts` that binds them, imported by `AppModule`.

Keep framework imports (`@nestjs/*`, `@prisma/client`, HTTP types) out of `domain/`.
