## 1. P0 - Critical SEO Fixes

### 1.1 Fix Metadata Inheritance (P0-1)
- [x] 1.1.1 Create `generateMetadataForPath()` helper in `src/lib/seo-metadata.ts`
  - Accept `locale`, `pageType`, `path`, and optional `config` parameters
  - Generate correct `alternates.canonical` based on actual path
  - Generate correct `alternates.languages` with path-aware URLs
  - Generate correct `openGraph.url` matching canonical
- [x] 1.1.2 Refactor `src/app/[locale]/layout-metadata.ts` to not export `alternates`/`openGraph`
  - Keep only base metadata (title template, robots, verification)
- [x] 1.1.3 Update `src/app/[locale]/layout.tsx:34` to use refactored metadata
- [x] 1.1.4 Add `generateMetadata` to homepage `src/app/[locale]/page.tsx`
- [x] 1.1.5 Update static pages to use path-aware metadata:
  - `src/app/[locale]/about/page.tsx`
  - `src/app/[locale]/contact/page.tsx`
  - `src/app/[locale]/products/page.tsx`
  - `src/app/[locale]/blog/page.tsx`
  - `src/app/[locale]/faq/page.tsx`
  - `src/app/[locale]/privacy/page.tsx`
  - `src/app/[locale]/terms/page.tsx`
- [x] 1.1.6 Update dynamic pages with path-aware metadata:
  - `src/app/[locale]/products/[slug]/page.tsx` - use `/products/${slug}`
  - `src/app/[locale]/blog/[slug]/page.tsx` - use `/blog/${slug}`
- [x] 1.1.7 Update layout metadata tests (`src/app/[locale]/__tests__/layout-metadata.test.ts`)

### 1.2 Fix OG Image Reference (P0-2)
- [x] 1.2.1 Update `src/lib/seo-metadata.ts:276` to use `/images/og-image.svg`
- [x] 1.2.2 Update test `src/lib/__tests__/seo-metadata.test.ts` to match

## 2. P1 - Template Completeness

### 2.1 Sitemap Blog Entries (P1-1)
- [x] 2.1.1 Add `generateBlogEntries()` function in `src/app/sitemap.ts`
  - Use `getAllPostsCached` from `src/lib/content/blog.ts`
  - Follow same pattern as `generateProductEntries()`
- [x] 2.1.2 Include blog entries in sitemap output

### 2.2 Detail Page JSON-LD (P1-2)
- [x] 2.2.1 Add Article JSON-LD to `src/app/[locale]/blog/[slug]/page.tsx`
  - Use `JsonLdScript` component with Article schema
  - Include correct URL, not blog listing URL
- [x] 2.2.2 Add Product JSON-LD to `src/app/[locale]/products/[slug]/page.tsx`
  - Use `JsonLdScript` component with Product schema

### 2.3 Remove Dead Navigation Links (P1-4)
- [x] 2.3.1 Remove `children` array from products nav item in `src/lib/navigation.ts:39-55`

### 2.4 Conditional PDF Download (P1-5)
- [x] 2.4.1 Update `src/app/[locale]/products/[slug]/page.tsx` to conditionally render PDF button
  - Only show when product has `pdfUrl` field or PDF file exists

## 3. P2 - Maintainability

### 3.1 Unify metadataBase Port (P2-1)
- [x] 3.1.1 Update `src/app/layout.tsx:16` fallback from `localhost:3001` to `localhost:3000`

### 3.2 Fix Semgrep Warnings (P2-2)
- [x] 3.2.1 Refactor `src/lib/content-parser.ts:59-68` to use explicit assignment
- [x] 3.2.2 Refactor `src/lib/content-utils.ts:216-225` to use explicit assignment

## 4. Verification

- [x] 4.1 Run `pnpm type-check`
- [x] 4.2 Run `pnpm lint:check`
- [x] 4.3 Run `pnpm test`
- [x] 4.4 Run `pnpm build`
- [x] 4.5 Run `pnpm security:check` (Semgrep should pass)
- [x] 4.6 Manual SEO verification:
  - Build and start: `pnpm build && PORT=3100 pnpm start`
  - Check `/en/about` canonical/hreflang/og:url
  - Check `/en/products` canonical/hreflang/og:url
  - Check `/en/products/<slug>` canonical/hreflang/og:url
  - Check `/en/blog/<slug>` canonical/hreflang/og:url
