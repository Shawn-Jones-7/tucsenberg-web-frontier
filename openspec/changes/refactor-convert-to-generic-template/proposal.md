# Change: Convert to Generic B2B Web Template

## Why

The current codebase contains business-specific content (Tucsenberg branding, products, blog posts) and external links (Vercel footer links) that need to be removed to create a reusable B2B enterprise website template. This conversion will enable rapid secondary development for new projects.

## What Changes

### Phase 0: Repository & Project Rename
- Rename GitHub repository: `tucsenberg-web-frontier` → `b2b-web-template`
- Rename Vercel project display name (projectId unchanged)
- Update local git remote URL after GitHub rename

### Phase 1: Core Configuration
- Replace all `tucsenberg` references with `[PROJECT_NAME]` placeholders
- Update `src/services/url-generator-cjs.js` default URL
- Modify `package.json` name to `b2b-web-template`

### Phase 2: Footer Restructure
- **BREAKING**: Remove 38 Vercel external links from `FOOTER_COLUMNS`
- Remove 6 dead links (`/enterprise`, `/pricing`, `/ai-policy`, `/docs`, `/ambassadors`)
- Fix `/faqs` → `/faq` typo
- Replace business-specific social links with placeholders

### Phase 3: Content
- Delete all 16 product MDX files
- Rewrite `welcome-to-tucsenberg` blog posts as generic "Welcome to Your Site" template articles (en/zh)
- Delete other 4 blog posts per locale
- Update About/FAQ pages with placeholder content
- Keep Privacy/Terms structure, replace company name

### Phase 4: Assets
- Delete 38 product images and 5 blog images
- Create placeholder images for OG/product/blog
- Update `robots.txt` base URL

### Phase 5: Code References
- Update ~35 source files with tucsenberg references
- Replace `'Tucsenberg SC Subset'` font-family name in `head.tsx`

### Phase 6: Tests & Generated Files
- Update ~25 test files with mock data changes
- Regenerate `mdx-importers.generated.ts` and `content-manifest.generated.ts`

### Phase 7: Documentation
- Rewrite README as template documentation
- Update tool configurations

## Impact

- **Affected specs**: content-management, seo, i18n
- **Affected code**: ~170 files, ~4300 lines changed
- **Breaking changes**: Footer link structure completely redesigned
- **Generated files**: Must run `pnpm content:manifest` after content deletion
- **External services**: GitHub repository rename (auto-redirect), Vercel project name update

## Verification

```bash
# No tucsenberg references should remain
grep -r "tucsenberg" src/ content/ messages/ public/

# No Vercel external links in footer
grep -r "vercel.com" src/config/footer-links.ts

# Verify git remote updated
git remote -v
```

## Placeholder Convention

| Placeholder | Usage |
|-------------|-------|
| `[PROJECT_NAME]` | Project/company name |
| `[BASE_URL]` | Site base URL |
| `[EMAIL]` | Contact email |
| `[PHONE]` | Contact phone |
| `[TWITTER_URL]` | Twitter profile URL |
| `[LINKEDIN_URL]` | LinkedIn profile URL |
| `[GITHUB_URL]` | GitHub profile/repo URL |
| `[COMPANY_ADDRESS]` | Physical address |
| `[COMMUNITY_URL]` | Community platform URL |
