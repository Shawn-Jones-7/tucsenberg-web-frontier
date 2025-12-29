import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

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
      .transform((val) => val === 'true')
      .default('true'),
    CSP_REPORT_URI: z.string().url().optional(),

    // Feature Flags
    ENABLE_WHATSAPP_CHAT: z
      .string()
      .transform((val) => val === 'true')
      .default('true'),
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

    // Feature Flags
    NEXT_PUBLIC_ENABLE_ANALYTICS: z
      .string()
      .transform((val) => val === 'true')
      .default('true'),
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: z
      .string()
      .transform((val) => val === 'true')
      .default('true'),
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: z
      .string()
      .transform((val) => val === 'true')
      .default('true'),
    NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional(),

    // Development Tools
    NEXT_PUBLIC_DISABLE_REACT_SCAN: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),
    NEXT_PUBLIC_DISABLE_DEV_TOOLS: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),
    NEXT_PUBLIC_TEST_MODE: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),

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
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    LINGO_DEV_API_KEY: process.env.LINGO_DEV_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    CI: process.env.CI,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    SECURITY_HEADERS_ENABLED: process.env.SECURITY_HEADERS_ENABLED,
    CSP_REPORT_URI: process.env.CSP_REPORT_URI,
    ENABLE_WHATSAPP_CHAT: process.env.ENABLE_WHATSAPP_CHAT,

    // Client
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID:
      process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING:
      process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING,
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING:
      process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
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
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
