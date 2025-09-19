---
type: "auto"
description: "Testing strategy and best practices with Vitest and React Testing Library"
---
# Testing Strategy and Best Practices

## Testing Philosophy
- **Testing Framework**: **Vitest 3.2.4** with React Testing Library
- **Test-Driven Development**: Write tests before implementation when possible
- **Coverage Goals**: Maintain minimum 65% code coverage
- **Quality over Quantity**: Focus on meaningful tests that catch real bugs
- **Fast Feedback**: Tests should run quickly
- **React 19 Ready**: Support new hooks and Server Actions testing

## Vitest Configuration for React 19
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 65,
          functions: 65,
          lines: 65,
          statements: 65,
        },
      },
    },
    deps: {
      inline: [
        'next-intl',
        '@radix-ui/react-*',
        'lucide-react',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

## React 19 Hook Testing

### useActionState Testing
```typescript
import { renderHook, act } from '@testing-library/react'; import { useActionState } from 'react';
const mockServerAction = vi.fn().mockImplementation(async (prevState, formData) => { const name = formData.get('name'); if (!name) return { error: 'Name is required' }; return { success: true, data: { name } }; });
describe('useActionState', () => { it('handles form submission with server action', async () => { const { result } = renderHook(() => useActionState(mockServerAction, { data: null })); const [state, formAction, pending] = result.current; expect(state.data).toBeNull(); expect(pending).toBe(false); const formData = new FormData(); formData.append('name', 'John Doe'); await act(async () => { await formAction(formData); }); expect(mockServerAction).toHaveBeenCalledWith({ data: null }, formData); }); });
```

### useOptimistic Testing
```typescript
import { renderHook, act } from '@testing-library/react'; import { useOptimistic, useState } from 'react';
describe('useOptimistic', () => { it('provides optimistic updates', () => { const TestComponent = () => { const [messages, setMessages] = useState([{ id: 1, text: 'Hello' }]); const [optimisticMessages, addOptimisticMessage] = useOptimistic(messages, (state, newMessage) => [...state, { id: Date.now(), text: newMessage, pending: true }]); return { optimisticMessages, addOptimisticMessage, setMessages }; }; const { result } = renderHook(TestComponent); act(() => { result.current.addOptimisticMessage('New message'); }); expect(result.current.optimisticMessages).toHaveLength(2); }); });
```

### useFormStatus Testing
```typescript
import { render, screen } from '@testing-library/react'; import { useFormStatus } from 'react-dom';
const FormStatusComponent = () => { const { pending, method } = useFormStatus(); return (<div><span data-testid="pending">{pending ? 'Loading...' : 'Ready'}</span><span data-testid="method">{method || 'GET'}</span></div>); };
describe('useFormStatus', () => { it('displays form status correctly', () => { render(<form><FormStatusComponent /></form>); expect(screen.getByTestId('pending')).toHaveTextContent('Ready'); }); });
```

## Server Actions Testing
### Server Action Unit Testing
```typescript
import { createUser } from '@/app/actions/user-actions';
vi.mock('@/lib/db', () => ({ user: { create: vi.fn() } }));
describe('Server Actions', () => { beforeEach(() => { vi.clearAllMocks(); }); it('creates user successfully', async () => { const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' }; vi.mocked(await import('@/lib/db')).user.create.mockResolvedValue(mockUser); const formData = new FormData(); formData.append('name', 'John Doe'); formData.append('email', 'john@example.com'); const result = await createUser(null, formData); expect(result.success).toBe(true); expect(result.data).toEqual(mockUser); }); });
```

### Form Integration Testing
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'; import userEvent from '@testing-library/user-event'; import { UserForm } from '@/components/user-form';
vi.mock('@/app/actions/user-actions', () => ({ createUser: vi.fn() }));
describe('Form with Server Actions', () => { it('submits form with useActionState', async () => { const mockCreateUser = vi.mocked(await import('@/app/actions/user-actions')).createUser; mockCreateUser.mockResolvedValue({ success: true, data: { id: 1 } }); const user = userEvent.setup(); render(<UserForm />); await user.type(screen.getByLabelText(/name/i), 'John Doe'); await user.click(screen.getByRole('button', { name: /submit/i })); await waitFor(() => { expect(mockCreateUser).toHaveBeenCalled(); }); }); });
```

## Component Testing Patterns
```typescript
import { render, screen, fireEvent } from '@testing-library/react'; import { axe } from 'jest-axe';
describe('Modern Component Testing', () => { it('renders and handles events', () => { const handleClick = vi.fn(); render(<Button onClick={handleClick}>Click me</Button>); fireEvent.click(screen.getByRole('button')); expect(handleClick).toHaveBeenCalledTimes(1); }); it('meets accessibility standards', async () => { const { container } = render(<Button>Accessible button</Button>); expect(await axe(container)).toHaveNoViolations(); }); });
describe('Custom Hooks', () => { it('manages state correctly', () => { const { result } = renderHook(() => useLocalStorage('key', 'default')); act(() => result.current[1]('new-value')); expect(localStorage.getItem('key')).toBe('"new-value"'); }); });
```

## Mocking Strategies
```typescript
// Mock React 19 hooks
vi.mock('react', async () => ({
  ...await vi.importActual('react'),
  useActionState: vi.fn(),
  useOptimistic: vi.fn(),
}));

// Mock Server Actions
vi.mock('@/app/actions', () => ({
  serverAction: vi.fn(),
}));

// Mock Next.js 15 features
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
}));
```

## Test Organization
### File Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.test.tsx
├── app/
│   ├── actions/
│   │   ├── user-actions.ts
│   │   └── user-actions.test.ts
└── __tests__/
    ├── hooks/
    ├── components/
    └── integration/
```

## Test Scripts
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:actions": "vitest run --testPathPattern=actions",
    "test:hooks": "vitest run --testPathPattern=hooks"
  }
}
```

## Quality Gates
- **Minimum Coverage**: 65% across all metrics
- **Server Actions**: All actions must have unit tests
- **React 19 Hooks**: All custom hooks using new APIs tested
- **Form Integration**: End-to-end form submission tests
- **Accessibility**: Zero violations in jest-axe tests
```
