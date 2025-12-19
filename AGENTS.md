# AGENTS.md

Enterprise B2B website template built with Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4.

## Project Overview

**Stack**: Next.js 16.0.8 (App Router, Turbopack) + React 19.1.1 + TypeScript 5.9.3 + Tailwind CSS 4.1.17 + next-intl

**Core Features**:
- Internationalization: English/Chinese (en/zh) via next-intl
- Theme: Light/Dark/System via next-themes
- Content: MDX + Git-based workflow
- UI: shadcn/ui components + Radix primitives

**Directory Structure**:
```
src/
├── app/[locale]/       # App Router pages (Server Components by default)
├── app/api/            # API routes (contact, whatsapp, cache, analytics)
├── components/         # UI components (layout, ui, home, i18n, theme)
├── config/             # Configuration (security, paths, features)
├── constants/          # Business constants (no magic numbers)
├── hooks/              # Custom React hooks
├── i18n/               # next-intl config
├── lib/                # Utilities, content loaders, security
├── services/           # Third-party integrations (Resend, Airtable)
└── types/              # TypeScript definitions

content/                # MDX content (posts, products, pages)
messages/               # i18n JSON (critical.json + deferred.json per locale)
middleware.ts           # Edge middleware (CSP, i18n routing)
```

---

## Build & Test Commands

```bash
pnpm dev              # Development server (Turbopack)
pnpm build            # Production build
pnpm type-check       # TypeScript validation
pnpm lint:check       # ESLint check
pnpm test             # Vitest unit tests
pnpm test:e2e         # Playwright E2E tests
pnpm ci:local         # Full CI pipeline locally
```

**Package Manager**: pnpm only (npm/yarn forbidden)
**Node Version**: 20.x (use fnm to switch)

---

## Code Conventions

### TypeScript
- **Strict mode**: `strict: true`, `noImplicitAny: true`
- **No `any`**: Forbidden in production code (tests have limited exceptions)
- **Prefer `interface`** over `type` for object shapes
- **Avoid `enum`**: Use `const` objects with `as const`
- **Use `satisfies`** for type-safe object literals
- **exactOptionalPropertyTypes**: Cannot pass explicit `undefined` to optional props; use conditional spreading

### Naming
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | `use` prefix | `useBreakpoint.ts` |
| Utilities | camelCase | `formatPrice.ts` |
| Constants | SCREAMING_SNAKE | `MAX_ITEMS` |
| Directories | kebab-case | `user-profile/` |
| Booleans | `is/has/can/should` | `isLoading` |
| Event handlers | `handle` prefix | `handleSubmit` |

### Imports
- Always use `@/` alias (resolves to `./src/`)
- No deep relative imports (`../../..`)
- No new `export *` barrels

---

## Complexity Limits

All limits are **function-level**:

| File Type | max-lines | max-lines-per-function | complexity | max-depth | max-params |
|-----------|-----------|------------------------|------------|-----------|------------|
| **Production** | 500 | 120 | 15 | 3 | 3 |
| **Config** | 800 | 250 | 18 | - | - |
| **Test** | 800 | 700 | 20 | - | 8 |

**Refactor-First Strategy**: When approaching limits, refactor before adding logic.

**Magic Numbers**: Forbidden. Use constants from `src/constants/`.

---

## Next.js 16 Architecture

### Async Request APIs (Breaking Change)

All request APIs **must be awaited**:

```typescript
// ✅ Correct
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const headersList = await headers();
}

// ❌ Error - sync access removed in Next.js 16
export default function Page({ params }) {
  return <div>{params.locale}</div>; // Will throw
}
```

**Client Components**: Use React 19 `use()` hook to unwrap Promises.

### Server vs Client Components

| Server (default) | Client (`"use client"`) |
|------------------|-------------------------|
| Data fetching, SEO | Interactivity, hooks, browser APIs |
| async/await | useState, useEffect |
| Direct API/DB access | onClick, onChange |

**Rule**: Push Client boundaries as low as possible.

### Data Serialization

Server → Client props must be serializable:
- ✅ string, number, boolean, plain objects, arrays
- ❌ functions, class instances, Date objects

### Cache Components

Project has `cacheComponents: true`. Runtime APIs (`headers()`, `cookies()`, `searchParams`) **cannot** be accessed inside `"use cache"` functions.

---

## Security Requirements

### Input Validation
- **All user input** must use Zod schema validation
- API routes must call `schema.parse(body)` before processing

### XSS Prevention
- **Never** use unfiltered `dangerouslySetInnerHTML`
- Must use `DOMPurify.sanitize()` to filter user HTML
- URLs must validate protocol (only `https://`, `http://` or `/`)

### API Security
- **Rate Limiting**: Default 10/min/IP, Contact API 5/min/IP
- **CSRF**: Cloudflare Turnstile for forms
- **Webhooks**: Must verify `x-hub-signature-256` signature

### Security Headers (via middleware.ts)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- CSP enforced with nonce

### Sensitive Data
- **Never log**: Passwords, API keys, PII
- **Never commit**: `.env` files, credentials
- Use `src/lib/logger.ts` for structured logging (no `console.log` in production)

---

## Internationalization

### Translation Structure
```
messages/
├── en/
│   ├── critical.json    # First-paint translations
│   └── deferred.json    # Lazy-loaded translations
└── zh/
    ├── critical.json
    └── deferred.json
```

### Rules
- All user-facing text must use translation keys
- Both en/zh files must have identical structure
- Use ICU message format for parameterized strings
- Server Components: `getTranslations()`
- Client Components: `useTranslations()` hook

---

## Testing Standards

- **Framework**: Vitest only (no Jest APIs)
- **Mocks**: Use `vi.hoisted` for variables
- **Coverage**: Progressive roadmap (current: ~72%, target: ≥80%)
- Centralized mocks in `src/test/constants/mock-messages.ts`

---

## Review Guidelines

When reviewing code, prioritize issues by severity:

### P0 (Critical - Must Fix Before Merge)

**Security Vulnerabilities**:
- XSS: Unfiltered `dangerouslySetInnerHTML`, unsanitized user content
- Injection: SQL/NoSQL injection, command injection
- Auth bypass: Missing authentication/authorization checks
- Sensitive data exposure: Logging secrets, hardcoded credentials
- CSRF: Missing token validation on state-changing endpoints

**Data Integrity**:
- Unhandled exceptions that could cause data loss
- Race conditions in critical paths
- Missing input validation on API routes

**Build Breakers**:
- TypeScript errors
- Failed tests

### P1 (Major - Should Fix)

**Architecture Issues**:
- Circular dependencies
- Violation of module boundaries (e.g., `lib/` importing from `components/`)
- Incorrect Server/Client Component boundaries
- Cache Components using runtime APIs (`headers()`, `cookies()` inside `"use cache"`)

**Next.js 16 Patterns**:
- Sync access to async APIs (`params`, `searchParams`, `cookies()`, `headers()`)
- Non-serializable props passed to Client Components
- Missing `await` on Promise-based APIs

**Performance Issues**:
- N+1 query patterns
- Unnecessary re-renders (missing memoization)
- Bundle size regressions
- Memory leak patterns

**Code Quality**:
- Functions exceeding 120 lines
- Cyclomatic complexity > 15
- Nesting depth > 3
- Magic numbers without constants
- Missing error handling

**i18n Issues**:
- Hardcoded user-facing text
- Missing translation keys
- Inconsistent en/zh structure

### P2 (Minor - Suggestions)

- Code style inconsistencies
- Naming convention violations
- Documentation gaps
- Test coverage gaps in non-critical paths
- Minor refactoring opportunities

---

## API Route Checklist

For new/modified API routes (`src/app/api/**/route.ts`):

- [ ] Input validated with Zod schema
- [ ] Rate limiting applied
- [ ] Error responses use consistent format
- [ ] No sensitive data in logs
- [ ] CORS headers configured if needed
- [ ] Webhook routes verify signatures

---

## Common Anti-Patterns to Flag

```typescript
// ❌ Magic numbers
if (score >= 80) return 'excellent';

// ✅ Use constants
if (score >= PERFORMANCE_THRESHOLDS.SCORE_EXCELLENT) return 'excellent';
```

```typescript
// ❌ Any type
function process(data: any) { ... }

// ✅ Proper typing
function process(data: ProcessedData) { ... }
```

```typescript
// ❌ Sync API access (Next.js 16)
export default function Page({ params }) {
  return <div>{params.locale}</div>;
}

// ✅ Async API access
export default async function Page({ params }) {
  const { locale } = await params;
  return <div>{locale}</div>;
}
```

```typescript
// ❌ Console.log in production
console.log('Debug:', data);

// ✅ Structured logging
logger.info('Processing data', { requestId, userId: user.id });
```

```typescript
// ❌ Hardcoded text
<button>Submit</button>

// ✅ i18n key
<button>{t('common.submit')}</button>
```

---

## Git Commit Format

Conventional Commits: `<type>(scope): description`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`

Examples:
- `feat(auth): add OAuth2 login flow`
- `fix(api): handle null response in contact endpoint`
- `refactor(components): simplify form state management`
