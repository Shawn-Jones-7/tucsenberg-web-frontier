---
type: "auto"
description: "Next.js 16 App Router, Turbopack by default (Webpack fallback via --webpack), Cache Components/Proxy rename, React Server Components vs Client Components, @next/bundle-analyzer, CSP & security headers, Sentry, CI/CD with pnpm"
---

# Next.js 16 Architecture

## Next.js 16 Key Changes and Migration Notes

### Async Request APIs (Breaking Change)

Next.js 16 fully removed the sync compatibility layer for request helpers. All request-related APIs must be used asynchronously, and Turbopack is the default compiler with routing/caching updates.

#### params and searchParams must be awaited/used with `use()`

In Next.js 16, `params` and `searchParams` are Promise-based only. In Server Components you must `await`; in Client Components unwrap with `use()`.

**Server Component usage**:

```typescript
// ❌ Next.js 14 and earlier - sync access (removed)
export default function Page({ params }: { params: { slug: string } }) {
  return <div>{params.slug}</div>;
}

// ✅ Next.js 16 - required async access
export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  return <div>{slug}</div>;
}

// searchParams also requires await
export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const { query } = await searchParams;
  return <div>Search: {query}</div>;
}
```

**Client Component usage (using React 19 use() hook)**:

```typescript
'use client';
import { use } from 'react';

// ✅ Use use() hook in Client Components to unwrap Promise
export default function ClientPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params);
  return <div>{slug}</div>;
}

// searchParams also uses use() hook
export default function ClientSearchPage({
  searchParams
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const { query } = use(searchParams);
  return <div>Search: {query}</div>;
}
```

#### cookies() and headers() are now async functions

The `cookies()` and `headers()` functions imported from `next/headers` now return Promises and require `await`.

```typescript
// ❌ Next.js 14 and earlier - sync call (removed)
import { cookies, headers } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();
  const headersList = headers();
  const theme = cookieStore.get('theme');
  const userAgent = headersList.get('user-agent');
  // ...
}

// ✅ Next.js 16 - required async call
import { cookies, headers } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const theme = cookieStore.get('theme');
  const userAgent = headersList.get('user-agent');
  // ...
}

// Usage in Server Actions
export async function updateTheme(theme: string) {
  'use server';
  const cookieStore = await cookies();
  cookieStore.set('theme', theme);
}
```

**Official documentation**: https://nextjs.org/docs/app/building-your-application/upgrading/version-15#async-request-apis-breaking-change

**Migration checklist**:
- [ ] Add `async` and `await` to all Server Components using `params`
- [ ] Add `async` and `await` to all Server Components using `searchParams`
- [ ] Use `use()` hook in all Client Components using `params`/`searchParams`
- [ ] Add `await` to all `cookies()` calls
- [ ] Add `await` to all `headers()` calls
- [ ] Update type definitions to `Promise<{ ... }>`

### Additional Next.js 16 migration items (per official guide)

- **Turbopack default**: `next dev` / `next build` use Turbopack by default. If you need custom Webpack, run `next build --webpack`. In `next.config.ts`, `turbopack` is now top-level; `experimental.turbopack` is removed.
- **Cache Components / PPR**: Use `cacheComponents: true` instead of `experimental_ppr`/`dynamicIO`. Caching helpers `cacheLife`/`cacheTag` are stable; new `updateTag` and `refresh` exist. **Project status**: Cache Components are **not enabled** because next-intl and related deps need better support; re-evaluate once upstream compatibility improves.
- **Routing & middleware**: `middleware.ts` is renamed to `proxy.ts` (Node runtime; keep legacy `middleware.ts` only for edge runtime). Parallel routes must provide `default.tsx`.
- **Metadata/OG**: In `opengraph-image`/`twitter-image`/`icon`/`apple-icon`/`sitemap`, `params`/`id` are Promises and must be awaited.
- **Image config**: Local images with query strings require `images.localPatterns.search`; `images.domains` is deprecated—use `remotePatterns`; `minimumCacheTTL` defaults to 4 hours; default `imageSizes` no longer includes 16px.
- **Tooling updates**: `next lint` removed (use ESLint CLI/flat config); `serverRuntimeConfig`/`publicRuntimeConfig` removed—use env vars; minimum Node 20.9, TypeScript ≥ 5.1.

## Dynamic Import + Radix UI Hydration

When using `next/dynamic` with Radix UI components, **always add `ssr: false`** to prevent hydration mismatch caused by `useId()` generating different IDs between server and client:

```typescript
// ✅ Correct
const Tabs = dynamic(() => import('./tabs'), { ssr: false });

// ❌ Will cause hydration mismatch
const Tabs = dynamic(() => import('./tabs'));
```

**Affected**: Radix UI primitives with `aria-*` bindings — Tabs, Dialog, Accordion, Select, DropdownMenu, Popover.

**LCP-critical content**: Avoid `dynamic`, use direct import instead.

## React Hooks Guidelines

- **Call order**: Hooks must be called at component top level in same order; no conditional calls
- **Complete dependencies**: useEffect/useMemo/useCallback dependency arrays must include all used variables
- **Fix strategy**: Move conditional logic inside Hook; split complex scenarios into separate components
- **ESLint**: `react-hooks/rules-of-hooks: error`, `react-hooks/exhaustive-deps: error` Guidelines

## Performance Optimizations

### Experimental Features (next.config.ts)

The project uses several Next.js experimental features to optimize performance:

#### 1. Inline Critical CSS (`experimental.inlineCss: true`)

**Purpose**: Eliminate render-blocking `<link rel="stylesheet">` requests by inlining critical CSS directly into HTML.

**Benefits**:
- Improves Largest Contentful Paint (LCP) - Core Web Vital metric
- Reduces initial page load time
- Eliminates flash of unstyled content (FOUC)

**Configuration**:
```typescript
// next.config.ts
experimental: {
  inlineCss: true,
}
```

**Impact**: Critical CSS is automatically extracted and inlined in `<head>`, non-critical CSS is loaded asynchronously.

#### 2. Test Proxy (`experimental.testProxy: process.env.CI === 'true'`)

**Purpose**: Enable test proxy only in CI/test environments to avoid runtime errors in production.

**Rationale**:
- Test proxy requires Turbopack runtime
- Production builds use Webpack, not Turbopack
- Enabling in production causes 500 errors due to missing runtime

**Configuration**:
```typescript
// next.config.ts
experimental: {
  testProxy: process.env.CI === 'true', // Only enable in CI
}
```

**Important**: Never set `testProxy: true` unconditionally - it will break production builds.

#### 3. Optimize Package Imports (`experimental.optimizePackageImports`)

**Purpose**: Automatically optimize imports from large icon/component libraries to reduce bundle size.

**Configuration**:
```typescript
// next.config.ts
experimental: {
  optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
}
```

**Benefits**:
- Tree-shaking for icon libraries (only import used icons)
- Reduces bundle size by ~50-70% for icon packages
- No code changes required - works automatically

**Example**:
```typescript
// Before optimization: imports entire lucide-react package
import { Home, Settings, User } from 'lucide-react';

// After optimization: only imports used icons
// Bundle size: ~200KB → ~10KB
```

### Build Tool Configuration

- **Development**: Turbopack is on by default (`next dev` does not need `--turbopack`)
- **Production**: Turbopack by default (`next build`); if you must use custom Webpack, run `next build --webpack`
- **Transpiler**: SWC (driven by Turbopack); Webpack fallback stays compatible with existing splitChunks configuration

### Bundle Optimization Strategy

The project uses **12 custom Webpack cacheGroups** for granular code splitting to optimize bundle size and loading performance.

#### Code Splitting Configuration (next.config.ts lines 123-235, **only active in Webpack mode**)

**Strategy**: Separate large libraries into individual chunks with priority-based loading.

**Benefits**:
- Parallel loading of independent chunks
- Better browser caching (library updates don't invalidate entire bundle)
- Reduced initial bundle size via async loading
- Optimized Core Web Vitals (LCP, FCP, TBT)

#### CacheGroups by Priority

| Priority | Name | Libraries | Chunks | Purpose |
|----------|------|-----------|--------|---------|
| 20 | `react` | react, react-dom | all | Core framework - highest priority |
| 16 | `floating-ui` | @floating-ui/* | async | Popover/tooltip positioning |
| 15 | `radix-ui` | @radix-ui/* | async | UI component primitives |
| 15 | `lucide` | lucide-react | async | Icon library |
| 15 | `sentry` | @sentry/* | async | Error monitoring (async only) |
| 14 | `analytics-libs` | @vercel/analytics, web-vitals | async | Analytics and monitoring |
| 12 | `mdx-libs` | @mdx-js, gray-matter, remark, rehype | async | MDX content processing |
| 12 | `validation-libs` | zod | async | Schema validation |
| 12 | `carousel` | embla-carousel | async | Carousel component |
| 11 | `ui-libs` | sonner, @marsidev/react-turnstile | async | UI notifications and Turnstile |
| 10 | `nextjs-libs` | next-intl, @next/*, next-themes, nextjs-toploader | async | Next.js ecosystem |
| 8 | `utils` | clsx, class-variance-authority, tailwind-merge | all | Utility libraries |
| 5 | `vendors` | All other node_modules | all | Remaining third-party code |

#### Loading Strategy

**Synchronous (`chunks: 'all'`)** - Loaded immediately:
- `react` (priority 20) - Required for all pages
- `utils` (priority 8) - Used throughout the app

**Asynchronous (`chunks: 'async'`)** - Lazy loaded on demand:
- All other libraries (priorities 10-16)
- Only loaded when component using them is rendered
- Reduces initial bundle size by ~60%

#### Bundle Size Impact

**Before optimization** (single vendors chunk):
- vendors.js: ~450KB (gzipped)
- Initial load: ~500KB

**After optimization** (12 cacheGroups):
- react.js: ~45KB (gzipped) - loaded immediately
- utils.js: ~8KB (gzipped) - loaded immediately
- Other chunks: ~10-50KB each - loaded on demand
- Initial load: ~180KB (64% reduction)

**Verification**: Run `pnpm build:analyze` to visualize bundle composition.

#### Configuration Example

```typescript
// next.config.ts - Webpack optimization
config.optimization.splitChunks.cacheGroups = {
  react: {
    test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
    name: 'react',
    chunks: 'all',      // Load immediately
    priority: 20,       // Highest priority
    enforce: true,      // Always create separate chunk
  },
  radixui: {
    test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
    name: 'radix-ui',
    chunks: 'async',    // Lazy load
    priority: 15,
    enforce: true,
  },
  // ... 10 more cacheGroups
};
```

**Important**: This configuration only applies to production builds (`pnpm build`). Development uses Turbopack with different optimization strategy.

## Project Structure Constraints

- **Source code directory**: All source code must be in `src/` directory only
- **App Router structure**: Use `src/app/[locale]/` for internationalized routing
- **Component layering**: Follow strict component organization:
  - `src/components/ui/` - shadcn/ui base components
  - `src/components/layout/` - layout and navigation components
  - `src/components/home/` - homepage-specific components
  - `src/components/i18n/` - internationalization components
  - `src/components/performance/` - performance monitoring components
  - `src/components/theme/` - theme-related components
- **Content management**: Store MDX content in `content/` with language separation
- **Static assets**: All static files must be in `public/` directory

## File Locations

Critical files at project root (NOT in `src/` directory):

- **`proxy.ts`** - Next.js 16 middleware layer (Node runtime) handling CSP headers, i18n routing, and security; keep legacy `middleware.ts` only when edge runtime is required
- **`next.config.ts`** - Next.js configuration (build, webpack, experimental features)
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`vitest.config.mts`** - Vitest test configuration
- **`lefthook.yml`** - Pre-commit hooks configuration

**Important**: Do NOT look for these files in `src/` directory. Next.js requires `proxy.ts`/`middleware.ts` (depending on runtime) and `next.config.ts` at project root.

## Path Alias Configuration

- Use `@/` alias for all project imports; ensure consistency across `tsconfig.json`, `next.config.ts`, and ESLint configuration

## React 19 Server Components Guidelines

- All pages default to **React Server Components**; opt into **Client Components** only for interactivity
- For performance-sensitive components, explicitly optimize with `React.memo`, `useMemo`, and `useCallback`
- Do not use relative paths that traverse outside `src`; always import modules via the `@/` alias

### File Organization for Server/Client Components

#### Ideal Structure (Target Architecture)

```
src/
├── components/
│   ├── server/          # Server Components (data fetching, async operations)
│   │   ├── ProductList.tsx
│   │   ├── BlogPosts.tsx
│   │   └── UserProfile.tsx
│   ├── client/          # Client Components (interactivity, hooks, events)
│   │   ├── ContactForm.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── Navigation.tsx
│   │   └── SearchInput.tsx
│   └── shared/          # Pure presentational components (no state/events)
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Typography.tsx
```

#### Current Project Structure (Actual Implementation)

**Feature-Based Organization** (NOT server/client/shared separation):

```
src/
├── components/
│   ├── layout/          # Header, Footer, Navigation components
│   │   ├── MainNavigation.tsx
│   │   ├── MobileNavigation.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── Footer.tsx
│   ├── ui/              # shadcn/ui components (Button, Card, etc.)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Sheet.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── theme/           # Theme switcher, theme-related components
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   ├── contact/         # Contact form components
│   │   ├── ContactForm.tsx
│   │   └── ContactFormFields.tsx
│   ├── i18n/            # Internationalization components
│   │   ├── LocaleSwitcher.tsx
│   │   └── LanguageProvider.tsx
│   ├── performance/     # Web Vitals monitoring components
│   │   ├── WebVitals.tsx
│   │   └── PerformanceMonitor.tsx
│   ├── security/        # Turnstile, security-related components
│   │   ├── TurnstileWidget.tsx
│   │   └── SecurityProvider.tsx
│   └── shared/          # Shared utilities and animations
│       ├── AnimatedSection.tsx
│       └── LoadingSpinner.tsx
```

**Key Characteristics**:
- **Organization**: Feature-based, NOT RSC-based (no server/client directory separation)
- **'use client' directive**: Applied at component level, NOT directory level
- **Rationale**: Easier to locate components by feature; RSC boundary is explicit via directive
- **Flexibility**: Each directory can contain both Server and Client Components as needed

#### Structure Adaptation Strategy

**Current Approach** (Feature-Based Organization):
- **Adopted Pattern**: Feature-based directories (layout, ui, theme, contact, i18n, performance, security, shared)
- **RSC Boundary**: Defined at component level via 'use client' directive, NOT at directory level
- **Benefits**:
  - Easier to locate components by feature/domain
  - Clear separation of concerns by functionality
  - Flexible mixing of Server and Client Components within same directory
  - Aligns with domain-driven design principles

**Component Classification Guidelines**:
- `layout/` - Mixed Server/Client components for page structure
- `ui/` - Primarily presentational components (can be Server or Client)
- `theme/` - Client Components (requires interactivity)
- `contact/` - Mixed Server/Client components for contact functionality
- `i18n/` - Mixed Server/Client components for internationalization
- `performance/` - Client Components (browser APIs, monitoring)
- `security/` - Mixed Server/Client components for security features
- `shared/` - Reusable utilities and animations (can be Server or Client)

**Best Practices**:
- Add 'use client' directive only when component requires interactivity, hooks, or browser APIs
- Keep Server Components as default for better performance and SEO
- Use composition to minimize Client Component boundaries
- Document RSC boundary decisions in component comments when non-obvious

### Server Components Development Patterns

```typescript
// ✅ Server Component (default) - Data fetching and async operations
async function ProductContainer() {
  const products = await fetchProducts(); // Direct database/API access
  const user = await getCurrentUser();

  return (
    <div>
      <ProductList products={products} />
      <UserWelcome user={user} />
    </div>
  );
}

// ✅ Server Component with error handling
async function BlogPostsContainer() {
  try {
    const posts = await fetchBlogPosts();
    return <BlogPostList posts={posts} />;
  } catch (error) {
    return <ErrorMessage message="Failed to load blog posts" />;
  }
}
```

### Client Components Development Patterns

```typescript
// ✅ Client Component - Interactive features
'use client';
import { useState } from 'react';

function ContactForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button disabled={isSubmitting}>Submit</button>
    </form>
  );
}

// ✅ Client Component - Browser APIs
'use client';
import { useEffect, useState } from 'react';

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored as 'light' | 'dark');
  }, []);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Common Anti-patterns to Avoid

```typescript
// ❌ Server Component with hooks (will cause error)
function BadServerComponent() {
  const [state, setState] = useState(0); // Error: hooks not allowed
  return <div>{state}</div>;
}

// ❌ Server Component with event handlers (will cause error)
function BadServerComponent() {
  return <button onClick={() => console.log('click')}>Click</button>; // Error: events not allowed
}

// ❌ Server Component with browser APIs (will cause error)
function BadServerComponent() {
  const width = window.innerWidth; // Error: window not available
  return <div>Width: {width}</div>;
}
```

### Data Serialization Rules

```typescript
// ✅ Serializable props (safe to pass from Server to Client)
interface SerializableProps {
  title: string;
  count: number;
  isActive: boolean;
  data: { id: number; name: string }[];
  config: Record<string, string>;
  date: string; // ISO string, not Date object
}

// ❌ Non-serializable props (will cause runtime errors)
interface NonSerializableProps {
  onClick: () => void;           // Functions cannot be serialized
  instance: MyClass;             // Class instances cannot be serialized
  element: HTMLElement;          // DOM nodes cannot be serialized
  date: Date;                    // Date objects cannot be serialized
  symbol: Symbol;                // Symbols cannot be serialized
}

// ✅ Correct pattern: Server fetches data, Client handles interaction
// Server Component
async function ProductPageContainer({ productId }: { productId: string }) {
  const product = await fetchProduct(productId);
  return <ProductPageClient product={product} />;
}

// Client Component
'use client';
function ProductPageClient({ product }: { product: SerializableProduct }) {
  const [quantity, setQuantity] = useState(1);
  const handleAddToCart = () => { /* handle interaction */ };

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### React Server / Client Boundary Guidelines

To prevent serialization errors and ensure a clean separation between Server and Client Components:

- **No non-serializable props**: Server Components must not pass functions, class instances, Symbols, or DOM nodes via props.
- **Client directive**: Any component that contains event handlers (`onClick`, `onSubmit`, etc.) or uses React hooks such as `useState` or `useEffect` **must** begin with `'use client';`.
- **Container-presentational split**: Fetch data in a Server Component _container_ and render interactivity in a Client Component _presentational_ child.
- **Lint enforcement**: Enable `eslint-plugin-react-server` (or the RSC rule set from `@next/eslint-plugin-react`) and add the CI command `pnpm run lint:rsc`; the build must fail on `react-server/no-server-function-props` violations.

### Component Development Guidelines

- **Server Components**: Use for data fetching and async operations (default)
- **Client Components**: Use `'use client'` directive only for interactivity
- **Error Handling**: Implement proper try-catch blocks in server components
- **State Management**: Use React hooks in client components for local state

## Build & Package Management

- Use **pnpm ≥ 8** as the package manager
- Development: `next dev --turbo` (Turbopack hot reload)
- Production build: `next build` (SWC)
- Monitor bundle size with **@next/bundle-analyzer**; split dynamic imports when needed
- Ensure `.npmrc` sets `shamefully-hoist=false` and `shared-workspace-lockfile=true`

### Package Manager Configuration

```bash
# .npmrc
shamefully-hoist=false
shared-workspace-lockfile=true
auto-install-peers=true
strict-peer-dependencies=false
```

### Bundle Analysis Setup

```javascript
// next.config.ts
import { withBundleAnalyzer } from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer({
  // Your Next.js config
});
```

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "build:analyze": "ANALYZE=true next build"
  }
}
```

### Path Alias Constraints (Build Configuration)

Maintain a single, canonical alias for project imports:

- The alias `@/` **must** always resolve to `./src/`.
- This mapping **must** be identical in `tsconfig.json`, `next.config.ts`, and ESLint's import resolver.
- When moving files or restructuring directories, update the alias configuration **first**, then move code.
- A custom script `pnpm run alias:check` should assert alias consistency during CI.

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// next.config.ts
export default {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};
```

## Environment Variables & Config Validation

- Define and validate env vars in `env.mjs` using **@t3-oss/env-nextjs**
- Fail CI if required variables are missing
- **Never** commit any `.env.*` files to the repository

### Environment Configuration

- Use **@t3-oss/env-nextjs** for environment variable validation
- Define server and client variables with Zod schemas
- Fail CI builds if required variables are missing

## Monitoring & Logging

- Enable **@vercel/analytics** and initialize in `src/app/layout.tsx`
- Report Core Web Vitals via **web-vitals**
- Use **Vercel function logs** for server-side monitoring and API route performance tracking
- Implement **basic error logging** with console.error collection, suitable for enterprise websites
- Provide a custom **Error Boundary** for user-friendly error pages
- Track key business events with **Vercel Analytics** custom events

### Analytics Integration

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Boundary Implementation

```typescript
// src/components/error-boundary.tsx
'use client';
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    // Optional: Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Performance Monitoring

```typescript
// src/lib/performance-monitor.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function initPerformanceMonitoring() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}

// Usage in layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initPerformanceMonitoring();
    }
  }, []);

  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
```

## CI/CD Guidelines

- Use **Lefthook** pre-commit hooks to run lint, tests, and type checks
- Validate commit messages with **commitlint**
- GitHub Actions workflow: install → lint → typecheck → test → build → deploy
- Use **Dependabot** for dependency upgrades and security patches
- Deploy to **Vercel** (Preview and Production environments)
- Add an **architecture validation** job: `pnpm arch:validate`
- Add a **security scanning** job: `pnpm security:check`

### CI/CD Pipeline Commands

```bash
pnpm install
pnpm type-check:strict
pnpm lint:strict
pnpm format:check
pnpm test
pnpm build
pnpm arch:validate
pnpm security:check
pnpm build:analyze
```

## Enhanced ESLint Configuration

- **React Server Components**: Enforce RSC boundary rules with `eslint-plugin-react-server`
- **Security rules**: 29 automated security rules (19 ESLint + 10 Semgrep)
- **ESLint**: Use recommended plugins and rules for React, Next.js, and import organization
- **Import organization**: Automatic import sorting and path alias validation

**📋 See `eslint-cicd-integration.md` for complete ESLint configuration and CI/CD setup**

## Security Guidelines

- Enable **strict CSP** site-wide via `headers()` in `next.config.ts`
- Set security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`
- Use **botid** for form protection and bot detection on contact forms and key interactions
- Implement **basic rate limiting** via Next.js Middleware for API routes when needed
- Run `pnpm audit` in CI and enable **GitHub Dependabot** for automatic security updates

### Security Headers

- Configure security headers in `next.config.ts`
- Include: `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`
- Enable CSP and referrer policy for enhanced security

## Service Integration Guidelines

- **@sentry/nextjs** - Error monitoring and performance tracking
- Optional: Integrate analytics or third-party services as needed by business requirements
