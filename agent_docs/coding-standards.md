# Coding Standards

## TypeScript

### Strict Mode Rules
- `strict: true`, `noImplicitAny: true` enforced
- **No `any`** in application code (tests may have limited exceptions)
- Prefer `interface` over `type` for object shapes
- Use `satisfies` for type-safe object literals
- Avoid `enum`, use `const` objects instead

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase with `use` prefix | `useBreakpoint.ts` |
| Utilities | camelCase | `formatPrice.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_ITEMS` |
| Types/Interfaces | PascalCase | `ProductSummary` |

## Imports & Modules

### Path Aliases
Always use `@/` alias. Never use deep relative imports.
```typescript
// Good
import { Button } from '@/components/ui/button';

// Bad
import { Button } from '../../../components/ui/button';
```

### Import Order
1. React/Next.js imports
2. Third-party libraries
3. Internal aliases (`@/`)
4. Relative imports (same directory only)
5. Types (with `type` keyword)

## Complexity Budgets

| Metric | Limit |
|--------|-------|
| Function length | ≤ 120 lines |
| File length | ≤ 500 lines |
| Cyclomatic complexity | ≤ 15 |

**Refactor-First Strategy**: If adding code would exceed limits, refactor existing code first.

## Constants

- No magic numbers in code
- Group constants by domain in `src/constants/`
- Use `as const` for literal types
- User-facing text must use i18n keys, not hardcoded strings

## Git Commits

Follow Conventional Commits:
```
type(scope): description

Types: feat, fix, refactor, docs, test, chore, perf
```
