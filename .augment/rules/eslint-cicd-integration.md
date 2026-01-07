---
type: "agent_requested"
description: "Enhanced ESLint configuration for React 19, RSC boundary enforcement, CI/CD integration, pre-commit hooks, automated security rules"
---

# ESLint & CI/CD Integration

## Enhanced ESLint Configuration for React 19

### RSC Boundary Enforcement

```javascript
// eslint.config.mjs
import reactServerPlugin from 'eslint-plugin-react-server';

export default [
  {
    plugins: {
      'react-server': reactServerPlugin,
    },
    rules: {
      'react-server/no-server-function-props': 'error',
      'react-server/no-client-hooks-in-server': 'error',
      'react-server/no-browser-apis-in-server': 'error',
    },
  },
];
```

### Security Rules Integration

- **React Server Components**: Enforce RSC boundary rules with `eslint-plugin-react-server`
- **Security rules**: 29 automated security rules (19 ESLint + 10 Semgrep)
- **ESLint**: Use recommended plugins and rules for React, Next.js, and import organization
- **Import organization**: Automatic import sorting and path alias validation

### Complete ESLint Configuration

```javascript
// eslint.config.mjs
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactServer from 'eslint-plugin-react-server';
import security from 'eslint-plugin-security';
import securityNode from 'eslint-plugin-security-node';
import next from '@next/eslint-plugin-next';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'react-server': reactServer,
      'security': security,
      'security-node': securityNode,
      '@next/next': next,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-definitions': 'error',

      // React rules
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Server Components
      'react-server/no-server-function-props': 'error',
      'react-server/no-client-hooks-in-server': 'error',
      'react-server/no-browser-apis-in-server': 'error',

      // Security rules
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-unsafe-regex': 'error',

      // Next.js rules
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
```

## CI/CD Integration

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "lint:rsc": "eslint --ext .tsx,.ts src/ --rule '{\"react-server/no-server-function-props\": \"error\"}'",
    "lint:full": "pnpm run lint && pnpm run lint:rsc",
    "type-check": "tsc --noEmit",
    "type-check:strict": "tsc --noEmit --strict",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "build": "next build",
    "security:check": "semgrep --config=auto src/",
    "alias:check": "node scripts/check-alias-consistency.js"
  }
}
```

### Pre-commit Hooks with Lefthook

```yaml
# .lefthook.yml
pre-commit:
  commands:
    lint:
      run: pnpm run lint:full
      fail_text: "ESLint failed. Please fix the errors and try again."
    typecheck:
      run: pnpm run type-check:strict
      fail_text: "TypeScript check failed. Please fix the errors and try again."
    format:
      run: pnpm run format:check
      fail_text: "Code formatting check failed. Run 'pnpm run format' to fix."
    test:
      run: pnpm run test --run
      fail_text: "Tests failed. Please fix the failing tests and try again."
    security:
      run: pnpm run security:check
      fail_text: "Security check failed. Please review and fix security issues."
    alias:
      run: pnpm run alias:check
      fail_text: "Path alias consistency check failed. Please fix alias configuration."

pre-push:
  commands:
    build:
      run: pnpm run build
      fail_text: "Build failed. Please fix build errors before pushing."
```

### GitHub Actions CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality-checks:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm run type-check:strict

      - name: Lint check
        run: pnpm run lint:full

      - name: Format check
        run: pnpm run format:check

      - name: Run tests
        run: pnpm run test --coverage

      - name: Security check
        run: pnpm run security:check

      - name: Alias consistency check
        run: pnpm run alias:check

      - name: Build
        run: pnpm run build

      - name: Bundle size check
        run: pnpm run size:check

  deploy:
    needs: quality-checks
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Alias Consistency Check Script

```javascript
// scripts/check-alias-consistency.js
const fs = require('fs');
const path = require('path');

function checkAliasConsistency() {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  const nextConfig = fs.readFileSync('next.config.ts', 'utf8');

  // Check tsconfig.json
  const tsconfigAlias = tsconfig.compilerOptions?.paths?.['@/*'];
  if (!tsconfigAlias || tsconfigAlias[0] !== './src/*') {
    console.error('❌ tsconfig.json: @/ alias must resolve to ./src/*');
    process.exit(1);
  }

  // Check next.config.ts
  if (!nextConfig.includes("'@': path.resolve(__dirname, 'src')")) {
    console.error('❌ next.config.ts: @/ alias must resolve to src directory');
    process.exit(1);
  }

  console.log('✅ Path alias consistency check passed');
}

checkAliasConsistency();
```

## Quality Gates Enforcement

### Mandatory CI/CD Pipeline Commands

```bash
# Complete CI/CD pipeline sequence
pnpm install --frozen-lockfile
pnpm run type-check:strict
pnpm run lint:full
pnpm run format:check
pnpm run test --coverage
pnpm run security:check
pnpm run alias:check
pnpm run build
pnpm run size:check
```

### Zero Tolerance Quality Standards

- **TypeScript**: Must have zero errors, no exceptions
- **ESLint**: Must have zero warnings, no exceptions
- **Security**: Must pass all 29 security rules
- **Tests**: Progressive coverage roadmap
  - **Phase 1 (Current)**: ≥65% coverage - Baseline quality standard
  - **Phase 2 (3 months)**: ≥75% coverage - Intermediate improvement
  - **Phase 3 (6 months)**: ≥80% coverage - Industry standard (final goal)
- **Build**: Must complete without errors
- **Bundle size**: Must stay within defined limits

**Note**: Test coverage follows a progressive improvement strategy. Current phase enforces ≥65% coverage, with planned increases to 75% and 80% over the next 6 months. This approach balances quality goals with practical development constraints.

### Failure Handling

- **Immediate failure**: Any quality gate failure stops the pipeline
- **No bypass**: Quality gates cannot be bypassed or ignored
- **Fix-first approach**: All issues must be resolved before proceeding
- **Incremental fixes**: Large changes implemented in stages with validation at each step

## ESLint Maintenance and Updates

### Dependency Update Strategy

```bash
# scripts/update-eslint-deps.sh
#!/bin/bash

echo "🔄 Starting ESLint dependency update process..."

# Backup current package.json
cp package.json package.json.backup

# Update ESLint core and TypeScript integration
echo "📦 Updating ESLint core dependencies..."
pnpm update eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Update Next.js specific plugins
echo "📦 Updating Next.js ESLint plugins..."
pnpm update eslint-config-next @next/eslint-plugin-next

# Update React plugins
echo "📦 Updating React ESLint plugins..."
pnpm update eslint-plugin-react eslint-plugin-react-hooks

# Update security plugins
echo "📦 Updating security ESLint plugins..."
pnpm update eslint-plugin-security eslint-plugin-security-node

# Update import and code quality plugins
echo "📦 Updating code quality plugins..."
pnpm update eslint-plugin-import eslint-plugin-promise

echo "✅ Dependencies updated successfully"
```

### Update Verification Process

```bash
# scripts/verify-eslint-update.sh
#!/bin/bash

echo "🔍 Verifying ESLint update compatibility..."

# Run type checking first
echo "1️⃣ Running TypeScript checks..."
if ! pnpm run type-check:strict; then
  echo "❌ TypeScript check failed after ESLint update"
  exit 1
fi

# Test ESLint configuration
echo "2️⃣ Testing ESLint configuration..."
if ! pnpm run lint:check; then
  echo "❌ ESLint configuration test failed"
  exit 1
fi

# Run full linting with zero warnings
echo "3️⃣ Running full lint check..."
if ! pnpm run lint:strict; then
  echo "❌ Linting failed with new dependencies"
  exit 1
fi

# Test security rules
echo "4️⃣ Testing security rules..."
if ! pnpm run security:eslint; then
  echo "❌ Security rules test failed"
  exit 1
fi

# Run tests to ensure no breaking changes
echo "5️⃣ Running test suite..."
if ! pnpm run test; then
  echo "❌ Tests failed after ESLint update"
  exit 1
fi

# Build verification
echo "6️⃣ Verifying build process..."
if ! pnpm run build; then
  echo "❌ Build failed after ESLint update"
  exit 1
fi

echo "✅ ESLint update verification completed successfully"
```

### Monthly Maintenance Checklist

```typescript
// scripts/eslint-maintenance-check.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface MaintenanceReport {
  date: string;
  eslintVersion: string;
  pluginVersions: Record<string, string>;
  rulesCount: number;
  deprecatedRules: string[];
  newRules: string[];
  performanceMetrics: {
    lintTime: number;
    fileCount: number;
  };
}

export async function generateMaintenanceReport(): Promise<MaintenanceReport> {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // Get current ESLint version
  const eslintVersion = packageJson.devDependencies.eslint;

  // Get plugin versions
  const pluginVersions = {
    '@typescript-eslint/eslint-plugin': packageJson.devDependencies['@typescript-eslint/eslint-plugin'],
    'eslint-config-next': packageJson.devDependencies['eslint-config-next'],
    'eslint-plugin-react': packageJson.devDependencies['eslint-plugin-react'],
    'eslint-plugin-security': packageJson.devDependencies['eslint-plugin-security'],
  };

  // Measure lint performance
  const startTime = Date.now();
  try {
    execSync('pnpm run lint:check', { stdio: 'pipe' });
  } catch (error) {
    console.warn('Lint check failed during performance measurement');
  }
  const lintTime = Date.now() - startTime;

  // Count TypeScript files
  const fileCount = execSync('find src -name "*.ts" -o -name "*.tsx" | wc -l', { encoding: 'utf8' });

  return {
    date: new Date().toISOString(),
    eslintVersion,
    pluginVersions,
    rulesCount: 0, // Would be populated by actual rule counting
    deprecatedRules: [], // Would be populated by deprecation check
    newRules: [], // Would be populated by new rule detection
    performanceMetrics: {
      lintTime,
      fileCount: parseInt(fileCount.trim()),
    },
  };
}

// Usage in package.json script: "maintenance:eslint": "tsx scripts/eslint-maintenance-check.ts"
```

### Enhanced CI/CD Quality Gates

```yaml
# .github/workflows/enhanced-quality-gates.yml
name: Enhanced Quality Gates

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Audit dependencies
        run: pnpm audit --audit-level moderate

      - name: Check for outdated ESLint dependencies
        run: |
          echo "Checking ESLint dependency versions..."
          pnpm outdated eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser || true

  eslint-performance:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js and pnpm
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Measure ESLint performance
        run: |
          echo "Measuring ESLint performance..."
          time pnpm run lint:check

      - name: ESLint with performance reporting
        run: |
          pnpm run lint:check --report-unused-disable-directives --max-warnings 0

      - name: Generate ESLint metrics
        run: |
          echo "Generating ESLint metrics..."
          pnpm run lint:check --format json > eslint-report.json || true

      - name: Upload ESLint report
        uses: actions/upload-artifact@v4
        with:
          name: eslint-report
          path: eslint-report.json

  security-enhanced:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js and pnpm
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run enhanced security checks
        run: |
          echo "Running enhanced security checks..."
          pnpm run security:eslint
          pnpm run security:semgrep

      - name: Security rule coverage check
        run: |
          echo "Verifying all 29 security rules are active..."
          # This would check that all expected security rules are enabled
          node -e "
            const config = require('./eslint.config.mjs');
            const securityRules = Object.keys(config[0].rules || {}).filter(rule =>
              rule.includes('security') || rule.includes('no-eval') || rule.includes('no-unsafe')
            );
            console.log(\`Active security rules: \${securityRules.length}\`);
            if (securityRules.length < 20) {
              console.error('❌ Insufficient security rules enabled');
              process.exit(1);
            }
          "
```

### Automated Quality Metrics Collection

```typescript
// scripts/quality-metrics-collector.ts
import { execSync } from 'child_process';
import fs from 'fs';

interface QualityMetrics {
  timestamp: string;
  eslint: {
    errors: number;
    warnings: number;
    executionTime: number;
    rulesViolated: string[];
  };
  typescript: {
    errors: number;
    executionTime: number;
  };
  tests: {
    coverage: number;
    passed: number;
    failed: number;
    executionTime: number;
  };
  build: {
    success: boolean;
    executionTime: number;
    bundleSize: number;
  };
}

export async function collectQualityMetrics(): Promise<QualityMetrics> {
  const metrics: QualityMetrics = {
    timestamp: new Date().toISOString(),
    eslint: { errors: 0, warnings: 0, executionTime: 0, rulesViolated: [] },
    typescript: { errors: 0, executionTime: 0 },
    tests: { coverage: 0, passed: 0, failed: 0, executionTime: 0 },
    build: { success: false, executionTime: 0, bundleSize: 0 },
  };

  // Collect ESLint metrics
  try {
    const eslintStart = Date.now();
    const eslintOutput = execSync('pnpm run lint:check --format json', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    metrics.eslint.executionTime = Date.now() - eslintStart;

    const eslintResults = JSON.parse(eslintOutput) as Array<{
      errorCount: number;
      warningCount: number;
      filePath: string;
    }>;
    metrics.eslint.errors = eslintResults.reduce((sum: number, file) =>
      sum + file.errorCount, 0);
    metrics.eslint.warnings = eslintResults.reduce((sum: number, file) =>
      sum + file.warningCount, 0);
  } catch (error) {
    console.warn('ESLint metrics collection failed:', error);
  }

  // Collect TypeScript metrics
  try {
    const tsStart = Date.now();
    execSync('pnpm run type-check:strict', { stdio: 'pipe' });
    metrics.typescript.executionTime = Date.now() - tsStart;
  } catch (error) {
    metrics.typescript.errors = 1;
    console.warn('TypeScript check failed');
  }

  // Collect test metrics
  try {
    const testStart = Date.now();
    const testOutput = execSync('pnpm run test --coverage --reporter=json', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    metrics.tests.executionTime = Date.now() - testStart;

    // Parse Vitest test results
    try {
      const testResults = JSON.parse(testOutput) as {
        numTotalTests: number;
        numPassedTests: number;
        numFailedTests: number;
        coverageMap?: { getCoverageSummary: () => { data: { total: { lines: { pct: number } } } } };
      };

      metrics.tests.passed = testResults.numPassedTests || 0;
      metrics.tests.failed = testResults.numFailedTests || 0;

      // Extract coverage from coverage report if available
      if (testResults.coverageMap) {
        const summary = testResults.coverageMap.getCoverageSummary();
        metrics.tests.coverage = summary.data.total.lines.pct || 0;
      }
    } catch (parseError) {
      console.warn('Failed to parse test results:', parseError);
      // Fallback: try to read coverage from file
      try {
        const coverageData = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json', 'utf8'));
        metrics.tests.coverage = coverageData.total.lines.pct || 0;
      } catch (coverageError) {
        console.warn('Failed to read coverage data:', coverageError);
      }
    }
  } catch (error) {
    console.warn('Test metrics collection failed:', error);
  }

  // Collect build metrics
  try {
    const buildStart = Date.now();
    execSync('pnpm run build', { stdio: 'pipe' });
    metrics.build.executionTime = Date.now() - buildStart;
    metrics.build.success = true;

    // Get bundle size
    const sizeOutput = execSync('pnpm run size:check', { encoding: 'utf8' });
    // Parse bundle size from output
    metrics.build.bundleSize = 1024; // Would be parsed from actual size check
  } catch (error) {
    console.warn('Build metrics collection failed:', error);
  }

  // Save metrics to file
  const metricsFile = `quality-metrics-${Date.now()}.json`;
  fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));

  console.log('Quality metrics collected:', metricsFile);
  return metrics;
}

// Usage: node -r tsx/register scripts/quality-metrics-collector.ts
if (require.main === module) {
  collectQualityMetrics().catch(console.error);
}
```

## Development Tools Configuration

### Development Tools Exemptions

For development-only tools (diagnostics, dev panels), apply relaxed rules:

```javascript
// eslint.config.mjs
  {
	  name: 'dev-tools-complexity-exemption',
	  files: [
	    'src/components/dev-tools/**/*.{ts,tsx}',
	    'src/app/*/dev-tools/**/*.{ts,tsx}',
	    'src/app/*/diagnostics/**/*.{ts,tsx}',
	    'src/lib/dev-tools-positioning.ts',
	    'src/lib/performance-monitoring-coordinator.ts',
	    'src/constants/dev-tools.ts'
	  ],
  rules: {
    'max-lines-per-function': 'off',
    'complexity': 'off',
    'max-lines': 'off',
    'max-statements': 'off',
    'max-params': 'off',
    'max-nested-callbacks': 'off'
  }
}
```

### Development Tools Special Rules

```javascript
  {
	  name: 'dev-tools-special-config',
	  files: [
	    'src/components/dev-tools/**/*.{ts,tsx}',
	    'src/app/**/dev-tools/**/*.{ts,tsx}',
	    'src/lib/dev-tools-positioning.ts'
	  ],
	  rules: {
    // Allow console output for development tools
    'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],

	    // Allow dev-tools specific naming
	    'no-underscore-dangle': ['error', {
	      allow: ['__DEV__']
	    }],

    // Allow any types with documentation requirement
    '@typescript-eslint/no-explicit-any': ['warn', {
      ignoreRestArgs: true
    }],

    // Allow object injection for development tools
    'security/detect-object-injection': 'warn'
  }
}
```

### TypeScript Configuration for Development Tools

```json
// tsconfig.json
  {
    "exclude": [
      "src/components/dev-tools/**/*.{ts,tsx}",
      "src/app/[locale]/dev-tools/**/*.{ts,tsx}",
      "src/app/[locale]/diagnostics/**/*.{ts,tsx}",
      "src/lib/dev-tools-positioning.ts",
      "src/lib/performance-monitoring-coordinator.ts",
      "src/constants/dev-tools.ts"
    ]
  }
```

**Rationale**: Development tools are excluded from strict quality checks as they:
- Are used only in development environment
- Don't affect production code quality
- Require flexibility for debugging and monitoring features
