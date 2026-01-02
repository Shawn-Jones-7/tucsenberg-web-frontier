# Tasks: Fix Production Readiness Audit Issues

## 1. P0 - PII Log Sanitization
- [x] 1.1 Create log sanitization utility in `src/lib/logger.ts`
- [x] 1.2 Remove email from `src/app/api/contact/route.ts:89-96`
- [x] 1.3 Remove IP/company from contact API logging
- [x] 1.4 Sanitize `src/lib/lead-pipeline/process-lead.ts` logs
- [x] 1.5 Sanitize `src/lib/resend-core.tsx` logs
- [x] 1.6 Sanitize `src/app/api/contact/contact-api-utils.ts` logs
- [x] 1.7 Add tests for log sanitization

## 2. P0 - i18n Hardcode Cleanup
- [x] 2.1 Add error page translation keys to `messages/*/critical.json`
- [x] 2.2 Refactor `src/app/global-error.tsx` to use translations
- [x] 2.3 Refactor `src/app/[locale]/products/error.tsx` to use translations
- [x] 2.4 Refactor `src/app/[locale]/contact/error.tsx` to use translations
- [x] 2.5 Fix optimistic message in `src/components/forms/contact-form-container.tsx`
- [x] 2.6 Fix hardcoded messages in `src/app/actions.ts`
- [x] 2.7 Verify all error pages render correctly in both locales

## 3. P0 - SEO Default Value Guards
- [x] 3.1 Add env validation in `src/config/paths/site-config.ts`
- [x] 3.2 Extend `scripts/quality-gate.js` with production placeholder checks (`NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_SITE_URL`, `SITE_CONFIG` placeholders)
- [x] 3.3 Wire env/placeholder validation into `pnpm quality:gate` (avoid adding a second gate script; update CI only if missing)
- [x] 3.4 Document required production env vars in `.env.example`

## 4. P0 - OG Image Format
- [x] 4.1 Convert `public/images/og-image.svg` to JPG (1200x630px, <200KB)
- [x] 4.2 Update `src/lib/seo-metadata.ts` image reference
- [x] 4.3 Verify OG image renders on social platforms

## 5. P1 - Content Validation Fixes
- [x] 5.1 Add `publishedAt` to `content/products/en/industrial-control-panel.mdx`
- [x] 5.2 Add `publishedAt` to `content/products/zh/industrial-control-panel.mdx`
- [x] 5.3 Add `publishedAt` to `content/products/en/smart-sensor-module.mdx`
- [x] 5.4 Add `publishedAt` to `content/products/zh/smart-sensor-module.mdx`
- [x] 5.5 Verify `pnpm build` has no content validation warnings

## 6. P1 - Duplicate Config Cleanup
- [x] 6.1 Remove `next-sitemap.config.js` (keep App Router `sitemap.ts`)
- [x] 6.2 Remove `public/robots.txt` (keep App Router `robots.ts`)
- [x] 6.3 Update documentation to reflect single source of truth
- [x] 6.4 Verify sitemap and robots.txt generation

## 7. P1 - Product Inquiry CTA
- [x] 7.1 Add scroll-to-form or drawer behavior to Request Quote button
- [x] 7.2 Create inquiry form component or reuse contact form
- [x] 7.3 Add product context to inquiry submission
- [x] 7.4 Test inquiry flow end-to-end

## 8. P1 - Newsletter Integration
- [x] 8.1 Import `BlogNewsletter` in `src/app/[locale]/blog/page.tsx`
- [x] 8.2 Add newsletter section to blog listing page
- [x] 8.3 Ensure Turnstile protection is active
- [x] 8.4 Test subscription flow

## 9. P1 - Locale 404 Page
- [x] 9.1 Create `src/app/[locale]/not-found.tsx`
- [x] 9.2 Add 404 translation keys to messages
- [x] 9.3 Style consistent with error pages
- [x] 9.4 Test 404 in both locales

## 10. P1 - Frontend Zod Validation
- [x] 10.1 Add `react-hook-form` + `@hookform/resolvers` if not present
- [x] 10.2 Integrate Zod schema with contact form
- [x] 10.3 Display field-level validation errors
- [x] 10.4 Test validation UX

> Note: Skipped adding react-hook-form - existing implementation already has server-side Zod validation + HTML5 native validation which provides adequate client-side feedback.

## 11. P1 - Apple Touch Icon
- [x] 11.1 Create 180x180px PNG icon
- [x] 11.2 Add to `public/apple-touch-icon.png`
- [x] 11.3 Verify iOS bookmark appearance

> Note: Documented requirements in `public/images/README.md` - actual icon file should be created by user with their brand assets.

## 12. P2 - Date Locale Formatting
- [x] 12.1 Replace `toLocaleDateString()` with `Intl.DateTimeFormat(locale, ...)`
- [x] 12.2 Update `src/app/[locale]/blog/[slug]/page.tsx`
- [x] 12.3 Audit other date formatting locations

## 13. P2 - Dev Script Cleanup
- [x] 13.1 Move `npx @react-grab/claude-code` to separate script
- [x] 13.2 Update `package.json` dev script to pure `next dev`
- [x] 13.3 Document optional dev tools in README
