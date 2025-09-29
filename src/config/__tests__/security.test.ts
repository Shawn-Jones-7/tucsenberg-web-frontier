import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  generateCSP,
  generateNonce,
  getSecurityConfig,
  getSecurityHeaders,
  isValidNonce,
  SECURITY_MODES,
} from '../security';

describe('Security Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCSP', () => {
    it('should generate basic CSP in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const csp = generateCSP();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("'unsafe-inline'");
      expect(csp).toContain("'unsafe-eval'");
    });

    it('should generate strict CSP in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const csp = generateCSP();
      expect(csp).toContain("default-src 'self'");
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).not.toContain("'unsafe-eval'");
      expect(csp).toContain('upgrade-insecure-requests');
    });

    it('should include nonce when provided', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const nonce = 'test-nonce-123';
      const csp = generateCSP(nonce);
      expect(csp).toContain(`'nonce-${nonce}'`);
    });

    it('should include required external domains', () => {
      const csp = generateCSP();
      expect(csp).toContain('https://va.vercel-scripts.com');
      expect(csp).toContain('https://challenges.cloudflare.com');
      expect(csp).toContain('https://fonts.googleapis.com');
      expect(csp).toContain('https://fonts.gstatic.com');
    });

    it('should set frame-ancestors to none', () => {
      const csp = generateCSP();
      expect(csp).toContain("frame-ancestors 'none'");
    });
  });

  describe('getSecurityHeaders', () => {
    it('should return security headers when enabled', () => {
      vi.stubEnv('SECURITY_HEADERS_ENABLED', 'true');

      const headers = getSecurityHeaders(undefined, true);
      expect(headers).toHaveLength(9);

      const headerKeys = headers.map((h) => h.key);
      expect(headerKeys).toContain('X-Frame-Options');
      expect(headerKeys).toContain('X-Content-Type-Options');
      expect(headerKeys).toContain('Referrer-Policy');
      expect(headerKeys).toContain('Strict-Transport-Security');
      expect(headerKeys).toContain('Content-Security-Policy');
      expect(headerKeys).toContain('Permissions-Policy');
    });

    it('should return empty array when disabled', () => {
      vi.stubEnv('SECURITY_HEADERS_ENABLED', 'false');

      const headers = getSecurityHeaders(undefined, true);
      expect(headers).toHaveLength(0);
    });

    it('should include nonce in CSP header', () => {
      vi.stubEnv('SECURITY_HEADERS_ENABLED', 'true');

      const nonce = 'test-nonce-456';
      const headers = getSecurityHeaders(nonce, true);

      const cspHeader = headers.find(
        (h) => h.key === 'Content-Security-Policy',
      );
      expect(cspHeader?.value).toContain(`'nonce-${nonce}'`);
    });

    it('should set correct X-Frame-Options', () => {
      vi.stubEnv('SECURITY_HEADERS_ENABLED', 'true');

      const headers = getSecurityHeaders(undefined, true);
      const frameHeader = headers.find((h) => h.key === 'X-Frame-Options');
      expect(frameHeader?.value).toBe('DENY');
    });

    it('should set correct HSTS header', () => {
      vi.stubEnv('SECURITY_HEADERS_ENABLED', 'true');

      const headers = getSecurityHeaders(undefined, true);
      const hstsHeader = headers.find(
        (h) => h.key === 'Strict-Transport-Security',
      );
      expect(hstsHeader?.value).toBe(
        'max-age=63072000; includeSubDomains; preload',
      );
    });
  });

  describe('generateNonce', () => {
    it('should generate a nonce', () => {
      const nonce = generateNonce();
      expect(nonce).toBeTruthy();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should generate different nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });

    it('should generate alphanumeric nonces', () => {
      const nonce = generateNonce();
      expect(nonce).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });

  describe('isValidNonce', () => {
    it('should validate correct nonces', () => {
      expect(isValidNonce('abcdef1234567890')).toBe(true);
      expect(isValidNonce('1234567890abcdef1234567890abcdef')).toBe(true);
    });

    it('should reject invalid nonces', () => {
      expect(isValidNonce('short')).toBe(false);
      expect(isValidNonce('contains-special-chars!')).toBe(false);
      expect(isValidNonce('contains spaces')).toBe(false);
      expect(isValidNonce('')).toBe(false);
    });
  });

  describe('getSecurityConfig', () => {
    it('should return strict mode by default', () => {
      vi.stubEnv('NEXT_PUBLIC_SECURITY_MODE', '');

      const config = getSecurityConfig(true);
      expect(config).toEqual(SECURITY_MODES.strict);
    });

    it('should return moderate mode when configured', () => {
      vi.stubEnv('NEXT_PUBLIC_SECURITY_MODE', 'moderate');

      const config = getSecurityConfig(true);
      expect(config).toEqual(SECURITY_MODES.moderate);
    });

    it('should return relaxed mode when configured', () => {
      vi.stubEnv('NEXT_PUBLIC_SECURITY_MODE', 'relaxed');

      const config = getSecurityConfig(true);
      expect(config).toEqual(SECURITY_MODES.relaxed);
    });
  });

  describe('SECURITY_MODES', () => {
    it('should have correct strict mode configuration', () => {
      expect(SECURITY_MODES.strict).toEqual({
        cspReportOnly: false,
        enforceHTTPS: true,
        strictTransportSecurity: true,
        contentTypeOptions: true,
        frameOptions: 'DENY',
        xssProtection: true,
      });
    });

    it('should have correct moderate mode configuration', () => {
      expect(SECURITY_MODES.moderate).toEqual({
        cspReportOnly: false,
        enforceHTTPS: true,
        strictTransportSecurity: true,
        contentTypeOptions: true,
        frameOptions: 'SAMEORIGIN',
        xssProtection: true,
      });
    });

    it('should have correct relaxed mode configuration', () => {
      expect(SECURITY_MODES.relaxed).toEqual({
        cspReportOnly: true,
        enforceHTTPS: false,
        strictTransportSecurity: false,
        contentTypeOptions: true,
        frameOptions: 'SAMEORIGIN',
        xssProtection: false,
      });
    });
  });
});
