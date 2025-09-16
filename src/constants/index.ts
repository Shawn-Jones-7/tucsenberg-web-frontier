/**
 * 常量模块统一导出
 * 提供项目中所有常量的集中访问点
 */

// 国际化常量
export {
  TIME_UNITS,
  CACHE_DURATIONS,
  UI_TIMINGS,
  PERFORMANCE_THRESHOLDS,
  QUALITY_WEIGHTS,
  QUALITY_SCORING,
  QUALITY_CHECK_THRESHOLDS,
  VALIDATION_THRESHOLDS,
  DETECTION_CONFIDENCE,
  DETECTION_SCORING,
  CACHE_LIMITS,
  CLEANUP_CONFIG,
  MONITORING_CONFIG,
  REPORTING_THRESHOLDS,
  UI_RATIOS,
  PAGINATION_CONFIG,
} from './i18n-constants';

// 应用程序常量
export {
  TIME_CONSTANTS,
  DELAY_CONSTANTS,
  CONTENT_LIMITS,
  PAGINATION_CONSTANTS,
  OPACITY_CONSTANTS,
  PERCENTAGE_CONSTANTS,
  PERFORMANCE_CONSTANTS,
  DEBUG_CONSTANTS,
} from './app-constants';
export type {
  AppConstants,
  TimeConstants,
  DelayConstants,
  ContentLimits,
  PaginationConstants,
  OpacityConstants,
  PercentageConstants,
  PerformanceConstants,
  DebugConstants,
} from './app-constants';

// 测试相关常量
export {
  TEST_TIME_CALCULATIONS,
  TEST_DELAY_VALUES,
  TEST_PERCENTAGE_VALUES,
  TEST_PERFORMANCE_TIMESTAMPS,
  TEST_APP_CONSTANTS,
  TEST_BASE_NUMBERS,
  TEST_TIMEOUT_CONSTANTS,
  TEST_COUNT_CONSTANTS,
  TEST_COUNTS,
  TEST_PERCENTAGE_CONSTANTS,
  TEST_TIMESTAMP_CONSTANTS,
  TEST_OPACITY_CONSTANTS,
  TEST_ANGLE_CONSTANTS,
  TEST_CONTRAST_CONSTANTS,
  TEST_EASING_CONSTANTS,
  TEST_PERFORMANCE_MONITORING,
  THEME_ANALYTICS_CONSTANTS,
  TEST_CONTENT_LIMITS,
  TEST_SAMPLE_CONSTANTS,
  TEST_SCREEN_CONSTANTS,
  TEST_SPECIAL_CONSTANTS,
  TEST_WEB_VITALS_DIAGNOSTICS,
  WEB_VITALS_CONSTANTS,
} from './test-constants';

// 安全相关常量
export {
  ENCRYPTION_CONSTANTS,
  ACCESS_CONTROL_CONSTANTS,
  SESSION_CONSTANTS,
  RATE_LIMIT_CONSTANTS,
  FILE_SECURITY_CONSTANTS,
  INPUT_VALIDATION_CONSTANTS,
  CSP_CONSTANTS,
  SECURITY_HEADERS_CONSTANTS,
} from './security-constants';
export type {
  SecurityConstants,
  EncryptionConstants,
  AccessControlConstants,
  SessionConstants,
  RateLimitConstants,
  FileSecurityConstants,
  InputValidationConstants,
  CspConstants,
  SecurityHeadersConstants,
} from './security-constants';

// SEO相关常量
export {
  SEO_PRIORITY_CONSTANTS,
  SITEMAP_CHANGEFREQ_CONSTANTS,
  URL_GENERATION_CONSTANTS,
} from './seo-constants';
export type {
  SeoConstants,
  SeoPriorityConstants,
  SitemapChangefreqConstants,
  UrlGenerationConstants,
} from './seo-constants';

// 重新导出主要常量对象以便于使用
export { APP_CONSTANTS } from '@/constants/app-constants';
export { SECURITY_CONSTANTS } from '@/constants/security-constants';
export { SEO_CONSTANTS } from '@/constants/seo-constants';
export { TEST_CONSTANTS } from '@/constants/test-constants';
