# P1: Frontmatter validation not enforced in production

**Severity:** P1 (Major)

## Summary
`parseContentFile` uses the production validation config but only throws when `options.strictMode` is set by callers. None of the content query helpers pass this flag, so invalid metadata (missing slug/title/publishedAt or product requirements) merely logs warnings while still returning parsed content.

## Evidence
- Validation errors trigger throws only when `options.strictMode` is true; otherwise content continues loading.【F:src/lib/content-parser.ts†L52-L146】
- Callers like `getAllPosts`/`getProductListing` invoke `parseContentFile` without `strictMode`, meaning production builds will not fail on invalid frontmatter.【F:src/lib/content-query/queries.ts†L18-L74】【F:src/lib/content/products-source.ts†L33-L139】

## Impact
Broken or incomplete frontmatter can ship to production (e.g., missing slugs, malformed dates, drafts), leading to SEO regressions, sitemap inconsistencies, or runtime errors when required fields are assumed present.

## Recommendation
Propagate `strictMode: true` when loading content in production (e.g., from content query wrappers), or change `parseContentFile` to honor `validationConfig.strictMode` by default so production builds fail fast on invalid MDX metadata.
