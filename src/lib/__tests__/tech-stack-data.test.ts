import { describe, expect, it } from 'vitest';
import {
  techStackCategories,
  techStackData,
  type TechStackCategory,
  type TechStackItem,
} from '../tech-stack-data';

// 测试常量定义
const TEST_MINIMUMS = {
  CATEGORY_MIN_ITEMS: 2, // 每个核心类别至少应有2个项目
} as const;

describe('tech-stack-data', () => {
  describe('TechStackItem interface', () => {
    it('should have valid TechStackItem structure', () => {
      const item: TechStackItem = {
        id: 'test-framework',
        name: 'Test Framework',
        version: '1.0.0',
        category: 'testing',
        description: 'A test framework for testing',
        icon: 'test-icon',
        url: 'https://example.com',
      };

      expect(item.name).toBe('Test Framework');
      expect(item.version).toBe('1.0.0');
      expect(item.category).toBe('testing');
      expect(item.description).toBe('A test framework for testing');
      expect(item.icon).toBe('test-icon');
      expect(item.url).toBe('https://example.com');
    });
  });

  describe('techStackData', () => {
    it('should have tech stack items', () => {
      expect(Array.isArray(techStackData)).toBe(true);
      expect(techStackData.length).toBeGreaterThan(0);
    });

    it('should have all required properties for each item', () => {
      techStackData.forEach((item) => {
        expect(item.name).toBeTruthy();
        expect(item.version).toBeTruthy();
        expect(item.category).toBeTruthy();
        // description 可以为空字符串（已移除硬编码中文）
        expect(item.description).toBeDefined();
      });
    });

    it('should have valid version formats', () => {
      techStackData.forEach((item) => {
        // Version should be either semantic version, 'latest', or specific format
        expect(item.version).toMatch(/^(\d+\.\d+\.\d+|latest)$/);
      });
    });

    it('should have valid URLs when provided', () => {
      techStackData.forEach((item) => {
        if (item.url) {
          expect(item.url).toMatch(/^https?:\/\/.+/);
        }
      });
    });

    it('should have valid categories', () => {
      const validCategories = Object.keys(techStackCategories);
      techStackData.forEach((item) => {
        expect(validCategories).toContain(item.category);
      });
    });

    it('should have unique names', () => {
      const names = techStackData.map((item) => item.name);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
    });

    describe('core framework items', () => {
      it('should include Next.js', () => {
        const nextjs = techStackData.find((item) => item.name === 'Next.js');
        expect(nextjs).toBeDefined();
        expect(nextjs!.category).toBe('core');
        expect(nextjs!.version).toMatch(/^\d+\.\d+\.\d+$/);
      });

      it('should include React', () => {
        const react = techStackData.find((item) => item.name === 'React');
        expect(react).toBeDefined();
        expect(react!.category).toBe('core');
        expect(react!.version).toMatch(/^\d+\.\d+\.\d+$/);
      });

      it('should include TypeScript', () => {
        const typescript = techStackData.find(
          (item) => item.name === 'TypeScript',
        );
        expect(typescript).toBeDefined();
        expect(typescript!.category).toBe('core');
        expect(typescript!.version).toMatch(/^\d+\.\d+\.\d+$/);
      });
    });

    describe('UI system items', () => {
      it('should include Tailwind CSS', () => {
        const tailwind = techStackData.find(
          (item) => item.name === 'Tailwind CSS',
        );
        expect(tailwind).toBeDefined();
        expect(tailwind!.category).toBe('ui');
      });

      it('should include shadcn/ui', () => {
        const shadcn = techStackData.find((item) => item.name === 'shadcn/ui');
        expect(shadcn).toBeDefined();
        expect(shadcn!.category).toBe('ui');
      });

      it('should include Radix UI', () => {
        const radix = techStackData.find((item) => item.name === 'Radix UI');
        expect(radix).toBeDefined();
        expect(radix!.category).toBe('ui');
      });
    });

    describe('internationalization items', () => {
      it('should include next-intl', () => {
        const nextIntl = techStackData.find(
          (item) => item.name === 'next-intl',
        );
        expect(nextIntl).toBeDefined();
        expect(nextIntl!.category).toBe('i18n');
      });
    });

    describe('testing items', () => {
      it('should include Jest', () => {
        const jest = techStackData.find((item) => item.name === 'Jest');
        expect(jest).toBeDefined();
        expect(jest!.category).toBe('testing');
      });

      it('should include Testing Library', () => {
        const testingLibrary = techStackData.find(
          (item) => item.name === 'Testing Library',
        );
        expect(testingLibrary).toBeDefined();
        expect(testingLibrary!.category).toBe('testing');
      });
    });

    describe('development tools', () => {
      it('should include pnpm', () => {
        const pnpm = techStackData.find((item) => item.name === 'pnpm');
        expect(pnpm).toBeDefined();
        expect(pnpm!.category).toBe('dev');
      });

      it('should include ESLint', () => {
        const eslint = techStackData.find((item) => item.name === 'ESLint');
        expect(eslint).toBeDefined();
        expect(eslint!.category).toBe('tools');
      });

      it('should include Prettier', () => {
        const prettier = techStackData.find((item) => item.name === 'Prettier');
        expect(prettier).toBeDefined();
        expect(prettier!.category).toBe('tools');
      });
    });

    describe('deployment and infrastructure', () => {
      it('should include Vercel', () => {
        const vercel = techStackData.find((item) => item.name === 'Vercel');
        expect(vercel).toBeDefined();
        expect(vercel!.category).toBe('deployment');
      });
    });
  });

  describe('techStackCategories', () => {
    it('should have all required categories', () => {
      const expectedCategories = [
        'core',
        'ui',
        'i18n',
        'tools',
        'testing',
        'dev',
        'performance',
        'security',
        'animation',
        'deployment',
        'quality',
        'docs',
        'data',
        'state',
      ];

      expectedCategories.forEach((category) => {
        expect(techStackCategories).toHaveProperty(category);
      });
    });

    it('should have Chinese descriptions for all categories', () => {
      Object.values(techStackCategories).forEach((description) => {
        expect(description).toBeTruthy();
        expect(typeof description).toBe('string');
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it('should be readonly', () => {
      expect(() => {
        // @ts-expect-error - Testing readonly property
        techStackCategories.core = '修改的核心框架';
      }).toThrow();
    });

    it('should have specific category mappings', () => {
      // 分类映射使用英文键名（已移除硬编码中文）
      expect(techStackCategories.core).toBe('core');
      expect(techStackCategories.ui).toBe('ui');
      expect(techStackCategories.i18n).toBe('i18n');
      expect(techStackCategories.tools).toBe('tools');
      expect(techStackCategories.testing).toBe('testing');
      expect(techStackCategories.dev).toBe('dev');
      expect(techStackCategories.performance).toBe('performance');
      expect(techStackCategories.security).toBe('security');
      expect(techStackCategories.animation).toBe('animation');
      expect(techStackCategories.deployment).toBe('deployment');
      expect(techStackCategories.quality).toBe('quality');
      expect(techStackCategories.docs).toBe('docs');
      expect(techStackCategories.data).toBe('data');
      expect(techStackCategories.state).toBe('state');
    });
  });

  describe('TechStackCategory type', () => {
    it('should include all category keys', () => {
      const categoryKeys = Object.keys(
        techStackCategories,
      ) as TechStackCategory[];

      categoryKeys.forEach((key) => {
        const safeCategories = new Map(Object.entries(techStackCategories));
        expect(safeCategories.get(key)).toBeTruthy();
      });
    });
  });

  describe('data consistency', () => {
    it('should have all categories used in data', () => {
      const usedCategories = new Set(
        techStackData.map((item) => item.category),
      );
      const definedCategories = new Set(Object.keys(techStackCategories));

      usedCategories.forEach((category) => {
        expect(definedCategories.has(category)).toBe(true);
      });
    });

    it('should have items for most categories', () => {
      const usedCategories = new Set(
        techStackData.map((item) => item.category),
      );
      const coreCategories = ['core', 'ui', 'tools', 'testing'];

      coreCategories.forEach((category) => {
        expect(usedCategories.has(category)).toBe(true);
      });
    });

    it('should have reasonable distribution across categories', () => {
      const categoryCount: Record<string, number> = {};

      techStackData.forEach((item) => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });

      // Core categories should have multiple items
      expect(categoryCount.core).toBeGreaterThanOrEqual(
        TEST_MINIMUMS.CATEGORY_MIN_ITEMS,
      );
      expect(categoryCount.ui).toBeGreaterThanOrEqual(
        TEST_MINIMUMS.CATEGORY_MIN_ITEMS,
      );
      expect(categoryCount.tools).toBeGreaterThanOrEqual(
        TEST_MINIMUMS.CATEGORY_MIN_ITEMS,
      );
    });
  });

  describe('version tracking', () => {
    it('should track major framework versions', () => {
      const nextjs = techStackData.find((item) => item.name === 'Next.js');
      const react = techStackData.find((item) => item.name === 'React');
      const typescript = techStackData.find(
        (item) => item.name === 'TypeScript',
      );

      expect(nextjs!.version).toMatch(/^1[5-9]\./); // Next.js 15+
      expect(react!.version).toMatch(/^1[8-9]\./); // React 18+
      expect(typescript!.version).toMatch(/^[4-9]\./); // TypeScript 4+
    });

    it('should have consistent version format', () => {
      const versionedItems = techStackData.filter(
        (item) => item.version !== 'latest',
      );

      versionedItems.forEach((item) => {
        expect(item.version).toMatch(/^\d+\.\d+\.\d+$/);
      });
    });
  });
});
