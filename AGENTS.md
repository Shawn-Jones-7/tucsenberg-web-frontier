# Next.js 15 Enterprise Development Guidelines

## Core Requirements

**Role**: TypeScript/React 19/Next.js 15 engineer delivering maintainable solutions

**Tech Stack**: TypeScript 5.9.2, Next.js 15.5.3 App Router, React 19 Server Components, shadcn/ui, Radix UI, Tailwind CSS 4.1.11, next-intl 4.3.4, MDX, Resend, Zod, next-themes, Lucide React

**Code Style**: Functional/declarative programming, early returns, DRY principle, accessibility compliance, performance optimization with `React.memo`, `useMemo`, `useCallback`

## TypeScript Standards

**Core Rules**: All code must use TypeScript, prefer `interface` over `type`, avoid `enum` (use const assertions), maintain strict type safety, use `satisfies` operator, write type guards for complex objects

**Type Safety**: Production code forbids `any`; tests/scripts allow minimal `any` usage

### React 19 Hook Types

```typescript
import { useActionState, useOptimistic, useFormStatus } from 'react';

type ActionState = { message: string; errors?: Record<string, string[]> };
type ServerAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;

// useActionState
const [state, formAction, pending] = useActionState<ActionState>(serverAction, { message: '' });

// useOptimistic
const [optimisticTodos, addOptimisticTodo] = useOptimistic(todos, (state, newTodo) => [...state, newTodo]);

// useFormStatus
const SubmitButton = () => {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? 'Submitting...' : 'Submit'}</button>;
};
```

### TypeScript 5.7+ Advanced Patterns

```typescript
// Template literal types
type EventName<T extends string> = `on${Capitalize<T>}`;
type ApiResponse<T> = T extends string ? { message: T } : { data: T };
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };

// Generic component
interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Array<{ key: keyof T; header: string; render?: (value: T[keyof T], item: T) => React.ReactNode }>;
  onRowClick?: (item: T) => void;
}

// Event handler types
type ButtonClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;
type InputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
```

## Naming & Organization

**Naming**: Boolean values (`is`, `has` prefix), event handlers (`handle` prefix), directories/files (kebab-case), schemas (PascalCase), prefer named exports

**React 19 Patterns**: Prefer Server Components for data fetching, use `"use client"` only for interactivity, App Router structure, async/await in server components

### Component Organization

This repository adopts a unified component and code organization approach based on functionality/domain (rather than technical layering by "server/client/shared"). Example:

```
src/
├── components/
│   ├── forms/
│   ├── layout/
│   ├── monitoring/
│   ├── i18n/
│   └── shared/
├── features/
├── services/
├── lib/
└── app/[locale]/
```

Guidelines:
- Default to using Server Components; only create small Client component "islands" when interactivity/events/browser APIs are needed.
- Keep interactive logic close to usage scenarios, preferably within corresponding functional domain directories (e.g., `components/forms/*`).
- Avoid top-level technical layering directory structures like "server/client/shared".

### Component Patterns

```typescript
// Server Component - async data fetching
async function ProductContainer() {
  const products = await fetchProducts();
  const user = await getCurrentUser();
  return <div><ProductList products={products} /><UserWelcome user={user} /></div>;
}

// Client Component - interactivity
'use client';
import { useState, useEffect } from 'react';

function ContactForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button disabled={isSubmitting}>Submit</button>
    </form>
  );
}

// Anti-patterns: No hooks/events in Server Components, no browser APIs
```

### Server/Client Boundaries

**Serializable Props**: strings, numbers, booleans, arrays, objects, ISO date strings
**Non-serializable**: functions, class instances, DOM nodes, Date objects, Symbols

```typescript
// Server fetches data, Client handles interaction
async function ProductPageContainer({ productId }: { productId: string }) {
  const product = await fetchProduct(productId);
  return <ProductPageClient product={product} />;
}

'use client';
function ProductPageClient({ product }: { product: SerializableProduct }) {
  const [quantity, setQuantity] = useState(1);
  return <div><h1>{product.name}</h1><button onClick={handleAddToCart}>Add to Cart</button></div>;
}
```

**Rules**: No non-serializable props from Server to Client; use `'use client'` for event handlers/hooks

## UI Components

**Guidelines**: Use shadcn/ui, Tailwind CSS, custom components in `components/ui`, avoid modifying library code, use clsx + tailwind-merge for conditional classes

### Radix UI + React 19 Integration

```typescript
import * as Form from '@radix-ui/react-form';
import * as Dialog from '@radix-ui/react-dialog';
import { useActionState, useFormStatus } from 'react';

// Form with Server Actions
function RadixForm() {
  const [state, formAction] = useActionState(submitAction, { message: '' });
  return (
    <Form.Root action={formAction}>
      <Form.Field name="email">
        <Form.Control asChild><input type="email" required /></Form.Control>
        {state.errors?.email && <Form.Message>{state.errors.email}</Form.Message>}
      </Form.Field>
      <Form.Submit asChild><SubmitButton /></Form.Submit>
    </Form.Root>
  );
}

// Dialog with Server Actions
function RadixDialog({ trigger }: { trigger: React.ReactNode }) {
  const [state, formAction] = useActionState(dialogAction, null);
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <form action={formAction}>
            <input name="confirmValue" placeholder="Type 'confirm'" />
            <SubmitButton />
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? 'Processing...' : 'Submit'}</button>;
}
```

### Zod + React 19 Form Validation

```typescript
// Server Action with Zod
'use server';
const ContactSchema = z.object({
  name: z.string().min(2), email: z.string().email(), message: z.string().min(10)
});

export async function submitContact(prevState: any, formData: FormData) {
  const result = ContactSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { errors: result.error.flatten().fieldErrors };
  await processContact(result.data);
  return { message: 'Success' };
}

// Client Form
'use client';
function ContactForm() {
  const [state, formAction] = useActionState(submitContact, { message: '' });
  return (
    <form action={formAction}>
      <input name="name" aria-invalid={!!state.errors?.name} />
      {state.errors?.name && <div role="alert">{state.errors.name}</div>}
      <input name="email" type="email" aria-invalid={!!state.errors?.email} />
      {state.errors?.email && <div role="alert">{state.errors.email}</div>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### next-themes Integration

```typescript
// Provider Setup
'use client';
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Theme Toggle
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

## Accessibility Guidelines

### WCAG 2.1 AA Compliance Standards

- **Perceivable**: Information presentable in ways users can perceive
- **Operable**: Interface components operable by all users
- **Understandable**: Information and UI operation understandable
- **Robust**: Content robust for various assistive technologies

### jest-axe Testing Setup

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

### Accessibility Testing Patterns

```typescript
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

describe('Component Accessibility', () => {
  it('meets WCAG 2.1 AA standards', async () => {
    const { container } = render(<Component />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('supports keyboard navigation', async () => {
    const { container } = render(<InteractiveComponent />);
    expect(await axe(container, {
      rules: { 'keyboard': { enabled: true } }
    })).toHaveNoViolations();
  });
});
```

### React 19 Accessibility Patterns

#### Form Actions with Accessibility

```typescript
function AccessibleForm() {
  const [state, formAction] = useActionState(submitAction, { message: '' });
  return (
    <form action={formAction}>
      <input id="email" name="email" type="email" required
             aria-describedby={state.errors?.email ? "email-error" : undefined}
             aria-invalid={state.errors?.email ? "true" : "false"} />
      {state.errors?.email && <div id="email-error" role="alert">{state.errors.email}</div>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} aria-busy={pending}>
    {pending ? 'Submitting...' : 'Submit'}
  </button>;
}
```

#### Optimistic Updates with Screen Reader Support

```typescript
function AccessibleTodoList({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos, (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );

  return (
    <ul role="list" aria-label="Todo items">
      {optimisticTodos.map(todo => (
        <li key={todo.id} role="listitem">
          <span className={todo.pending ? 'opacity-50' : ''}>{todo.text}</span>
          {todo.pending && <span className="sr-only">Adding item...</span>}
        </li>
      ))}
    </ul>
  );
}
```

### Semantic HTML Guidelines
```typescript
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
<main>
  <h1>Page Title</h1>
  <section aria-labelledby="content-heading">
    <h2 id="content-heading">Content Section</h2>
  </section>
</main>
<footer>
  <p>&copy; 2025 Company</p>
</footer>
```

### ARIA Patterns for React 19
```typescript
function AccessibleModal({ isOpen, onClose, title }) {
  const [state, formAction] = useActionState(handleSubmit, null);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
         aria-describedby="modal-description" hidden={!isOpen}>
      <h2 id="modal-title">{title}</h2>
      <form action={formAction}>
        <div id="modal-description">{/* Form content */}</div>
        <button type="button" onClick={onClose} aria-label="Close modal">×</button>
      </form>
    </div>
  );
}

function LoadingAwareButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" aria-busy={pending}
            aria-describedby={pending ? "loading-description" : undefined}>
      {pending ? 'Processing...' : 'Submit'}
      {pending && <span id="loading-description" className="sr-only">
        Request is being processed, please wait</span>}
    </button>
  );
}
```

### Color Contrast Standards
```css
/* WCAG 2.1 AA: 4.5:1 normal text, 3:1 large text */
:root {
  --text-primary: #1a1a1a;
  --accent: #0066cc;
}
[data-theme='dark'] {
  --text-primary: #ffffff;
  --accent: #4da6ff;
}

.focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### Screen Reader Support
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

```typescript
function AccessibleImage({ src, alt, decorative = false }) {
  return (
    <img
      src={src}
      alt={decorative ? "" : alt}
      role={decorative ? "presentation" : undefined}
    />
  );
}

function AccessibleDataVisualization({ data, description }) {
  const [state, updateAction] = useActionState(updateChart, data);

  return (
    <div>
      <div aria-describedby="chart-description">
        <Chart data={state} />
      </div>
      <div id="chart-description" className="sr-only">
        {description}
      </div>
      <form action={updateAction}>
        <button type="submit">Update Chart</button>
      </form>
    </div>
  );
}
```

### Testing React 19 Accessibility Features
```typescript
describe('Form Actions Accessibility', () => {
  it('provides proper ARIA attributes during submission', async () => {
    const { container } = render(<AccessibleForm />);
    // Test optimistic state accessibility
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

### Testing Scripts
```json
{
  "scripts": {
    "test:a11y": "jest --testPathPattern=a11y",
    "lighthouse:a11y": "lhci collect --settings.onlyCategories=accessibility"
  }
}
```

### Accessibility Checklist for React 19

#### Development
- [ ] Form actions include proper ARIA states and error handling
- [ ] useFormStatus provides accessible loading indicators
- [ ] Optimistic updates announce changes to screen readers
- [ ] Server actions maintain focus management
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators meet contrast requirements
- [ ] Form validation errors are properly associated
- [ ] Loading states are announced to assistive technology

#### Testing
- [ ] jest-axe tests pass for all React 19 patterns
- [ ] Form action accessibility tested with screen readers
- [ ] Optimistic update announcements verified
- [ ] Keyboard navigation works with new hook patterns
- [ ] Focus management tested during async operations
- [ ] Error states are accessible and announced properly

## Internationalization Guidelines

- Use **next-intl** as the i18n framework
- Use the `useTranslations` hook inside components
- Store translations in `messages/[locale].json`
- **Strict ICU typing**: enable `strictMessageTypeSafety` in `getRequestConfig` and declare `AppConfig.Messages` in `global.ts` to get compile-time checks for message arguments
- **Provider composition**: Currently directly composing `NextIntlClientProvider`, `EnterpriseAnalytics`, `ThemeProvider` in `src/app/[locale]/layout.tsx`. Can extract unified Providers component for reuse if needed.

### Advanced Features
- **Smart Language Detection**: Automatic locale detection based on geo-location and browser preferences
- **Performance Monitoring**: Built-in i18n performance tracking with `I18nPerformanceMonitor`
- **Caching Strategy**: LRU cache with TTL for translation messages via `I18nCacheManager`
- **Middleware Integration**: CSP-compliant language detection in `middleware.ts`

### Configuration Files
- `src/i18n/routing.ts` - Next-intl routing configuration with shared pathnames
- `src/i18n/request.ts` - Request configuration with smart detection
- `middleware.ts` - Language detection and security headers
- `i18n.json` - Translation automation configuration

### Automation
- Execute `pnpm i18n:sync:check` in CI and pre-commit to validate key set consistency between `messages/en.json` and `messages/zh.json`; also validate corresponding file and Front Matter alignment between `content/*/en/` and `content/*/zh/`.

## Multi-language File Synchronization Rules

- **Always update both languages**: When modifying content in `content/*/en/`, must also update corresponding `content/*/zh/` files
- **UI translations sync**: Changes to `messages/en.json` must be reflected in `messages/zh.json`
- **Document synchronization**: Updates to `public/documents/*/en/` require corresponding updates to `public/documents/*/zh/`
- **Route structure consistency**: Maintain identical file structure across language directories
- **Metadata alignment**: Ensure Front Matter metadata is consistent across language versions

## Security Guidelines

- Enable **strict CSP** site-wide via Middleware (with `nonce`); avoid outputting CSP in `next.config.ts`
- Set security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`
- Use **Cloudflare Turnstile** for form protection and bot detection on contact forms and key interactions
- Implement **basic rate limiting** via Next.js Middleware for API routes when needed
- Run `pnpm audit` in CI and enable **GitHub Dependabot** for automatic security updates

### CSP Policy Source Unification
- Recommend generating CSP in Middleware (with per-request `nonce`), avoid outputting CSP again in `next.config.ts/headers()` to prevent duplication and conflicts; other static security headers can continue to be configured in `next.config.ts`
- Typical directive examples (trim as needed):
  - `default-src 'self'`
  - `script-src 'self' 'nonce-<nonce>' https://va.vercel-scripts.com https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com`
  - `style-src 'self' 'nonce-<nonce>' https://fonts.googleapis.com`
  - `img-src 'self' data: https:`
  - `font-src 'self' data: https://fonts.gstatic.com`
  - `connect-src 'self' https://vitals.vercel-insights.com https://o4507902318592000.ingest.us.sentry.io https://api.resend.com`

## Content Management Guidelines

### Dynamic Content Management

- Dynamic content is currently maintained directly by code and static resources, no external CMS integration yet

### Static Content: MDX

- Prefer **@next/mdx** for handling local MDX pages under App Router; use `next-mdx-remote-client/rsc` when rendering remote content.
- Store content in `content/` directory with language separation (`content/*/en/` and `content/*/zh/`)
- Use Front Matter for metadata: `title`, `description`, `publishedAt`, `slug`
- Organize content by type: `pages/`, `products/`, `solutions/`, `case-studies/`
- Support embedded React components within MDX content
- Use `gray-matter` for Front Matter parsing and metadata extraction

### Content Strategy

- **Static content** (documentation, policies): Use MDX files, maintain multi-language synchronization
- **Dynamic content**: Team will evaluate and decide whether to introduce CMS solutions based on business requirements

## Service Integration Guidelines

- Call the **Resend** API inside API routes to send emails
- Current email templates are generated through strings (`src/lib/resend-templates.ts`), can gradually migrate to React components for visual reuse if needed later
- Initialize **Vercel Analytics** in the layout component for performance monitoring
- Recommend **Zustand** for lightweight state management; use **Redux Toolkit** for complex scenarios

## Build & Package Management

- Use **pnpm ≥ 8** as the package manager
- Development: `next dev --turbo` (Turbopack hot reload)
- Production build: `next build` (SWC)
- Monitor bundle size with **@next/bundle-analyzer**; split dynamic imports when needed
- Ensure `.npmrc` sets `shamefully-hoist=false` and `shared-workspace-lockfile=true`
- **Path Alias Constraints**

  Maintain a single, canonical alias for project imports:

  - The alias `@/` **must** always resolve to `./src/`
  - This mapping **must** be identical in `tsconfig.json`, `next.config.ts`, and ESLint's import resolution configuration
  - Please update alias configuration before adjusting directory structure, currently manually confirmed through code review and static checks for alias consistency

## Environment Variables & Config Validation

- Define and validate env vars in `env.mjs` using **@t3-oss/env-nextjs**
- Fail CI if required variables are missing
- Repository contains development/example `.env.*` files, prohibit committing production keys or sensitive credentials

## Monitoring & Logging

- Enable **@vercel/analytics** and initialize in `src/app/layout.tsx`
- Report Core Web Vitals via **web-vitals**
- Use **Vercel function logs** for server-side monitoring and API route performance tracking
- Implement **basic error logging** with console.error collection, suitable for enterprise websites
- Provide a custom **Error Boundary** for user-friendly error pages
- Track key business events with **Vercel Analytics** custom events

## SEO Optimization Guidelines

- Use Next.js App Router's **Metadata API** (`metadata` and `generateMetadata`) to manage page metadata; **next-seo** only as optional supplement in specific scenarios
- Generate `sitemap.xml` and `robots.txt` automatically with **next-sitemap**
- Enable multi-language **hreflang** tags for international SEO
- Use **static OG images** for consistent brand presentation, with **@vercel/og** as optional dynamic generation for specific use cases
- Use **next/image** for images and **next/font** for fonts; lazy load by default

## Performance Budget Management

### Core Web Vitals 2025 Compliance

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Interaction to Next Paint (INP)**: < 200ms

### Lighthouse CI Configuration for React 19

```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.92 }],
        'categories:accessibility': ['error', { minScore: 0.95 }]
      }
    }
  }
};
```

### Turbopack Configuration Essentials

```javascript
const nextConfig = {
  turbopack: {
    resolveAlias: {
      '@': './src',
      'components': './src/components'
    },
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.json']
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    reactCompiler: true
  }
}
```

### Development Performance Benefits

- **10x faster** cold starts
- **700x faster** updates
- **Incremental compilation**
- **Better memory** usage

### Performance Optimization Checklist

#### Development Phase
- [ ] Enable Turbopack for faster builds and configure path aliases
- [ ] Set up Web Vitals monitoring and use React 19 concurrent features
- [ ] Implement proper loading states with Suspense boundaries

#### Build Phase
- [ ] Enable package import optimization and image optimization
- [ ] Set up proper caching headers and analyze bundle size
- [ ] Test Core Web Vitals scores

#### Production Phase
- [ ] Monitor real-user performance metrics and error tracking
- [ ] Implement progressive enhancement and CDN for static assets
- [ ] Monitor and optimize database queries

## Testing Guidelines

- **Testing Framework**: **Vitest 3.2.4** with React Testing Library
- **Unit tests**: Filenames `*.test.ts?(x)` in `src/**` directories
- **End-to-end tests**: **@playwright/test** – directory `e2e/`
- **Performance benchmarks**: **@lhci/cli** (Lighthouse CI)
- **Coverage Provider**: **@vitest/coverage-v8** for accurate coverage analysis
- **Test Environment**: jsdom for DOM simulation, happy-dom for browser tests
- CI will execute `pnpm type-check`, `pnpm type-check:tests`, `pnpm lint:check`, `pnpm test:coverage`, `pnpm test:e2e`
- Coverage policy (phased approach)
  - Phase 1 (current): Global coverage ≥ 65% (statements/lines/branches/functions)
  - Phase 2: Global coverage ≥ 75%
  - Phase 3 (target): Global coverage ≥ 80%
  - Enforced by Vitest `coverage.thresholds.global` in `vitest.config.ts`
  - **ESM-only packages**: Inline ESM deps (e.g. `next-intl`, `@radix-ui/react-*`) via `deps.inline` to avoid resolution errors

### Vitest Configuration for React 19
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 65,
          functions: 65,
          lines: 65,
          statements: 65,
        },
      },
    },
    deps: {
      inline: [
        'next-intl',
        '@radix-ui/react-*',
        'lucide-react',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

### React 19 Hook Testing Patterns
```typescript
import { renderHook, act } from '@testing-library/react';
import { useActionState, useOptimistic } from 'react';

describe('useActionState', () => {
  it('handles form submission correctly', async () => {
    const mockAction = jest.fn().mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useActionState(mockAction, { success: false })
    );

    const [state, formAction] = result.current;

    await act(async () => {
      const formData = new FormData();
      formData.append('test', 'value');
      await formAction(formData);
    });

    expect(mockAction).toHaveBeenCalledWith(
      { success: false },
      expect.any(FormData)
    );
  });
});

describe('useOptimistic', () => {
  it('updates state optimistically', () => {
    const initialTodos = [{ id: 1, text: 'Test', completed: false }];

    const { result } = renderHook(() =>
      useOptimistic(initialTodos, (state, newTodo) => [...state, newTodo])
    );

    const [optimisticTodos, addOptimisticTodo] = result.current;

    act(() => {
      addOptimisticTodo({ id: 2, text: 'New Todo', completed: false });
    });

    expect(result.current[0]).toHaveLength(2);
  });
});
```

### Component Testing with React 19
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useActionState } from 'react';

function TestForm() {
  const [state, formAction] = useActionState(
    async (prevState, formData) => {
      const name = formData.get('name');
      return { message: `Hello ${name}` };
    },
    { message: '' }
  );

  return (
    <form action={formAction}>
      <input name="name" placeholder="Enter name" />
      <button type="submit">Submit</button>
      {state.message && <p>{state.message}</p>}
    </form>
  );
}

describe('TestForm', () => {
  it('submits form and displays message', async () => {
    render(<TestForm />);

    const input = screen.getByPlaceholderText('Enter name');
    const button = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(input, { target: { value: 'John' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Hello John')).toBeInTheDocument();
    });
  });
});
```

### Performance Best Practices
1. **User Input Priority**: Use `useTransition` for non-urgent updates
2. **Heavy Computations**: Use `useDeferredValue` for expensive renders
3. **Progressive Loading**: Implement nested Suspense boundaries with visual feedback
4. **Bundle Optimization**: Use dynamic imports, tree shaking, Next.js Image
5. **Caching**: Implement cache headers and SWR patterns

## Error Prevention Guidelines

### Pre-Development Checks

#### TypeScript Configuration Verification
- [ ] Confirm tsconfig.json has strict mode enabled and check for unused imports
- [ ] Verify type definition files are up to date and @types/* packages match dependency versions

#### Project Dependencies Verification
- [ ] Confirm all required dependencies are installed and check version compatibility
- [ ] Validate type definition packages (@types/*) and verify peer dependencies are satisfied

### Development Phase Checks

#### Component Creation Standards
- [ ] Use correct React component type definitions
- [ ] Define explicit interfaces for props
- [ ] Add necessary default values
- [ ] Implement proper error boundaries

```typescript
interface ComponentProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function Component({ children, className = '', onClick }: ComponentProps) {
  return (<button className={className} onClick={onClick}>{children}</button>);
}
```

#### Event Handler Standards
- [ ] Use correct event types and prefix unused parameters with underscore
- [ ] Provide default values for optional callbacks and handle async operations properly

#### Framer Motion Component Standards
- [ ] Use correct Variants type for animations and avoid readonly array issues
- [ ] Handle animation properties correctly and implement proper motion component patterns

#### Internationalization Standards
- [ ] Use correct namespace patterns and handle unused translation variables
- [ ] Escape special characters properly and implement proper fallback mechanisms

### Code Review Checklist

#### TypeScript Type Safety
- [ ] No usage of `any` type without justification
- [ ] All functions have explicit return types
- [ ] Interface definitions are complete and accurate
- [ ] Generic types are used appropriately
- [ ] Type guards are implemented where needed

#### React Best Practices
- [ ] Components have displayName (required for HOCs)
- [ ] useEffect dependency arrays are complete
- [ ] Avoid unnecessary re-renders
- [ ] Proper usage of React.memo and useCallback
- [ ] Error boundaries are implemented

#### Performance Optimization
- [ ] Images use Next.js Image component
- [ ] Large components are dynamically imported
- [ ] Avoid object creation during render
- [ ] Implement appropriate caching strategies
- [ ] Use proper loading states

### Quality Metrics Targets

#### Target Metrics
- TypeScript errors: 0, ESLint errors: 0, ESLint warnings: < 5
- Test coverage: > 80%, Build time: < 60 seconds
- Lighthouse performance: > 90, Accessibility score: > 95

#### Monitoring Methods
- GitHub Actions automated checks, Pre-commit hooks configuration
- Regular code quality reviews, Performance monitoring and reporting
- Automated dependency updates

### React 19 Specific Checks

#### New Hooks Validation
- [ ] useActionState properly typed and implemented
- [ ] useOptimistic with correct state management
- [ ] useFormStatus integrated with form handling
- [ ] use() Hook proper implementation and error handling
- [ ] Server Actions properly typed and error-handled

```typescript
// ✅ React 19 useActionState pattern
const [state, formAction, pending] = useActionState(
  async (prevState: FormState, formData: FormData) => {
    try {
      const result = await processForm(formData);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  { success: false, data: null }
);
```

#### Form Actions and Server Actions
- [ ] Form Actions with proper validation and error boundaries
- [ ] Server Actions marked with 'use server' directive
- [ ] Proper FormData handling and validation
- [ ] Error states and loading states properly managed
- [ ] Progressive enhancement patterns implemented

#### React 19 Concurrent Features
- [ ] React 19 concurrent features usage patterns
- [ ] Proper Suspense boundary implementation
- [ ] Enhanced streaming capabilities utilized
- [ ] Transition updates properly implemented
- [ ] Priority-based rendering optimizations

#### Server Components Standards
- [ ] Proper async/await patterns in Server Components
- [ ] Correct data fetching strategies
- [ ] Appropriate use of Suspense boundaries
- [ ] Proper error boundary implementation
- [ ] New JSX transform compatibility verified
- [ ] Enhanced Server Components patterns utilized

### Next.js 15 Specific Checks

#### Turbopack Integration
- [ ] Turbopack configuration and optimization verified
- [ ] Build performance improvements validated
- [ ] Development server optimization confirmed
- [ ] Hot reload efficiency tested

#### Enhanced App Router Features
- [ ] Next.js 15 caching strategy updates implemented
- [ ] New App Router improvements utilized
- [ ] Parallel routes optimization verified
- [ ] Dynamic route optimizations applied

#### Performance Optimization
- [ ] React 19 performance optimizations implemented
- [ ] Enhanced streaming capabilities utilized
- [ ] Concurrent rendering optimizations applied
- [ ] Bundle size optimization with new features
- [ ] Core Web Vitals improvements validated

### Pre-Commit Verification

#### Automated Checks
```bash
pnpm type-check && pnpm lint && pnpm build && pnpm test && pnpm test:a11y
```

#### Manual Verification Checklist
- [ ] All TypeScript errors resolved
- [ ] All ESLint errors fixed
- [ ] Build completes without warnings
- [ ] Test coverage meets requirements (≥65% current phase)
- [ ] Performance metrics within acceptable range
- [ ] Accessibility standards met (WCAG 2.1 AA)

## Git Commit Guidelines

- Follow **Conventional Commits**
- Format: `<type>[optional scope]: <description>`
- Main types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Breaking changes: prefix with `BREAKING CHANGE:` or append `!` after the type

## Quality Assurance and CI/CD Standards

### Quality Gates Overview
```bash
pnpm quality-gate # type-check:strict + lint:strict + test:coverage + test:a11y + turbopack:check
```

### Quality Metrics Thresholds
- **Type Coverage**: ≥95%, **Code Coverage**: ≥80%, **Accessibility**: Zero violations
- **Performance**: Core Web Vitals + React 19 metrics, **Bundle Size**: Turbopack limits

### Pre-commit Quality Checks
```bash
pnpm lint-staged && pnpm type-check && pnpm test:coverage && pnpm turbopack:validate
```

### GitHub Actions Workflow
```yaml
name: Quality Gate - Next.js 15
on: [push, pull_request]
jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install && pnpm quality-gate && pnpm lighthouse:ci && pnpm turbopack:analyze
```

### TypeScript 5.9.2 Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Quality Gate Scripts
```json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit",
    "type-check:tests": "tsc --noEmit -p tsconfig.test.json",
    "lint:check": "eslint . --ext .js,.jsx,.ts,.tsx --config eslint.config.mjs",
    "format:check": "prettier --check .",
    "build:check": "next build --no-lint",
    "arch:check": "dependency-cruiser src --config .dependency-cruiser.js",
    "circular:check": "madge --circular --extensions ts,tsx src",
    "quality:monitor": "node scripts/quality-monitor.js",
    "i18n:sync:check": "node scripts/check-i18n-sync.js",
    "config:check": "node scripts/check-config-consistency.js"
  }
}
```

### Coverage Reporting for React 19
```typescript
// vitest.config.ts coverage configuration
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/test/**'],
      thresholds: {
        global: {
          branches: 65,
          functions: 65,
          lines: 65,
          statements: 65
        }
      }
    }
  }
});
```

### Pre-deployment Validation for Next.js 15
```bash
pnpm build:check && pnpm type-check && pnpm lint:check && pnpm test:coverage && pnpm test:e2e && pnpm audit --audit-level moderate
```

## CI/CD Guidelines

- Use **Lefthook** pre-commit hooks to execute `pnpm format:check`, `pnpm type-check`, `pnpm quality:quick:staged` and architecture guard scripts
- Validate commit messages with **commitlint**
- GitHub Actions workflow: sequentially execute `pnpm type-check`, `pnpm type-check:tests`, `pnpm lint:check`, `pnpm format:check`, `pnpm test:coverage`, `pnpm test:e2e`, `pnpm size:check`, `pnpm build`
- Use **Dependabot** for dependency upgrades and security patches
- Cache the pnpm store to speed up CI
- Deploy to **Vercel** (Preview and Production environments)
- If additional lint tasks are needed later (such as alias consistency, RSC boundaries), add corresponding scripts and CI jobs

## Enhanced ESLint Configuration for React 19

### Recommended ESLint Configuration

```json
{
  "extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react/no-unescaped-entities": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "overrides": [{ "files": ["**/*.test.ts"], "rules": { "@typescript-eslint/no-explicit-any": "off" }}]
}
```

### Enhanced ESLint Configuration and Error Handling

#### Error Level Management
- **Error**: Critical issues that must be fixed, will block builds
- **Warning**: Recommended fixes, won't block builds but should be addressed
- **Off**: Disabled rules for specific use cases

#### Severity Classification
- **Critical**: Type safety violations, potential runtime errors
- **High**: Performance issues, accessibility violations
- **Medium**: Code style inconsistencies, maintainability concerns
- **Low**: Formatting preferences, minor optimizations

### Common ESLint Errors and Solutions

#### Type Safety & Variables
```typescript
// ❌ Using any type, unused variables
const handleEvent = (event: any) => {};
const unusedVariable = someValue;

// ✅ Use specific types, prefix unused with underscore
const handleEvent = (event: React.MouseEvent<HTMLButtonElement>) => {};
const _unusedVariable = someValue;
```

#### JSX & Hooks
```jsx
// ❌ Unescaped entities, missing dependencies
<p>This is "quoted" content</p>
useEffect(() => updateMetrics(analytics.data), [analytics.data]); // Missing 'analytics'

// ✅ Escape entities, include all dependencies
<p>This is &ldquo;quoted&rdquo; content</p>
useEffect(() => updateMetrics(analytics.data), [analytics.data, analytics, updateMetrics]);
```

### Project-Specific Rule Adjustments

#### Animation Components (Framer Motion)
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDrag = (_event: any, info: PanInfo) => {
  /* Framer Motion provides complex event objects */
};
```

#### Development Tools and Debugging
```typescript
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.log('Animation performance:', metrics);
}
```

#### React 19 Server Actions
```typescript
// Server Actions may need specific ESLint configurations
'use server';

// eslint-disable-next-line @typescript-eslint/require-await
async function serverAction(formData: FormData) {
  // Server-side logic
}
```

### Error Handling Strategies

#### Error Handling Strategies
- **Build-time**: Must be fixed before build completion, use `--max-warnings 0` in CI
- **Development-time**: IDE integration for real-time feedback, auto-fix on save configuration
- **Team Collaboration**: Unified ESLint configuration across team, regular rule updates and reviews

### VS Code Integration & Scripts

```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": { "source.fixAll.eslint": true, "source.organizeImports": true },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}

// package.json
{
  "scripts": {
    "lint": "next lint", "lint:fix": "next lint --fix", "lint:strict": "next lint --max-warnings 0"
  }
}
```

The project currently uses custom security and quality rule sets (see `eslint.config.mjs`), and has not yet integrated `eslint-plugin-react-server`. If static checking for RSC boundaries is needed later, refer to the official plugin documentation to add configuration and scripts.

## Code Output Format

- Precede code blocks with a comment indicating the file path
- Provide surrounding context lines when editing code
- Ensure code completeness and executability

## Optional UI Extensions (Appendix)

| Priority | Modules                                           | Typical Scenarios                                    |
| -------- | ------------------------------------------------- | ---------------------------------------------------- |
| High     | `recharts`, `@tremor/react`, `@react-three/fiber` | Data visualization, dashboards, 3D product showcases |
| Medium   | `react-leaflet`, `@tanstack/react-table`          | Maps, scalable tables                                |
| Low      | `react-player`, `react-pdf`                       | Media playback, PDF previews                         |

## Analysis Workflow

- Identify the task type and core technologies involved
- Break the solution into logical steps
- Prioritize modularity and reusability
- Choose appropriate design patterns
- Consider performance impact and error handling
- Before upgrading React or Next.js versions:
  - Run `pnpm why` to snapshot the dependency tree.
  - Review the official upgrade guide for breaking changes.
  - Pay extra attention to path aliases and RSC boundaries in preview PRs, add dedicated scripts if necessary.

## Project Structure Constraints

- **Source code directory**: All source code must be in `src/` directory only
- **App Router structure**: Use `src/app/[locale]/` for internationalized routing
- **Component organization**: Adopt component directory structure organized by functionality/domain (e.g., `components/forms/`, `components/layout/`, `components/monitoring/`, etc.), keep reusable components in `components/shared/`
- **Content management**: Store MDX content in `content/` with language separation
- **Static assets**: All static files must be in `public/` directory

## Path Alias Constraints

Maintain a single, canonical alias for project imports:

- The alias `@/` **must** always resolve to `./src/`.
- This mapping **must** be identical in `tsconfig.json`, `next.config.ts`, and ESLint's import resolver.
- When moving files or restructuring directories, update the alias configuration **first**, then move code.
- Currently manually confirmed through code review and TypeScript/ESLint checks for alias correctness.

### Automated Validation
- Execute `pnpm config:check` in CI and pre-commit to automatically validate:
  - tsconfig `paths["@/*"]` → `./src/*`
  - next.config webpack alias `@` → `src`
  - ESLint import resolver exists and resolves `@/*`

## React 19 Patterns

- Server Actions + `useActionState`: Prioritize server-side mutations with progressive feedback.
- Forms: `useFormStatus` manages submission/disabled states, avoid redundant local state.
- Optimistic updates: `useOptimistic` covers fine-grained UI; reconcile with server results.
- Data primitives: Use `use` to directly await Promises in RSC (combined with Error/Suspense boundaries).
- Boundaries: Wrap client component islands with `<Suspense>`, stream rendering when necessary.

## Next.js 15 Advanced

- Streaming/Suspense: Set clear fallbacks for server-side chunked output.
- Parallel/Intercepting Routes: Compose complex flows; isolate segment-level loading states.
- Partial Prerendering (PPR): Dynamic/static hybrid, reduce TTFB.
- Testing: Enable testProxy in Playwright; verify RSC and Client boundaries.

## React 19 Server Components Guidelines

- All pages default to **React Server Components**; opt into **Client Components** only for interactivity
- For performance-sensitive components, explicitly optimize with `React.memo`, `useMemo`, and `useCallback`
- Do not use relative paths that traverse outside `src`; always import modules via the `@/` alias
