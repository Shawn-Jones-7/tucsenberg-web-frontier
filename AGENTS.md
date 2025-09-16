# Next.js 15 Enterprise B2B Website Development Guidelines

## Role Definition

- Act as a software engineer proficient in TypeScript, React 19, and Next.js 15
- Prioritize the project's specified tech stack and conventions
- Deliver high-quality, maintainable code solutions

## Tech Stack Preferences

- **TypeScript** (required)
- **Next.js 15** App Router
- **React 19** Server Components first
- **shadcn/ui** and **Radix UI** component libraries
- **Tailwind CSS** for styling
- **next-intl** for internationalization
- **MDX** for content management
- **Resend** for email delivery

## Code Style Guidelines

- **Functional style**: favor functional/declarative programming and use _early returns_ for readability
- Follow the **DRY** principle to avoid duplication
- Ensure **Accessibility (a11y)** compliance
- Implement complete features that include all necessary code
- For performance-sensitive components, explicitly optimize with `React.memo`, `useMemo`, and `useCallback`

## TypeScript Guidelines

- All code **must** use TypeScript
- Prefer `interface` over `type` for object shapes
- Avoid `enum`; use mapping objects with `const` assertions
- Maintain strict type safety and leverage type inference
- Use the `satisfies` operator for type validation
- Write custom **type guards** or assertions for complex objects

## Naming Conventions

- Boolean values prefixed with `is`, `has`, etc.
- Event handlers prefixed with `handle`
- Directory names use **kebab-case**
- Sanity schema & database models use **PascalCase** singular nouns
- File and route paths use **kebab-case** aligned with URLs
- Prefer **named exports** over default exports

## React 19 & Next.js 15 Pattern

- Prefer **React Server Components (RSC)** for data fetching
- Use the `"use client"` directive **only** when interactivity is required
- Organize files following the **App Router** structure
- Access data in server components with `async/await`
- Client data fetching via `useEffect` and `fetch`
- Select **SSG / ISR / SSR** per page characteristics to avoid over-rendering

### File Organization for Server/Client Components

> 下列目录结构仅作为参考示例；当前仓库按业务功能拆分组件目录（如 `components/forms/`、`components/contact/` 等）。

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
- **Container-presentational split**: 在条件允许时，将数据获取放在 Server Component，将交互放在 Client Component；目前主要依赖代码评审来保持边界清晰。

## UI Component Guidelines

- Prefer components provided by **shadcn/ui**
- Use Tailwind CSS utility-first styling
- Custom components live under `components/ui`; **do not modify library code**
- Reuse styles with `@apply` in CSS/PostCSS
- Manage conditional class names with **clsx** + **tailwind-merge**; keep logic simple
  +- **Tailwind dynamic classes**: avoid building class names via template literals (`` `bg-${color}-500` ``). If dynamic ranges are unavoidable, add literal mappings or configure `safelist` patterns in `tailwind.config.js` to prevent purging.

## Internationalization Guidelines

- Use **next-intl** as the i18n framework
- Use the `useTranslations` hook inside components
- Store translations in `messages/[locale].json`
- **Strict ICU typing**: enable `strictMessageTypeSafety` in `getRequestConfig` and declare `AppConfig.Messages` in `global.ts` to get compile-time checks for message arguments
- **Provider composition**: 当前在 `src/app/[locale]/layout.tsx` 中直接组合 `NextIntlClientProvider`、`EnterpriseAnalytics`、`ThemeProvider`，如需复用可再抽离统一 Providers 组件

## Multi-language File Synchronization Rules

- **Always update both languages**: When modifying content in `content/*/en/`, must also update corresponding `content/*/zh/` files
- **UI translations sync**: Changes to `messages/en.json` must be reflected in `messages/zh.json`
- **Document synchronization**: Updates to `public/documents/*/en/` require corresponding updates to `public/documents/*/zh/`
- **Route structure consistency**: Maintain identical file structure across language directories
- **Metadata alignment**: Ensure Front Matter metadata is consistent across language versions

## Security Guidelines

- Enable **strict CSP** site-wide via `headers()` in `next.config.ts`
- Set security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`
- Use **Cloudflare Turnstile** for form protection and bot detection on contact forms and key interactions
- Implement **basic rate limiting** via Next.js Middleware for API routes when needed
- Run `pnpm audit` in CI and enable **GitHub Dependabot** for automatic security updates

## Content Management Guidelines

### Dynamic Content Management

- 动态内容暂由代码与静态资源直接维护，暂无外部 CMS 集成

### Static Content: MDX

- Process **MDX** content with `@next/mdx` and `next-mdx-remote` for static documentation
- Store content in `content/` directory with language separation (`content/*/en/` and `content/*/zh/`)
- Use Front Matter for metadata: `title`, `description`, `publishedAt`, `slug`
- Organize content by type: `pages/`, `products/`, `solutions/`, `case-studies/`
- Support embedded React components within MDX content
- Use `gray-matter` for Front Matter parsing and metadata extraction

### Content Strategy

- **Static content** (documentation, policies): Use MDX files，保持多语言同步
- **Dynamic content**: 由团队根据业务需求评估后再行决定是否引入 CMS 方案

## Service Integration Guidelines

- Call the **Resend** API inside API routes to send emails
- 当前邮件模版通过字符串生成（`src/lib/resend-templates.ts`），后续如需视觉复用可逐步迁移为 React 组件
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

  - The alias `@/` **must** always resolve to `./src/`。
  - This mapping **must** be identical in `tsconfig.json`, `next.config.ts`, and ESLint 的 import 解析配置。
  - 调整目录结构前请先更新别名配置，目前通过代码评审和静态检查人工确认别名一致性。

## Environment Variables & Config Validation

- Define and validate env vars in `env.mjs` using **@t3-oss/env-nextjs**
- Fail CI if required variables are missing
- 仓库包含开发/示例用 `.env.*` 文件，禁止在其中提交生产密钥或敏感凭证

## Monitoring & Logging

- Enable **@vercel/analytics** and initialize in `src/app/layout.tsx`
- Report Core Web Vitals via **web-vitals**
- Use **Vercel function logs** for server-side monitoring and API route performance tracking
- Implement **basic error logging** with console.error collection, suitable for enterprise websites
- Provide a custom **Error Boundary** for user-friendly error pages
- Track key business events with **Vercel Analytics** custom events

## SEO Optimization Guidelines

- Manage page metadata with **next-seo**
- Generate `sitemap.xml` and `robots.txt` automatically with **next-sitemap**
- Enable multi-language **hreflang** tags for international SEO
- Use **static OG images** for consistent brand presentation, with **@vercel/og** as optional dynamic generation for specific use cases
- Use **next/image** for images and **next/font** for fonts; lazy load by default

## Testing Guidelines

- **Unit tests**: **vitest** – filenames `*.test.ts?(x)`
- **End-to-end tests**: **@playwright/test** – directory `e2e/`
- **Performance benchmarks**: **@lhci/cli** (Lighthouse CI)
- CI 会执行 `pnpm type-check`、`pnpm type-check:tests`、`pnpm lint:check`、`pnpm test:coverage`、`pnpm test:e2e`
- Statement coverage ≥ 80 %
  +- **ESM-only packages**: when using Jest, include ESM deps (e.g. `next-intl`) in `transformIgnorePatterns`; for Vitest, inline them via `server.deps.inline` to avoid resolution errors.

## Git Commit Guidelines

- Follow **Conventional Commits**
- Format: `<type>[optional scope]: <description>`
- Main types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Breaking changes: prefix with `BREAKING CHANGE:` or append `!` after the type

## CI/CD Guidelines

- Use **Lefthook** pre-commit hooks执行 `pnpm format:check`、`pnpm type-check`、`pnpm quality:quick:staged` 以及架构守卫脚本
- Validate commit messages with **commitlint**
- GitHub Actions workflow：依次执行 `pnpm type-check`、`pnpm type-check:tests`、`pnpm lint:check`、`pnpm format:check`、`pnpm test:coverage`、`pnpm test:e2e`、`pnpm size:check`、`pnpm build`
- Use **Dependabot** for dependency upgrades and security patches
- Cache the pnpm store to speed up CI
- Deploy to **Vercel** (Preview and Production environments)
- 若后续需要额外 lint 任务（如别名一致性、RSC 边界），再增补对应脚本和 CI job

## Enhanced ESLint Configuration for React 19

项目当前使用自定义的安全与质量规则集（参见 `eslint.config.mjs`），尚未集成 `eslint-plugin-react-server`。如后续需要对 RSC 边界做静态检查，可参考官方插件文档追加配置与脚本。

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
  - Review the official upgrade guide for breaking changes。
  - 在预览 PR 中请额外关注路径别名与 RSC 边界，必要时可新增专项脚本再执行。

## Project Structure Constraints

- **Source code directory**: All source code must be in `src/` directory only
- **App Router structure**: Use `src/app/[locale]/` for internationalized routing
- **Component organization**: 采用按功能/领域划分的组件目录结构（例如 `components/forms/`、`components/layout/`、`components/monitoring/` 等），保持复用组件放在 `components/shared/`
- **Content management**: Store MDX content in `content/` with language separation
- **Static assets**: All static files must be in `public/` directory

## Path Alias Constraints

Maintain a single, canonical alias for project imports:

- The alias `@/` **must** always resolve to `./src/`.
- This mapping **must** be identical in `tsconfig.json`, `next.config.ts`, and ESLint's import resolver.
- When moving files or restructuring directories, update the alias configuration **first**, then move code。
- 当前通过代码评审及 TypeScript/ESLint 检查关注别名正确性。

## React 19 Server Components Guidelines

- All pages default to **React Server Components**; opt into **Client Components** only for interactivity
- For performance-sensitive components, explicitly optimize with `React.memo`, `useMemo`, and `useCallback`
- Do not use relative paths that traverse outside `src`; always import modules via the `@/` alias
