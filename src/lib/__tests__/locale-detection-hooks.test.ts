import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UnsafeLocaleCode } from '@/types';
import { DEFAULT_LOCALE } from '@/lib/locale-constants';
import { useClientLocaleDetection } from '@/lib/locale-detection-hooks';
import type { LocaleDetectionResult } from '@/lib/locale-detection-types';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const { mockLocaleStorageManager, mockNavigator } = vi.hoisted(() => ({
  mockLocaleStorageManager: {
    getUserOverride: vi.fn(),
    saveUserPreference: vi.fn(),
    getDetectionHistory: vi.fn(),
    addDetectionRecord: vi.fn(),
  },
  mockNavigator: {
    language: 'en-US',
    languages: ['en-US', 'en'],
  },
}));

// Mock外部依赖
vi.mock('../locale-storage', () => ({
  LocaleStorageManager: mockLocaleStorageManager,
}));

// Mock浏览器API
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// 共享的useClientLocaleDetection测试设置
const setupClientLocaleDetectionTest = () => {
  vi.clearAllMocks();

  // Mock window.navigator
  Object.defineProperty(window, 'navigator', {
    value: {
      language: 'en-US',
      languages: ['en-US', 'en'],
    },
    writable: true,
  });

  // Mock localStorage
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  return mockLocalStorage;
};

describe('useClientLocaleDetection - User Override and Browser Detection', () => {
  let detectClientLocale: () => LocaleDetectionResult;

  beforeEach(() => {
    setupClientLocaleDetectionTest();

    // 重置所有mock
    mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
    mockLocaleStorageManager.saveUserPreference.mockReturnValue(undefined);
    mockLocaleStorageManager.getDetectionHistory.mockReturnValue([]);
    mockLocaleStorageManager.addDetectionRecord.mockReturnValue(undefined);

    // 重置navigator mock
    Object.defineProperty(global, 'navigator', {
      value: {
        language: 'en-US',
        languages: ['en-US', 'en'],
      },
      writable: true,
    });

    // 获取hook函数
    const hook = useClientLocaleDetection();
    detectClientLocale = hook.detectClientLocale;
  });

  describe('用户覆盖检测', () => {
    it('应该优先返回用户手动设置的语言', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue('zh');

      const result = detectClientLocale();

      expect(result.locale).toBe('zh');
      expect(result.source).toBe('user');
      expect(result.confidence).toBe(1.0);
      expect(result.details.userOverride).toBe('zh');
    });

    it('应该忽略无效的用户设置语言', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(
        'invalid' as UnsafeLocaleCode,
      );

      const result = detectClientLocale();

      expect(result.locale).not.toBe('invalid');
      expect(result.source).not.toBe('user');
    });
  });

  describe('浏览器语言检测', () => {
    it('应该正确检测中文浏览器语言', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'zh-CN',
          languages: ['zh-CN', 'zh', 'en'],
        },
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.locale).toBe('zh');
      expect(result.source).toBe('browser');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('应该正确检测英文浏览器语言', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'en-US',
          languages: ['en-US', 'en'],
        },
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.locale).toBe('en');
      expect(result.source).toBe('browser');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('应该处理不支持的浏览器语言', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'fr-FR',
          languages: ['fr-FR', 'fr'],
        },
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.locale).toBe(DEFAULT_LOCALE);
      expect(result.source).toBe('default');
    });

    it('应该处理空的浏览器语言列表', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: {
          language: '',
          languages: [],
        },
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.locale).toBe(DEFAULT_LOCALE);
      expect(result.source).toBe('default');
    });

    it('应该正确映射浏览器语言代码', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);

      const testCases = [
        { input: ['zh-tw'], expected: 'zh' },
        { input: ['zh-hk'], expected: 'zh' },
        { input: ['en-gb'], expected: 'en' },
        { input: ['en-ca'], expected: 'en' },
      ];

      testCases.forEach(({ input, expected }) => {
        Object.defineProperty(global, 'navigator', {
          value: {
            language: input[0],
            languages: input,
          },
          writable: true,
        });

        const result = detectClientLocale();
        expect(result.locale).toBe(expected);
      });
    });
  });
});

describe('useClientLocaleDetection - Navigator API and Security', () => {
  let detectClientLocale: () => LocaleDetectionResult;

  beforeEach(() => {
    setupClientLocaleDetectionTest();
    detectClientLocale = useClientLocaleDetection().detectClientLocale;
  });

  describe('navigator API不可用的情况', () => {
    it('应该处理navigator未定义的情况', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.locale).toBe(DEFAULT_LOCALE);
      expect(result.source).toBe('default');
    });

    it('应该处理navigator.languages未定义的情况', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'zh-CN',
          // languages 属性未定义
        },
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.locale).toBe('zh');
      expect(result.source).toBe('browser');
    });
  });

  describe('安全性测试', () => {
    it('应该安全地处理对象注入攻击', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);

      // 尝试对象注入攻击
      const maliciousLanguage = '__proto__';
      Object.defineProperty(global, 'navigator', {
        value: {
          language: maliciousLanguage,
          languages: [maliciousLanguage],
        },
        writable: true,
      });

      const result = detectClientLocale();

      // 应该回退到默认语言，而不是被注入
      expect(result.locale).toBe(DEFAULT_LOCALE);
      expect(result.source).toBe('default');
    });

    it('应该安全地处理constructor注入', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);

      const maliciousLanguage = 'constructor';
      Object.defineProperty(global, 'navigator', {
        value: {
          language: maliciousLanguage,
          languages: [maliciousLanguage],
        },
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.locale).toBe(DEFAULT_LOCALE);
      expect(result.source).toBe('default');
    });
  });
});

describe('useClientLocaleDetection - Confidence and Details', () => {
  let detectClientLocale: () => LocaleDetectionResult;

  beforeEach(() => {
    setupClientLocaleDetectionTest();
    detectClientLocale = useClientLocaleDetection().detectClientLocale;
  });

  describe('置信度计算', () => {
    it('用户覆盖应该有最高置信度', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue('zh');

      const result = detectClientLocale();

      expect(result.confidence).toBe(1.0);
    });

    it('浏览器检测应该有合理的置信度', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'zh-CN',
          languages: ['zh-CN', 'zh'],
        },
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.confidence).toBeLessThan(1.0);
    });

    it('默认回退应该有最低置信度', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'unsupported',
          languages: ['unsupported'],
        },
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('详细信息记录', () => {
    it('应该记录用户覆盖详细信息', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue('zh');

      const result = detectClientLocale();

      expect(result.details).toHaveProperty('userOverride');
      expect(result.details.userOverride).toBe('zh');
    });

    it('应该记录浏览器检测详细信息', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'zh-CN',
          languages: ['zh-CN', 'zh'],
        },
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.details).toHaveProperty('browserLocale');
      expect(result.details.browserLocale).toBe('zh');
    });

    it('应该记录默认回退详细信息', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.details).toHaveProperty('fallbackUsed');
      expect(result.details.fallbackUsed).toBe(true);
    });
  });

  describe('边界条件测试', () => {
    it('应该处理null和undefined输入', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: {
          language: null,
          languages: null,
        },
        writable: true,
      });

      expect(() => {
        detectClientLocale();
      }).not.toThrow();
    });

    it('应该处理空字符串语言代码', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: {
          language: '',
          languages: [''],
        },
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.locale).toBe(DEFAULT_LOCALE);
    });

    it('应该处理格式错误的语言代码', () => {
      mockLocaleStorageManager.getUserOverride.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'invalid-format-code',
          languages: ['invalid-format-code'],
        },
        writable: true,
      });

      const result = detectClientLocale();

      expect(result.locale).toBe(DEFAULT_LOCALE);
    });
  });
});
