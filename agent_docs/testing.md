# Testing Standards

## Framework

- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright
- **Config**: `vitest.config.mts`

## Commands

```bash
pnpm test              # Run all unit tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
pnpm test:e2e          # Playwright E2E tests
pnpm type-check:tests  # Type-check test files
```

## Test File Organization

```
src/
├── components/
│   └── ui/
│       ├── button.tsx
│       └── __tests__/
│           └── button.test.tsx
└── lib/
    ├── utils.ts
    └── __tests__/
        └── utils.test.ts

tests/
├── e2e/           # Playwright tests
├── integration/   # Cross-module tests
└── unit/          # Isolated unit tests
```

## Writing Tests

### Naming Convention
```typescript
describe('ComponentName', () => {
  it('should [expected behavior] when [condition]', () => {
    // ...
  });
});
```

### Testing Async Server Components
Server Components cannot be rendered directly in Vitest. Test their logic separately:
```typescript
// Test the data fetching function, not the component
import { getAllProductsCached } from '@/lib/content/products';

describe('getAllProductsCached', () => {
  it('should return product list', async () => {
    const products = await getAllProductsCached('en');
    expect(products).toBeDefined();
  });
});
```

### Mocking
- Mock external services (Airtable, Resend) in tests
- Use `vi.mock()` for module mocking
- Translation mocks available in test setup

## Coverage Requirements

- Aim for meaningful coverage, not 100%
- Critical paths: authentication, payment, data validation
- UI components: test user interactions, not implementation details
