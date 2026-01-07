# Implementation Tasks

## 1. Global Selection Highlight (CSS)

- [x] 1.1 Update `src/app/globals.css` — add `--selection-background` and `--selection-foreground` for `:root` and `.dark`
- [x] 1.2 Update `src/app/globals.css` — add `::selection` and `::-moz-selection` rules under `@layer base`

## 2. QA (Manual)

- [ ] 2.1 Verify selection highlight in light/dark on representative pages (home, blog post MDX, product page)
- [ ] 2.2 Verify selection highlight for both locales (en/zh)
- [ ] 2.3 Verify Firefox renders selection highlight (optional but recommended)

## 3. Validation

- [x] 3.1 Run `pnpm format:write`
- [x] 3.2 Run `pnpm lint:check`
- [x] 3.3 Run `pnpm type-check`
- [x] 3.4 Run `pnpm test`
- [x] 3.5 Run `pnpm ci:local:quick`
- [x] 3.6 Run `openspec validate add-selection-highlight --strict`

