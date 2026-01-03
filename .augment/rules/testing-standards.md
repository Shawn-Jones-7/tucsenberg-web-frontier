---
type: "auto"
description: "Vitest unit/integration testing standards: vi.hoisted, complete mocks, import usage retention, test structure templates, error/edge cases, test-specific quality budgets"
---

# Testing Standards (Vitest only)

- Framework: Vitest APIs only (describe, it, expect, vi). No Jest.
- Mocks: use vi.hoisted for variables; provide complete mock implementations for required methods.
- Imports: ensure all imports are used to survive IDE auto-organize. Add minimal validation tests when needed.
- Structure: group by function/feature; include normal, edge, and error cases; include integration tests where relevant.
- Error handling: prefer testing actual behavior (fallbacks, return values) rather than assuming throws.
- File naming: use .test.ts/.test.tsx or .spec.ts/.spec.tsx; place under __tests__ when appropriate.

## Example patterns

- Mandatory Vitest import pattern: `import { describe, it, expect, vi, beforeEach } from 'vitest'`.
- Mock configuration completeness: ensure mocked modules return required functions/properties.
- Mock usage: `vi.clearAllMocks()` in beforeEach; `vi.restoreAllMocks()` in afterEach when needed.
- IDE auto-save compatibility: add a small "import usage validation" test to prevent removal of required imports.

## Test-specific Quality Budgets (data-informed)

- Preferred function length in test files: ≤ 100 lines.
- Hard limit for function length in test files: ≤ 160 lines (exceeding requires a refactor task or helper extraction plan).
- Cyclomatic complexity in test files: ≤ 20 (split into helper utilities when approaching the limit).
- Encourage helpers: extract repetitive mock/setup logic into __tests__/utils or test-only modules; share fixtures where sensible.
- Keep assertions focused: avoid giant scenarios; prefer multiple smaller tests over a single long one.

Note: Current repository metrics (49 test files analyzed) show test-callback p95 ≈ 91 lines and general function p95 ≈ 63 lines; the budgets above aim to catch outliers while staying practical.

## Centralized Test Mocks (i18n & UI)

- i18n-aware and UI/layout tests **MUST** use centralized message fixtures from `src/test/constants/mock-messages.ts` and test utilities from `@/test/utils` (for example `renderWithIntl`, `createMockTranslations`) instead of creating new per-file `test-utils` or inline `mockMessages` that duplicate them.
- Local, file-scoped i18n mocks are allowed **ONLY** for highly specific core-configuration or full message-structure tests (for example `tests/unit/i18n.test.ts`); such files **MUST** include a short comment explaining why centralized mocks are not reused.
- New test utilities or message fixtures **MUST NOT** reimplement behavior already covered by `@/test/utils`, `src/test/mock-utils.ts`, or `src/test/constants/mock-messages.ts`.
- When using `vi.hoisted`, you **MUST NOT** reference imported symbols inside the hoisted callback; use inline literals only to avoid ESM initialization order issues.
- For detailed examples and migration patterns, see `docs/testing/mock-usage-guide.md`.

## ESLint Configuration Requirements

### Vitest Global Variables Configuration

**Must correctly define Vitest global variables in ESLint configuration** to avoid `no-undef` errors:

```javascript
// eslint.config.mjs - Vitest test file configuration
{
  name: 'vitest-config',
  files: [
    '**/*.test.{js,jsx,ts,tsx}',     // Standard test files
    '**/__tests__/**/*.{js,jsx,ts,tsx}', // __tests__ directory
    'tests/**/*.{js,jsx,ts,tsx}',    // Root-level tests directory
    'src/test/**/*.{js,jsx,ts,tsx}', // Test setup files
    'src/testing/**/*.{js,jsx,ts,tsx}' // Test utility files
  ],
  languageOptions: {
    globals: {
      describe: 'readonly',
      it: 'readonly',
      test: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      beforeAll: 'readonly',
      afterAll: 'readonly',
      vi: 'readonly',        // Vitest mock utilities
      vitest: 'readonly',    // Vitest global object
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off', // Allow any type in test files
    'no-magic-numbers': 'off', // Allow magic numbers in test files
    'max-lines-per-function': ['warn', 160], // Relaxed test function length
  },
}
```

### Test File Path Matching Rules

**Standard test file paths**:
- `**/*.test.{js,jsx,ts,tsx}` - Test files co-located with source files
- `**/__tests__/**/*.{js,jsx,ts,tsx}` - Test files in __tests__ directory
- `tests/**/*.{js,jsx,ts,tsx}` - Root-level tests directory (integration tests, end-to-end tests)
- `src/test/**/*.{js,jsx,ts,tsx}` - Test setup and configuration files
- `src/testing/**/*.{js,jsx,ts,tsx}` - Test utilities and helper functions

### Guidelines for Using any Type in Test Files

**Scenarios where any is allowed**:
```typescript
// ✅ Allow any when mocking third-party libraries
const mockLibrary = {
  someMethod: vi.fn() as any, // When third-party library types are complex
};

// ✅ Allow any when constructing test data
const testData: any = {
  // When constructing complex test data
};

// ✅ Allow any when simulating DOM events
const mockEvent = { target: { value: 'test' } } as any;
```

**Recommended type-safe alternatives**:
```typescript
// ✅ Recommended: Use specific types
interface MockApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

// ✅ Recommended: Type-safe mock functions
type TestMockFunction<T extends (...args: any[]) => any> = ReturnType<typeof vi.fn<T>>;

const mockApiClient: {
  get: TestMockFunction<(url: string) => Promise<MockApiResponse>>;
} = {
  get: vi.fn(),
};
```

## Enhanced Coverage Configuration

### Vitest Coverage Setup

```typescript
// vitest.config.ts - Enhanced coverage configuration
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',

      // Global coverage thresholds
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },

        // Stricter thresholds for critical modules
        'src/lib/security/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },

        'src/lib/api/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },

        'src/lib/validation/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },

        // More lenient for UI components
        'src/components/**': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        }
      },

      // Files to exclude from coverage
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/test/**/*',
        'src/types/**/*',
        'src/**/*.d.ts',
        'src/app/**/layout.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/error.tsx',
        'src/app/**/not-found.tsx',
        'src/middleware.ts',
        'next.config.ts',
        'tailwind.config.ts'
      ],

      // Include specific patterns
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.spec.{ts,tsx}'
      ],

      // Fail on coverage threshold
      skipFull: false,
      all: true
    },

    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      '__tests__/**/*.{test,spec}.{ts,tsx}'
    ],

    // Test timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,

    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Coverage Quality Gates

```typescript
// scripts/coverage-quality-gate.ts
import fs from 'fs';
import path from 'path';

interface CoverageReport {
  total: {
    lines: { pct: number };
    functions: { pct: number };
    statements: { pct: number };
    branches: { pct: number };
  };
  [key: string]: any;
}

interface CoverageThresholds {
  [path: string]: {
    lines: number;
    functions: number;
    statements: number;
    branches: number;
  };
}

const COVERAGE_THRESHOLDS: CoverageThresholds = {
  'src/lib/security': { lines: 95, functions: 95, statements: 95, branches: 95 },
  'src/lib/api': { lines: 90, functions: 90, statements: 90, branches: 90 },
  'src/lib/validation': { lines: 95, functions: 95, statements: 95, branches: 95 },
  'src/components': { lines: 75, functions: 75, statements: 75, branches: 75 },
  'global': { lines: 80, functions: 80, statements: 80, branches: 80 }
};

export function validateCoverageThresholds(): boolean {
  try {
    const coverageReport: CoverageReport = JSON.parse(
      fs.readFileSync('./coverage/coverage-summary.json', 'utf8')
    );

    let allPassed = true;
    const failures: string[] = [];

    // Check global thresholds
    const global = coverageReport.total;
    const globalThresholds = COVERAGE_THRESHOLDS.global;

    if (global.lines.pct < globalThresholds.lines) {
      failures.push(`Global lines coverage ${global.lines.pct}% < ${globalThresholds.lines}%`);
      allPassed = false;
    }

    if (global.functions.pct < globalThresholds.functions) {
      failures.push(`Global functions coverage ${global.functions.pct}% < ${globalThresholds.functions}%`);
      allPassed = false;
    }

    if (global.statements.pct < globalThresholds.statements) {
      failures.push(`Global statements coverage ${global.statements.pct}% < ${globalThresholds.statements}%`);
      allPassed = false;
    }

    if (global.branches.pct < globalThresholds.branches) {
      failures.push(`Global branches coverage ${global.branches.pct}% < ${globalThresholds.branches}%`);
      allPassed = false;
    }

    // Check module-specific thresholds
    Object.entries(COVERAGE_THRESHOLDS).forEach(([modulePath, thresholds]) => {
      if (modulePath === 'global') return;

      Object.entries(coverageReport).forEach(([filePath, coverage]) => {
        if (filePath.startsWith(modulePath) && typeof coverage === 'object' && coverage.lines) {
          const fileCoverage = coverage as any;

          if (fileCoverage.lines.pct < thresholds.lines) {
            failures.push(`${filePath} lines coverage ${fileCoverage.lines.pct}% < ${thresholds.lines}%`);
            allPassed = false;
          }
        }
      });
    });

    if (!allPassed) {
      console.error('❌ Coverage thresholds failed:');
      failures.forEach(failure => console.error(`  - ${failure}`));
      return false;
    }

    console.log('✅ All coverage thresholds passed');
    return true;

  } catch (error) {
    console.error('❌ Failed to validate coverage thresholds:', error);
    return false;
  }
}

// Usage in CI: node -r tsx/register scripts/coverage-quality-gate.ts
if (require.main === module) {
  const passed = validateCoverageThresholds();
  process.exit(passed ? 0 : 1);
}
```

## Test Organization Patterns

### Enhanced Test Structure Templates

```typescript
// src/components/UserProfile/__tests__/UserProfile.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile } from '../UserProfile';
import type { User } from '@/types/user';

// Mock dependencies
import { fetchUserData, updateUserProfile } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/lib/api-client', () => ({
  fetchUserData: vi.fn(),
  updateUserProfile: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Test data fixtures
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://example.com/avatar.jpg',
  },
  role: 'user',
  createdAt: '2024-01-01T00:00:00Z',
};

const mockAuthUser = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
};

describe('UserProfile', () => {
  // Setup and teardown
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations with proper typing
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue(mockAuthUser);
    (fetchUserData as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
    (updateUserProfile as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Import usage validation (prevents IDE auto-removal)
  it('should validate imports are used', () => {
    expect(React).toBeDefined();
    expect(UserProfile).toBeDefined();
    expect(mockUser).toBeDefined();
  });

  // Happy path tests
  describe('Rendering', () => {
    it('should render user profile with correct information', () => {
      render(<UserProfile userId="1" />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /john doe/i })).toBeInTheDocument();
    });

    it('should display user role badge', () => {
      render(<UserProfile userId="1" />);

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByTestId('role-badge')).toHaveClass('bg-blue-100');
    });
  });

  // Interaction tests
  describe('User Interactions', () => {
    it('should handle profile edit button click', async () => {
      render(<UserProfile userId="1" />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should submit profile updates successfully', async () => {
      render(<UserProfile userId="1" />);

      // Open edit dialog
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));

      // Update form fields
      const firstNameInput = screen.getByLabelText(/first name/i);
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(updateUserProfile).toHaveBeenCalledWith('1', {
          ...mockUser.profile,
          firstName: 'Jane',
        });
      });
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should display error message when user data fails to load', async () => {
      vi.mocked(fetchUserData).mockRejectedValue(new Error('Network error'));

      render(<UserProfile userId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load user profile/i)).toBeInTheDocument();
      });
    });

    it('should handle profile update failures gracefully', async () => {
      vi.mocked(updateUserProfile).mockRejectedValue(new Error('Update failed'));

      render(<UserProfile userId="1" />);

      // Open edit dialog and submit
      fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
      });
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle missing user data gracefully', () => {
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthUser,
        user: null,
      });

      render(<UserProfile userId="1" />);

      expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    });

    it('should handle unauthorized access', () => {
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthUser,
        isAuthenticated: false,
      });

      render(<UserProfile userId="1" />);

      expect(screen.getByText(/please log in/i)).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthUser,
        isLoading: true,
      });

      render(<UserProfile userId="1" />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<UserProfile userId="1" />);

      expect(screen.getByRole('img')).toHaveAttribute('alt');
      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<UserProfile userId="1" />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      editButton.focus();

      expect(editButton).toHaveFocus();
    });
  });
});
```

### Integration Test Patterns

```typescript
// src/lib/api/__tests__/user-service.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserService } from '../user-service';
import { setupTestDatabase, cleanupTestDatabase } from '@/test/database-setup';
import type { User } from '@/types/user';

describe('UserService Integration Tests', () => {
  let userService: UserService;

  beforeEach(async () => {
    await setupTestDatabase();
    userService = new UserService();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('User CRUD Operations', () => {
    it('should create, read, update, and delete user successfully', async () => {
      // Create
      const userData = {
        email: 'integration@test.com',
        profile: {
          firstName: 'Integration',
          lastName: 'Test',
        },
        role: 'user' as const,
      };

      const createdUser = await userService.createUser(userData);
      expect(createdUser).toMatchObject(userData);
      expect(createdUser.id).toBeDefined();

      // Read
      const fetchedUser = await userService.getUserById(createdUser.id);
      expect(fetchedUser).toEqual(createdUser);

      // Update
      const updateData = {
        profile: {
          ...createdUser.profile,
          firstName: 'Updated',
        },
      };

      const updatedUser = await userService.updateUser(createdUser.id, updateData);
      expect(updatedUser.profile.firstName).toBe('Updated');

      // Delete
      await userService.deleteUser(createdUser.id);

      await expect(
        userService.getUserById(createdUser.id)
      ).rejects.toThrow('User not found');
    });

    it('should handle concurrent user operations', async () => {
      const userPromises = Array.from({ length: 5 }, (_, i) =>
        userService.createUser({
          email: `concurrent${i}@test.com`,
          profile: {
            firstName: `User${i}`,
            lastName: 'Test',
          },
          role: 'user',
        })
      );

      const users = await Promise.all(userPromises);

      expect(users).toHaveLength(5);
      users.forEach((user, i) => {
        expect(user.email).toBe(`concurrent${i}@test.com`);
      });
    });
  });

  describe('Business Logic Integration', () => {
    it('should enforce email uniqueness constraint', async () => {
      const userData = {
        email: 'unique@test.com',
        profile: { firstName: 'Test', lastName: 'User' },
        role: 'user' as const,
      };

      await userService.createUser(userData);

      await expect(
        userService.createUser(userData)
      ).rejects.toThrow('Email already exists');
    });

    it('should validate user permissions correctly', async () => {
      const adminUser = await userService.createUser({
        email: 'admin@test.com',
        profile: { firstName: 'Admin', lastName: 'User' },
        role: 'admin',
      });

      const regularUser = await userService.createUser({
        email: 'user@test.com',
        profile: { firstName: 'Regular', lastName: 'User' },
        role: 'user',
      });

      // Admin should be able to update any user
      expect(
        await userService.canUserModify(adminUser.id, regularUser.id)
      ).toBe(true);

      // Regular user should only be able to update themselves
      expect(
        await userService.canUserModify(regularUser.id, adminUser.id)
      ).toBe(false);

      expect(
        await userService.canUserModify(regularUser.id, regularUser.id)
      ).toBe(true);
    });
  });
});
```

### Performance-Sensitive Module Testing

```typescript
// src/lib/security/__tests__/encryption.performance.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { EncryptionService } from '../encryption-service';

describe('EncryptionService Performance Tests', () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = new EncryptionService();
  });

  describe('Encryption Performance', () => {
    it('should encrypt data within acceptable time limits', async () => {
      const testData = 'sensitive user data'.repeat(100); // ~2KB

      const startTime = performance.now();
      const encrypted = await encryptionService.encrypt(testData);
      const encryptionTime = performance.now() - startTime;

      expect(encryptionTime).toBeLessThan(100); // Should complete within 100ms
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testData);
    });

    it('should decrypt data within acceptable time limits', async () => {
      const testData = 'sensitive user data'.repeat(100);
      const encrypted = await encryptionService.encrypt(testData);

      const startTime = performance.now();
      const decrypted = await encryptionService.decrypt(encrypted);
      const decryptionTime = performance.now() - startTime;

      expect(decryptionTime).toBeLessThan(50); // Should complete within 50ms
      expect(decrypted).toBe(testData);
    });

    it('should handle bulk encryption efficiently', async () => {
      const testItems = Array.from({ length: 50 }, (_, i) => `data-${i}`);

      const startTime = performance.now();
      const encryptedItems = await Promise.all(
        testItems.map(item => encryptionService.encrypt(item))
      );
      const totalTime = performance.now() - startTime;

      expect(totalTime).toBeLessThan(1000); // Should complete within 1 second
      expect(encryptedItems).toHaveLength(50);

      // Verify all items are encrypted
      encryptedItems.forEach((encrypted, i) => {
        expect(encrypted).not.toBe(testItems[i]);
      });
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks during repeated operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many encryption operations
      for (let i = 0; i < 1000; i++) {
        const data = `test-data-${i}`;
        const encrypted = await encryptionService.encrypt(data);
        await encryptionService.decrypt(encrypted);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});
```

### Test Utilities and Helpers

```typescript
// src/test/test-helpers.ts
import { vi } from 'vitest';
import type { User } from '@/types/user';

// Factory functions for test data
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: crypto.randomUUID(),
  email: 'test@example.com',
  profile: {
    firstName: 'Test',
    lastName: 'User',
    avatar: null,
  },
  role: 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockUsers = (count: number): User[] =>
  Array.from({ length: count }, (_, i) =>
    createMockUser({
      email: `user${i}@example.com`,
      profile: {
        firstName: `User${i}`,
        lastName: 'Test',
        avatar: null,
      },
    })
  );

// Common mock implementations
export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
};

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock environment variables - Use vi.stubEnv instead of Object.defineProperty
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
  vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', 'your-app.vercel.app');

  // Mock localStorage and sessionStorage - Complete type-safe mock
  const createStorageMock = () => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = String(value);
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      length: 0,
      key: vi.fn((index: number) => Object.keys(store)[index] || null),
    };
  };

  Object.defineProperty(window, 'localStorage', {
    value: createStorageMock(),
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: createStorageMock(),
  });

  // Mock PerformanceObserver for performance monitoring
  global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn().mockReturnValue([]),
  }));
};

// Async test utilities
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();

  while (!condition() && Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};
```


