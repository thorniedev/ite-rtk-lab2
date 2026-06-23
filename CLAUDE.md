# CLAUDE.md

Project guidance for AI coding agents working in this repository.

## Project Snapshot

- App: `lab2-nextjs`
- Framework: Next.js `16.2.7` with the App Router under `src/app`
- Runtime UI: React `19.2.4`, TypeScript strict mode, Tailwind CSS `4`
- State/data: Redux Toolkit, React Redux, RTK Query
- Tables/UI: TanStack Table for table behavior, Shadcn-style UI wrappers in `src/components/ui`
- Path alias: `@/*` maps to `./src/*`

## Non-Negotiable Repo Rule

This project has an `AGENTS.md` rule:

> This is NOT the Next.js you know. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.

Before changing Next.js routes, layouts, config, images, metadata, data fetching, or server/client component behavior, read the matching installed doc from `node_modules/next/dist/docs/`. Do not rely on older Next.js conventions from memory.

Useful docs for this codebase:

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/src-folder.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/intercepting-routes.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/images.md`

## Commands

```bash
npm run dev
npm run build
npm run lint
```

Run `npm run build` before considering feature work complete. For doc-only changes, a build is usually unnecessary.

## App Structure

- `src/app/layout.tsx` is the root layout. It imports global CSS, configures Geist fonts, and wraps all routes in `StoreProvider`.
- `src/app/StoreProvider.tsx` delegates to the client provider in `src/lib/providers.tsx`.
- `src/lib/providers.tsx` creates one Redux store per browser session using `useRef(makeStore())`.
- `src/lib/store.ts` registers normal slices plus RTK Query reducers and middleware.
- `src/components/ui/*` contains local Shadcn-style primitives. Prefer these over raw Radix or ad hoc controls when a matching component exists.
- `src/types/*` contains shared product types. Update these first when API response shapes change.

## Routing Notes

This repo uses the `src` folder convention, so routes live in `src/app`.

Product table routes:

- `/product-table` -> `src/app/product-table/page.tsx`
- `/product-table/[slug]` -> `src/app/product-table/[slug]/page.tsx`
- Modal slot -> `src/app/product-table/@modal`
- Intercepted modal detail -> `src/app/product-table/@modal/(.)[slug]/page.tsx`
- Slot fallback -> `src/app/product-table/@modal/default.tsx`

Keep `@modal/default.tsx` returning `null`; it prevents unmatched parallel-route slot 404s on hard refreshes. Remember that `@modal` is a slot, not a URL segment. The `(.)[slug]` folder intercepts the sibling `[slug]` route for client-side modal navigation, while direct loads of `/product-table/[slug]` render the full detail page.

In this installed Next version, dynamic route `params` in App Router pages are typed as promises in the current codebase:

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
}
```

Follow the nearby route files unless the installed docs say otherwise.

## Data And State

The Redux store is created in `src/lib/store.ts`.

- Add new regular slices to the `reducer` object.
- Add new RTK Query APIs with both `[api.reducerPath]: api.reducer` and `api.middleware`.
- Keep provider code client-only; hooks such as `useGetProductsQuery` must be used in client components.

Current API slices:

- `src/lib/features/product/productApi.ts` calls Fake Store API at `https://fakestoreapi.com/`.
- Ecommerce requests go through `/api/ecommerce/*`, which forwards to `SPRINGBOOT_API_URL` on the server. The local guide expects Spring Boot on `http://localhost:7070`, Keycloak on `http://localhost:9090`, realm `ite`, and client `ecommerce-api`.

Fake Store products can have inconsistent image/category/date fields. Guard optional fields such as `image`, `images`, `creationAt`, and `updatedAt` instead of assuming they are present.

## Product Table Feature

The table implementation lives under `src/components/product-table`.

- `product-table-client.tsx` handles RTK Query loading/error/empty states.
- `data-table.tsx` owns TanStack Table state: search, sorting, pagination, and column visibility.
- `columns.tsx` defines product columns and cell rendering.
- `product-detail.tsx` renders detail content for both the full page and modal.
- `product-modal.tsx` wraps detail content in a dialog-like route modal.

Use this mental model when changing the table:

- Shadcn Table controls how the table looks.
- TanStack Table controls how the table behaves.

Do not remove `@tanstack/react-table` unless you also replace filtering, sorting, pagination, row models, and column visibility behavior.

## Styling And Components

- Tailwind CSS is configured through `src/app/globals.css` and Shadcn metadata in `components.json`.
- Use `cn` from `src/lib/utils.ts` for conditional class names.
- Keep card radii and spacing consistent with the existing Shadcn-style components.
- Prefer `lucide-react` icons, already configured by `components.json`.
- Use `next/image` for remote product images and update `next.config.ts` `images.remotePatterns` when adding a new image host.

## Quality Checklist

Before finishing code changes:

- Read the relevant installed Next doc if the change touches framework behavior.
- Preserve requested route/file paths exactly.
- Keep server components server-side unless hooks, browser APIs, or interactive state require `"use client"`.
- Verify RTK Query reducers and middleware are both registered when adding an API.
- Handle loading, error, and empty states for data-driven UI.
- Run `npm run build` for feature changes and `npm run lint` when changing lint-sensitive code.
