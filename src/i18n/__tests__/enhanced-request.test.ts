import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const {
  mockGetRequestConfig,
  mockGetCachedMessages,
  mockI18nPerformanceMonitor,
  mockTranslationCache,
  mockRouting,
} = vi.hoisted(() => ({
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

describe('i18n Enhanced Request Configuration', () => {
  const mockCacheInstance = {
    get: vi.fn(),
    set: vi.fn(),
  };

  let performanceNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
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

  describe('增强配置功能', () => {
    it('应该正确配置enhanced getRequestConfig', async () => {
      // Import the module to trigger getRequestConfig call
      await import('../enhanced-request');

      expect(mockGetRequestConfig).toHaveBeenCalledWith(expect.any(Function));
    });

    it('应该处理有效的locale并返回增强元数据', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(result.locale).toBe('en');
        expect(result.messages).toBeDefined();
        expect(result.timeZone).toBe('UTC');
        expect(result.metadata).toBeDefined();
        expect(result.metadata.loadTime).toBeDefined();
        expect(result.metadata.cacheUsed).toBeDefined();
        expect(result.metadata.timestamp).toBeDefined();

        return result;
      });

      await import('../enhanced-request');
    });

    it('应该为中文locale配置正确的时区', async () => {
      mockGetCachedMessages.mockResolvedValue({
        common: { loading: '加载中...' },
        navigation: { home: '首页' },
      });

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('zh') });

        expect(result.locale).toBe('zh');
        expect(result.timeZone).toBe('Asia/Shanghai');
        expect(result.formats.number.currency.currency).toBe('CNY');

        return result;
      });

      await import('../enhanced-request');
    });
  });

  describe('增强格式配置', () => {
    it('应该为英文配置增强的格式选项', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        const formats = result.formats;

        // 验证日期时间格式
        expect(formats.dateTime.short).toEqual({
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        expect(formats.dateTime.long).toEqual({
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long',
        });

        // 验证数字格式
        expect(formats.number.precise.maximumFractionDigits).toBe(5);
        expect(formats.number.currency).toEqual({
          style: 'currency',
          currency: 'USD',
        });
        expect(formats.number.percentage).toEqual({
          style: 'percent',
          minimumFractionDigits: 1,
        });

        // 验证列表格式
        expect(formats.list.enumeration).toEqual({
          style: 'long',
          type: 'conjunction',
        });

        return result;
      });

      await import('../enhanced-request');
    });

    it('应该为中文配置正确的货币格式', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('zh') });

        expect(result.formats.number.currency.currency).toBe('CNY');

        return result;
      });

      await import('../enhanced-request');
    });
  });

  describe('增强缓存监控', () => {
    it('应该记录缓存命中并更新性能指标', async () => {
      mockCacheInstance.get.mockReturnValue({ cached: true });

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(mockI18nPerformanceMonitor.recordCacheHit).toHaveBeenCalled();
        expect(mockI18nPerformanceMonitor.recordLoadTime).toHaveBeenCalled();
        expect(result.metadata.cacheUsed).toBe(true);

        return result;
      });

      await import('../enhanced-request');
    });

    it('应该记录缓存未命中', async () => {
      mockCacheInstance.get.mockReturnValue(null);

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(mockI18nPerformanceMonitor.recordCacheMiss).toHaveBeenCalled();
        expect(result.metadata.cacheUsed).toBe(false);

        return result;
      });

      await import('../enhanced-request');
    });
  });

  describe('增强错误处理', () => {
    it('应该在错误时创建增强的回退响应', async () => {
      mockGetCachedMessages.mockRejectedValue(new Error('Load error'));

      global.performance.now = vi
        .fn()
        .mockReturnValueOnce(100) // start time
        .mockReturnValueOnce(200); // fallback time

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(mockI18nPerformanceMonitor.recordError).toHaveBeenCalled();
        expect(result.locale).toBe('en');
        expect(result.messages).toEqual({});
        expect(result.metadata.error).toBe(true);
        expect(result.metadata.cacheUsed).toBe(false);
        expect(result.metadata.loadTime).toBe(100);

        return result;
      });

      await import('../enhanced-request');
    });

    it('应该为中文locale创建正确的回退响应', async () => {
      mockGetCachedMessages.mockRejectedValue(new Error('Load error'));

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('zh') });

        expect(result.locale).toBe('zh');
        expect(result.timeZone).toBe('Asia/Shanghai');
        expect(result.formats.number.currency.currency).toBe('CNY');
        expect(result.metadata.error).toBe(true);

        return result;
      });

      await import('../enhanced-request');
    });
  });

  describe('增强性能监控', () => {
    it('应该记录详细的加载时间', async () => {
      global.performance.now = vi
        .fn()
        .mockReturnValueOnce(100) // start time
        .mockReturnValueOnce(250); // end time

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(mockI18nPerformanceMonitor.recordLoadTime).toHaveBeenCalledWith(
          150,
        );
        expect(result.metadata.loadTime).toBe(150);

        return result;
      });

      await import('../enhanced-request');
    });

    it('应该包含完整的元数据信息', async () => {
      const mockTimestamp = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(result.metadata).toEqual({
          loadTime: expect.any(Number),
          cacheUsed: expect.any(Boolean),
          timestamp: mockTimestamp,
        });

        return result;
      });

      await import('../enhanced-request');
    });
  });

  describe('locale验证和回退', () => {
    it('应该处理无效的locale并回退到默认值', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({
          requestLocale: Promise.resolve('invalid'),
        });

        expect(result.locale).toBe('en');

        return result;
      });

      await import('../enhanced-request');
    });

    it('应该处理null locale', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve(null) });

        expect(result.locale).toBe('en');

        return result;
      });

      await import('../enhanced-request');
    });

    it('应该处理undefined locale', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({
          requestLocale: Promise.resolve(undefined),
        });

        expect(result.locale).toBe('en');

        return result;
      });

      await import('../enhanced-request');
    });
  });

  describe('时间和日期配置', () => {
    it('应该设置正确的now时间', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        expect(result.now).toBeInstanceOf(Date);

        return result;
      });

      await import('../enhanced-request');
    });

    it('应该为不同locale设置正确的时区', async () => {
      // 测试英文
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const enResult = await configFn({
          requestLocale: Promise.resolve('en'),
        });
        expect(enResult.timeZone).toBe('UTC');

        const zhResult = await configFn({
          requestLocale: Promise.resolve('zh'),
        });
        expect(zhResult.timeZone).toBe('Asia/Shanghai');

        return enResult;
      });

      await import('../enhanced-request');
    });
  });

  describe('边缘情况处理', () => {
    it('应该处理空字符串locale', async () => {
      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('') });

        expect(result.locale).toBe('en');

        return result;
      });

      await import('../enhanced-request');
    });

    it('应该处理缓存实例不可用的情况', async () => {
      mockTranslationCache.getInstance.mockReturnValue(null);

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        // 应该仍然能够正常工作，只是没有缓存信息
        expect(result.locale).toBe('en');
        expect(result.metadata.cacheUsed).toBe(false);

        return result;
      });

      await import('../enhanced-request');
    });

    it('应该处理性能API不可用的情况', async () => {
      const globalWithPerformance = globalThis as {
        performance?: Performance | undefined;
      };
      const originalPerformance = globalWithPerformance.performance;
      globalWithPerformance.performance = undefined;

      mockGetRequestConfig.mockImplementation(async (configFn) => {
        const result = await configFn({ requestLocale: Promise.resolve('en') });

        // 应该仍然能够正常工作
        expect(result.locale).toBe('en');
        expect(result.metadata).toBeDefined();

        return result;
      });

      await import('../enhanced-request');

      globalWithPerformance.performance = originalPerformance;
    });
  });
});
