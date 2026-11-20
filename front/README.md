# GastroSpecs — public website

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · next-intl (English + Arabic RTL).

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /en
npm run build    # production build (pages are pre-rendered as static HTML)
npm run lint
```

## Structure

```
src/
  app/                    Routing only: thin files that compose features
    [locale]/             layout (html lang/dir, header, footer), pages, 404
    sitemap.ts robots.ts  SEO
    globals.css           Brand tokens (colors, fonts) + a few utilities
  features/               One folder per page or feature (vertical slices)
    home/
      HomePage.tsx        Composes the sections
      content.ts          Order of slides, sectors, steps… and which photo each uses
      components/         Sections used only by the home page
    about/                About page (who we help: traders, food businesses)
    services/             Services page (what we do: trade supply, engineering & supply)
    brand/                Own-brand page ("coming soon", not indexed yet)
  shared/                 Used by more than one feature
    brand/Logo.tsx        Wordmark + GS icon, extracted 1:1 from the brand kit PDF
    config/               site.ts (contact, main nav), media.ts (all photos), fonts.ts
    layout/               Header, Footer, MobileMenu, LocaleSwitcher, nav builder
    sections/             Page sections reused on several pages (Trust, ContactCta)
    lib/                  Small helpers (cn, seo, routes, contact links, format)
    ui/                   Generic building blocks (Section, PageHero, ButtonLink, Photo…)
  i18n/                   next-intl routing and request config
  messages/en.json ar.json  All copy. Keys are type-checked against en.json.
```

## Rules

- **Copy** lives in `messages/`. Never hard-code text in components. Arabic is written natively, not translated word for word.
- **Colors and fonts** come from the tokens in `globals.css` (`ink`, `paper`, `signal`, `steel`, `graphite`…). Red (`signal`) is only for the logo line and calls to action.
- **Logo**: use `Wordmark` / `GsIcon`. Never redraw or restyle it.
- **Photos**: register them in `shared/config/media.ts` and render them with `shared/ui/Photo`. Final photos go in `public/images/`. To stay sharp, `sizes` must describe the width the photo is really drawn at: when the box is not the photo's shape, pass `cropRatio` (CDN photos) or save the file in the box's shape (local photos).
- **RTL**: use logical utilities (`ms-`, `pe-`, `start-`, `text-start`) instead of left/right.
- **Server first**: components are Server Components. Use `"use client"` only for interaction (slider, menu, language switch) and pass strings in as props.
- **New page**: add a folder in `features/`, a thin route in `app/[locale]/` (use `routeMetadata` from `shared/lib/seo`), its messages, its path in `app/sitemap.ts`, and a `mainNav` entry in `shared/config/site.ts` if it belongs in the menu.

## Not decided yet

- Contact details: `shared/config/site.ts` (`whatsapp`, `email`). Empty values show "Coming soon"; the WhatsApp button appears automatically once a number is set.
- Photos are temporary (Unsplash, plus photos the owner chose; the cooking line is an AI re-render of one of them). Replace with own factory/project photos.
