# Change: Improve UX and Fix Critical Bugs

## Why

Functional testing revealed several UX issues and critical bugs that impact user experience and site functionality:
1. Cookie Banner and WhatsApp button overlap in bottom-right corner
2. WhatsApp button opens new tab instead of embedded chat experience
3. Blog article detail pages return 404 (missing dynamic route)
4. Contact form shows unavailable state in development environment

## What Changes

### UI/UX Improvements
- **Cookie Banner positioning**: Use CSS variable `--cookie-banner-height` for dynamic offset coordination
- **WhatsApp integration**: Upgrade existing custom component with chat window UI
  - ~~Use `react-floating-whatsapp` library~~ → **Custom implementation** (React 19 compatibility)
  - Add "Contextual Concierge" chat window pattern
  - Implement device-aware behavior (mobile deep link vs desktop web popup)
  - Add pre-filled message with page context

### Bug Fixes
- **Blog detail page**: Create missing `src/app/[locale]/blog/[slug]/page.tsx` dynamic route
- **Contact form**: Add graceful degradation when Turnstile is unavailable in development

## Technical Decisions

### WhatsApp Widget: Custom Implementation (NOT react-floating-whatsapp)

**Decision Changed:** After analysis with Gemini, we decided NOT to use `react-floating-whatsapp`:

| Factor | `react-floating-whatsapp` | Custom Implementation |
|--------|---------------------------|----------------------|
| React 19 Compatibility | ⚠️ Risk (built for React 17/18) | ✅ Full control |
| Last Update | 1 year ago | N/A (we maintain) |
| Weekly Downloads | ~2000 (low activity) | N/A |
| Bundle Size | External dependency | Zero additional deps |
| Customization | Limited to props | Full control |

**Existing Foundation:** Our `WhatsAppFloatingButton` already has:
- Correct SSR/Hydration handling (`useSyncExternalStore`)
- Draggable functionality (`react-draggable`)
- Position persistence (localStorage)
- Dark mode support

We only need to add the chat window UI layer.

## Impact

- Affected specs: `ui-components` (new), `blog` (new), `contact-form` (new)
- Affected code:
  - `src/components/whatsapp/whatsapp-floating-button.tsx` (upgrade)
  - `src/components/whatsapp/whatsapp-chat-window.tsx` (new)
  - `src/components/cookie/cookie-banner.tsx` (add CSS variable)
  - `src/app/[locale]/blog/[slug]/page.tsx` (new)
  - `src/app/[locale]/contact/page.tsx`
  - `src/lib/security/turnstile-verify.ts` (add dev bypass)
  - `messages/*/common.json` (add i18n keys)

## Priority

| Issue | Severity | Priority |
|-------|----------|----------|
| Blog 404 | High | P0 |
| Contact form unavailable | High | P0 |
| Cookie/WhatsApp overlap | Medium | P1 |
| WhatsApp chat window UX | Medium | P1 |

## References

- WhatsApp Click-to-Chat best practices: [chatarmin.com](https://chatarmin.com/en/blog/click-to-chat-for-whatsapp)
- WhatsApp Widget Tools comparison: [authkey.io](https://authkey.io/blogs/best-whatsapp-widget-tools/)
- ~~react-floating-whatsapp~~: [GitHub](https://github.com/awran5/react-floating-whatsapp) (rejected due to React 19 compatibility)
- npm trends comparison: [npmtrends.com](https://npmtrends.com/react-floating-whatsapp-vs-react-whatsapp-vs-react-whatsapp-widget)
