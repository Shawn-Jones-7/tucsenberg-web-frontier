# Change: Refactor Email Templates to React Email Components

## Why

The current email system uses raw HTML string templates in `src/lib/resend-templates.ts` (~300 lines of inline HTML/CSS). This approach has poor maintainability, no type safety, no preview capability, and requires manual handling of email client compatibility. React Email provides component-based templates with TypeScript support, local preview, and automatic cross-client compatibility.

## What Changes

- **NEW**: Add `@react-email/components` and `@react-email/render` dependencies
- **NEW**: Create `src/components/emails/` directory with React Email components
- **NEW**: Add `email:dev` script for local template preview
- **MODIFIED**: Rename `src/lib/resend-core.ts` → `src/lib/resend-core.tsx` to support JSX
- **MODIFIED**: Update `ResendService` to use `react` property for HTML and `text` property (generated via `@react-email/render`)
- **DEPRECATED**: `src/lib/resend-templates.ts` (replaced by React Email components)
- **MODIFIED**: Update test assertions from `html` to `react` payloads

## Impact

- Affected specs: `email-templates` (new capability)
- Affected code:
  - `src/lib/resend-core.ts` → `.tsx`
  - `src/lib/resend-templates.ts` (deprecated)
  - `src/lib/__tests__/resend.test.ts`
  - `package.json`
- **BREAKING**: Tests expecting `html` property will need updates
- **Architecture Note**: `lib/` importing `components/` is an accepted exception for email templates
