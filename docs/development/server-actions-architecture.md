# Server Actions Architecture Boundary

This document captures the layering model we follow when wiring React 19 Server Actions to business logic. It clarifies the responsibilities of each layer, highlights existing examples in the repository, and outlines checks to keep the architecture healthy as we continue to iterate.

## Goals

- Keep domain logic pure and independently testable.
- Restrict Server Actions to thin adapters that translate HTTP/FormData concerns into domain inputs and surface structured results.
- Provide UI components with declarative, type-safe hooks that never reimplement business rules.
- Establish an upgrade-friendly baseline for future migrations (e.g., RPC, queue handlers, background jobs).

## Layered Responsibilities

### 1. Domain Services (Pure Functions)

Located under `src/app/api/contact/contact-api-validation.ts` and related modules.

- Accept typed data structures (`ContactFormWithToken`, etc.) and return `Promise`-wrapped DTOs.
- Enforce invariants (e.g., Turnstile verification, Airtable writes) and raise typed errors.
- Avoid direct references to Next.js, React, or request context.
- Depend only on platform-agnostic utilities (`@/lib/logger`, `@/lib/validations`, third‑party SDKs).

> **Example:** `processFormSubmission` orchestrates validation, messaging, and persistence while returning a normalized result consumed by the adapter.

### 2. Server Action Adapters

Centralized in `src/app/actions.ts`.

- Translate `FormData` into typed request objects using helpers such as `getFormDataString/getFormDataBoolean`.
- Delegate to domain services (`processFormSubmission`) and capture telemetry via `logger` and `Sentry`.
- Map validation failures to i18n keys (`errors.*`) so clients can display localized feedback.
- Return `ServerActionResult<T>` values through `createSuccessResultWithLogging` / `createErrorResultWithLogging`.
- Must remain side-effect minimal: no direct UI manipulation, no shared mutable state.

> **Pattern:** `contactFormAction` measures execution time, passes sanitized input downstream, and maps outcomes back to the UI contract while ensuring consistent logging.

### 3. UI Consumers

Primarily under `src/components/forms/contact-form-container.tsx`.

- Use `useActionState`/`useOptimistic` to consume the action without reimplementing business rules.
- Render translated error keys (`contact.form.errors.*`) and optimistic statuses.
- Handle client-only concerns (Throttle, Turnstile, loading states) without mixing server logic.
- May provide additional UX niceties (debounce, accessibility affordances) while respecting action boundaries.

> **Flow:** `ContactFormContainer` invokes `contactFormAction`, displays localized errors, and never touches persistence credentials directly.

## Sequence Overview

```
Client Form ──submit──▶ Server Action Adapter ──▶ Domain Service
     ▲                     │                        │
     │                     ├─ logs / telemetry ─────┤
     │                     └─ normalized result ◀───┘
     └─ optimistic state & i18n rendering ◀─────────
```

## Healthy-Boundary Checklist

- [ ] Domain services stay framework-agnostic and expose typed responses.
- [ ] Server Actions perform only translation, validation mapping, and telemetry.
- [ ] UI components never touch `FormData` parsing or infrastructure credentials.
- [ ] New validation rules expose i18n keys instead of raw strings.
- [ ] Error handling feeds both Sentry (`@sentry/nextjs`) and structured logs.

## Extension Points

- **Background Processing:** Wrap domain services in queue workers without modifying UI contracts.
- **Multi-channel Submission:** Reuse `processFormSubmission` from future REST/RPC endpoints.
- **Testing:** Unit test domain services with pure inputs; integration test adapters via `contactFormAction`.

## Migration Notes

- When introducing new Server Actions, scaffold the adapter in `src/app/actions.ts` and keep UI entry points thin.
- For non-form scenarios (e.g., dashboards), maintain the same separation: domain utilities → adapter → UI.
- Revisit this document after significant schema or infrastructure changes to ensure the boundary still reflects reality.
