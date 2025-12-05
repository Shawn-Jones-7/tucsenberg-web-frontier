# CLAUDE.md

## Project: B2B Foreign Trade Enterprise Website Template

**Stack**: Next.js 16 (App Router, Cache Components) + React 19 + TypeScript 5 + Tailwind CSS 4 + next-intl

**Philosophy**: Adopt latest stable tech stack versions, maximize new features for performance.

**Purpose**: Enterprise website template with i18n (en/zh), SSR/SSG, and enterprise-grade quality gates.

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
content/{posts,pages,products}/{locale}/ # MDX content files
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

1. **TypeScript strict** - No `any`, prefer `interface`
2. **Server Components first** - Use `"use client"` only for interactivity
3. **i18n required** - All user-facing text must use translation keys
4. **Complexity limits** - Function ≤120 lines, File ≤500 lines (see `coding-standards.md`)

---

## Agent Documentation (Progressive Disclosure)

Read these **only when relevant** to your current task:

| Document | When to Read |
|----------|--------------|
| `agent_docs/architecture.md` | Routing, data fetching, Cache Components, RSC boundaries |
| `agent_docs/coding-standards.md` | Naming, imports, complexity, bundle budgets |
| `agent_docs/content.md` | MDX content creation, frontmatter schemas, B2B product fields |
| `agent_docs/testing.md` | Writing tests, vi.hoisted, Mock system |
| `agent_docs/i18n.md` | Translations, locales, critical/deferred split |
| `agent_docs/security.md` | Input validation, security rules, sensitive data |
| `agent_docs/ui-system.md` | Components, styling, design specs |
| `agent_docs/quality-gates.md` | Complexity exemptions, CI/CD, magic numbers |

---

## Codebase Exploration

Use **ace `search_context`** for semantic/exploratory queries before attempting multiple Grep searches. Built-in tools (Grep, Glob, Read) suffice for precise symbol lookups.

For Next.js specifics: `nextjs_docs` MCP tool.

---

## Communication

Reply in Chinese. Technical terms (e.g., `Server Component`, `useEffect`) stay in English.
