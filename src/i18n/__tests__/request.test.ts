import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const {
  mockHeaders,
  mockGetRequestConfig,
  mockGetCachedMessages,
  mockI18nPerformanceMonitor,
  mockTranslationCache,
  mockRouting,
} = vi.hoisted(() => ({
  mockHeaders: vi.fn(),
  mockGetRequestConfig: vi.fn(),
  mockGetCachedMessages: vi.fn(),
  mockI18nPerformanceMonitor: {
    recordLoadTime: vi.fn(),
    recordCacheHit: vi.fn(),
    recordCacheMiss: vi.fn(),
    recordError: vi.fn(),
  },
  mockTranslationCache: {
    getInstance: vi.fn(),
  },
  mockRouting: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  },
}));

// Mock dependencies
vi.mock('next/headers', () => ({
  headers: mockHeaders,
}));

vi.mock('next-intl/server', () => ({
  getRequestConfig: mockGetRequestConfig,
}));

vi.mock('@/lib/i18n-performance', () => ({
  getCachedMessages: mockGetCachedMessages,
  I18nPerformanceMonitor: mockI18nPerformanceMonitor,
  TranslationCache: mockTranslationCache,
}));

vi.mock('../routing', () => ({
  routing: mockRouting,
}));

// Mock messages
vi.mock('../../../messages/en.json', () => ({
  default: {
    common: { loading: 'Loading...' },
    navigation: { home: 'Home' },
  },
}));

vi.mock('../../../messages/zh.json', () => ({
  default: {
    common: { loading: '加载中...' },
    navigation: { home: '首页' },
  },
}));

describe('i18n Request Configuration', () => {
  const mockHeadersList = new Map();
  const mockCacheInstance = {
    get: vi.fn(),
    set: vi.fn(),
  };
  let performanceNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockHeaders.mockResolvedValue(mockHeadersList);
    mockTranslationCache.getInstance.mockReturnValue(mockCacheInstance);
    mockGetCachedMessages.mockResolvedValue({
      common: { loading: 'Loading...' },
      navigation: { home: 'Home' },
    });

    // Mock performance.now
    performanceNowSpy = vi
      .spyOn(globalThis.performance, 'now')
      .mockReturnValue(100);
  });

  afterEach(() => {
    performanceNowSpy.mockRestore();
  });

  describe('基础配置', () => {
    it('应该正确配置getRequestConfig', async () => {
      // Import the module to trigger getRequestConfig call
      await import('../request');

      expect(mockGetRequestConfig).toHaveBeenCalledWith(expect.any(Function));
    });

    it('应该处理有效的locale', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(result.locale).toBe('en');
        expect(result.messages).toBeDefined();
        expect(result.timeZone).toBe('UTC');
        expect(result.strictMessageTypeSafety).toBe(true);

        return result;
      });

      await import('../request');
    });

    it('应该处理中文locale', async () => {
      mockGetCachedMessages.mockResolvedValue({
        common: { loading: '加载中...' },
        navigation: { home: '首页' },
      });

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('zh') });

        expect(result.locale).toBe('zh');
        expect(result.timeZone).toBe('Asia/Shanghai');
        expect(result.messages).toBeDefined();

        return result;
      });

      await import('../request');
    });
  });

  describe('智能语言检测', () => {
    it('应该使用检测到的locale', async () => {
      mockHeadersList.set('x-detected-locale', 'zh');
      mockHeadersList.set('x-detection-source', 'browser');
      mockHeadersList.set('x-detection-confidence', '0.9');

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve(null) });

        expect(result.locale).toBe('zh');
        expect(result.metadata.smartDetection).toEqual({
          detectedLocale: 'zh',
          source: 'browser',
          confidence: 0.9,
          applied: true,
        });

        return result;
      });

      await import('../request');
    });

    it('应该回退到默认locale当检测失败时', async () => {
      mockHeadersList.set('x-detected-locale', 'invalid');
      mockHeadersList.set('x-detection-source', 'browser');
      mockHeadersList.set('x-detection-confidence', '0.5');

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve(null) });

        expect(result.locale).toBe('en');
        expect(result.metadata.smartDetection).toEqual({
          detectedLocale: 'invalid',
          source: 'browser',
          confidence: 0.5,
          applied: false,
        });

        return result;
      });

      await import('../request');
    });

    it('应该处理缺少检测头的情况', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve(null) });

        expect(result.locale).toBe('en');
        expect(result.metadata.smartDetection).toBeUndefined();

        return result;
      });

      await import('../request');
    });
  });

  describe('缓存处理', () => {
    it('应该记录缓存命中', async () => {
      mockCacheInstance.get.mockReturnValue({ cached: true });

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        await configFn({ requestLocale: Promise.resolve('en') });

        expect(mockI18nPerformanceMonitor.recordCacheHit).toHaveBeenCalled();
        expect(mockI18nPerformanceMonitor.recordLoadTime).toHaveBeenCalled();

        return {};
      });

      await import('../request');
    });

    it('应该记录缓存未命中', async () => {
      mockCacheInstance.get.mockReturnValue(null);

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        await configFn({ requestLocale: Promise.resolve('en') });

        expect(mockI18nPerformanceMonitor.recordCacheMiss).toHaveBeenCalled();
        expect(mockI18nPerformanceMonitor.recordLoadTime).toHaveBeenCalled();

        return {};
      });

      await import('../request');
    });
  });

  describe('格式配置', () => {
    it('应该为英文配置正确的格式', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(result.formats.number.currency.currency).toBe('USD');
        expect(result.formats.dateTime.short.day).toBe('numeric');
        expect(result.formats.list.enumeration.style).toBe('long');

        return result;
      });

      await import('../request');
    });

    it('应该为中文配置正确的格式', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('zh') });

        expect(result.formats.number.currency.currency).toBe('CNY');
        expect(result.formats.dateTime.long.weekday).toBe('long');
        expect(result.formats.number.percentage.style).toBe('percent');

        return result;
      });

      await import('../request');
    });
  });

  describe('错误处理', () => {
    it('应该处理消息加载错误', async () => {
      mockGetCachedMessages.mockRejectedValue(new Error('Load error'));

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(mockI18nPerformanceMonitor.recordError).toHaveBeenCalled();
        expect(result.locale).toBe('en');
        expect(result.metadata.error).toBe(true);
        expect(result.metadata.cacheUsed).toBe(false);

        return result;
      });

      await import('../request');
    });

    it('应该在错误时使用回退消息', async () => {
      mockGetCachedMessages.mockRejectedValue(new Error('Load error'));

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        // 应该回退到直接导入的消息
        expect(result.messages).toEqual({
          common: { loading: 'Loading...' },
          navigation: { home: 'Home' },
        });

        return result;
      });

      await import('../request');
    });
  });

  describe('性能监控', () => {
    it('应该记录加载时间', async () => {
      global.performance.now = vi
        .fn()
        .mockReturnValueOnce(100) // start time
        .mockReturnValueOnce(150); // end time

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        await configFn({ requestLocale: Promise.resolve('en') });

        expect(mockI18nPerformanceMonitor.recordLoadTime).toHaveBeenCalledWith(
          50,
        );

        return {};
      });

      await import('../request');
    });

    it('应该在元数据中包含性能信息', async () => {
      global.performance.now = vi
        .fn()
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(200);

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(result.metadata.loadTime).toBe(100);
        expect(result.metadata.timestamp).toBeDefined();
        expect(typeof result.metadata.cacheUsed).toBe('boolean');

        return result;
      });

      await import('../request');
    });
  });

  describe('时区配置', () => {
    it('应该为英文设置UTC时区', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(result.timeZone).toBe('UTC');

        return result;
      });

      await import('../request');
    });

    it('应该为中文设置上海时区', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('zh') });

        expect(result.timeZone).toBe('Asia/Shanghai');

        return result;
      });

      await import('../request');
    });
  });

  describe('边缘情况', () => {
    it('应该处理无效的locale', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({
          requestLocale: Promise.resolve('invalid'),
        });

        expect(result.locale).toBe('en'); // 应该回退到默认locale

        return result;
      });

      await import('../request');
    });

    it('应该处理空的requestLocale', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('') });

        expect(result.locale).toBe('en'); // 应该回退到默认locale

        return result;
      });

      await import('../request');
    });

    it('应该处理undefined的requestLocale', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({
          requestLocale: Promise.resolve(undefined),
        });

        expect(result.locale).toBe('en'); // 应该回退到默认locale

        return result;
      });

      await import('../request');
    });
  });
});
