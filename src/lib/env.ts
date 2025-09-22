/**
 * 环境变量代理模块
 *
 * 解决架构违规问题：避免src目录内文件直接导入根目录的env.mjs
 * 提供统一的环境变量访问接口
 */

import { env } from '@/../env.mjs';

// 重新导出环境变量，保持类型安全
export { env };

// 提供类型安全的环境变量访问函数
export function getEnvVar(key: keyof typeof env): string | boolean | undefined {
  // eslint-disable-next-line security/detect-object-injection
  return env[key];
}

// 提供必需环境变量检查（仅用于字符串类型的环境变量）
export function requireEnvVar(key: keyof typeof env): string {
  // eslint-disable-next-line security/detect-object-injection
  const value = env[key];
  if (!value || typeof value === 'boolean') {
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
