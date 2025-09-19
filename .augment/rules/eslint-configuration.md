---
type: "auto"
description: "ESLint configuration and error handling guide for Next.js 15 and React 19"
---
# ESLint Configuration and Error Handling Guide
## Core Principles

### 1. Error Level Management
- **Error**: Critical issues that must be fixed, will block builds
- **Warning**: Recommended fixes, won't block builds but should be addressed
- **Off**: Disabled rules for specific use cases

### 2. Severity Classification
- **Critical**: Type safety violations, potential runtime errors
- **High**: Performance issues, accessibility violations
- **Medium**: Code style inconsistencies, maintainability concerns
- **Low**: Formatting preferences, minor optimizations

## Common ESLint Errors and Solutions

### react/no-unescaped-entities

```jsx
// ❌ Error: Unescaped quotes in JSX
<p>This is "quoted" content</p>
// ✅ Solutions: Use HTML entities, backslash escaping, single quotes, or JavaScript expression
<p>This is &ldquo;quoted&rdquo; content</p>
<p>This is \"quoted\" content</p>
<p>This is 'quoted' content</p>
<p>This is {'"quoted"'} content</p>
```

### @typescript-eslint/no-explicit-any

```typescript
// ❌ Error: Using any type
const handleEvent = (event: any) => {};
// ✅ Solution: Use specific types
const handleEvent = (event: React.MouseEvent<HTMLButtonElement>) => {};

const handleEvent = (event: unknown) => {}; function handleEvent<T>(event: T) {} const handleEvent = (event: MouseEvent | TouchEvent | PointerEvent) => {};
```

### @typescript-eslint/no-unused-vars

```typescript
// ❌ Error: Unused variables
const unusedVariable = someValue; const handleClick = (event, info) => { /* only using info */ };
// ✅ Solutions: Remove unused variables, prefix with underscore, or configure argsIgnorePattern
const _unusedVariable = someValue; const handleClick = (_event, info) => { /* only using info */ };
```

### @typescript-eslint/no-empty-function

```typescript
// ❌ Error: Empty function
const onClick = () => {};
// ✅ Solutions: Provide default implementation, use conditional rendering, or add explanatory comment
const onClick = () => { /* TODO: Implement click handler */ }; {onClick && <button onClick={onClick}>Click me</button>}
<button onClick={onClick?.()}>Click me</button>
```

### no-console

```typescript
// ❌ Error: Console statements in production
console.log('Debug info');
// ✅ Solutions: Use proper logging library, conditional console, or ESLint disable comment
import { logger } from '@/lib/logger'; logger.debug('Debug info'); if (process.env.NODE_ENV === 'development') { console.log('Debug info'); } // eslint-disable-next-line no-console console.error('Critical error that must be logged');
```

### react-hooks/exhaustive-deps

```typescript
// ❌ Error: Missing dependencies in useEffect
useEffect(() => { const { timeSpentInThemes } = analytics; updateMetrics(timeSpentInThemes); }, [analytics.timeSpentInThemes]); // Missing 'analytics'
// ✅ Solution: Include all dependencies
useEffect(() => { const { timeSpentInThemes } = analytics; updateMetrics(timeSpentInThemes); }, [analytics.timeSpentInThemes, analytics, updateMetrics]);
```

## Recommended ESLint Configuration (eslint.config.mjs)

```javascript
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.extends('next/core-web-vitals', '@typescript-eslint/recommended'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-empty-function': ['warn', {
        allow: ['arrowFunctions']
      }],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      'react/no-unescaped-entities': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-img-element': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['*.config.js', '*.config.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
```

## Project-Specific Rule Adjustments

### 1. Animation Components (Framer Motion)
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDrag = (_event: any, info: PanInfo) => { /* Framer Motion provides complex event objects */ };
```

### 2. Development Tools and Debugging
```typescript
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.log('Animation performance:', metrics);
}
```

### 3. React 19 Server Actions

```typescript
// Server Actions may need specific ESLint configurations
'use server';

// eslint-disable-next-line @typescript-eslint/require-await
async function serverAction(formData: FormData) {
  // Server-side logic
}
```

## Automation and Integration

### package.json Scripts

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "lint:strict": "next lint --max-warnings 0",
    "lint:check": "eslint . --ext .js,.jsx,.ts,.tsx --config eslint.config.mjs"
  }
}
```

### VS Code Integration

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

## Error Handling Strategies

### 1. Build-time Error Handling

- **Error Level**: Must be fixed before build completion
- **Warning Level**: Logged but doesn't block builds
- Use `--max-warnings 0` in CI to enforce warning fixes

### 2. Development-time Error Handling

- IDE integration for real-time feedback
- Auto-fix on save configuration
- Pre-commit hooks for quality assurance

### 3. Team Collaboration Standards

- Unified ESLint configuration across team
- Regular rule updates and reviews
- Documentation of special case handling
- Code review guidelines for ESLint violations

By following this comprehensive ESLint configuration and error handling guide, you can significantly
reduce code quality issues, improve development efficiency, and maintain consistent code standards
across your Next.js 15 and React 19 projects.

```

```
