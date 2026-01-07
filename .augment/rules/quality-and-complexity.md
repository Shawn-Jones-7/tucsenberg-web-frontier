---
type: "agent_requested"
description: "Quality and complexity: cyclomatic complexity, function length, nesting depth, parameter count, duplication, refactor-first strategy"
---

# Quality and Complexity

- Budgets: function length ≤ 120 lines; cyclomatic complexity ≤ 15; nesting depth ≤ 4; parameters ≤ 5.
- Refactor-first: if a fix would exceed budgets, refactor to reduce complexity before adding logic.
- Patterns: prefer early returns; extract strategy/lookup-table over deep branching; deduplicate shared logic.
- Validation: include complexity checks in CI (lint rules or static analysis as available).
- Large changes: implement incrementally; validate type-check, lint, and tests at each step.
- Duplication: target < 3% (use `pnpm duplication:check` and `pnpm duplication:report` to monitor and enforce).

## Magic Number Management

### Business Constants Classification

**Performance threshold constants**:
```typescript
// src/constants/performance.ts
export const PERFORMANCE_THRESHOLDS = {
  // Web Vitals thresholds
  CLS_GOOD: 0.1,
  CLS_NEEDS_IMPROVEMENT: 0.25,
  LCP_GOOD: 2500,
  LCP_NEEDS_IMPROVEMENT: 4000,
  FID_GOOD: 100,
  FID_NEEDS_IMPROVEMENT: 300,

  // Score thresholds
  SCORE_EXCELLENT: 80,
  SCORE_GOOD: 50,
  SCORE_POOR: 30,
} as const;
```

**Timeout configuration constants**:
```typescript
// src/constants/timeouts.ts
export const TIMEOUT_VALUES = {
  // API request timeouts
  API_REQUEST: 5000,
  API_REQUEST_SLOW: 10000,

  // User interaction timeouts
  USER_INTERACTION: 300,
  FORM_SUBMISSION: 8000,

  // Animation and UI feedback
  ANIMATION_DURATION: 150,
  NOTIFICATION_DISPLAY: 3000,

  // Diagnostics and monitoring
  DIAGNOSTIC_DELAY: 2000,
  SIMULATION_DELAY: 2000,
  AUTO_RUN_DELAY: 1000,
} as const;
```

**UI dimension constants**:
```typescript
// src/constants/ui-dimensions.ts
export const UI_DIMENSIONS = {
  // Responsive breakpoints
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,

  // Content dimensions
  MAX_CONTENT_WIDTH: 1200,
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,

  // Component dimensions
  BUTTON_HEIGHT: 40,
  INPUT_HEIGHT: 36,
  CARD_PADDING: 16,
} as const;
```

### ESLint no-magic-numbers Configuration

```javascript
// eslint.config.mjs - Magic number rule configuration
{
  rules: {
    'no-magic-numbers': ['error', {
      // Allowed common numbers
      ignore: [
        0, 1, -1,           // Basic numbers
        100, 200, 201,      // HTTP status codes
        400, 401, 403, 404,
        500, 502, 503,
        24, 60, 1000,       // Time-related (hours, minutes, milliseconds)
      ],
      ignoreArrayIndexes: true,     // Allow array indexes
      ignoreDefaultValues: true,    // Allow default values
      enforceConst: true,          // Enforce const declaration
      detectObjects: false,        // Don't detect object properties
    }],
  }
}
```

### Code Examples

**❌ Hardcoded magic numbers**:
```typescript
function checkPerformance(score: number) {
  if (score >= 80) return 'excellent';  // Magic number
  if (score >= 50) return 'good';
  return 'poor';
}

const response = await fetch(url, {
  timeout: 5000  // Magic number
});
```

**✅ Using business constants**:
```typescript
import { PERFORMANCE_THRESHOLDS, TIMEOUT_VALUES } from '@/constants';

function checkPerformance(score: number) {
  if (score >= PERFORMANCE_THRESHOLDS.SCORE_EXCELLENT) return 'excellent';
  if (score >= PERFORMANCE_THRESHOLDS.SCORE_GOOD) return 'good';
  return 'poor';
}

const response = await fetch(url, {
  timeout: TIMEOUT_VALUES.API_REQUEST
});
```

### Constants Organization Principles

1. **Group by business domain**: Performance, UI, network, time, etc.
2. **Use const assertions**: Ensure accurate type inference
3. **Centralized management**: Avoid duplicate definitions across files
4. **Semantic naming**: Constant names should clearly express purpose
5. **Documentation**: Add comments for complex constants

### Prevention Measures

- **CI checks**: Run `no-magic-numbers` checks in pre-commit hooks
- **Code review**: Focus on newly added numeric literals
- **Refactoring strategy**: Extract magic numbers to constants immediately when found
- **Team training**: Ensure team understands importance of constant definitions

## Special File Type Exemptions

### Configuration Files and Development Tools

Certain file types have relaxed complexity limits to accommodate their specific requirements while maintaining code quality standards.

#### Configuration Files (`*.config.{js,ts,mjs}`)

**Scope** (eslint.config.mjs lines 555-582):
- `next.config.ts`, `vitest.config.mts`, `playwright.config.ts`, `tailwind.config.js`
- All files matching `*.config.{js,ts,mjs}` pattern

**Relaxed Limits**:
```javascript
{
  'max-lines': ['warn', {
    max: 800,                    // Increased from 500
    skipBlankLines: true,        // Exclude blank lines from count
    skipComments: true           // Exclude comments from count
  }],
  'max-lines-per-function': ['warn', {
    max: 250,                    // Increased from 120
    skipBlankLines: true,
    skipComments: true
  }],
  'complexity': ['warn', 18],    // Increased from 15
  'no-console': 'off',           // Allow console output in build scripts
  'no-magic-numbers': 'off',     // Allow numeric literals in configuration
}
```

**Severity**: `warn` (not `error`) - allows gradual improvement without blocking builds

**Rationale**:
- Configuration files require complete option definitions
- Build scripts need console output for debugging
- Numeric configuration values are context-specific

#### Development Tools

**Scope** (eslint.config.mjs lines 560-570):
- `src/components/dev-tools/**/*.{ts,tsx}`
- `src/app/**/dev-tools/**/*.{ts,tsx}`
- `src/app/**/diagnostics/**/*.{ts,tsx}`
- `src/components/examples/ui-showcase/**/*.{ts,tsx}`
- `src/lib/dev-tools-positioning.ts`
- `src/lib/performance-monitoring-coordinator.ts`
- `src/constants/dev-tools.ts`
- `src/constants/test-*.ts`

**Relaxed Limits**: Same as configuration files (800 lines, 250 lines/function, complexity 18)

**Rationale**:
- Development tools often contain comprehensive diagnostic logic
- UI showcases demonstrate multiple component variations
- Performance monitoring requires detailed instrumentation

#### Test Files (Separate Configuration)

**Scope** (eslint.config.mjs lines 479-500):
- `**/*.{test,spec}.{js,jsx,ts,tsx}`
- `**/__tests__/**/*.{js,jsx,ts,tsx}`
- `tests/**/*.{test,spec}.{js,jsx,ts,tsx}`

**Test-Specific Limits**:
```javascript
{
  'max-lines': ['warn', {
    max: 800,                    // Accommodate large test suites
    skipBlankLines: true,
    skipComments: true
  }],
  'max-lines-per-function': ['warn', {
    max: 700,                    // Large describe blocks
    skipBlankLines: true,
    skipComments: true
  }],
  'complexity': ['warn', 20],    // Test setup can be complex
  'max-nested-callbacks': ['warn', 6],  // describe/it nesting
  'max-statements': ['warn', 50],       // Test assertions
  'max-params': ['warn', 8],            // Test fixtures
}
```

**Note**: Test files have their own dedicated configuration, NOT part of "configuration file exemptions"

#### i18n Files (Separate Configuration)

**Scope** (eslint.config.mjs lines 418-427):
- `src/i18n/**/*.{ts,tsx}`
- `src/app/**/[locale]/**/*.{ts,tsx}`
- `src/components/language-toggle.tsx`

**i18n-Specific Limits**:
```javascript
{
  'max-lines-per-function': ['warn', {
    max: 200,                    // i18n functions can be lengthy
    skipBlankLines: true,
    skipComments: true
  }],
  'complexity': ['warn', 20],    // i18n logic can be complex
  'no-magic-numbers': 'off',     // i18n configuration numbers
  'security/detect-object-injection': 'error',  // Dynamic key access
}
```

### Exemption Summary Table

| File Type | max-lines | max-lines-per-function | complexity | Severity | Evidence |
|-----------|-----------|------------------------|------------|----------|----------|
| **Production Code** | 500 | 120 | 15 | error | eslint.config.mjs:219-222 |
| **Config Files** | 800 | 250 | 18 | warn | eslint.config.mjs:579-582 |
| **Dev Tools** | 800 | 250 | 18 | warn | eslint.config.mjs:574-582 |
| **Test Files** | 800 | 700 | 20 | warn | eslint.config.mjs:496-500 |
| **i18n Files** | 500 | 200 | 20 | warn | eslint.config.mjs:423-427 |

### Key Principles

1. **Gradual Improvement**: Exemptions use `warn` level to encourage improvement without blocking development
2. **Skip Blank Lines**: All limits exclude blank lines and comments from counts
3. **Context-Specific**: Each file type has limits appropriate to its purpose
4. **Production Standards**: Core application code maintains strict limits (500 lines, 120 lines/function, complexity 15)
5. **No Complete Exemptions**: Even exempted files have limits - just higher thresholds

### Verification

Check current exemptions:
```bash
# View configuration file rules
grep -A 10 "max-lines" eslint.config.mjs | grep -E "(max:|warn|error)"

# Verify file matches exemption patterns
pnpm lint:check --debug
```

