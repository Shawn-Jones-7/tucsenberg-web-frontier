# Change: Fix Production Readiness Audit Issues

## Why

A comprehensive audit of the B2B enterprise website template identified critical issues blocking production deployment. The audit (conducted by Claude + Codex cross-validation) found PII logging violations, i18n inconsistencies, SEO configuration risks, and incomplete B2B conversion flows that must be resolved before the template can be considered production-ready.

## Scope

This change addresses production-readiness issues that materially affect:
- Compliance/privacy (PII exposure in logs)
- Core template promises (en/zh parity on critical error + form UX paths)
- SEO safety (no placeholder canonicals/OG/brand config in production output)
- Lead capture/conversion (contact + inquiry CTAs are functional)

Out of scope (follow-ups):
- New features not directly tied to audit findings
- Large UI redesign beyond minimal wiring/consistency

## What Changes

### P0 - Blocking Release

1. **PII Log Sanitization** - Remove email, IP, company from logger calls
   - `src/app/api/contact/route.ts`
   - `src/lib/lead-pipeline/process-lead.ts`
   - `src/lib/resend-core.tsx`
   - `src/app/api/contact/contact-api-utils.ts`

2. **i18n Hardcode Cleanup** - Replace hardcoded user-facing text with translation keys
   - `src/app/global-error.tsx` (entire page in English)
   - `src/app/[locale]/products/error.tsx` (hardcoded Chinese)
   - `src/app/[locale]/contact/error.tsx` (hardcoded Chinese)
   - `src/components/forms/contact-form-container.tsx` (optimistic message)
   - `src/app/actions.ts` (success/error messages)

3. **SEO + Branding Placeholder Guards** - Fail fast for placeholder base URLs and placeholder tokens in `SITE_CONFIG`
   - `src/config/paths/site-config.ts` defaults to `https://example.com` and includes placeholders like `[PROJECT_NAME]`
   - Add quality gate checks for `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_SITE_URL` and placeholder tokens in production output

4. **OG Image Format** - Convert SVG to JPG for social platform compatibility
   - `public/images/og-image.svg` → `public/images/og-image.jpg`

### P1 - Important Improvements

5. **Content Validation Fixes** - Add missing `publishedAt` to product MDX files
6. **Duplicate Config Cleanup** - Remove redundant `next-sitemap.config.js` and `public/robots.txt`
7. **Product Inquiry CTA** - Connect Request Quote button to inquiry form
8. **Newsletter Integration** - Add BlogNewsletter component to blog pages
9. **Locale 404 Page** - Create `src/app/[locale]/not-found.tsx`
10. **Frontend Zod Validation** - Add client-side form validation
11. **Apple Touch Icon** - Add iOS bookmark icon

### P2 - Optimizations

12. **Date Locale Formatting** - Use `Intl.DateTimeFormat(locale, ...)`
13. **Dev Script Cleanup** - Remove external npx dependency from default dev command

## Success Criteria

- Production builds fail fast when `SITE_CONFIG.baseUrl` is placeholder (`https://example.com`) or unset envs (`NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_SITE_URL`).
- Quality gate fails in production when any placeholder tokens remain in `SITE_CONFIG` (e.g. `[PROJECT_NAME]`, `[CONTACT_EMAIL]`, social URLs).
- Error pages and form feedback states contain no hardcoded user-facing strings outside i18n.
- Default OG image referenced by metadata is non-SVG and exists in `public/`.

## Dependencies / Notes

- Reuse the existing unified gate at `scripts/quality-gate.js` (avoid introducing a second "quality gate script").
- Coordinate with `openspec/changes/refactor-convert-to-generic-template` (it defines placeholder conventions and may remove product content, impacting "publishedAt" tasks).

## Impact

- **Affected specs**: `security`, `seo`, `contact-form`, `i18n` (new), `content-management` (new)
- **Affected code**: ~25 files
- **Breaking changes**: None (all changes are additive or internal fixes)
- **Compliance**: Resolves GDPR/PII logging concerns
- **Quality gates**: Will require new CI checks for production env validation
