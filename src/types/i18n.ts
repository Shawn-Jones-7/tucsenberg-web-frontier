/**
 * 类型安全的国际化类型定义
 * 提供完整的翻译键类型检查和自动补全支持
 */

// 基础翻译消息结构
export interface Messages {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    edit: string;
    delete: string;
    search: string;
    filter: string;
    sort: string;
    next: string;
    previous: string;
    close: string;
    open: string;
    retry: string;
    back: string;
    refresh: string;
  };
  navigation: {
    home: string;
    about: string;
    contact: string;
    services: string;
    products: string;
    blog: string;
    login: string;
    logout: string;
    profile: string;
    settings: string;
  };
  theme: {
    toggle: string;
    light: string;
    dark: string;
    system: string;
  };
  language: {
    toggle: string;
    english: string;
    chinese: string;
    switching: string;
    switchSuccess: string;
    switchError: string;
    fallbackWarning: string;
  };
  home: {
    title: string;
    subtitle: string;
    description: string;
    getStarted: string;
    learnMore: string;
    features: {
      title: string;
      performance: {
        title: string;
        description: string;
      };
      scalable: {
        title: string;
        description: string;
      };
      secure: {
        title: string;
        description: string;
      };
    };
  };
  themeDemo: {
    title: string;
    description: string;
    chineseTest: string;
    englishTest: string;
    chineseDescription: string;
    englishDescription: string;
    chineseInput: string;
    englishInput: string;
    chinesePlaceholder: string;
    englishPlaceholder: string;
    primaryButton: string;
    secondaryButton: string;
    outlineButton: string;
  };
  instructions: {
    getStarted: string;
    saveChanges: string;
  };
  actions: {
    deployNow: string;
    readDocs: string;
  };
  footer: {
    learn: string;
    examples: string;
    goToNextjs: string;
  };
  formatting: {
    date: {
      today: string;
      yesterday: string;
      tomorrow: string;
      lastUpdated: string;
      publishedOn: string;
    };
    number: {
      currency: string;
      percentage: string;
      fileSize: string;
    };
    plurals: {
      items: {
        zero: string;
        one: string;
        other: string;
      };
      users: {
        zero: string;
        one: string;
        other: string;
      };
      notifications: {
        zero: string;
        one: string;
        other: string;
      };
    };
  };
  errors: {
    notFound: string;
    serverError: string;
    networkError: string;
    validationError: string;
    unauthorized: string;
    forbidden: string;
    timeout: string;
    generic: string;
    translationMissing: string;
    loadingFailed: string;
  };
  accessibility: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    loading: string;
    error: string;
    languageSelector: string;
    themeSelector: string;
  };
}

// 翻译键路径类型
export type TranslationKey = keyof Messages | `${keyof Messages}.${string}`;

// 支持的语言类型
export type Locale = 'en' | 'zh';
// 兼容旧测试代码中的别名
export type _Locale = Locale;

// 翻译参数类型
export interface TranslationParams {
  [key: string]: string | number | boolean | Date;
}

// 格式化选项
export interface FormatOptions {
  dateTime?: Intl.DateTimeFormatOptions;
  number?: Intl.NumberFormatOptions;
  list?: Intl.ListFormatOptions;
}

// 翻译上下文
export interface TranslationContext {
  locale: Locale;
  fallbackLocale: Locale;
  namespace?: string;
  interpolation?: boolean;
  escapeValue?: boolean;
}

// 翻译错误类型
export interface TranslationError {
  code: 'MISSING_KEY' | 'INVALID_PARAMS' | 'FORMAT_ERROR' | 'NETWORK_ERROR';
  message: string;
  key?: string;
  locale?: Locale;
  params?: TranslationParams;
}

// 翻译状态
export interface TranslationState {
  isLoading: boolean;
  error: TranslationError | null;
  locale: Locale;
  fallbackLocale: Locale;
  messages: Partial<Messages>;
  coverage: number;
}

// 翻译配置
export interface I18nConfig {
  defaultLocale: Locale;
  locales: Locale[];
  fallbackLocale: Locale;
  interpolation: {
    escapeValue: boolean;
    prefix: string;
    suffix: string;
  };
  detection: {
    order: ('localStorage' | 'cookie' | 'header' | 'path')[];
    caches: ('localStorage' | 'cookie')[];
    cookieOptions: {
      maxAge: number;
      sameSite: 'strict' | 'lax' | 'none';
      secure: boolean;
    };
  };
  backend: {
    loadPath: string;
    allowMultiLoading: boolean;
    crossDomain: boolean;
  };
  cache: {
    enabled: boolean;
    prefix: string;
    expirationTime: number;
  };
}

// 翻译钩子返回类型
export interface UseTranslationReturn {
  t: (_key: TranslationKey, _params?: TranslationParams) => string;
  locale: Locale;
  isLoading: boolean;
  error: TranslationError | null;
  changeLanguage: (_locale: Locale) => Promise<void>;
  ready: boolean;
}

// 格式化钩子返回类型
export interface UseFormatterReturn {
  formatDate: (
    _date: Date | string | number,
    _options?: Intl.DateTimeFormatOptions,
  ) => string;
  formatNumber: (_value: number, _options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (_value: number, _currency?: string) => string;
  formatPercentage: (_value: number) => string;
  formatList: (_items: string[], _options?: Intl.ListFormatOptions) => string;
  formatRelativeTime: (
    _value: number,
    _unit: Intl.RelativeTimeFormatUnit,
  ) => string;
}

// 路由国际化类型
export interface LocalizedPathnames {
  [_key: string]: string | { [_locale in Locale]: string };
}

// 域名配置类型
export interface DomainConfig {
  domain: string;
  defaultLocale: Locale;
  locales?: Locale[];
}

// 中间件配置类型
export interface MiddlewareConfig {
  locales: Locale[];
  defaultLocale: Locale;
  localePrefix: 'always' | 'as-needed' | 'never';
  domains?: DomainConfig[];
  pathnames?: LocalizedPathnames;
  alternateLinks?: boolean;
  localeDetection?: boolean;
}

// 性能监控类型
export interface I18nMetrics {
  loadTime: number;
  cacheHitRate: number;
  errorRate: number;
  translationCoverage: number;
  localeUsage: Record<Locale, number>;
}

// 翻译质量指标
export interface TranslationQuality {
  completeness: number;
  consistency: number;
  accuracy: number;
  freshness: number;
  score: number;
}

// 声明模块扩展以支持类型检查
declare global {
  interface IntlMessages extends Messages {
    // This interface extends Messages to provide type safety for next-intl
    [key: string]: unknown;
  }
}

export {};
