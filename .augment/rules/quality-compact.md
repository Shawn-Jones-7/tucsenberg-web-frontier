---
type: "auto"
description: "Quality gates, CI/CD processes, and performance budgets for Next.js 15 and React 19"
---
# Quality Assurance and CI/CD Standards

## Quality Gates Overview
```bash
pnpm quality-gate # type-check:strict + lint:strict + test:coverage + test:a11y + turbopack:check
```

### Quality Metrics Thresholds
- **Type Coverage**: ≥95%, **Code Coverage**: ≥65%, **Accessibility**: Zero violations
- **Performance**: Core Web Vitals + React 19 metrics, **Bundle Size**: Turbopack limits

## CI/CD Pipeline Configuration

### Pre-commit Quality Checks
```bash
pnpm lint-staged && pnpm type-check && pnpm test:coverage && pnpm turbopack:validate
```

### GitHub Actions Workflow
```yaml
name: Quality Gate - Next.js 15
on: [push, pull_request]
jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install && pnpm quality-gate && pnpm lighthouse:ci && pnpm turbopack:analyze
```

## Performance Budget Management

### Lighthouse CI Configuration for React 19
```javascript
module.exports = { ci: { collect: { url: ['http://localhost:3000'], numberOfRuns: 3 }, assert: { assertions: { 'categories:performance': ['error', { minScore: 0.92 }], 'categories:accessibility': ['error', { minScore: 0.95 }] } } };
```

## Code Quality Standards

### TypeScript 5.9.2 Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### ESLint Rules for React 19
```javascript
module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: { '@typescript-eslint/no-explicit-any': 'error', '@typescript-eslint/no-unused-vars': 'error', 'react-hooks/exhaustive-deps': 'error', 'react/no-deprecated-react-apis': 'error', 'react-hooks/rules-of-hooks': 'error', 'no-console': 'warn' },
  overrides: [{ files: ['**/actions/**/*.ts', '**/actions/**/*.tsx'], rules: { 'react-hooks/rules-of-hooks': 'off' } }],
};
```

## Quality Gate Scripts
```json
{ "scripts": { "quality-gate": "pnpm type-check:strict && pnpm lint:strict && pnpm test:coverage && pnpm test:a11y", "type-check:strict": "tsc --noEmit --strict", "lint:strict": "eslint --ext .js,.jsx,.ts,.tsx . --max-warnings 0", "test:coverage": "jest --coverage", "lighthouse:ci": "lhci autorun" } }
```

## Coverage Reporting for React 19
```javascript
module.exports = { collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'], coverageThreshold: { global: { branches: 65, functions: 65, lines: 65, statements: 65 } }, testEnvironment: 'jsdom' };
```

## Deployment Quality Checks
### Pre-deployment Validation for Next.js 15
```bash
pnpm build && pnpm quality-gate && pnpm react19:validate && pnpm lighthouse:ci && pnpm audit --audit-level moderate
```

## Next.js 15 Turbopack Performance Optimization

### Core Web Vitals 2025 Compliance
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Interaction to Next Paint (INP)**: < 200ms

### Turbopack Configuration Essentials
```javascript
const nextConfig = {
  turbopack: { resolveAlias: { '@': './src', 'components': './src/components' }, resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.json'] },
  experimental: { optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'], reactCompiler: true }
}
```

### Development Performance Benefits
- **10x faster** cold starts, **700x faster** updates, **Incremental compilation**, **Better memory**

## Performance Optimization Checklist
### Development Phase
- [ ] Enable Turbopack for faster builds and configure path aliases
- [ ] Set up Web Vitals monitoring and use React 19 concurrent features
- [ ] Implement proper loading states with Suspense boundaries
### Build Phase
- [ ] Enable package import optimization and image optimization
- [ ] Set up proper caching headers and analyze bundle size
- [ ] Test Core Web Vitals scores
### Production Phase
- [ ] Monitor real-user performance metrics and error tracking
- [ ] Implement progressive enhancement and CDN for static assets
- [ ] Monitor and optimize database queries
## Performance Best Practices
1. **User Input Priority**: Use `useTransition` for non-urgent updates
2. **Heavy Computations**: Use `useDeferredValue` for expensive renders
3. **Progressive Loading**: Implement nested Suspense boundaries with visual feedback
4. **Bundle Optimization**: Use dynamic imports, tree shaking, Next.js Image
5. **Caching**: Implement cache headers and SWR patterns
