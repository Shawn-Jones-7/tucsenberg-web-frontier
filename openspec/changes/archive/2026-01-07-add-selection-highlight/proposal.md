# Change: Add Global Selection Highlight (CSS-only)

## Why

The template aims to provide a polished “production-ready” baseline. A consistent selection highlight:

- Improves perceived quality and brand consistency (similar to vercel.com)
- Has near-zero risk (CSS-only; no JS, no hydration impact)
- Is easy to theme (light/dark) via existing OKLCH token system

## What Changes

- Add two new global theme tokens in `src/app/globals.css`:
  - `--selection-background`
  - `--selection-foreground`
- Add global selection styling in `@layer base`:
  - `::selection`
  - `::-moz-selection` (Firefox)
- No new dependencies, no runtime JS changes.

## Impact

- **Affected specs**: `ui-components`
- **Affected code**: `src/app/globals.css`
- **Risk**: color contrast/readability (needs quick visual QA in light/dark).

## Success Criteria

- Selecting any text shows the same selection highlight across the site.
- Light/Dark themes have appropriate contrast for selection.
- Firefox behavior is consistent (via `::-moz-selection`).

## Non-Goals

- Per-component/section special-casing (e.g., gradient headings, code blocks).
- Adding any JS-based selection tracking.

## Rollout

- Implement as part of the template delivery stage (or earlier if desired, since it’s low risk).
- If product pages later introduce gradient text or special typography, consider upgrading to the “方案 B” approach described in `docs/references/selection-highlight.md`.

