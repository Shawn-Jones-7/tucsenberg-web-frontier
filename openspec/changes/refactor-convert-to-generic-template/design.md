# Design: Convert to Generic B2B Web Template

## Context

This project started as a specific B2B enterprise website (Tucsenberg) and needs to be converted into a reusable template. The conversion requires removing all business-specific content while maintaining the enterprise-grade architecture, i18n support, and quality gates.

**Stakeholders**: Template users, secondary developers

**Constraints**:
- Must maintain TypeScript strict mode
- Must pass all existing quality gates
- Generated files depend on content structure
- GitHub repository rename requires updating git remotes
- Vercel deployment bound by projectId (not name)

## Goals / Non-Goals

**Goals**:
- Create a clean, reusable template with placeholder content
- Remove all Tucsenberg-specific branding and content
- Remove dead footer links and simplify navigation
- Maintain all existing functionality and architecture
- Provide clear placeholder conventions for customization
- Rename repository to `b2b-web-template`

**Non-Goals**:
- Adding new features or capabilities
- Changing the tech stack or architecture
- Creating documentation generators
- Building a CLI tool for template customization

## Decisions

### D1: Placeholder Convention
**Decision**: Use square bracket format `[PLACEHOLDER_NAME]` for all replaceable content.

**Rationale**:
- Easily searchable with grep/IDE
- Clearly distinguishable from real content
- Common convention in template projects
- Works in code, content, and config files

**Alternatives considered**:
- `{{PLACEHOLDER}}` - Mustache-style, might conflict with template engines
- `$PLACEHOLDER` - Shell-style, might conflict with environment variables
- `__PLACEHOLDER__` - Python-style, less visually distinct

### D2: Footer Structure Simplification
**Decision**: Reduce footer from 5 columns (Products/Support/Resources/Company/Social) to 3 columns (Navigation/Support/Social).

**Rationale**:
- Remove all Vercel external links (not relevant to template)
- Keep only internal routes that exist
- Placeholder social links for customization
- Cleaner, more maintainable structure

### D3: Content Strategy
**Decision**: Delete all products, rewrite welcome blog post as generic template article.

**Rationale**:
- Products are highly business-specific
- Empty product listing demonstrates the feature
- Rewriting welcome post (instead of creating new) preserves content structure example
- Generic welcome article serves as template for users
- Minimal content reduces template size

### D4: Generated Files Handling
**Decision**: Document regeneration requirement rather than modifying generator.

**Rationale**:
- Existing `pnpm content:manifest` works correctly
- No need to change build tooling
- Clear instruction in tasks.md
- Follows existing project patterns

### D5: Font Family Naming
**Decision**: Rename `'Tucsenberg SC Subset'` to `'Template SC Subset'` in head.tsx.

**Rationale**:
- Font files remain unchanged
- Only the CSS font-family name changes
- Maintains Chinese font optimization
- Clear template naming

### D6: Repository Naming
**Decision**: Rename GitHub repository from `tucsenberg-web-frontier` to `b2b-web-template`.

**Rationale**:
- `b2b-web-template` is concise and descriptive
- Clearly indicates purpose (B2B website template)
- GitHub auto-creates 301 redirect from old URL
- All PR/Issue/Star history preserved
- Vercel deployment unaffected (bound by projectId)

**Alternatives considered**:
- `enterprise-web-template` - More generic but less specific
- `b2b-website-template` - Slightly longer
- `website-template-for-b2b` - Too verbose

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Test failures after content deletion | Update all 25+ test files with new mock data |
| Missing tucsenberg references | Grep verification in Phase 8 |
| Breaking changes in footer | Clear documentation in proposal.md |
| Generated file out of sync | Explicit regeneration step in Phase 6 |
| Other developers' git remote broken | GitHub 301 redirect + notify team |
| Lighthouse test URLs invalid | Update `lighthouserc.js` with new blog slug |

## Migration Plan

### For Template Users
1. Clone the template repository
2. Search and replace all `[PLACEHOLDER]` values
3. Add products/blog content to `content/` directories
4. Run `pnpm content:manifest` to regenerate
5. Update images in `public/images/`
6. Run `pnpm ci:local` to verify

### Rollback
Not applicable - this is a one-way template conversion.

## Open Questions

None - all decisions finalized during planning phase.

## File Impact Summary

| Category | Files | Action |
|----------|-------|--------|
| Config | 7 | Modify |
| Footer | 2 | Rewrite |
| Content | 26 | Delete/Replace |
| Translations | 6 | Modify |
| Source Code | 19 | Modify |
| Tests | 25 | Modify |
| Generated | 2 | Regenerate |
| Images | 45 | Delete/Create |
| Docs | 12 | Modify |
| **Total** | **~144** | - |
