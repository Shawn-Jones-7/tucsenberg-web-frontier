/**
 * TypeScript declarations for env.mjs
 * This file provides type definitions for the environment configuration
 */

interface EnvVariables {
  // Database
  DATABASE_URL?: string;

  // Authentication
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;

  // Email Service (Resend)
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;

  // Data Storage (Airtable)
  AIRTABLE_API_KEY?: string;
  AIRTABLE_BASE_ID?: string;
  AIRTABLE_TABLE_NAME?: string;

  // Bot Protection (Cloudflare Turnstile)
  TURNSTILE_SECRET_KEY?: string;

  // AI Translation Service (Lingo.dev)
  LINGO_API_KEY?: string;
  LINGO_PROJECT_ID?: string;
  LINGO_DEV_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GROQ_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  MISTRAL_API_KEY?: string;

  // WhatsApp Business API
  WHATSAPP_ACCESS_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_BUSINESS_ACCOUNT_ID?: string;
  WHATSAPP_WEBHOOK_VERIFY_TOKEN?: string;

  // Performance Monitoring (Sentry)
  SENTRY_DSN?: string;
  SENTRY_ORG?: string;
  SENTRY_PROJECT?: string;
  SENTRY_AUTH_TOKEN?: string;

  // Analytics & Monitoring
  VERCEL_ANALYTICS_ID?: string;
  GOOGLE_ANALYTICS_ID?: string;

  // Security & CSP
  CSP_REPORT_URI?: string;
  SECURITY_HEADERS_ENABLED?: string;

  // Development & Testing
  NODE_ENV: 'development' | 'production' | 'test';
  VERCEL_ENV?: 'development' | 'preview' | 'production';
  VERCEL_URL?: string;
  PORT?: string;

  // API Configuration
  API_TIMEOUT?: string;
  UPLOAD_TIMEOUT?: string;
  WEBSOCKET_TIMEOUT?: string;
  HEALTH_CHECK_TIMEOUT?: string;

  // Retry Configuration
  DEFAULT_RETRIES?: string;
  API_RETRIES?: string;
  UPLOAD_RETRIES?: string;
  RETRY_DELAY_BASE?: string;

  // Rate Limiting
  API_REQUESTS_PER_MINUTE?: string;
  UPLOADS_PER_HOUR?: string;
  CONTACT_FORMS_PER_HOUR?: string;

  // Port Configuration
  API_PORT?: string;
  DEV_TOOLS_PORT?: string;
  TEST_PORT?: string;
  MONITORING_PORT?: string;
  API_MONITORING_PORT?: string;

  // Development Configuration
  HOT_RELOAD_DELAY?: string;
  FILE_WATCH_DEBOUNCE?: string;
  DEV_TOOLS_REFRESH_INTERVAL?: string;

  // Cache Configuration
  STATIC_CACHE_TTL?: string;
  API_CACHE_TTL?: string;
  SESSION_CACHE_TTL?: string;
  I18N_CACHE_TTL?: string;

  // Size Limits
  MAX_UPLOAD_SIZE?: string;
  MAX_REQUEST_SIZE?: string;
  MAX_CACHE_SIZE?: string;
  MAX_LOG_SIZE?: string;

  // Monitoring Configuration
  PERFORMANCE_SAMPLE_RATE?: string;
  ERROR_SAMPLE_RATE?: string;
  MONITORING_INTERVAL?: string;
  HEALTH_CHECK_INTERVAL?: string;

  // Performance Thresholds
  LCP_GOOD_THRESHOLD?: string;
  FID_GOOD_THRESHOLD?: string;
  CLS_GOOD_THRESHOLD?: string;
  TTFB_GOOD_THRESHOLD?: string;

  // Security Configuration
  JWT_EXPIRES_IN?: string;
  BCRYPT_ROUNDS?: string;
  CSRF_TOKEN_LENGTH?: string;
  SESSION_TIMEOUT?: string;

  // Feature Flags
  ENABLE_PERFORMANCE_MONITORING?: string;
  ENABLE_ERROR_TRACKING?: string;
  ENABLE_AB_TESTING?: string;

  // Public environment variables (prefixed with NEXT_PUBLIC_)
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID?: string;
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?: string;
  NEXT_PUBLIC_APP_ENV?: 'development' | 'staging' | 'production';
  NEXT_PUBLIC_API_BASE_URL?: string;
  NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING?: string;
  NEXT_PUBLIC_ENABLE_DEBUG_MODE?: string;
  NEXT_PUBLIC_TEST_MODE?: string;
  NEXT_PUBLIC_SECURITY_MODE?: string;
}

// Global module declarations for all possible import paths
declare module '*/env.mjs' {
  export const env: EnvVariables;
  export default env;
}
