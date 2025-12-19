# Change: Fix Navbar Responsive Overlap

## Why

The header navigation uses `absolute` positioning for center alignment, which causes visual overlap between Logo, navigation links, and right-side controls when the viewport shrinks to 768px-1024px range. This breaks usability and brand visibility.

**Root Cause Analysis:**
- `CenterNav` uses `absolute top-1/2 left-1/2 -translate-*` (escapes document flow)
- Left/right sections use `flex justify-between` (participate in space allocation)
- No z-index hierarchy defined for collision scenarios
- Breakpoint `md:flex` (768px) is too aggressive for navigation content width (~830px total)

## What Changes

### 1. Layout Restructure (Core Fix)
- Replace `absolute` centering with flex three-column layout
- Left/right columns: `shrink-0` (content-adaptive width, no shrink)
- Center column: `flex-1 min-w-0 justify-center` (fills remaining space, can shrink)

### 2. Breakpoint Synchronization (Critical)
All navigation-related breakpoints MUST be aligned to prevent navigation gap:

| Component | Current | After |
|-----------|---------|-------|
| Desktop Navigation | `hidden md:flex` | `hidden lg:flex` |
| Mobile Menu Button | `md:hidden` | `lg:hidden` |
| CTA Button (optional) | `hidden md:inline-flex` | Consider `lg:inline-flex` |

**Warning**: Changing desktop nav breakpoint without syncing mobile menu creates a 768-1023px gap where NO navigation is accessible.

### 3. Overflow Control (Revised)
- **DO NOT use `overflow-hidden`** on CenterNav or any ancestor containing NavigationMenuViewport
- Radix NavigationMenuViewport renders inside the nav subtree with `absolute top-full` - it will be clipped
- Use breakpoint control (hide earlier) instead of overflow clipping

## Impact

- **Affected specs:** `ui-components`
- **Affected code:**
  - `src/components/layout/header.tsx` (layout structure)
  - `src/components/layout/vercel-navigation.tsx` (breakpoint)
  - `src/components/layout/mobile-navigation.tsx` (breakpoint sync)
- **Risk:** Low - visual layout change, no logic changes
- **Breaking:** No - all existing functionality preserved

## Technical Notes

### Width Calculation
```
Logo area:     ~200px (image + "Tucsenberg" text)
Nav links:     ~450px (Home + Products + Blog + FAQ + About + Privacy)
Right area:    ~180px (Language toggle + CTA button)
Total:         ~830px
```

At `md` breakpoint (768px), content overflows by ~62px minimum.

### Stacking Context
Previous: All elements at `z-index: auto` (DOM order determines overlap)
After: Not needed - flex layout prevents overlap entirely

### Centering Behavior Change
Previous: Navigation centered at exact viewport geometric center
After: Navigation centered within remaining space (between left/right columns)

Visual difference is minimal when left/right columns are similar width.

### Dropdown Safety
NavigationMenuViewport uses `absolute top-full left-0 z-50` inside NavigationMenu.
Any `overflow-hidden` on ancestors will clip the dropdown panel, making it unusable.

## Open Questions (Product Confirmation)

1. Is it acceptable that 768-1023px uses hamburger-only navigation?
2. Should CTA button follow the same breakpoint (`lg:inline-flex`) to reduce mid-range crowding?
