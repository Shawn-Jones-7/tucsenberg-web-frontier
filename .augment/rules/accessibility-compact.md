---
type: "auto"
description: "Accessibility testing and WCAG 2.1 AA compliance with jest-axe integration and React 19"
---
# Accessibility Standards and Testing
## WCAG 2.1 AA Compliance
- **Perceivable**: Information presentable in ways users can perceive
- **Operable**: Interface components operable by all users
- **Understandable**: Information and UI operation understandable
- **Robust**: Content robust for various assistive technologies

## jest-axe Testing Setup
```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```
### Testing Patterns
```typescript
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

describe('Component Accessibility', () => {
  it('meets WCAG 2.1 AA standards', async () => {
    const { container } = render(<Component />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('supports keyboard navigation', async () => {
    const { container } = render(<InteractiveComponent />);
    expect(await axe(container, {
      rules: { 'keyboard': { enabled: true } }
    })).toHaveNoViolations();
  });
});
```

## React 19 Accessibility Patterns

### Form Actions with Accessibility
```typescript
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
function AccessibleForm() {
  const [state, formAction] = useActionState(submitAction, { message: '' });
  return (
    <form action={formAction}>
      <label htmlFor="email">Email Address</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        aria-describedby={state.errors?.email ? "email-error" : undefined}
        aria-invalid={state.errors?.email ? "true" : "false"}
      />
      {state.errors?.email && (
        <div id="email-error" role="alert" className="text-red-600">
          {state.errors.email}
        </div>
      )}
      <SubmitButton />
    </form>
  );
}
function SubmitButton() {
  const { pending } = useFormStatus();
  return (<button type="submit" disabled={pending} aria-busy={pending}>{pending ? 'Submitting...' : 'Submit'}</button>);
}
```

### Optimistic Updates with Screen Reader Support
```typescript
import { useOptimistic } from 'react';
function AccessibleTodoList({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(todos, (state, newTodo) => [...state, { ...newTodo, pending: true }]);
  async function addTodo(formData) { const newTodo = { id: Date.now(), text: formData.get('todo') }; addOptimisticTodo(newTodo); await saveTodo(newTodo); }
  return (<div><ul role="list" aria-label="Todo items">{optimisticTodos.map(todo => (<li key={todo.id} role="listitem"><span className={todo.pending ? 'opacity-50' : ''}>{todo.text}</span>{todo.pending && <span className="sr-only">Adding item...</span>}</li>))}</ul><form action={addTodo}><label htmlFor="todo-input">Add new todo</label><input id="todo-input" name="todo" required /><button type="submit">Add Todo</button></form></div>);
}
```

## Semantic HTML Guidelines
```typescript
<header><nav aria-label="Main navigation"><ul><li><a href="/">Home</a></li></ul></nav></header>
<main><h1>Page Title</h1><section aria-labelledby="content-heading"><h2 id="content-heading">Content Section</h2></section></main>
<footer><p>&copy; 2025 Company</p></footer>
```

## ARIA Patterns for React 19
```typescript
function AccessibleModal({ isOpen, onClose, title }) {
  const [state, formAction] = useActionState(handleSubmit, null);
  return (<div role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description" hidden={!isOpen}><h2 id="modal-title">{title}</h2><form action={formAction}><div id="modal-description">{/* Form content */}</div><button type="button" onClick={onClose} aria-label="Close modal">×</button></form></div>);
}
function LoadingAwareButton() {
  const { pending } = useFormStatus();
  return (<button type="submit" aria-busy={pending} aria-describedby={pending ? "loading-description" : undefined}>{pending ? 'Processing...' : 'Submit'}{pending && (<span id="loading-description" className="sr-only">Request is being processed, please wait</span>)}</button>);
}
```

## Color Contrast Standards
```css
/* WCAG 2.1 AA: 4.5:1 normal text, 3:1 large text */
:root { --text-primary: #1a1a1a; --accent: #0066cc; }
[data-theme='dark'] { --text-primary: #ffffff; --accent: #4da6ff; }

.focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

## Screen Reader Support
```css
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
```

```typescript
function AccessibleImage({ src, alt, decorative = false }) { return (<img src={src} alt={decorative ? "" : alt} role={decorative ? "presentation" : undefined} />); }
function AccessibleDataVisualization({ data, description }) {
  const [state, updateAction] = useActionState(updateChart, data);
  return (<div><div aria-describedby="chart-description"><Chart data={state} /></div><div id="chart-description" className="sr-only">{description}</div><form action={updateAction}><button type="submit">Update Chart</button></form></div>);
}
```

## Testing React 19 Accessibility Features
```typescript
describe('Form Actions Accessibility', () => {
  it('provides proper ARIA attributes during submission', async () => {
    const { container } = render(<AccessibleForm />);
    // Test optimistic state accessibility
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

## Testing Scripts
```json
{
  "scripts": {
    "test:a11y": "jest --testPathPattern=a11y",
    "lighthouse:a11y": "lhci collect --settings.onlyCategories=accessibility"
  }
}
```

## Accessibility Checklist for React 19

### Development
- [ ] Form actions include proper ARIA states and error handling
- [ ] useFormStatus provides accessible loading indicators
- [ ] Optimistic updates announce changes to screen readers
- [ ] Server actions maintain focus management
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators meet contrast requirements
- [ ] Form validation errors are properly associated
- [ ] Loading states are announced to assistive technology

### Testing
- [ ] jest-axe tests pass for all React 19 patterns
- [ ] Form action accessibility tested with screen readers
- [ ] Optimistic update announcements verified
- [ ] Keyboard navigation works with new hook patterns
- [ ] Focus management tested during async operations
- [ ] Error states are accessible and announced properly
```
