# Phase 07: Core Components Review

## Overview
Scope: `src/components/`, `src/app/[locale]/`, shadcn/ui integration. Focus areas included Server/Client boundaries, Next.js 16 async APIs, serialization, accessibility, component size, props typing, and re-render optimization.

## Findings by Component

### Footer (`src/components/footer/Footer.tsx`)
- **P0 – Server/Client boundary:** Uses `useTranslations` without a `'use client'` directive, so the component is treated as a Server Component while depending on client-only hooks. Imported in `src/app/[locale]/layout.tsx`, this will fail under Next.js 16 runtime rules. 【F:src/components/footer/Footer.tsx†L1-L158】【F:src/app/[locale]/layout.tsx†L1-L35】

**GitHub Issue Draft:**
- *Title:* Mark `Footer` as Client Component for `useTranslations`
- *Body:* `Footer` uses `useTranslations` but lacks a `'use client'` pragma, causing an invalid Server/Client boundary when rendered from the locale layout. Add the directive and confirm all props remain serializable.

**PR Draft (quick fix):**
- Add `'use client'` at the top of `Footer.tsx`, verify no server-only APIs are used, and rerun layout to ensure hydration succeeds.

### ProductInquiryForm (`src/components/products/product-inquiry-form.tsx`)
- **P1 – Component size & responsibility:** The main `ProductInquiryForm` function spans ~125 lines and handles submission state, Turnstile token management, translations, and markup in a single scope. Exceeds the 120-line guideline and mixes data/control flow with rendering, making it harder to test and reuse. Extracting submission/Turnstile logic into a hook and splitting UI into smaller presentational components would improve maintainability. 【F:src/components/products/product-inquiry-form.tsx†L312-L436】

**GitHub Issue Draft:**
- *Title:* Refactor `ProductInquiryForm` into hooks and presentational subcomponents
- *Body:* Break out form submission + Turnstile handling into a dedicated hook, keep i18n + rendering in lean components, and ensure the main render function stays under 120 lines.

**PR Draft (quick fix):**
- Introduce `useProductInquiryForm` hook for submission/Turnstile state, keep `ProductInquiryForm` focused on composition, and update tests accordingly.

### ContactFormContainer (`src/components/forms/contact-form-container.tsx`)
- **P1 – Component breadth:** File is ~450 lines with multiple inline subcomponents and form state wiring. While individual functions stay under 120 lines, the container owns submission handling, optimistic messaging, Turnstile mounting, and layout. Splitting field groups and status handling into separate files or hooks would reduce cognitive load and improve reusability. 【F:src/components/forms/contact-form-container.tsx†L356-L454】

**GitHub Issue Draft:**
- *Title:* Modularize `ContactFormContainer` to reduce file size and shared responsibilities
- *Body:* Move field groups/status blocks into isolated components and encapsulate submit/Turnstile logic in hooks to keep the container leaner.

**PR Draft (quick fix):**
- Extract status/message blocks and form wiring into dedicated modules/hooks while keeping the public API unchanged.

## Quick Checks
- "use client" occurrences in `src/components`: 0 with double quotes; client directives mostly use single quotes. No unnecessary client directives found, but `Footer` is missing the required pragma. (Command: `rg '"use client"' src/components --glob '*.tsx' | wc -l`)
- Largest components exceed 200 lines; primary refactor targets noted above. (Command: `wc -l src/components/**/*.tsx | sort -n | tail -20`)

## Recommendations
1. Treat **Footer** boundary fix as highest priority (P0) to avoid runtime errors in the shared layout.
2. Schedule refactors for **ProductInquiryForm** and **ContactFormContainer** to align with component size guidelines and improve testability.
3. After fixes, rerun `pnpm lint:check` and relevant component tests to guard regressions.
