/**
 * 安全工具主入口文件
 * Main security utilities entry point
 *
 * 这个文件作为所有安全模块的统一入口，重新导出所有安全相关功能
 * This file serves as a unified entry point for all security modules
 */

// 重新导出所有安全模块的功能
// Re-export all security module functions

// 输入验证和清理
export {
  isValidEmail,
  isValidUrl,
  sanitizeFilePath,
  validateInputLength,
  validateCharacters,
  isValidPhoneNumber,
  sanitizeHtml,
  isValidJson,
  sanitizeForDatabase,
} from '@/lib/security-validation';

// 令牌生成
export {
  generateSecureToken,
  generateUUID,
  generateApiKey,
  generateSessionToken,
  generateCsrfToken,
  generateNonce,
  generateOTP,
  generateVerificationCode,
  isValidToken,
  isValidUUID,
  generateSalt,
  createTokenWithExpiry,
  isTokenExpired,
  type TokenWithExpiry,
} from '@/lib/security-tokens';

// 速率限制
export {
  rateLimit,
  getRateLimitStatus,
  cleanupRateLimit,
  resetRateLimit,
  getActiveLimits,
  rateLimitWithTier,
  createRateLimitTier,
  slidingWindowRateLimit,
  cleanupSlidingWindow,
  type RateLimitTier,
} from '@/lib/security-rate-limit';

// 文件上传验证
export {
  validateFileUpload,
  validateFileSignature,
  sanitizeFileName,
  generateSafeFileName,
  isImageFile,
  isDocumentFile,
  getFileCategory,
  validateMultipleFiles,
  ALLOWED_FILE_TYPES,
  type FileValidationResult,
} from '@/lib/security-file-upload';

// 加密和密码哈希
export {
  hashPassword,
  verifyPassword,
  generateSalt as generateCryptoSalt,
  sha256Hash,
  sha512Hash,
  generateHMAC,
  verifyHMAC,
  encryptData,
  decryptData,
  generateEncryptionKey,
  exportKey,
  importKey,
  constantTimeCompare,
} from '@/lib/security-crypto';

// 安全头部和配置
export {
  getApiSecurityHeaders,
  getWebSecurityHeaders,
  getCORSHeaders,
  verifyTurnstileToken,
  checkSecurityConfig,
  getSecurityMiddlewareHeaders,
  validateSecurityHeaders,
  generateSecurityReport,
  type SecurityMiddlewareConfig,
} from '@/lib/security-headers';

export {
  generateCSP,
  getSecurityHeaders,
  SecurityUtils,
  type SecurityHeader,
} from '@/config/security';

// 向后兼容性：保留一些常用的直接导出
// Backward compatibility: keep some commonly used direct exports

/**
 * @deprecated 请使用 security-validation 模块中的 sanitizeInput
 * @deprecated Please use sanitizeInput from security-validation module
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
