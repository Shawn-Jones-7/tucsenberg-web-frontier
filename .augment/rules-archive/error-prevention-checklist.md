---
type: "agent_requested"
description: "Comprehensive error prevention checklist for TypeScript, React, and Next.js development"
---
# Error Prevention Checklist

## 🚀 Pre-Development Checks

### TypeScript Configuration Verification
- [ ] Confirm tsconfig.json has strict mode enabled and check for unused imports
- [ ] Verify type definition files are up to date and @types/\* packages match dependency versions

### Project Dependencies Verification
- [ ] Confirm all required dependencies are installed and check version compatibility
- [ ] Validate type definition packages (@types/\*) and verify peer dependencies are satisfied

## 💻 Development Phase Checks

### Component Creation Standards
- [ ] Use correct React component type definitions
- [ ] Define explicit interfaces for props
- [ ] Add necessary default values
- [ ] Implement proper error boundaries

```typescript
interface ComponentProps { children: React.ReactNode; className?: string; onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void; }
export function Component({ children, className = '', onClick }: ComponentProps) { return (<button className={className} onClick={onClick}>{children}</button>); }
```
### Event Handler Standards
- [ ] Use correct event types and prefix unused parameters with underscore
- [ ] Provide default values for optional callbacks and handle async operations properly

### Framer Motion Component Standards
- [ ] Use correct Variants type for animations and avoid readonly array issues
- [ ] Handle animation properties correctly and implement proper motion component patterns

### Internationalization Standards
- [ ] Use correct namespace patterns and handle unused translation variables
- [ ] Escape special characters properly and implement proper fallback mechanisms

## 🔍 Code Review Checklist

### TypeScript Type Safety

- [ ] No usage of `any` type without justification
- [ ] All functions have explicit return types
- [ ] Interface definitions are complete and accurate
- [ ] Generic types are used appropriately
- [ ] Type guards are implemented where needed

### React Best Practices

- [ ] Components have displayName (required for HOCs)
- [ ] useEffect dependency arrays are complete
- [ ] Avoid unnecessary re-renders
- [ ] Proper usage of React.memo and useCallback
- [ ] Error boundaries are implemented

### Performance Optimization

- [ ] Images use Next.js Image component
- [ ] Large components are dynamically imported
- [ ] Avoid object creation during render
- [ ] Implement appropriate caching strategies
- [ ] Use proper loading states

## 🧪 Pre-Commit Verification

### Automated Checks

```bash
pnpm type-check && pnpm lint && pnpm build && pnpm test && pnpm test:a11y
```

### Manual Verification Checklist

- [ ] All TypeScript errors resolved
- [ ] All ESLint errors fixed
- [ ] Build completes without warnings
- [ ] Test coverage meets requirements (>80%)
- [ ] Performance metrics within acceptable range
- [ ] Accessibility standards met (WCAG 2.1 AA)

## 🚨 Common Error Quick Fixes

### Quick Fix Examples
```typescript
// TS6133 - Unused Variable: Add underscore prefix
const _unusedVar = someValue;

// TS2769 - Type Mismatch: Verify type definitions
import type { CorrectType } from './types';

// react/no-unescaped-entities: Use HTML entities
<p>Use &ldquo;and&rdquo; instead of direct quotes</p>

// @typescript-eslint/no-explicit-any: Use specific types
const handler = (event: React.MouseEvent) => {}; // ✅

// react-hooks/exhaustive-deps: Include all dependencies
useEffect(() => { const { timeSpentInThemes } = analytics; }, [analytics.timeSpentInThemes, analytics]);
```

## 📊 Quality Metrics Targets

### Target Metrics

- TypeScript errors: 0, ESLint errors: 0, ESLint warnings: < 5
- Test coverage: > 80%, Build time: < 60 seconds
- Lighthouse performance: > 90, Accessibility score: > 95

### Monitoring Methods

- GitHub Actions automated checks, Pre-commit hooks configuration
- Regular code quality reviews, Performance monitoring and reporting
- Automated dependency updates

## 🎯 React 19 Specific Checks

### New Hooks Validation

- [ ] useActionState properly typed and implemented
- [ ] useOptimistic with correct state management
- [ ] useFormStatus integrated with form handling
- [ ] use() Hook proper implementation and error handling
- [ ] Server Actions properly typed and error-handled

```typescript
// ✅ React 19 useActionState pattern
const [state, formAction, pending] = useActionState(
  async (prevState: FormState, formData: FormData) => {
    try {
      const result = await processForm(formData);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  { success: false, data: null }
);
```

### Form Actions and Server Actions

- [ ] Form Actions with proper validation and error boundaries
- [ ] Server Actions marked with 'use server' directive
- [ ] Proper FormData handling and validation
- [ ] Error states and loading states properly managed
- [ ] Progressive enhancement patterns implemented

### React 19 Concurrent Features

- [ ] React 19 concurrent features usage patterns
- [ ] Proper Suspense boundary implementation
- [ ] Enhanced streaming capabilities utilized
- [ ] Transition updates properly implemented
- [ ] Priority-based rendering optimizations

### Server Components Standards

- [ ] Proper async/await patterns in Server Components
- [ ] Correct data fetching strategies
- [ ] Appropriate use of Suspense boundaries
- [ ] Proper error boundary implementation
- [ ] New JSX transform compatibility verified
- [ ] Enhanced Server Components patterns utilized

## 🚀 Next.js 15 Specific Checks

### Turbopack Integration

- [ ] Turbopack configuration and optimization verified
- [ ] Build performance improvements validated
- [ ] Development server optimization confirmed
- [ ] Hot reload efficiency tested

### Enhanced App Router Features

- [ ] Next.js 15 caching strategy updates implemented
- [ ] New App Router improvements utilized
- [ ] Parallel routes optimization verified
- [ ] Dynamic route optimizations applied

### Performance Optimization

- [ ] React 19 performance optimizations implemented
- [ ] Enhanced streaming capabilities utilized
- [ ] Concurrent rendering optimizations applied
- [ ] Bundle size optimization with new features
- [ ] Core Web Vitals improvements validated
