# CLAUDE.md

## Project: B2B Foreign Trade Enterprise Website Template

**Stack**: Next.js 16 + React 19 + TypeScript 5.8 + Tailwind CSS 4 + next-intl

**Purpose**: Production-ready B2B enterprise website template with i18n (en/zh), SSR/SSG, and enterprise-grade quality gates.

---

## Project Structure

```
src/
├── app/[locale]/          # App Router pages (async Server Components)
├── components/            # UI components (shadcn/ui based)
├── lib/                   # Utilities, content loaders, services
├── i18n/                  # next-intl config (request.ts, routing.ts)
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript definitions
messages/[locale]/         # i18n JSON (critical.json + deferred.json)
```

---

## Essential Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm type-check   # TypeScript validation
pnpm lint         # ESLint check
pnpm test         # Vitest unit tests
```

---

## Hard Constraints

1. **TypeScript strict mode** - No `any` in app code, prefer `interface` over `type`
2. **Server Components default** - Use `"use client"` only when necessary
3. **i18n via next-intl** - All user-facing text must use translation keys
4. **Complexity budgets** - Function ≤120 lines, File ≤500 lines, Complexity ≤15

---

## Agent Documentation (Progressive Disclosure)

Read these **only when relevant** to your current task:

| Document | When to Read |
|----------|--------------|
| `agent_docs/architecture.md` | App Router, routing, data fetching |
| `agent_docs/coding-standards.md` | Code style, naming, imports |
| `agent_docs/testing.md` | Writing/running tests |
| `agent_docs/i18n.md` | Translations, locale handling |
| `agent_docs/security.md` | Input validation, CSP, auth |
| `agent_docs/ui-system.md` | Components, styling, themes |

---

## Tool Usage

- **ACE `search_context`**: Use for discovering code locations before editing
- **Serena**: Use for symbol-level navigation and structured edits
- **Next.js DevTools**: Use `nextjs_docs` for official Next.js documentation

---

## Communication

All responses in **Chinese**. Technical terms (e.g., `Server Component`, `useEffect`) in English.
