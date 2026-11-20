# GastroSpecs

Commercial kitchen and refrigeration equipment: public website, catalog and admin dashboard.

```
front/     Next.js website + admin dashboard (English + Arabic)   → see front/README.md
Backend/   NestJS API + Prisma (PostgreSQL on Neon), images on R2 → see Backend/README.md
```

## Branches

- **`main`**: production. Only receives finished work, merged from `dev`.
- **`dev`**: day-to-day work. Commit and push here.

## Run locally

Each app needs its own env file (never committed). Copy the template and fill it in:

- `Backend/.env.example` → `Backend/.env`
- `front/.env.local.example` → `front/.env.local`

Then, in two terminals:

```bash
cd Backend && npm install && npm run dev     # API on http://localhost:4000/api
cd front && npm install && npm run dev       # site on http://localhost:3000
```
