/**
 * 环境变量代理模块
 *
 * 解决架构违规问题：避免src目录内文件直接导入根目录的env.mjs
 * 提供统一的环境变量访问接口
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// 创建类型安全的环境变量配置
export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // Database
    DATABASE_URL: z.string().url().optional(),

    // Authentication
    NEXTAUTH_SECRET: z.string().min(1).optional(),
    NEXTAUTH_URL: z.string().url().optional(),

    // Email Service (Resend)
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().email().optional(),
    EMAIL_REPLY_TO: z.string().email().optional(),

    // Data Storage (Airtable)
    AIRTABLE_API_KEY: z.string().min(1).optional(),
    AIRTABLE_BASE_ID: z.string().min(1).optional(),
    AIRTABLE_TABLE_NAME: z.string().min(1).optional(),

    // Bot Protection (Cloudflare Turnstile)
    TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
    TURNSTILE_ALLOWED_HOSTS: z.string().optional(),
    TURNSTILE_EXPECTED_ACTION: z.string().optional(),

    // AI Translation Service (Lingo.dev)
    LINGO_DEV_API_KEY: z.string().min(1).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
    GROQ_API_KEY: z.string().min(1).optional(),
    GOOGLE_API_KEY: z.string().min(1).optional(),
    MISTRAL_API_KEY: z.string().min(1).optional(),

    // WhatsApp Business API
    WHATSAPP_ACCESS_TOKEN: z.string().min(1).optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),
    WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().min(1).optional(),
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().min(1).optional(),
    WHATSAPP_APP_SECRET: z.string().min(1).optional(),

    // Vercel
    VERCEL_URL: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

    // Node Environment
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    // CI/CD
    CI: z.string().optional(),
    GITHUB_TOKEN: z.string().optional(),

    // Security
    SECURITY_HEADERS_ENABLED: z
      .string()
      .default('true')
      .transform((val) => val === 'true'),
    CSP_REPORT_URI: z.string().url().optional(),

    // Network & API Configuration
    API_TIMEOUT: z.coerce.number().optional(),
    UPLOAD_TIMEOUT: z.coerce.number().optional(),
    WEBSOCKET_TIMEOUT: z.coerce.number().optional(),
    HEALTH_CHECK_TIMEOUT: z.coerce.number().optional(),

    // Retry Configuration
    DEFAULT_RETRIES: z.coerce.number().optional(),
    API_RETRIES: z.coerce.number().optional(),
    UPLOAD_RETRIES: z.coerce.number().optional(),
    RETRY_DELAY_BASE: z.coerce.number().optional(),

    // Rate Limiting
    API_REQUESTS_PER_MINUTE: z.coerce.number().optional(),
    UPLOADS_PER_HOUR: z.coerce.number().optional(),
    CONTACT_FORMS_PER_HOUR: z.coerce.number().optional(),

    // Development Server Ports
    PORT: z.coerce.number().optional(),
    API_PORT: z.coerce.number().optional(),
    DEV_TOOLS_PORT: z.coerce.number().optional(),
    TEST_PORT: z.coerce.number().optional(),
    MONITORING_PORT: z.coerce.number().optional(),
    API_MONITORING_PORT: z.coerce.number().optional(),

    // Development Experience
    HOT_RELOAD_DELAY: z.coerce.number().optional(),
    FILE_WATCH_DEBOUNCE: z.coerce.number().optional(),
    DEV_TOOLS_REFRESH_INTERVAL: z.coerce.number().optional(),

    // Cache Configuration
    STATIC_CACHE_TTL: z.coerce.number().optional(),
    API_CACHE_TTL: z.coerce.number().optional(),
    SESSION_CACHE_TTL: z.coerce.number().optional(),
    I18N_CACHE_TTL: z.coerce.number().optional(),

    // Memory Limits
    MAX_UPLOAD_SIZE: z.coerce.number().optional(),
    MAX_REQUEST_SIZE: z.coerce.number().optional(),
    MAX_CACHE_SIZE: z.coerce.number().optional(),
    MAX_LOG_SIZE: z.coerce.number().optional(),

    // Performance Monitoring
    PERFORMANCE_SAMPLE_RATE: z.coerce.number().optional(),
    ERROR_SAMPLE_RATE: z.coerce.number().optional(),
    MONITORING_INTERVAL: z.coerce.number().optional(),
    HEALTH_CHECK_INTERVAL: z.coerce.number().optional(),

    // Web Vitals Thresholds
    LCP_GOOD_THRESHOLD: z.coerce.number().optional(),
    FID_GOOD_THRESHOLD: z.coerce.number().optional(),
    CLS_GOOD_THRESHOLD: z.coerce.number().optional(),
    TTFB_GOOD_THRESHOLD: z.coerce.number().optional(),

    // Security Configuration
    JWT_EXPIRES_IN: z.coerce.number().optional(),
    BCRYPT_ROUNDS: z.coerce.number().optional(),
    CSRF_TOKEN_LENGTH: z.coerce.number().optional(),
    SESSION_TIMEOUT: z.coerce.number().optional(),

    // Feature Flags
    ENABLE_PERFORMANCE_MONITORING: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    ENABLE_ERROR_TRACKING: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    ENABLE_AB_TESTING: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    ENABLE_WHATSAPP_CHAT: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Base Configuration
    NEXT_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_APP_NAME: z.string().default('Tucsenberg Web Frontier'),
    NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),

    // Analytics & Monitoring
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

    // Bot Protection (Cloudflare Turnstile Public Key)
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    NEXT_PUBLIC_TURNSTILE_ACTION: z.string().optional(),
    NEXT_PUBLIC_TURNSTILE_BYPASS: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),

    // Feature Flags
    NEXT_PUBLIC_ENABLE_ANALYTICS: z
      .string()
      .default('true')
      .transform((val) => val === 'true'),
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: z
      .string()
      .default('true')
      .transform((val) => val === 'true'),
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: z
      .string()
      .default('true')
      .transform((val) => val === 'true'),

    // Development Tools
    NEXT_PUBLIC_DISABLE_REACT_SCAN: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),
    NEXT_PUBLIC_DISABLE_DEV_TOOLS: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),
    NEXT_PUBLIC_TEST_MODE: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),

    // Internationalization
    NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default('en'),
    NEXT_PUBLIC_SUPPORTED_LOCALES: z.string().default('en,zh'),

    // Security
    NEXT_PUBLIC_CSP_NONCE: z.string().optional(),
    NEXT_PUBLIC_SECURITY_MODE: z
      .enum(['strict', 'moderate', 'relaxed'])
      .default('strict'),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    AIRTABLE_TABLE_NAME: process.env.AIRTABLE_TABLE_NAME,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    TURNSTILE_ALLOWED_HOSTS: process.env.TURNSTILE_ALLOWED_HOSTS,
    TURNSTILE_EXPECTED_ACTION: process.env.TURNSTILE_EXPECTED_ACTION,
    LINGO_DEV_API_KEY: process.env.LINGO_DEV_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    CI: process.env.CI,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    SECURITY_HEADERS_ENABLED: process.env.SECURITY_HEADERS_ENABLED,
    CSP_REPORT_URI: process.env.CSP_REPORT_URI,

    // Network & API Configuration
    API_TIMEOUT: process.env.API_TIMEOUT,
    UPLOAD_TIMEOUT: process.env.UPLOAD_TIMEOUT,
    WEBSOCKET_TIMEOUT: process.env.WEBSOCKET_TIMEOUT,
    HEALTH_CHECK_TIMEOUT: process.env.HEALTH_CHECK_TIMEOUT,

    // Retry Configuration
    DEFAULT_RETRIES: process.env.DEFAULT_RETRIES,
    API_RETRIES: process.env.API_RETRIES,
    UPLOAD_RETRIES: process.env.UPLOAD_RETRIES,
    RETRY_DELAY_BASE: process.env.RETRY_DELAY_BASE,

    // Rate Limiting
    API_REQUESTS_PER_MINUTE: process.env.API_REQUESTS_PER_MINUTE,
    UPLOADS_PER_HOUR: process.env.UPLOADS_PER_HOUR,
    CONTACT_FORMS_PER_HOUR: process.env.CONTACT_FORMS_PER_HOUR,

    // Development Server Ports
    PORT: process.env.PORT,
    API_PORT: process.env.API_PORT,
    DEV_TOOLS_PORT: process.env.DEV_TOOLS_PORT,
    TEST_PORT: process.env.TEST_PORT,
    MONITORING_PORT: process.env.MONITORING_PORT,
    API_MONITORING_PORT: process.env.API_MONITORING_PORT,

    // Development Experience
    HOT_RELOAD_DELAY: process.env.HOT_RELOAD_DELAY,
    FILE_WATCH_DEBOUNCE: process.env.FILE_WATCH_DEBOUNCE,
    DEV_TOOLS_REFRESH_INTERVAL: process.env.DEV_TOOLS_REFRESH_INTERVAL,

    // Cache Configuration
    STATIC_CACHE_TTL: process.env.STATIC_CACHE_TTL,
    API_CACHE_TTL: process.env.API_CACHE_TTL,
    SESSION_CACHE_TTL: process.env.SESSION_CACHE_TTL,
    I18N_CACHE_TTL: process.env.I18N_CACHE_TTL,

    // Memory Limits
    MAX_UPLOAD_SIZE: process.env.MAX_UPLOAD_SIZE,
    MAX_REQUEST_SIZE: process.env.MAX_REQUEST_SIZE,
    MAX_CACHE_SIZE: process.env.MAX_CACHE_SIZE,
    MAX_LOG_SIZE: process.env.MAX_LOG_SIZE,

    // Performance Monitoring
    PERFORMANCE_SAMPLE_RATE: process.env.PERFORMANCE_SAMPLE_RATE,
    ERROR_SAMPLE_RATE: process.env.ERROR_SAMPLE_RATE,
    MONITORING_INTERVAL: process.env.MONITORING_INTERVAL,
    HEALTH_CHECK_INTERVAL: process.env.HEALTH_CHECK_INTERVAL,

    // Web Vitals Thresholds
    LCP_GOOD_THRESHOLD: process.env.LCP_GOOD_THRESHOLD,
    FID_GOOD_THRESHOLD: process.env.FID_GOOD_THRESHOLD,
    CLS_GOOD_THRESHOLD: process.env.CLS_GOOD_THRESHOLD,
    TTFB_GOOD_THRESHOLD: process.env.TTFB_GOOD_THRESHOLD,

    // Security Configuration
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
    CSRF_TOKEN_LENGTH: process.env.CSRF_TOKEN_LENGTH,
    SESSION_TIMEOUT: process.env.SESSION_TIMEOUT,

    // Feature Flags
    ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING,
    ENABLE_ERROR_TRACKING: process.env.ENABLE_ERROR_TRACKING,
    ENABLE_AB_TESTING: process.env.ENABLE_AB_TESTING,
    ENABLE_WHATSAPP_CHAT: process.env.ENABLE_WHATSAPP_CHAT,

    // Client
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID:
      process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_TURNSTILE_ACTION: process.env.NEXT_PUBLIC_TURNSTILE_ACTION,
    NEXT_PUBLIC_TURNSTILE_BYPASS: process.env.NEXT_PUBLIC_TURNSTILE_BYPASS,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING:
      process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING,
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING:
      process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING,
    NEXT_PUBLIC_DISABLE_REACT_SCAN: process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN,
    NEXT_PUBLIC_DISABLE_DEV_TOOLS: process.env.NEXT_PUBLIC_DISABLE_DEV_TOOLS,
    NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_SUPPORTED_LOCALES: process.env.NEXT_PUBLIC_SUPPORTED_LOCALES,
    NEXT_PUBLIC_CSP_NONCE: process.env.NEXT_PUBLIC_CSP_NONCE,
    NEXT_PUBLIC_SECURITY_MODE: process.env.NEXT_PUBLIC_SECURITY_MODE,
  },

  /**
   * Run `build` or `dev` with SKIP_ENV_VALIDATION to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),

  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

// 提供类型安全的环境变量访问函数
export function getEnvVar(
  key: keyof typeof env,
): string | boolean | number | undefined {
  // eslint-disable-next-line security/detect-object-injection
  return env[key];
}

// 提供必需环境变量检查（仅用于字符串类型的环境变量）
export function requireEnvVar(key: keyof typeof env): string {
  // eslint-disable-next-line security/detect-object-injection
  const value = env[key];
  if (!value || typeof value === 'boolean' || typeof value === 'number') {
    throw new Error(
      `Required environment variable ${key} is not set or is not a string`,
    );
  }
  return value;
}

// 常用环境变量的便捷访问器
export const envUtils = {
  isDevelopment: () => env.NODE_ENV === 'development',
  isProduction: () => env.NODE_ENV === 'production',
  isTest: () => env.NODE_ENV === 'test',

  // WhatsApp相关
  getWhatsAppToken: () => requireEnvVar('WHATSAPP_ACCESS_TOKEN'),
  getWhatsAppPhoneId: () => requireEnvVar('WHATSAPP_PHONE_NUMBER_ID'),

  // Turnstile相关
  getTurnstileSecret: () => requireEnvVar('TURNSTILE_SECRET_KEY'),
  getTurnstileSiteKey: () => requireEnvVar('NEXT_PUBLIC_TURNSTILE_SITE_KEY'),

  // Resend相关
  getResendApiKey: () => requireEnvVar('RESEND_API_KEY'),

  // Airtable相关
  getAirtableToken: () => requireEnvVar('AIRTABLE_API_KEY'),
  getAirtableBaseId: () => requireEnvVar('AIRTABLE_BASE_ID'),
} as const;
