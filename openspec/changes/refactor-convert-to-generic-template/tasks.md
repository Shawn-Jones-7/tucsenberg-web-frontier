# Tasks: Convert to Generic B2B Web Template

## 0. Phase 0 - Repository & Project Rename

- [ ] 0.1 Rename GitHub repository via GitHub Settings
  - Go to: Settings → General → Repository name
  - Change: `tucsenberg-web-frontier` → `b2b-web-template`
  - GitHub auto-creates 301 redirect from old URL
- [ ] 0.2 Update local git remote URL
  - Run: `git remote set-url origin https://github.com/Alx-707/b2b-web-template.git`
- [ ] 0.3 Update Vercel project display name (optional)
  - Go to: Vercel Dashboard → Project Settings → General → Project Name
  - Note: `projectId` in `.vercel/project.json` remains unchanged
- [ ] 0.4 Update `.vercel/project.json` projectName field

## 1. Phase 1.1 - Core Configuration Files

- [ ] 1.1.1 Update `src/config/paths/site-config.ts`
  - Replace `tucsenberg` → `[PROJECT_NAME]`
  - Replace URLs → `[BASE_URL]`
  - Replace contact → `[EMAIL]`
  - Replace social → `[TWITTER_URL]`, `[LINKEDIN_URL]`, `[GITHUB_URL]`
- [ ] 1.1.2 Update `src/config/site-facts.ts` with placeholders
- [ ] 1.1.3 Update `content/config/content.json` SEO defaults
- [ ] 1.1.4 Update `package.json` name to `b2b-web-template`
- [ ] 1.1.5 Update `vercel.json` app name and URLs
- [ ] 1.1.6 Update `.env.example` default values
- [ ] 1.1.7 Update `src/services/url-generator-cjs.js:25` default URL

## 2. Phase 1.2 - Footer Links Restructure

- [ ] 2.1 Rewrite `src/config/footer-links.ts`
  - Delete Products column (11 Vercel links)
  - Delete Resources column (12 Vercel links)
  - Delete Company column (11 Vercel links)
  - Keep Support column (faq, privacy, terms)
  - Replace Social column links with placeholders
  - Add Navigation column (home, about, products, blog, contact)
- [ ] 2.2 Rewrite `src/lib/footer-config.ts`
  - Remove `/enterprise` link
  - Remove `/pricing` link
  - Remove `/ai-policy` link
  - Fix `/faqs` → `/faq`
  - Remove `/docs` link
  - Remove `/ambassadors` link
  - Replace `community.tucsenberg.com` → `[COMMUNITY_URL]`
  - Replace `COMPANY_INFO` with placeholders
- [ ] 2.3 Update `src/lib/__tests__/footer-config.test.ts` assertions

## 3. Phase 2.1 - Delete Product Content

- [ ] 3.1 Delete `content/products/en/*.mdx` (8 files)
- [ ] 3.2 Delete `content/products/zh/*.mdx` (8 files)
- [ ] 3.3 Create `content/products/en/.gitkeep`
- [ ] 3.4 Create `content/products/zh/.gitkeep`

## 4. Phase 2.2 - Replace Blog Posts

- [ ] 4.1 Rewrite `content/posts/en/welcome-to-tucsenberg.mdx` as generic "Welcome to Your Site" article
  - Rename file to `content/posts/en/welcome.mdx`
  - Replace all Tucsenberg references with `[PROJECT_NAME]` placeholders
  - Keep structure as template example
- [ ] 4.2 Rewrite `content/posts/zh/welcome-to-tucsenberg.mdx` as generic welcome article (Chinese)
  - Rename file to `content/posts/zh/welcome.mdx`
  - Replace all Tucsenberg references with `[PROJECT_NAME]` placeholders
- [ ] 4.3 Delete other blog posts in `content/posts/en/` (4 files)
- [ ] 4.4 Delete other blog posts in `content/posts/zh/` (4 files)

## 5. Phase 2.3 - Update Page Content

- [ ] 5.1 Update `content/pages/en/about.mdx` with placeholder content
- [ ] 5.2 Update `content/pages/zh/about.mdx` with placeholder content
- [ ] 5.3 Update `content/pages/en/faq.mdx` with placeholder Q&A
- [ ] 5.4 Update `content/pages/zh/faq.mdx` with placeholder Q&A
- [ ] 5.5 Update `content/pages/en/privacy.mdx` - replace `[COMPANY_NAME]`
- [ ] 5.6 Update `content/pages/zh/privacy.mdx` - replace `[COMPANY_NAME]`
- [ ] 5.7 Update `content/pages/en/terms.mdx` - replace `[COMPANY_NAME]`
- [ ] 5.8 Update `content/pages/zh/terms.mdx` - replace `[COMPANY_NAME]`

## 6. Phase 3 - Translation Files

- [ ] 6.1 Update `messages/en/critical.json`
  - `seo.*` section
  - `structured-data.organization.*` section
  - Social links
- [ ] 6.2 Update `messages/zh/critical.json` (same as above)
- [ ] 6.3 Update `messages/en/deferred.json`
  - `footer.copyright`
  - `footer.description`
  - `article.defaultAuthor`
- [ ] 6.4 Update `messages/zh/deferred.json` (same as above)
- [ ] 6.5 Sync `messages/en.json` with critical + deferred
- [ ] 6.6 Sync `messages/zh.json` with critical + deferred

## 7. Phase 1.3 - Source Code References

- [ ] 7.1 Update `src/lib/site-config.ts` - GitHub links
- [ ] 7.2 Update `src/lib/structured-data-generators.ts` - organization data
- [ ] 7.3 Update `src/lib/resend-utils.ts` - email addresses
- [ ] 7.4 Update `src/lib/resend-templates.ts` - company references
- [ ] 7.5 Update `src/lib/security-headers.ts` - CORS domains
- [ ] 7.6 Update `src/lib/env.ts` - default values
- [ ] 7.7 Update `src/components/layout/logo.tsx` - logo text/alt
- [ ] 7.8 Update `src/app/layout.tsx` - title
- [ ] 7.9 Update `src/app/[locale]/head.tsx` - `'Tucsenberg SC Subset'` font-family
- [ ] 7.10 Update `src/app/[locale]/contact/page.tsx` - contact email
- [ ] 7.11 Update `src/app/[locale]/blog/[slug]/page.tsx` - author name
- [ ] 7.12 Update `src/components/shared/under-construction-v2-components.tsx`
- [ ] 7.13 Update `src/components/blocks/hero/hero-split-block.tsx`
- [ ] 7.14 Update `src/components/blocks/features/features-grid-block.tsx`
- [ ] 7.15 Update `src/components/blocks/cta/cta-banner-block.tsx`
- [ ] 7.16 Update `src/components/home/cta/community-section.tsx`
- [ ] 7.17 Update `src/components/home/cta/data.ts`
- [ ] 7.18 Update `env.mjs` - default app name

## 8. Phase 4 - Image Assets

- [ ] 8.1 Delete `public/images/products/*.jpg` (38 files)
- [ ] 8.2 Delete `public/images/blog/*.jpg` (5 files)
- [ ] 8.3 Create placeholder `public/images/placeholder-product.jpg`
- [ ] 8.4 Create placeholder `public/images/placeholder-blog.jpg`
- [ ] 8.5 Update `public/images/og-image.svg` with generic placeholder
- [ ] 8.6 Update `public/robots.txt` - replace `tucsenberg.com`

## 9. Phase 5 - Test Files

### 9.1 Mock Data
- [ ] 9.1.1 Update `src/test/setup.ts`
- [ ] 9.1.2 Update `src/test/constants/mock-messages.ts`
- [ ] 9.1.3 Update `src/lib/__tests__/mocks/env.ts`

### 9.2 Unit Tests
- [ ] 9.2.1 Update `src/lib/__tests__/site-config.test.ts`
- [ ] 9.2.2 Update `src/lib/__tests__/footer-config.test.ts`
- [ ] 9.2.3 Update `src/lib/__tests__/security-headers.test.ts`
- [ ] 9.2.4 Update `src/lib/__tests__/structured-data.test.ts`
- [ ] 9.2.5 Update `src/lib/__tests__/resend.test.ts`
- [ ] 9.2.6 Update `src/services/__tests__/url-generator.test.ts`
- [ ] 9.2.7 Update `src/app/[locale]/__tests__/layout-structured-data.test.ts`
- [ ] 9.2.8 Update `src/app/[locale]/contact/__tests__/*.test.tsx` (3 files)
- [ ] 9.2.9 Update `src/components/home/__tests__/*.test.tsx` (2 files)
- [ ] 9.2.10 Update `src/components/layout/__tests__/*.test.tsx` (3 files)
- [ ] 9.2.11 Update `src/components/security/__tests__/turnstile.test.tsx`
- [ ] 9.2.12 Update `src/components/shared/__tests__/*.test.tsx`
- [ ] 9.2.13 Update `src/config/__tests__/paths.test.ts`

### 9.3 E2E Tests
- [ ] 9.3.1 Update `tests/e2e/homepage.spec.ts`
- [ ] 9.3.2 Update `tests/e2e/basic-navigation.spec.ts`
- [ ] 9.3.3 Update `tests/e2e/safe-navigation.spec.ts`
- [ ] 9.3.4 Update `tests/e2e/header-layout.bbox.spec.ts`

### 9.4 Test Configuration
- [ ] 9.4.1 Update `tests/unit/security/security-headers.test.ts`
- [ ] 9.4.2 Update `tests/unit/i18n.test.ts`
- [ ] 9.4.3 Update `vitest.config.mts`

## 10. Phase 6 - Regenerate Generated Files

- [ ] 10.1 Run `pnpm content:manifest`
- [ ] 10.2 Verify `src/lib/mdx-importers.generated.ts`
- [ ] 10.3 Verify `src/lib/content-manifest.generated.ts`

## 11. Phase 7 - Documentation

- [ ] 11.1 Rewrite `README.md` as template documentation
- [ ] 11.2 Update `DEVELOPMENT.md` project references
- [ ] 11.3 Update `public/images/README.md`
- [ ] 11.4 Update `.serena/memories/project_overview.md`
- [ ] 11.5 Update `.mcp.json` project identifiers
- [ ] 11.6 Update `.kiro/settings/mcp.json`
- [ ] 11.7 Update `lighthouserc.js` test URLs
- [ ] 11.8 Update `.augment/rules/*.md` project references
- [ ] 11.9 Update `.serena/project.yml`
- [ ] 11.10 Update `.claude/agents/*.md` project references

## 12. Phase 8 - Verification

- [ ] 12.1 Run `pnpm type-check`
- [ ] 12.2 Run `pnpm lint:check`
- [ ] 12.3 Run `pnpm test`
- [ ] 12.4 Run `pnpm build`
- [ ] 12.5 Grep verification: no `tucsenberg` references
- [ ] 12.6 Grep verification: no `vercel.com` in footer files
- [ ] 12.7 Manual verification: all placeholder render correctly
- [ ] 12.8 Manual verification: all footer links point to valid routes
