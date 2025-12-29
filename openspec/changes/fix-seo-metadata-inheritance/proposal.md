# Change: Fix SEO Metadata Inheritance Issues

## Why

Next.js metadata uses shallow merging where child pages inherit parent layout's `alternates` and `openGraph` fields when not explicitly overridden. Currently, `layout-metadata.ts` hardcodes `'home'` as pageType, causing all pages to inherit homepage's canonical URL, hreflang, and OG metadata—a critical SEO issue that affects search engine indexing and social sharing.

## What Changes

### P0 - Critical SEO Fixes
- **P0-1**: Fix canonical/OG/hreflang inheritance
  - Create `generateMetadataForPath()` helper that accepts path parameter
  - Remove layout-level `alternates`/`openGraph` pollution
  - Update all static pages to explicitly return correct `alternates` and `openGraph`
  - Update dynamic pages (`products/[slug]`, `blog/[slug]`) with path-aware metadata
- **P0-2**: Fix OG image reference (`/images/og-image.jpg` → `.svg`)

### P1 - Template Completeness
- **P1-1**: Add blog detail pages to sitemap.xml
- **P1-2**: Add JSON-LD structured data to detail pages (Product/Article schema)
- **P1-4**: Remove dead navigation links (`/products/solutions|enterprise|pricing`)
- **P1-5**: Conditional PDF download button (only show when PDF exists)

### P2 - Maintainability
- **P2-1**: Unify metadataBase default port (`localhost:3001` → `localhost:3000`)
- **P2-2**: Fix Semgrep object-spread warnings with explicit assignment

## Impact

- Affected specs: `seo` (new capability spec)
- Affected code:
  - `src/lib/seo-metadata.ts` - Add path-aware metadata helper
  - `src/app/[locale]/layout.tsx` - Remove polluting generateMetadata export
  - `src/app/[locale]/layout-metadata.ts` - Refactor or remove
  - `src/app/[locale]/*/page.tsx` - All page files need metadata updates
  - `src/app/sitemap.ts` - Add blog entries
  - `src/lib/navigation.ts` - Remove dead links
  - `src/lib/content-parser.ts`, `src/lib/content-utils.ts` - Semgrep fixes
