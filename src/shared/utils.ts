/**
 * 共享工具函数库
 * 提供项目中常用的工具函数，包括日期格式化、邮箱验证等
 */

import { ZERO } from '@/constants';
import { EMAIL_VALIDATION } from '@/constants/react-scan';

/**
 * 格式化日期为ISO字符串格式 (YYYY-MM-DD)
 * @param date - 要格式化的日期对象
 * @returns ISO格式的日期字符串
 * @example
 * ```typescript
 * const today = new Date();
 * const formatted = formatDate(today); // "2025-07-29"
 * ```
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

/**
 * 验证邮箱地址格式是否正确
 * 使用标准的邮箱正则表达式进行验证
 * @param email - 要验证的邮箱地址
 * @returns 是否为有效邮箱格式
 * @example
 * ```typescript
 * validateEmail("user@example.com"); // true
 * validateEmail("invalid-email");    // false
 * validateEmail("test@domain.co.uk"); // true
 * ```
 */
/**
 * 验证邮箱基本格式
 */
function validateEmailBasicFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // 检查是否包含空格或连续点号
  return !(email.includes(' ') || email.includes('..'));
}

/**
 * 验证邮箱本地部分（@前面）
 */
function validateLocalPart(localPart: string): boolean {
  if (
    !localPart ||
    localPart.length === ZERO ||
    localPart.length > EMAIL_VALIDATION.LOCAL_PART_MAX_LENGTH
  ) {
    return false;
  }

  // 检查不能以点号开头或结尾
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }

  // 基本字符检查
  const validLocalChars = /^[a-zA-Z0-9._+-]+$/;
  return validLocalChars.test(localPart);
}

/**
 * 验证邮箱域名部分（@后面）
 */
function validateDomainPart(domainPart: string): boolean {
  if (
    !domainPart ||
    domainPart.length === ZERO ||
    domainPart.length > EMAIL_VALIDATION.DOMAIN_PART_MAX_LENGTH
  ) {
    return false;
  }

  // 检查不能以点号开头或结尾，且必须包含点号
  if (
    domainPart.startsWith('.') ||
    domainPart.endsWith('.') ||
    !domainPart.includes('.')
  ) {
    return false;
  }

  // 基本字符检查
  const validDomainChars = /^[a-zA-Z0-9.-]+$/;
  return validDomainChars.test(domainPart);
}

export function validateEmail(email: string): boolean {
  // 基本格式检查
  if (!validateEmailBasicFormat(email)) {
    return false;
  }

  // 分割邮箱地址
  const parts = email.split('@');
  if (parts.length !== EMAIL_VALIDATION.EMAIL_PARTS_COUNT) {
    return false;
  }

  const [localPart, domainPart] = parts;

  // 验证本地部分和域名部分
  return (
    validateLocalPart(localPart || '') && validateDomainPart(domainPart || '')
  );
}
