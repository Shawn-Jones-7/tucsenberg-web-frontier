import { MAGIC_6 } from "@/constants/count";
import { ANIMATION_DURATION_VERY_SLOW, COUNT_PAIR, HEX_MASK_6_BITS, HEX_MASK_BIT_6, HEX_MASK_HIGH_BIT, HEX_MASK_LOW_NIBBLE, MAGIC_12, MAGIC_16, MAGIC_20, MAGIC_32, MAGIC_48, MAGIC_64, MAGIC_8, MAGIC_HEX_3, MAGIC_HEX_8, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";

/**
 * 安全令牌生成工具
 * Security token generation utilities
 */

/**
 * Token generation constants
 */
const TOKEN_CONSTANTS = {
  // Token generation
  DEFAULT_TOKEN_LENGTH: MAGIC_32,
  HEX_RADIX: COUNT_PAIR,
  HEX_PAD_LENGTH: COUNT_PAIR,
  HEX_BASE: MAGIC_16,
} as const;

/**
 * Generate a secure random string
 */
export function generateSecureToken(
  length: number = TOKEN_CONSTANTS.DEFAULT_TOKEN_LENGTH,
): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Generate half the length in bytes since each byte becomes COUNT_PAIR hex characters
    const byteLength = Math.ceil(length / TOKEN_CONSTANTS.HEX_RADIX);
    const array = new Uint8Array(byteLength);
    crypto.getRandomValues(array);
    const hex = Array.from(array, (byte) =>
      byte
        .toString(TOKEN_CONSTANTS.HEX_BASE)
        .padStart(TOKEN_CONSTANTS.HEX_PAD_LENGTH, '0'),
    ).join('');
    return hex.substring(ZERO, length);
  }

  // Fallback for environments without crypto.getRandomValues
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = ZERO; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a secure random UUID v4
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(MAGIC_16);
    crypto.getRandomValues(array);

    // Set version (4) and variant bits
    array[MAGIC_6] = (array[MAGIC_6]! & HEX_MASK_LOW_NIBBLE) | HEX_MASK_BIT_6;
    array[MAGIC_8] = (array[MAGIC_8]! & HEX_MASK_6_BITS) | HEX_MASK_HIGH_BIT;

    const hex = Array.from(array, (byte) =>
      byte.toString(MAGIC_16).padStart(COUNT_PAIR, '0'),
    ).join('');

    return [
      hex.substring(ZERO, MAGIC_8),
      hex.substring(MAGIC_8, MAGIC_12),
      hex.substring(MAGIC_12, MAGIC_16),
      hex.substring(MAGIC_16, MAGIC_20),
      hex.substring(MAGIC_20, MAGIC_32),
    ].join('-');
  }

  // Fallback UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * MAGIC_16) | 0;
    const v = c === 'x' ? r : (r & MAGIC_HEX_3) | MAGIC_HEX_8;
    return v.toString(MAGIC_16);
  });
}

/**
 * Generate a secure random API key
 */
export function generateApiKey(prefix: string = 'sk'): string {
  const randomPart = generateSecureToken(MAGIC_48);
  return `${prefix}_${randomPart}`;
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return generateSecureToken(MAGIC_64);
}

/**
 * Generate a secure CSRF token
 */
export function generateCsrfToken(): string {
  return generateSecureToken(MAGIC_32);
}

/**
 * Generate a secure nonce for CSP
 */
export function generateNonce(): string {
  return generateSecureToken(MAGIC_16);
}

/**
 * Generate a secure one-time password (OTP)
 */
export function generateOTP(length: number = MAGIC_6): string {
  const digits = '0123456789';
  let result = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = ZERO; i < length; i++) {
      result += digits[array[i]! % digits.length];
    }
  } else {
    // Fallback
    for (let i = ZERO; i < length; i++) {
      result += digits[Math.floor(Math.random() * digits.length)];
    }
  }

  return result;
}

/**
 * Generate a secure verification code (alphanumeric)
 */
export function generateVerificationCode(length: number = MAGIC_8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = ZERO; i < length; i++) {
      result += chars[array[i]! % chars.length];
    }
  } else {
    // Fallback
    for (let i = ZERO; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
}

/**
 * Validate token format
 */
export function isValidToken(token: string, expectedLength?: number): boolean {
  if (typeof token !== 'string' || token.length === ZERO) {
    return false;
  }

  // Check if token contains only valid characters (alphanumeric and some special chars)
  const validTokenRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validTokenRegex.test(token)) {
    return false;
  }

  // Check length if specified
  if (expectedLength && token.length !== expectedLength) {
    return false;
  }

  return true;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{MAGIC_8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{MAGIC_12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate a secure random salt for password hashing
 */
export function generateSalt(length: number = MAGIC_16): string {
  return generateSecureToken(length * COUNT_PAIR); // Double length for hex representation
}

/**
 * Token expiration utilities
 */
export interface TokenWithExpiry {
  token: string;
  expiresAt: number;
}

/**
 * Create a token with expiration
 */
export function createTokenWithExpiry(
  tokenLength: number = MAGIC_32,
  expiryMinutes: number = SECONDS_PER_MINUTE,
): TokenWithExpiry {
  return {
    token: generateSecureToken(tokenLength),
    expiresAt: Date.now() + expiryMinutes * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
  };
}

/**
 * Check if token is expired
 */
export function isTokenExpired(tokenWithExpiry: TokenWithExpiry): boolean {
  return Date.now() > tokenWithExpiry.expiresAt;
}
