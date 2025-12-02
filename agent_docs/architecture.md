# Architecture Guide

## Next.js 16 App Router

### Page Structure
- All pages are **async Server Components** by default
- Page props use `Promise` pattern:
  ```typescript
  interface PageProps {
    params: Promise<{ locale: string }>;
    searchParams?: Promise<{ [key: string]: string | undefined }>;
  }
  ```

### Routing
- Locale-based routing: `/[locale]/page-name`
- Supported locales: `en`, `zh` (defined in `src/i18n/routing.ts`)
- Middleware handles locale detection and redirects

### Data Fetching
- Use `async/await` directly in Server Components
- Cached functions in `src/lib/content/` for products, blog posts
- Example: `getAllProductsCached()`, `getProductBySlugCached(slug)`

### Layout Hierarchy
```
src/app/
├── layout.tsx              # Root layout (minimal)
└── [locale]/
    ├── layout.tsx          # Locale layout (fonts, metadata, providers)
    ├── page.tsx            # Home page
    ├── about/page.tsx
    ├── blog/page.tsx
    ├── contact/page.tsx
    └── products/
        ├── page.tsx        # Product listing
        └── [slug]/page.tsx # Product detail
```

### Server vs Client Components
- **Server (default)**: Data fetching, SEO, static content
- **Client (`"use client"`)**: Interactivity, hooks, browser APIs
- Keep client boundaries as low as possible in component tree

## Key Files

| File | Purpose |
|------|---------|
| `src/i18n/request.ts` | Translation loading config |
| `src/i18n/routing.ts` | Locale routing config |
| `src/lib/content/products.ts` | Product data fetching |
| `src/lib/content/blog.ts` | Blog post fetching |
| `src/middleware.ts` | Locale detection, redirects |
