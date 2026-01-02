# Design: React Email Components Architecture

## Context

The project uses Resend SDK v6.6.0 for email delivery. Current implementation generates HTML strings in `resend-templates.ts`. This refactoring introduces React Email for component-based email templates.

**Stakeholders**: Frontend developers, DevOps (email deliverability)

**Constraints**:
- Must maintain plainText fallback for deliverability
- Must work with TypeScript strict mode
- Must not break existing email functionality

## Goals / Non-Goals

**Goals**:
- Replace HTML string templates with React Email components
- Enable local preview via `email:dev` command
- Improve maintainability and type safety
- Maintain email client compatibility (Outlook, Gmail, Apple Mail)

**Non-Goals**:
- i18n for email templates (future enhancement)
- Dark mode support (future enhancement)
- Email analytics/tracking integration

## Decisions

### 1. Directory Structure

**Decision**: Place components in `src/components/emails/`

**Rationale**: Follows existing component organization pattern. While `lib/` importing `components/` is technically an architecture violation, email templates are a special case where visual components are consumed by a service layer.

**Alternatives Considered**:
- `src/emails/` (Gemini suggestion) - Rejected: inconsistent with project structure
- `src/lib/emails/` - Rejected: mixing concerns (lib is for utilities)

### 2. Styling Approach

**Decision**: Inline styles with shared `theme.ts` constants

**Rationale**: Email clients have limited CSS support. Inline styles are most reliable across Outlook, Gmail, and Apple Mail. A theme object provides consistency without build complexity.

**Alternatives Considered**:
- `@react-email/tailwind` - Rejected: adds build complexity, less predictable in Outlook
- CSS-in-JS - Rejected: not supported in email context

### 3. JSX in Service Layer

**Decision**: Rename `resend-core.ts` → `resend-core.tsx`

**Rationale**: Cleaner than using `createElement()`. The file already has React as a peer dependency via Resend.

**Alternatives Considered**:
- Use `createElement()` in `.ts` file - Rejected: verbose, harder to read
- Create adapter layer - Rejected: over-engineering

### 4. PlainText Generation

**Decision**: Use `@react-email/render` with `plainText: true` option

**Rationale**: Maintains deliverability. Some email clients and spam filters prefer plainText fallback.

```typescript
import { render } from '@react-email/render';
const text = await render(<ContactFormEmail {...data} />, { plainText: true });
```

### 5. Props Design

**Decision**: Spread props directly (e.g., `props.firstName`) instead of wrapping in `data` object

**Rationale**: Simpler API, matches existing `EmailTemplateData` type structure.

## Component Architecture

```
src/components/emails/
├── index.ts                    # Unified export
├── theme.ts                    # Colors, fonts, spacing constants
├── EmailLayout.tsx             # Shared layout (Header/Footer/Container)
├── EmailField.tsx              # Label/Value primitive
├── ContactFormEmail.tsx        # Admin notification
├── ConfirmationEmail.tsx       # User confirmation
└── ProductInquiryEmail.tsx     # Product inquiry notification
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Visual differences from current HTML | Manual comparison before deployment |
| `lib/` importing `components/` | Documented exception; email is special case |
| Test brittleness with `react` assertions | Use `expect.anything()` for react prop |
| Deliverability regression | Keep plainText generation; test with email clients |

## Migration Plan

1. **Phase 1**: Add dependencies and create components (non-breaking)
2. **Phase 2**: Update `resend-core.tsx` to use new components
3. **Phase 3**: Update tests
4. **Phase 4**: Deprecate `resend-templates.ts`

**Rollback**: Revert to `html/text` approach by restoring `resend-core.ts` from git history.

## Open Questions

- [ ] Should we add i18n support for email templates in this change or defer?
  - **Recommendation**: Defer to separate proposal
- [ ] Should `resend-templates.ts` be deleted or kept as deprecated?
  - **Recommendation**: Keep as deprecated for one release cycle
