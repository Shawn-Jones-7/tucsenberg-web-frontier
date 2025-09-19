---
type: "always_apply"
description: "Core TypeScript/React development standards and patterns"
---

# TypeScript/React Development Standards

## Core Principles
- **Tech Stack**: TypeScript 5.9.2, Next.js 15.5.3 App Router, React 19 Server Components, shadcn/ui, Radix UI, Tailwind CSS 4.1.11, next-intl 4.3.4, MDX, Resend, Zod, next-themes, Lucide React
- TypeScript strict mode, functional components, Next.js 15 App Router, React 19 features
- Server components default, client components only when necessary
- React 19 Hooks: useActionState, useFormStatus, useOptimistic, use

## TypeScript Standards
- Never `any` - use proper types/`unknown`, avoid `as`/`!` assertions
- Interfaces over types, @/ path aliases, no wildcard imports
- Enable strict mode options, JSDoc for public APIs
- Ensure all variables/imports used, proper return types

## React Patterns
- Next.js App Router, 'use client' directive for client components
- Async server components for data fetching
- Complete useEffect dependencies, no conditional hooks

## React 19 New Hook Patterns (Enhanced Standards)

### useActionState Hook Standards
- **Preferred Pattern**: Use `useActionState` over manual `useTransition` + `useState` combinations
- **Action Function Signature**: `async (previousState, formData) => newState`
- **Error Handling**: Return error objects instead of throwing exceptions
- **State Management**: Use returned `isPending` to disable submit buttons and show loading states
- **Form Integration**: Pass `formAction` directly to form's `action` prop
```typescript
const [error, submitAction, isPending] = useActionState(
  async (previousState, formData) => {
    const result = await updateData(formData.get("field"));
    return result.error || null;
  },
  null
);
```

### useFormStatus Hook Standards
- **Component Placement**: Only call within child components of `<form>`, never in the same component
- **Design System Usage**: Ideal for reusable form components (SubmitButton, LoadingIndicator)
- **Prop Drilling Avoidance**: Eliminates need to pass `pending` state through props
- **Return Values**: Destructure `{ pending, data, method, action }` as needed
```typescript
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} type="submit">Submit</button>;
}
```

### useOptimistic Hook Standards
- **Async Integration**: Always use with `startTransition` for async operations
- **Update Function**: Must be pure function that merges current state with optimistic value
- **User Feedback**: Provide immediate UI feedback while async operation completes
- **State Synchronization**: React automatically syncs with actual state when operation completes
```typescript
const [optimisticMessages, addOptimisticMessage] = useOptimistic(
  messages,
  (state, newMessage) => [{ text: newMessage, sending: true }, ...state]
);
```

### use Hook Standards (Conditional Hook Calling)
- **Conditional Usage**: Can be called conditionally, but still within component/Hook top level
- **Promise Handling**: Use with Suspense boundaries when reading Promises
- **Context Reading**: Alternative to `useContext` with conditional calling capability
- **Server/Client Pattern**: Create Promises in Server Components, pass to Client Components
```typescript
function MessageComponent({ messagePromise }) {
  if (condition) {
    const message = use(messagePromise);
    const theme = use(ThemeContext);
    return <div className={theme}>{message}</div>;
  }
  return null;
}
```

### Form Actions Standards
- **Direct Function Passing**: Pass functions directly to form `action` and `formAction` props
- **Server Functions**: Server Functions can be used directly as form actions
- **Automatic Reset**: React automatically resets uncontrolled forms on successful submission
- **Progressive Enhancement**: Use `permalink` parameter for non-JS fallback
```typescript
<form action={updateName}>
  <input name="name" type="text" />
</form>
<form action={formAction}>
  <input name="name" type="text" />
  <button disabled={isPending}>Update</button>
</form>
```

## Standards Summary
- **Import/Export**: Use @/ path aliases, import only what you use, group imports: external first then internal, use named exports for components
- **Naming**: Files: kebab-case, Components: PascalCase, Variables: camelCase, Constants: UPPERCASE, Booleans: descriptive verbs
- **Organization**: This repository adopts a unified component and code organization approach based on functionality/domain (rather than technical layering by "server/client/shared"). Example:

```
src/
├── components/
│   ├── forms/
│   ├── layout/
│   ├── monitoring/
│   ├── i18n/
│   └── shared/
├── features/
├── services/
├── lib/
└── app/[locale]/
```

Guidelines:
- Default to using Server Components; only create small Client component "islands" when interactivity/events/browser APIs are needed.
- Keep interactive logic close to usage scenarios, preferably within corresponding functional domain directories (e.g., `components/forms/*`).
- Avoid top-level technical layering directory structures like "server/client/shared".
- Utilities in src/lib, Types in src/types, Server Actions in src/app/actions.ts
- **Code Generation**: Use const declarations, prefix event handlers with "handle", use early returns, include ARIA attributes
- **Functions**: Keep under 20 lines, start with verbs, use default parameters, prefer map/filter/reduce, single abstraction level

## React 19 Best Practices & Migration Guidelines
### Hook Migration Priorities
- **High Priority**: Replace manual form state management with `useActionState`
- **Medium Priority**: Upgrade conditional context reading to `use` Hook
- **Low Priority**: Add optimistic updates with `useOptimistic` for enhanced UX

### Server/Client Component Patterns
- **Server Actions**: Define server functions with `'use server'` directive for form `action` props
- **Error Boundaries**: Implement proper error handling for async operations
- **Suspense Integration**: Use Suspense boundaries with `use` Hook for Promise handling

## React 19 Component Optimization Patterns
### Component Structure with Performance Optimizations
```typescript
import { memo, use, cache } from 'react'
export const Component = memo(({ className, variant, size, ...props }) => (<div className={cn(variants({ variant, size, className }))} {...props} />))
```

### Essential Radix UI Integration Patterns
**Radix UI with React 19 Hooks:**
```typescript
import * as Dialog from '@radix-ui/react-dialog'; import * as DropdownMenu from '@radix-ui/react-dropdown-menu'; import { useOptimistic } from 'react'; import { useFormStatus } from 'react-dom'
export const OptimizedDialog = ({ open, onOpenChange, title, children }) => { const [optimisticOpen, setOptimisticOpen] = useOptimistic(open, (state, newState) => newState); return (<Dialog.Root open={optimisticOpen} onOpenChange={(newOpen) => { setOptimisticOpen(newOpen); onOpenChange(newOpen) }}><Dialog.Portal><Dialog.Overlay /><Dialog.Content><Dialog.Title>{title}</Dialog.Title>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>) }
const DropdownMenuItem = ({ action }) => { const { pending } = useFormStatus(); return (<DropdownMenu.Item disabled={pending} onSelect={() => !pending && action.action()}>{action.label}</DropdownMenu.Item>) }
```

## Data Validation with Zod and React 19 Forms
### Form Validation Patterns
```typescript
import { useActionState } from 'react'; import { z } from 'zod'
async function createUserAction(prevState, formData) { const schema = z.object({ name: z.string().min(2), email: z.string().email() }); const result = schema.safeParse({ name: formData.get('name'), email: formData.get('email') }); return result.success ? { success: true, user: result.data } : { success: false, errors: result.error.flatten() } }
function UserForm() { const [state, formAction, pending] = useActionState(createUserAction, null); return (<form action={formAction}><input name="name" required /><input name="email" type="email" required /><button disabled={pending}>{pending ? 'Creating...' : 'Create User'}</button>{state?.errors && <div>Validation errors: {JSON.stringify(state.errors)}</div>}</form>) }
```

### Essential Zod Patterns
- **Object**: `z.object({ field: z.string() })` **Array**: `z.array(z.string())`
- **Optional**: `z.string().optional()` **Transform**: `z.string().transform(val => val.toLowerCase())`
- **Custom**: `z.string().refine(val => val.length > 0)`

## Theme System with next-themes
```typescript
import { ThemeProvider } from 'next-themes'; import { useTheme } from 'next-themes'; import { useOptimistic, useTransition } from 'react'
export function Providers({ children }) { return <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="app-theme">{children}</ThemeProvider> }
export function ThemeToggle() { const { setTheme, resolvedTheme } = useTheme(); const [isPending, startTransition] = useTransition(); const [optimisticTheme, setOptimisticTheme] = useOptimistic(resolvedTheme, (state, newTheme) => newTheme); const handleThemeChange = (newTheme) => { setOptimisticTheme(newTheme); startTransition(() => setTheme(newTheme)) }; return (<div>{['light', 'dark', 'system'].map((themeOption) => (<button key={themeOption} onClick={() => handleThemeChange(themeOption)} disabled={isPending}>{themeOption}</button>))}</div>) }
```

## Performance Guidelines
- Use Next.js Image component with proper sizing and React.memo() for expensive components
- Implement loading states with loading.tsx files and error boundaries with error.tsx files
- Optimize bundle size with dynamic imports and server components for data fetching
- Leverage React 19 concurrent features (useTransition, useDeferredValue, useOptimistic)
- Apply CSS containment for better rendering performance
