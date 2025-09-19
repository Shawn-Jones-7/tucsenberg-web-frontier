import { ANIMATION_DURATION_VERY_SLOW, ZERO } from '@/constants';
import { INPUT_VALIDATION_CONSTANTS } from '@/constants/security-constants';

/**
 * 安全验证工具
 * Security validation utilities
 */

/**
 * Security constants for validation
 */
const VALIDATION_CONSTANTS = {
  // Email validation
  MAX_EMAIL_LENGTH: INPUT_VALIDATION_CONSTANTS.EMAIL_MAX_LENGTH,
} as const;

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (
    emailRegex.test(email) &&
    email.length <= VALIDATION_CONSTANTS.MAX_EMAIL_LENGTH
  );
}

/**
 * Validate URL format and protocol
 */
export function isValidUrl(
  url: string,
  allowedProtocols: string[] = ['http:', 'https:'],
): boolean {
  try {
    const urlObj = new URL(url);
    return allowedProtocols.includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate and sanitize file path to prevent path traversal attacks
 */
export function sanitizeFilePath(filePath: string): string {
  if (typeof filePath !== 'string') {
    return '';
  }

  // Remove dangerous path components
  return filePath
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .replace(/^\/+/, '') // Remove leading slashes
    .trim();
}

/**
 * Validate input length
 */
export function validateInputLength(
  input: string,
  minLength: number = ZERO,
  maxLength: number = ANIMATION_DURATION_VERY_SLOW,
): { valid: boolean; error?: string } {
  if (typeof input !== 'string') {
    return { valid: false, error: 'Input must be a string' };
  }

  if (input.length < minLength) {
    return {
      valid: false,
      error: `Input must be at least ${minLength} characters`,
    };
  }

  if (input.length > maxLength) {
    return {
      valid: false,
      error: `Input must be no more than ${maxLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Check if string contains only allowed characters
 */
export function validateCharacters(
  input: string,
  allowedPattern: RegExp,
): { valid: boolean; error?: string } {
  if (typeof input !== 'string') {
    return { valid: false, error: 'Input must be a string' };
  }

  if (!allowedPattern.test(input)) {
    return { valid: false, error: 'Input contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // International phone number validation
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  return phoneRegex.test(cleanPhone);
}

/**
 * Validate and sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  // 移除特定标签（非正则实现，避免不安全正则）
  const stripTag = (input: string, tag: 'script' | 'iframe'): string => {
    let out = input;
    let lower = out.toLowerCase();
    let start = lower.indexOf(`<${tag}`);
    while (start !== -1) {
      const end = lower.indexOf(`</${tag}>`, start);
      const endIdx = end === -1 ? out.length : end + tag.length + 3; // include closing tag
      out = out.slice(0, start) + out.slice(endIdx);
      lower = out.toLowerCase();
      start = lower.indexOf(`<${tag}`);
    }
    return out;
  };

  let sanitized = stripTag(html, 'script');
  sanitized = stripTag(sanitized, 'iframe');
  sanitized = sanitized
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // 移除事件处理属性
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
  return sanitized;
}

/**
 * Validate JSON string
 */
export function isValidJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate and sanitize user input for database queries
 */
export function sanitizeForDatabase(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Basic SQL injection prevention
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .trim();
}
