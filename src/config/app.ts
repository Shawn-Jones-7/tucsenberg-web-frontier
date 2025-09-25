/**
 * CODEX分层治理：应用配置集中化
 *
 * 🎯 目标：将端口、超时、重试次数等配置值从魔法数字常量库中分离
 * 📊 优势：配置与业务常量分离，支持环境变量覆盖，便于部署配置
 * 🔄 配合env.mjs进行类型安全的环境变量验证
 */

import { env } from '@/lib/env';
import { COUNT_PAIR, ONE } from '@/constants';
import { MAGIC_0_1 } from '@/constants/decimal';
import { WEB_VITALS_THRESHOLDS } from '@/constants/performance-constants';
import {
  HOURS_PER_DAY,
  MINUTE_MS,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
  THIRTY_SECONDS_MS,
} from '@/constants/time';

// ============================================================================
// 网络和API配置
// ============================================================================

/**
 * 网络超时配置 (毫秒)
 */
export const NETWORK_CONFIG = {
  /** API请求默认超时 */
  API_TIMEOUT: env.API_TIMEOUT ?? 30_000,
  /** 文件上传超时 */
  UPLOAD_TIMEOUT: env.UPLOAD_TIMEOUT ?? 120_000,
  /** WebSocket连接超时 */
  WEBSOCKET_TIMEOUT: env.WEBSOCKET_TIMEOUT ?? 10_000,
  /** 健康检查超时 */
  HEALTH_CHECK_TIMEOUT: env.HEALTH_CHECK_TIMEOUT ?? 5_000,
} as const;

/**
 * 重试配置
 */
export const RETRY_CONFIG = {
  /** 默认重试次数 */
  DEFAULT_RETRIES: env.DEFAULT_RETRIES ?? 3,
  /** API请求重试次数 */
  API_RETRIES: env.API_RETRIES ?? 3,
  /** 文件上传重试次数 */
  UPLOAD_RETRIES: env.UPLOAD_RETRIES ?? 2,
  /** 重试延迟基数 (毫秒) */
  RETRY_DELAY_BASE: env.RETRY_DELAY_BASE ?? 1_000,
} as const;

/**
 * 速率限制配置
 */
export const RATE_LIMIT_CONFIG = {
  /** API请求速率限制 (每分钟) */
  API_REQUESTS_PER_MINUTE: env.API_REQUESTS_PER_MINUTE ?? 60,
  /** 文件上传速率限制 (每小时) */
  UPLOADS_PER_HOUR: env.UPLOADS_PER_HOUR ?? 10,
  /** 联系表单提交限制 (每小时) */
  CONTACT_FORMS_PER_HOUR: env.CONTACT_FORMS_PER_HOUR ?? 5,
} as const;

// ============================================================================
// 开发服务器配置
// ============================================================================

/**
 * 开发服务器端口配置
 */
export const DEV_SERVER_CONFIG = {
  /** 主应用端口 */
  MAIN_PORT: env.PORT ?? 3000,
  /** API服务端口 */
  API_PORT: env.API_PORT ?? 4000,
  /** 开发工具端口 - 替代魔法数字8888 */
  DEV_TOOLS_PORT: env.DEV_TOOLS_PORT ?? 8888,
  /** 测试服务器端口 - 替代魔法数字8900 */
  TEST_PORT: env.TEST_PORT ?? 8900,
  /** 性能监控端口 */
  MONITORING_PORT: env.MONITORING_PORT ?? 8888,
  /** API监控端口 */
  API_MONITORING_PORT: env.API_MONITORING_PORT ?? 8900,
} as const;

/**
 * 热重载和开发体验配置
 */
export const DEV_EXPERIENCE_CONFIG = {
  /** 热重载延迟 (毫秒) */
  HOT_RELOAD_DELAY: env.HOT_RELOAD_DELAY ?? 250,
  /** 文件监听防抖延迟 (毫秒) */
  FILE_WATCH_DEBOUNCE: env.FILE_WATCH_DEBOUNCE ?? 300,
  /** 开发工具刷新间隔 (毫秒) */
  DEV_TOOLS_REFRESH_INTERVAL: env.DEV_TOOLS_REFRESH_INTERVAL ?? 1_000,
} as const;

// ============================================================================
// 性能和缓存配置
// ============================================================================

/**
 * 缓存配置
 */
export const CACHE_CONFIG = {
  /** 静态资源缓存时间 (秒) */
  STATIC_CACHE_TTL: env.STATIC_CACHE_TTL ?? HOURS_PER_DAY * SECONDS_PER_HOUR,
  /** API响应缓存时间 (秒) */
  API_CACHE_TTL: env.API_CACHE_TTL ?? 5 * SECONDS_PER_MINUTE,
  /** 用户会话缓存时间 (秒) */
  SESSION_CACHE_TTL: env.SESSION_CACHE_TTL ?? SECONDS_PER_HOUR,
  /** 国际化缓存时间 (秒) */
  I18N_CACHE_TTL: env.I18N_CACHE_TTL ?? SECONDS_PER_HOUR / COUNT_PAIR,
} as const;

/**
 * 内存限制配置 (字节)
 */
export const MEMORY_CONFIG = {
  /** 文件上传大小限制 */
  MAX_UPLOAD_SIZE: env.MAX_UPLOAD_SIZE ?? 10 * 1024 * 1024, // 10MB
  /** 请求体大小限制 */
  MAX_REQUEST_SIZE: env.MAX_REQUEST_SIZE ?? 1024 * 1024, // 1MB
  /** 缓存大小限制 */
  MAX_CACHE_SIZE: env.MAX_CACHE_SIZE ?? 100 * 1024 * 1024, // 100MB
  /** 日志文件大小限制 */
  MAX_LOG_SIZE: env.MAX_LOG_SIZE ?? 50 * 1024 * 1024, // 50MB
} as const;

// ============================================================================
// 监控和诊断配置
// ============================================================================

/**
 * 性能监控配置
 */
export const MONITORING_CONFIG = {
  /** 性能指标采样率 (0-1) */
  PERFORMANCE_SAMPLE_RATE: env.PERFORMANCE_SAMPLE_RATE ?? MAGIC_0_1,
  /** 错误采样率 (0-1) */
  ERROR_SAMPLE_RATE: env.ERROR_SAMPLE_RATE ?? ONE,
  /** 监控数据上报间隔 (毫秒) */
  MONITORING_INTERVAL: env.MONITORING_INTERVAL ?? THIRTY_SECONDS_MS,
  /** 健康检查间隔 (毫秒) */
  HEALTH_CHECK_INTERVAL: env.HEALTH_CHECK_INTERVAL ?? MINUTE_MS,
} as const;

/**
 * Web Vitals阈值配置
 */
export const WEB_VITALS_CONFIG = {
  /** LCP良好阈值 (毫秒) */
  LCP_GOOD_THRESHOLD: env.LCP_GOOD_THRESHOLD ?? WEB_VITALS_THRESHOLDS.LCP.GOOD,
  /** FID良好阈值 (毫秒) */
  FID_GOOD_THRESHOLD: env.FID_GOOD_THRESHOLD ?? WEB_VITALS_THRESHOLDS.FID.GOOD,
  /** CLS良好阈值 */
  CLS_GOOD_THRESHOLD: env.CLS_GOOD_THRESHOLD ?? WEB_VITALS_THRESHOLDS.CLS.GOOD,
  /** TTFB良好阈值 (毫秒) */
  TTFB_GOOD_THRESHOLD:
    env.TTFB_GOOD_THRESHOLD ?? WEB_VITALS_THRESHOLDS.TTFB.GOOD,
} as const;

// ============================================================================
// 安全配置
// ============================================================================

/**
 * 安全相关配置
 */
export const SECURITY_CONFIG = {
  /** JWT过期时间 (秒) */
  JWT_EXPIRES_IN: env.JWT_EXPIRES_IN ?? SECONDS_PER_HOUR,
  /** 密码哈希轮数 */
  BCRYPT_ROUNDS: env.BCRYPT_ROUNDS ?? 12,
  /** CSRF令牌长度 */
  CSRF_TOKEN_LENGTH: env.CSRF_TOKEN_LENGTH ?? 32,
  /** 会话超时时间 (秒) */
  SESSION_TIMEOUT: env.SESSION_TIMEOUT ?? SECONDS_PER_HOUR / COUNT_PAIR,
} as const;

// ============================================================================
// 功能开关配置
// ============================================================================

/**
 * 功能开关配置
 */
export const FEATURE_FLAGS = {
  /** 启用性能监控 */
  ENABLE_PERFORMANCE_MONITORING: env.ENABLE_PERFORMANCE_MONITORING ?? true,
  /** 启用错误追踪 */
  ENABLE_ERROR_TRACKING: env.ENABLE_ERROR_TRACKING ?? true,
  /** 启用A/B测试 */
  ENABLE_AB_TESTING: env.ENABLE_AB_TESTING ?? false,
  /** 启用调试模式 */
  ENABLE_DEBUG_MODE: env.NODE_ENV === 'development',
} as const;

// ============================================================================
// 类型导出
// ============================================================================

export type NetworkConfig = typeof NETWORK_CONFIG;
export type RetryConfig = typeof RETRY_CONFIG;
export type RateLimitConfig = typeof RATE_LIMIT_CONFIG;
export type DevServerConfig = typeof DEV_SERVER_CONFIG;
export type DevExperienceConfig = typeof DEV_EXPERIENCE_CONFIG;
export type CacheConfig = typeof CACHE_CONFIG;
export type MemoryConfig = typeof MEMORY_CONFIG;
export type MonitoringConfig = typeof MONITORING_CONFIG;
export type WebVitalsConfig = typeof WEB_VITALS_CONFIG;
export type SecurityConfig = typeof SECURITY_CONFIG;
export type FeatureFlags = typeof FEATURE_FLAGS;

/**
 * 完整应用配置类型
 */
export interface AppConfig {
  network: NetworkConfig;
  retry: RetryConfig;
  rateLimit: RateLimitConfig;
  devServer: DevServerConfig;
  devExperience: DevExperienceConfig;
  cache: CacheConfig;
  memory: MemoryConfig;
  monitoring: MonitoringConfig;
  webVitals: WebVitalsConfig;
  security: SecurityConfig;
  features: FeatureFlags;
}

/**
 * 获取完整应用配置
 */
export const getAppConfig = (): AppConfig => ({
  network: NETWORK_CONFIG,
  retry: RETRY_CONFIG,
  rateLimit: RATE_LIMIT_CONFIG,
  devServer: DEV_SERVER_CONFIG,
  devExperience: DEV_EXPERIENCE_CONFIG,
  cache: CACHE_CONFIG,
  memory: MEMORY_CONFIG,
  monitoring: MONITORING_CONFIG,
  webVitals: WEB_VITALS_CONFIG,
  security: SECURITY_CONFIG,
  features: FEATURE_FLAGS,
});

/**
 * 配置验证函数
 */
export const validateAppConfig = (config: AppConfig): boolean => {
  // 基本验证逻辑 - 确保数值类型比较
  return (
    Number(config.network.API_TIMEOUT) > 0 &&
    Number(config.retry.DEFAULT_RETRIES) >= 0 &&
    Number(config.devServer.MAIN_PORT) > 0 &&
    Number(config.cache.STATIC_CACHE_TTL) > 0 &&
    Number(config.memory.MAX_UPLOAD_SIZE) > 0 &&
    Number(config.monitoring.PERFORMANCE_SAMPLE_RATE) >= 0 &&
    Number(config.monitoring.PERFORMANCE_SAMPLE_RATE) <= 1 &&
    Number(config.webVitals.LCP_GOOD_THRESHOLD) > 0 &&
    Number(config.security.JWT_EXPIRES_IN) > 0
  );
};
