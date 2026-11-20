# GastroSpecs Backend

NestJS + Prisma + PostgreSQL. Serves the public catalog and the admin API.

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

## Run everything in Docker

```bash
docker compose up        # DB + API on http://localhost:4000
docker compose down      # stop; the DB volume persists
```

## Endpoints

Public catalog routes take `?locale=en|ar` (default `en`).

| Method | Path                                | Who    | What                                                   |
| ------ | ----------------------------------- | ------ | ------------------------------------------------------ |
| POST   | /api/auth/sign-in                   | admin  | Sign in, returns a JWT.                                |
| GET    | /api/catalog/categories             | public | Main categories with their subcategories.              |
| GET    | /api/catalog/categories/:slug       | public | A category's products, grouped by subcategory.         |
| GET    | /api/catalog/business-types         | public | Business types (Fried chicken, Hotel…).                |
| GET    | /api/catalog/business-types/:slug   | public | A business type's products, grouped by subcategory.    |
| GET    | /api/catalog/products/:slug         | public | One product with variants and images.                  |
| POST   | /api/leads                          | public | Save a lead (PDF download or quote). Email or phone.   |
| GET    | /api/leads                          | admin  | All leads, newest first.                               |
| POST   | /api/auth/change-password           | admin  | Change your own password.                              |
| GET    | /api/admin/catalog/categories       | admin  | Category tree, both languages, with image URLs.        |
| PUT    | /api/admin/catalog/categories/:id/image | admin | Upload or replace a category image (field `file`). |
| DELETE | /api/admin/catalog/categories/:id/image | admin | Remove a category image.                           |
| POST   | /api/admin/catalog/products/:id/images  | admin | Add a product image (field `file`).                |
| DELETE | /api/admin/catalog/products/:id/images/:imageId | admin | Remove a product image.                    |

Admin routes need `Authorization: Bearer <token>` from sign-in.

## Images (Cloudflare R2)

Files live in the R2 bucket, organized by owner:

```
categories/<categoryId>/<random>.webp
products/<productId>/<random>.webp
```

- The database stores the **key** only; `R2_PUBLIC_URL` turns it into a URL. Changing domain = one `.env` line.
- Uploads are checked by their real file signature (JPEG, PNG, WebP, AVIF), up to 10 MB.
- Replacing or removing an image deletes the old file. Cloudflare's edge may keep serving it for up to a day.

## Data model

- `categories` is a two-level tree (`parentId`). Products attach to a subcategory.
- `business_types` ↔ `products` is many-to-many through `product_business_types`, whose `sortOrder` orders a venue's page.
- `product_variants` holds sizes (cooking line 90 / 120 / 150). `product_images` holds photos.
- `leads` records who downloaded a catalog or asked for a quote.

## Adding a feature

1. `src/modules/<feature>/` with the four subfolders above.
2. Entity + repository interface in `domain/`.
3. Use case(s) + DTOs in `application/`.
4. Prisma adapter in `infrastructure/`.
5. Controller in `presentation/`.
6. A `<feature>.module.ts` that binds them, imported by `AppModule`.

Keep framework imports (`@nestjs/*`, `@prisma/client`, HTTP types) out of `domain/`.
