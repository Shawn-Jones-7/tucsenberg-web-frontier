import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkSecurityConfig,
  getApiSecurityHeaders,
  getCORSHeaders,
  getSecurityMiddlewareHeaders,
  getWebSecurityHeaders,
  validateSecurityHeaders,
} from '../security-headers';

// Mock dependencies
vi.mock('@/lib/env', () => ({
  env: {
    TURNSTILE_SECRET_KEY: '',
    NEXT_PUBLIC_SECURITY_MODE: 'strict',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('security-headers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe('getApiSecurityHeaders', () => {
    it('should return security headers object', () => {
      const headers = getApiSecurityHeaders();

      expect(headers).toBeDefined();
      expect(typeof headers).toBe('object');
    });

    it('should include Content-Type-Options header', () => {
      const headers = getApiSecurityHeaders();

      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', () => {
      const headers = getApiSecurityHeaders();

      expect(headers['X-Frame-Options']).toBeDefined();
    });

    it('should accept optional nonce parameter', () => {
      const headers = getApiSecurityHeaders('test-nonce-123');

      expect(headers).toBeDefined();
    });
  });

  describe('getWebSecurityHeaders', () => {
    it('should return security headers for web responses', () => {
      const headers = getWebSecurityHeaders();

      expect(headers).toBeDefined();
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should accept optional nonce', () => {
      const headers = getWebSecurityHeaders('web-nonce');

      expect(headers).toBeDefined();
    });
  });

  describe('getCORSHeaders', () => {
    it('should return CORS headers without origin', () => {
      const headers = getCORSHeaders();

      expect(headers['Access-Control-Allow-Methods']).toBe(
        'GET, POST, PUT, DELETE, OPTIONS',
      );
      expect(headers['Access-Control-Allow-Headers']).toBe(
        'Content-Type, Authorization, X-Requested-With',
      );
      expect(headers['Access-Control-Max-Age']).toBe('86400');
    });

    it('should include origin header for allowed origins', () => {
      const headers = getCORSHeaders('http://localhost:3000');

      expect(headers['Access-Control-Allow-Origin']).toBe(
        'http://localhost:3000',
      );
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });

    it('should include origin for example.com', () => {
      const headers = getCORSHeaders('https://example.com');

      expect(headers['Access-Control-Allow-Origin']).toBe(
        'https://example.com',
      );
    });

    it('should not include origin for unauthorized domains', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const headers = getCORSHeaders('https://malicious-site.com');

      expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
    });

    it('should allow all origins in development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const headers = getCORSHeaders('https://any-origin.com');

      expect(headers['Access-Control-Allow-Origin']).toBe('*');
    });
  });

  describe('checkSecurityConfig', () => {
    it('should return configured=true in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const result = checkSecurityConfig(true);

      expect(result.configured).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect missing Turnstile key in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('TURNSTILE_SECRET_KEY', '');

      const result = checkSecurityConfig(true);

      expect(result.configured).toBe(false);
      expect(result.issues).toContain(
        'Turnstile secret key not configured in production',
      );
    });

    it('should detect relaxed security mode in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-key');
      vi.stubEnv('NEXT_PUBLIC_SECURITY_MODE', 'relaxed');

      const result = checkSecurityConfig(true);

      expect(result.configured).toBe(false);
      expect(result.issues).toContain(
        'Security mode is set to relaxed in production',
      );
    });
  });

  describe('getSecurityMiddlewareHeaders', () => {
    it('should return all headers with default config', () => {
      const headers = getSecurityMiddlewareHeaders();

      expect(headers).toBeDefined();
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
    });

    it('should disable CSP when configured', () => {
      const headers = getSecurityMiddlewareHeaders({ enableCSP: false });

      expect(headers['Content-Security-Policy']).toBeUndefined();
    });

    it('should disable HSTS when configured', () => {
      const headers = getSecurityMiddlewareHeaders({ enableHSTS: false });

      expect(headers['Strict-Transport-Security']).toBeUndefined();
    });

    it('should disable XSS Protection when configured', () => {
      const headers = getSecurityMiddlewareHeaders({
        enableXSSProtection: false,
      });

      expect(headers['X-XSS-Protection']).toBeUndefined();
    });

    it('should disable Frame Options when configured', () => {
      const headers = getSecurityMiddlewareHeaders({
        enableFrameOptions: false,
      });

      expect(headers['X-Frame-Options']).toBeUndefined();
    });

    it('should set custom Frame Options value', () => {
      const headers = getSecurityMiddlewareHeaders({
        frameOptionsValue: 'SAMEORIGIN',
      });

      expect(headers['X-Frame-Options']).toBe('SAMEORIGIN');
    });

    it('should disable Content Type Options when configured', () => {
      const headers = getSecurityMiddlewareHeaders({
        enableContentTypeOptions: false,
      });

      expect(headers['X-Content-Type-Options']).toBeUndefined();
    });

    it('should disable Referrer Policy when configured', () => {
      const headers = getSecurityMiddlewareHeaders({
        enableReferrerPolicy: false,
      });

      expect(headers['Referrer-Policy']).toBeUndefined();
    });

    it('should disable Permissions Policy when configured', () => {
      const headers = getSecurityMiddlewareHeaders({
        enablePermissionsPolicy: false,
      });

      expect(headers['Permissions-Policy']).toBeUndefined();
    });

    it('should accept nonce parameter', () => {
      const headers = getSecurityMiddlewareHeaders({}, 'middleware-nonce');

      expect(headers).toBeDefined();
    });
  });

  describe('validateSecurityHeaders', () => {
    it('should return valid=true when all required headers present', () => {
      const headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      };

      const result = validateSecurityHeaders(headers);

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should detect missing required headers', () => {
      const headers = {
        'X-Content-Type-Options': 'nosniff',
      };

      const result = validateSecurityHeaders(headers);

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('X-Frame-Options');
      expect(result.missing).toContain('X-XSS-Protection');
      expect(result.missing).toContain('Referrer-Policy');
    });

    it('should recommend optional headers', () => {
      const headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      };

      const result = validateSecurityHeaders(headers);

      expect(result.recommendations).toContain('Content-Security-Policy');
      expect(result.recommendations).toContain('Strict-Transport-Security');
    });

    it('should not recommend headers that are present', () => {
      const headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'",
        'Strict-Transport-Security': 'max-age=31536000',
        'Permissions-Policy': 'camera=()',
      };

      const result = validateSecurityHeaders(headers);

      expect(result.recommendations).toHaveLength(0);
    });
  });
});
