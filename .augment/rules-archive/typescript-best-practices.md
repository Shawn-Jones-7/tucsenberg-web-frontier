---
type: "agent_requested"
description: "Comprehensive TypeScript best practices and advanced patterns"
---
# TypeScript Best Practices
## Core Principles

### 1. Strict Type Safety
- **Never use `any` type**: Use specific types or `unknown` for truly unknown data
- **Define function return types**: Especially for complex functions
- **Proper event handler types**: Use correct event types for handlers

```typescript
// ❌ Incorrect: const handleClick = (event: any) => {}; const handleDrag = (event: any, info: any) => {};
// ✅ Correct:
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {}; const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {};
```

### 2. React 19 Component Type Standards

```typescript
// ❌ Incorrect: interface Props { children: any; onClick?: any; }
// ✅ Correct:
interface Props { children: React.ReactNode; onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void; className?: string; }
```

### 3. React 19 New Hooks Type Patterns

```typescript
import { useActionState } from 'react';
type ActionState = { message: string; errors?: Record<string, string[]>; };

type ServerAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;
const [state, formAction, pending] = useActionState<ActionState>(serverAction, { message: '' });
// useOptimistic typing
import { useOptimistic } from 'react';
type TodoItem = { id: string; text: string; completed: boolean };
const [optimisticTodos, addOptimisticTodo] = useOptimistic(todos, (state: TodoItem[], newTodo: TodoItem) => [...state, newTodo]);
// useFormStatus typing
import { useFormStatus } from 'react';
const SubmitButton = () => { const { pending, data, method, action } = useFormStatus(); return (<button type="submit" disabled={pending}>{pending ? 'Submitting...' : 'Submit'}</button>); };
```

### 4. TypeScript 5.7+ Advanced Patterns

```typescript
// Enhanced template literal types
type EventName<T extends string> = `on${Capitalize<T>}`; type ClickEvent = EventName<'click'>; // 'onClick'
// Improved conditional types with infer
type ExtractArrayType<T> = T extends (infer U)[] ? U : never; type StringType = ExtractArrayType<string[]>; // string
// Better tuple type inference
const createTuple = <T extends readonly unknown[]>(...args: T): T => args; const tuple = createTuple('hello', 42, true); // [string, number, boolean]

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  features: ['auth', 'analytics']
} satisfies Config;
```

### 5. Server Actions Type Safety

```typescript
// Server Action with proper typing
'use server';
import { z } from 'zod';

const CreateUserSchema = z.object({ name: z.string().min(1), email: z.string().email() });
type CreateUserState = { message: string; errors?: z.ZodFormattedError<z.infer<typeof CreateUserSchema>> };

export async function createUser(prevState: CreateUserState, formData: FormData): Promise<CreateUserState> {
  const validatedFields = CreateUserSchema.safeParse({ name: formData.get('name'), email: formData.get('email') });
  if (!validatedFields.success) {
    return { message: 'Validation failed', errors: validatedFields.error.format() };
  }
  return { message: 'User created successfully' };
}
```

### 6. Advanced Component Patterns

```typescript
// Generic component with constraints
interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], item: T) => React.ReactNode;
  }>;
  onRowClick?: (item: T) => void;
}

function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick
}: DataTableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={String(col.key)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} onClick={() => onRowClick?.(item)}>
            {columns.map(col => (
              <td key={String(col.key)}>
                {col.render ? col.render(item[col.key], item) : String(item[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 7. Form Handling with React 19

```typescript
// Form component with useActionState
interface FormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  initialState: ActionState;
}

const Form: React.FC<FormProps> = ({ action, initialState }) => {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      {state.errors?.email && (
        <div className="error">{state.errors.email.join(', ')}</div>
      )}
      <SubmitButton />
      {state.message && (
        <div className={state.errors ? 'error' : 'success'}>
          {state.message}
        </div>
      )}
    </form>
  );
};
```

### 8. Error Handling Patterns

```typescript
// Result type with discriminated unions
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

// Async error handling with proper typing
async function safeApiCall<T>(apiCall: () => Promise<T>): Promise<Result<T>> {
  try {
    const data = await apiCall();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}
```

## Common Error Patterns and Solutions

### 1. React 19 Hook Type Errors
```typescript
// ❌ Incorrect
const [state, action] = useActionState(myAction, undefined);

// ✅ Correct
const [state, action] = useActionState<ActionState>(myAction, { message: '' });
```

### 2. Server Component vs Client Component Types
```typescript
// Server Component (async allowed)
async function ServerComponent({ id }: { id: string }) {
  const data = await fetchData(id);
  return <div>{data.title}</div>;
}

// Client Component (no async)
'use client';
function ClientComponent({ id }: { id: string }) {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetchData(id).then(setData);
  }, [id]);

  return <div>{data?.title}</div>;
}
```

## Tool Configuration Recommendations

### tsconfig.json for React 19 + Next.js 15
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```
