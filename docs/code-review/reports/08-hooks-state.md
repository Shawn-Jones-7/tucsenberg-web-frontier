# Phase 08: Hooks & State Review

**Scope:** `src/hooks/**` (React 19)

## Executive Summary
- No React 19 `use()`/Actions/Transitions usage found; current hooks rely on traditional client-side patterns and Suspense is not used in this layer.
- Fixed a **P1** side-effect leak in `useDeferredContent` by cleaning up both `IntersectionObserver` and idle callbacks to prevent lingering observers.
- Most hooks have correct dependency arrays; none observed with stale-closure risks. Returned callbacks are memoized where needed, though `useBreakpoint` still returns new function identities each render (refactor suggested in Issue 1).

## Hook-by-Hook Notes
| Hook | Purpose | Dependency Review | Stability & Side Effects | Findings |
| --- | --- | --- | --- | --- |
| `useCurrentTime` | Interval-based timestamp for time-sensitive UI. | `useEffect` depends on `updateInterval`; clearInterval provided. | Returns primitive; no stability concerns. | ✅ No issues. |
| `useEnhancedTheme` | Debounced theme switching with view-transition support. | No effects; relies on memoized callbacks. | Return object memoized via `useMemo`; debounce refs prevent re-creation. | ✅ No issues. |
| `useThemeToggle` | Accessible theme switcher wiring `useEnhancedTheme` + accessibility manager. | Locale binding effect includes `locale`; cleanup not needed. | Callbacks memoized; `supportsViewTransitions()` cached internally. | ✅ No issues. |
| `useEnhancedTranslations` | i18n helper with analytics, formatting, and safe ICU value normalization. | Uses `useMemo` for preload; callbacks memoized with correct deps. | Return object memoized; analytics guarded. | ✅ No issues. |
| `useBreakpoint` | Tracks viewport width against breakpoint map. | Resize listener effect has empty deps (window-level singleton). | Returns fresh functions each render (could be memoized to reduce downstream renders). | ⚠️ See Issue 1. |
| `useIntersectionObserver` / `useIntersectionObserverWithDelay` | Visibility detection with reduced-motion fallback and optional delay. | Effects include all threshold/root settings and callback dependencies. | Observer cleanup handled; delayed variant queues microtasks safely. | ✅ No issues. |
| `useDeferredBackground` | Idle-based toggling for decorative backgrounds. | Effect depends on `timeout`; cleanup via idle callback. | Primitive return; no leak. | ✅ No issues. |
| `useDeferredContent` | Defers rendering until visible or idle. | Effect depends on ref + options. | **Fixed:** now disconnects `IntersectionObserver` and cancels idle callback on cleanup to avoid leaks. | ✅ Resolved P1. |
| `useKeyboardNavigation` | Arrow/Tab/Home-End navigation helpers for composite widgets. | Event listener effect depends on `handleKeyDown` + `config.enabled`. | Config memoized; callbacks stable. | ✅ No issues. |
| `useWebVitalsDiagnostics` | Collects, persists, and analyzes Web Vitals reports. | Initialization effect depends on `initialData`/`refreshDiagnostics`; no missing deps found. | Returns new object each render; acceptable given data payload, persistence uses memoized callbacks. | ✅ No critical issues. |
| `useReducedMotion` | Detects prefers-reduced-motion media query. | Effect runs once; cleans up listener when supported. | Initial state guarded for SSR. | ✅ No issues. |

## React 19-Specific Patterns
- No usage of `use()`/Actions/Transitions in hooks; current patterns remain React 18-compatible. No Suspense boundaries observed in hooks layer.

## Recommendations
1. **Refactor for stable return signatures** — Memoize the function/object return values of `useBreakpoint` to avoid unnecessary re-renders in consumers that rely on referential equality (see Issue 1).
2. **Keep side-effect cleanups paired** — Maintain the added cleanup pattern from `useDeferredContent` as a template for future observer/idle integrations.

## Created Issues
- [Issue 1](../issues/use-breakpoint-stability.md): Memoize `useBreakpoint` return functions to improve referential stability and reduce downstream renders.
