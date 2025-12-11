# Design: UX Improvements and Bug Fixes

## Context

Functional testing using browser automation revealed multiple issues affecting user experience and core functionality. This change addresses critical bugs (blog 404, contact form) and UX improvements (Cookie/WhatsApp overlap, WhatsApp chat experience).

## Goals / Non-Goals

**Goals:**
- Fix critical navigation bugs (blog detail 404)
- Ensure contact form works in development environment
- Resolve UI element overlap issues
- Improve WhatsApp integration UX with embedded chat

**Non-Goals:**
- Full WhatsApp Business API integration (requires backend infrastructure)
- Cookie consent redesign (only positioning changes)
- Blog redesign (only add missing page)

## Decisions

### D1: Blog Detail Page Implementation

**Decision:** Create standard Next.js dynamic route with MDX rendering

**Rationale:**
- Consistent with existing product detail page pattern
- Uses existing `getAllPostsCached` and `getPostBySlugCached` functions
- MDX allows rich content with custom components

**File:** `src/app/[locale]/blog/[slug]/page.tsx`

```typescript
// Pattern
export async function generateStaticParams() {
  const posts = await getAllPostsCached();
  return posts.flatMap(post =>
    ['en', 'zh'].map(locale => ({ locale, slug: post.slug }))
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = await getPostBySlugCached(slug, locale);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}
```

### D2: Contact Form Turnstile Bypass

**Decision:** Add environment-based bypass for development only

**Rationale:**
- Turnstile requires valid domain verification
- Development testing blocked without bypass
- Secure: Only enabled with explicit env var + NODE_ENV check

**Implementation:**
```typescript
// src/lib/security/turnstile-verify.ts
export async function verifyTurnstile(token: string): Promise<boolean> {
  // Development bypass
  if (process.env.NODE_ENV === 'development' &&
      process.env.TURNSTILE_BYPASS === 'true') {
    console.warn('[DEV] Turnstile verification bypassed');
    return true;
  }
  // Production verification...
}
```

### D3: Cookie Banner / WhatsApp Positioning

**Decision:** Use CSS custom property for dynamic offset

**Rationale:**
- Avoids tight coupling between components
- Works with existing Tailwind classes
- Smooth transitions possible

**Implementation:**
```css
/* Cookie banner sets the variable */
:root { --cookie-banner-height: 0px; }

/* WhatsApp button uses it */
.whatsapp-button {
  bottom: calc(24px + var(--cookie-banner-height, 0px));
  transition: bottom 300ms ease-out;
}
```

**Alternative Considered:** React Context
- More complex
- Requires provider wrapping
- CSS variable is simpler for this use case

### D4: WhatsApp Chat Window (Custom Implementation)

**Decision:** Upgrade existing custom component with chat window UI (NOT use `react-floating-whatsapp`)

**Rationale:**
- `react-floating-whatsapp` has **critical compatibility risks** with React 19:
  - Last updated 1 year ago (v5.0.8), built for React 17/18
  - React 19 removed `defaultProps` support and changed `ref` mechanism
  - Only ~2000 weekly downloads, single maintainer, low activity
- Existing `WhatsAppFloatingButton` already has solid foundation:
  - Correct SSR/Hydration handling (`useSyncExternalStore`)
  - Draggable functionality (`react-draggable`)
  - Position persistence (localStorage)
  - Dark mode support
- Custom implementation provides:
  - Full control over UI/UX
  - No external dependency risk
  - Consistent with project "simplicity first" principle

**Alternative Rejected:** `react-floating-whatsapp`
- ⚠️ React 19 incompatibility risk
- Abandoned maintenance (1 year no updates)
- "Fake chat" UX pattern can be misleading

**UX Pattern: "Contextual Concierge"**

Better than "fake chat" - users clearly know they're starting a WhatsApp conversation:

```
┌─────────────────────────────┐
│  👋 Need help?              │
│  ─────────────────────────  │
│  Team typically replies     │
│  within 5 minutes.          │
│                             │
│  ┌─────────────────────┐    │
│  │ Your message...     │    │
│  └─────────────────────┘    │
│                             │
│  [💬 Start WhatsApp Chat]   │
└─────────────────────────────┘
         [W] ← Button
```

**Implementation Pattern:**
```typescript
// Upgrade existing WhatsAppFloatingButton
const [isOpen, setIsOpen] = useState(false);
const [message, setMessage] = useState(defaultMessage);

// Device-aware URL generation
const getWhatsAppUrl = () => {
  const text = encodeURIComponent(message);
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  return isMobile
    ? `whatsapp://send?phone=${number}&text=${text}`
    : `https://web.whatsapp.com/send?phone=${number}&text=${text}`;
};

return (
  <Draggable ...>
    <div className="relative">
      {/* Chat Window - shows when open */}
      {isOpen && (
        <ChatWindow
          message={message}
          onMessageChange={setMessage}
          onSubmit={() => window.open(getWhatsAppUrl(), '_blank')}
          onClose={() => setIsOpen(false)}
        />
      )}

      {/* Floating Button */}
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <MessageCircle />}
      </button>
    </div>
  </Draggable>
);
```

**Pre-filled Message Context:**
```typescript
const getContextualMessage = (locale: string, pathname: string) => {
  const baseMessage = locale === 'zh'
    ? '您好！我对贵公司的产品感兴趣。'
    : 'Hi! I\'m interested in your products.';

  // Add product context if on product page
  if (pathname.includes('/products/')) {
    const productSlug = pathname.split('/products/')[1];
    return `${baseMessage}\n\nProduct: ${productSlug}\nPage: ${window.location.href}`;
  }

  return `${baseMessage}\n\nPage: ${window.location.href}`;
};
```

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Turnstile bypass in production | High | Double-check: `NODE_ENV` + explicit `TURNSTILE_BYPASS` |
| Custom WhatsApp UI maintenance | Low | Simple UI, ~100 lines of code, fully controlled |
| CSS variable browser support | None | Supported in all modern browsers |
| WhatsApp web availability | Low | Fallback to wa.me link if widget fails |

## Migration Plan

1. Deploy blog detail page first (P0, no breaking changes)
2. Deploy contact form fix (P0, development only)
3. Deploy positioning fix (P1, CSS only)
4. Deploy WhatsApp widget (P1, replaces existing component)

**Rollback:** Each change is independent, can be reverted separately.

## Open Questions

1. Should WhatsApp widget show agent avatar/name from config?
2. Should pre-filled message include product details on product pages?
3. Cookie banner height: fixed value or dynamic measurement?

## References

- [react-floating-whatsapp](https://github.com/awran5/react-floating-whatsapp)
- [WhatsApp Click-to-Chat](https://faq.whatsapp.com/5913398998672934)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
