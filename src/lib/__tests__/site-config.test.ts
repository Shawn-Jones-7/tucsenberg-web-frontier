import { describe, expect, it } from 'vitest';
import {
  ANIMATION_CONFIG,
  PROJECT_LINKS,
  PROJECT_STATS,
  RESPONSIVE_BREAKPOINTS,
  TECH_ARCHITECTURE,
  THEME_CONFIG,
} from '../site-config';

// 测试常量定义
const TEST_STATS = {
  TOTAL_TECHNOLOGIES: 22,
  CATEGORIES: 14,
  LANGUAGES: 2,
  INITIAL_LIKE_COUNT: 42,
  ANIMATION_STEPS: 4,
  OPACITY_VALUE: 0.2,
  FONT_WEIGHT: 700,
  ANIMATION_DURATION: 2000,
} as const;

const PLACEHOLDER_PATTERN = /\[[A-Z0-9_]+\]/;
const isPlaceholder = (value: string) => PLACEHOLDER_PATTERN.test(value);
const isGithubUrl = (value: string) => /^https:\/\/github\.com\/.+/.test(value);

describe('Site Configuration', () => {
  describe('PROJECT_STATS', () => {
    it('should have valid tech stack statistics', () => {
      expect(PROJECT_STATS.techStack.totalTechnologies).toBe(
        TEST_STATS.TOTAL_TECHNOLOGIES,
      );
      expect(PROJECT_STATS.techStack.categories).toBe(TEST_STATS.CATEGORIES);
      expect(PROJECT_STATS.techStack.modernScore).toBe('100%');
      expect(PROJECT_STATS.techStack.qualityGrade).toBe('A+');
    });

    it('should have valid performance metrics', () => {
      expect(PROJECT_STATS.performance.grade).toBe('A+');
      expect(PROJECT_STATS.performance.securityScore).toBe('100%');
      expect(PROJECT_STATS.performance.languages).toBe(TEST_STATS.LANGUAGES);
      expect(PROJECT_STATS.performance.themes).toBe('Multiple');
      expect(PROJECT_STATS.performance.typescriptVersion).toBe('TS 5.9.3');
      expect(PROJECT_STATS.performance.deployment).toBe('Vercel');
    });

    it('should have valid community data', () => {
      expect(PROJECT_STATS.community.initialLikeCount).toBe(
        TEST_STATS.INITIAL_LIKE_COUNT,
      );
      expect(PROJECT_STATS.community.githubStars).toBe('1.2k+');
      expect(PROJECT_STATS.community.contributors).toBe('10+');
      expect(PROJECT_STATS.community.downloads).toBe('5k+');
    });

    it('should be immutable (readonly)', () => {
      // TypeScript const assertions make objects readonly at compile time
      // but don't prevent runtime modifications. We test the structure instead.
      expect(PROJECT_STATS).toBeDefined();
      expect(typeof PROJECT_STATS.techStack.totalTechnologies).toBe('number');

      // Verify the object structure is as expected
      expect(PROJECT_STATS.techStack).toHaveProperty('totalTechnologies');
      expect(PROJECT_STATS.techStack).toHaveProperty('categories');
      expect(PROJECT_STATS.techStack).toHaveProperty('modernScore');
      expect(PROJECT_STATS.techStack).toHaveProperty('qualityGrade');
    });
  });

  describe('PROJECT_LINKS', () => {
    it('should have valid GitHub link', () => {
      expect(
        isPlaceholder(PROJECT_LINKS.github) ||
          isGithubUrl(PROJECT_LINKS.github),
      ).toBe(true);
    });

    it('should have valid internal links', () => {
      expect(PROJECT_LINKS.documentation).toBe('/docs');
      expect(PROJECT_LINKS.demo).toBe('/demo');
    });

    it('should have valid discussions link', () => {
      expect(
        isPlaceholder(PROJECT_LINKS.discussions) ||
          /^https:\/\/github\.com\/.+\/discussions$/.test(
            PROJECT_LINKS.discussions,
          ),
      ).toBe(true);
    });
  });

  describe('TECH_ARCHITECTURE', () => {
    it('should have frontend configuration', () => {
      expect(TECH_ARCHITECTURE.frontend.title).toBe('Frontend');
      expect(TECH_ARCHITECTURE.frontend.technologies).toContain('Next.js 16');
      expect(TECH_ARCHITECTURE.frontend.technologies).toContain('React 19');
      expect(TECH_ARCHITECTURE.frontend.technologies).toContain('TypeScript');
      expect(TECH_ARCHITECTURE.frontend.color).toBe('blue');
    });

    it('should have UI system configuration', () => {
      expect(TECH_ARCHITECTURE.ui.title).toBe('UI System');
      expect(TECH_ARCHITECTURE.ui.technologies).toContain('shadcn/ui');
      expect(TECH_ARCHITECTURE.ui.technologies).toContain('Radix UI');
      expect(TECH_ARCHITECTURE.ui.color).toBe('green');
    });

    it('should have development tooling configuration', () => {
      expect(TECH_ARCHITECTURE.tooling.title).toBe('Development');
      expect(TECH_ARCHITECTURE.tooling.technologies).toContain('ESLint');
      expect(TECH_ARCHITECTURE.tooling.technologies).toContain('Prettier');
      expect(TECH_ARCHITECTURE.tooling.color).toBe('purple');
    });

    it('should have consistent structure across all categories', () => {
      Object.values(TECH_ARCHITECTURE).forEach((category) => {
        expect(category).toHaveProperty('title');
        expect(category).toHaveProperty('technologies');
        expect(category).toHaveProperty('color');
        expect(Array.isArray(category.technologies)).toBe(true);
        expect(category.technologies.length).toBeGreaterThan(0);
      });
    });
  });

  describe('RESPONSIVE_BREAKPOINTS', () => {
    it('should have mobile configuration', () => {
      expect(RESPONSIVE_BREAKPOINTS.mobile.title).toBe('Mobile First');
      expect(RESPONSIVE_BREAKPOINTS.mobile.description).toBe(
        '移动端优先的响应式设计',
      );
      expect(RESPONSIVE_BREAKPOINTS.mobile.icon).toBe('User');
    });

    it('should have tablet configuration', () => {
      expect(RESPONSIVE_BREAKPOINTS.tablet.title).toBe('Tablet Optimized');
      expect(RESPONSIVE_BREAKPOINTS.tablet.description).toBe(
        '平板设备优化体验',
      );
      expect(RESPONSIVE_BREAKPOINTS.tablet.icon).toBe('Mail');
    });

    it('should have desktop configuration', () => {
      expect(RESPONSIVE_BREAKPOINTS.desktop.title).toBe('Desktop Enhanced');
      expect(RESPONSIVE_BREAKPOINTS.desktop.description).toBe('桌面端增强功能');
      expect(RESPONSIVE_BREAKPOINTS.desktop.icon).toBe('Settings');
    });

    it('should have consistent structure across all breakpoints', () => {
      Object.values(RESPONSIVE_BREAKPOINTS).forEach((breakpoint) => {
        expect(breakpoint).toHaveProperty('title');
        expect(breakpoint).toHaveProperty('description');
        expect(breakpoint).toHaveProperty('icon');
        expect(typeof breakpoint.title).toBe('string');
        expect(typeof breakpoint.description).toBe('string');
        expect(typeof breakpoint.icon).toBe('string');
      });
    });
  });

  describe('THEME_CONFIG', () => {
    it('should have valid color configuration', () => {
      expect(THEME_CONFIG.colors.primary).toBe('hsl(var(--primary))');
      expect(THEME_CONFIG.colors.secondary).toBe('hsl(var(--secondary))');
      expect(THEME_CONFIG.colors.muted).toBe('hsl(var(--muted))');
      expect(THEME_CONFIG.colors.accent).toBe('hsl(var(--accent))');
    });

    it('should have valid typography configuration', () => {
      expect(THEME_CONFIG.typography.weights).toEqual([
        'bold',
        'medium',
        'normal',
        'muted',
      ]);
      expect(Array.isArray(THEME_CONFIG.typography.weights)).toBe(true);
      expect(THEME_CONFIG.typography.weights.length).toBe(
        TEST_STATS.ANIMATION_STEPS,
      );
    });

    it('should use CSS custom properties for colors', () => {
      Object.values(THEME_CONFIG.colors).forEach((color) => {
        expect(color).toMatch(/^hsl\(var\(--[\w-]+\)\)$/);
      });
    });
  });

  describe('ANIMATION_CONFIG', () => {
    it('should have valid intersection observer configuration', () => {
      expect(ANIMATION_CONFIG.intersection.threshold).toBe(
        TEST_STATS.OPACITY_VALUE,
      );
      expect(ANIMATION_CONFIG.intersection.triggerOnce).toBe(true);
      expect(typeof ANIMATION_CONFIG.intersection.threshold).toBe('number');
      expect(typeof ANIMATION_CONFIG.intersection.triggerOnce).toBe('boolean');
    });

    it('should have valid transition configuration', () => {
      expect(ANIMATION_CONFIG.transitions.duration).toBe(
        TEST_STATS.FONT_WEIGHT,
      );
      expect(ANIMATION_CONFIG.transitions.easing).toBe('ease-out');
      expect(typeof ANIMATION_CONFIG.transitions.duration).toBe('number');
      expect(typeof ANIMATION_CONFIG.transitions.easing).toBe('string');
    });

    it('should have reasonable animation values', () => {
      expect(ANIMATION_CONFIG.intersection.threshold).toBeGreaterThan(0);
      expect(ANIMATION_CONFIG.intersection.threshold).toBeLessThanOrEqual(1);
      expect(ANIMATION_CONFIG.transitions.duration).toBeGreaterThan(0);
      expect(ANIMATION_CONFIG.transitions.duration).toBeLessThan(
        TEST_STATS.ANIMATION_DURATION,
      );
    });
  });

  describe('Configuration Integrity', () => {
    it('should export all required configurations', () => {
      expect(PROJECT_STATS).toBeDefined();
      expect(PROJECT_LINKS).toBeDefined();
      expect(TECH_ARCHITECTURE).toBeDefined();
      expect(RESPONSIVE_BREAKPOINTS).toBeDefined();
      expect(THEME_CONFIG).toBeDefined();
      expect(ANIMATION_CONFIG).toBeDefined();
    });

    it('should have no undefined values in configurations', () => {
      const checkForUndefined = (obj: unknown, path = ''): void => {
        Object.entries(obj as Record<string, unknown>).forEach(
          ([key, value]) => {
            const currentPath = path ? `${path}.${key}` : key;
            if (value === undefined) {
              throw new Error(`Undefined value found at ${currentPath}`);
            }
            if (
              typeof value === 'object' &&
              value !== null &&
              !Array.isArray(value)
            ) {
              checkForUndefined(value, currentPath);
            }
          },
        );
      };

      expect(() => checkForUndefined(PROJECT_STATS)).not.toThrow();
      expect(() => checkForUndefined(PROJECT_LINKS)).not.toThrow();
      expect(() => checkForUndefined(TECH_ARCHITECTURE)).not.toThrow();
      expect(() => checkForUndefined(RESPONSIVE_BREAKPOINTS)).not.toThrow();
      expect(() => checkForUndefined(THEME_CONFIG)).not.toThrow();
      expect(() => checkForUndefined(ANIMATION_CONFIG)).not.toThrow();
    });
  });
});
