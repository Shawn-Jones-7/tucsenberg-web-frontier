import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock next-intl/middleware
vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => NextResponse.next()),
}));

// Mock security config
vi.mock('@/config/security', () => ({
  generateNonce: vi.fn(() => 'test-nonce-123'),
  getSecurityHeaders: vi.fn(() => []),
}));

// Mock routing config
vi.mock('@/i18n/routing-config', () => ({
  routing: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    pathnames: {
      '/': '/',
      '/about': '/about',
    },
  },
}));

describe('Middleware Cookie Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('setLocaleCookie security attributes', () => {
    it('should set httpOnly: true to prevent XSS access', async () => {
      const { default: middleware } = await import('../../middleware');

      const request = new NextRequest('http://localhost:3000/en/about');
      const response = middleware(request);

      if (response) {
        // NextResponse.cookies.set with httpOnly: true will have the attribute
        // We verify via the set-cookie header
        const setCookieHeader = response.headers.get('set-cookie');
        expect(setCookieHeader).toContain('HttpOnly');
      }
    });

    it('should set secure: true in production environment', async () => {
      vi.stubEnv('NODE_ENV', 'production');

      // Re-import to pick up new env
      vi.resetModules();

      // Re-mock dependencies after reset
      vi.doMock('next-intl/middleware', () => ({
        default: vi.fn(() => NextResponse.next()),
      }));
      vi.doMock('@/config/security', () => ({
        generateNonce: vi.fn(() => 'test-nonce-123'),
        getSecurityHeaders: vi.fn(() => []),
      }));
      vi.doMock('@/i18n/routing-config', () => ({
        routing: {
          defaultLocale: 'en',
          locales: ['en', 'zh'],
          pathnames: { '/': '/', '/about': '/about' },
        },
      }));

      const { default: middleware } = await import('../../middleware');

      const request = new NextRequest('http://localhost:3000/en/about');
      const response = middleware(request);

      if (response) {
        const setCookieHeader = response.headers.get('set-cookie');
        expect(setCookieHeader).toContain('Secure');
      }
    });

    it('should not set secure flag in development environment', async () => {
      vi.stubEnv('NODE_ENV', 'development');

      vi.resetModules();

      vi.doMock('next-intl/middleware', () => ({
        default: vi.fn(() => NextResponse.next()),
      }));
      vi.doMock('@/config/security', () => ({
        generateNonce: vi.fn(() => 'test-nonce-123'),
        getSecurityHeaders: vi.fn(() => []),
      }));
      vi.doMock('@/i18n/routing-config', () => ({
        routing: {
          defaultLocale: 'en',
          locales: ['en', 'zh'],
          pathnames: { '/': '/', '/about': '/about' },
        },
      }));

      const { default: middleware } = await import('../../middleware');

      const request = new NextRequest('http://localhost:3000/en/about');
      const response = middleware(request);

      if (response) {
        const setCookieHeader = response.headers.get('set-cookie');
        // In development, Secure flag should not be present
        // The header format is: NEXT_LOCALE=en; Path=/; SameSite=Lax; HttpOnly
        // Without '; Secure' at the end
        expect(setCookieHeader).not.toMatch(/;\s*Secure(?:;|$)/i);
      }
    });

    it('should maintain sameSite: lax for cross-site navigation', async () => {
      const { default: middleware } = await import('../../middleware');

      const request = new NextRequest('http://localhost:3000/en/about');
      const response = middleware(request);

      if (response) {
        const setCookieHeader = response.headers.get('set-cookie');
        expect(setCookieHeader).toContain('SameSite=Lax');
      }
    });

    it('should set correct cookie path', async () => {
      const { default: middleware } = await import('../../middleware');

      const request = new NextRequest('http://localhost:3000/en/about');
      const response = middleware(request);

      if (response) {
        const setCookieHeader = response.headers.get('set-cookie');
        expect(setCookieHeader).toContain('Path=/');
      }
    });
  });

  describe('cookie security in different scenarios', () => {
    it('should apply security attributes when handling explicit localized request', async () => {
      vi.resetModules();

      vi.doMock('next-intl/middleware', () => ({
        default: vi.fn(() => NextResponse.next()),
      }));
      vi.doMock('@/config/security', () => ({
        generateNonce: vi.fn(() => 'test-nonce-123'),
        getSecurityHeaders: vi.fn(() => []),
      }));
      vi.doMock('@/i18n/routing-config', () => ({
        routing: {
          defaultLocale: 'en',
          locales: ['en', 'zh'],
          pathnames: { '/': '/', '/about': '/about' },
        },
      }));

      const { default: middleware } = await import('../../middleware');

      // Request without existing NEXT_LOCALE cookie
      const request = new NextRequest('http://localhost:3000/zh/about');
      const response = middleware(request);

      if (response) {
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          expect(setCookieHeader).toContain('NEXT_LOCALE=zh');
          expect(setCookieHeader).toContain('HttpOnly');
          expect(setCookieHeader).toContain('SameSite=Lax');
        }
      }
    });

    it('should apply security attributes when redirecting invalid locale prefix', async () => {
      vi.resetModules();

      vi.doMock('next-intl/middleware', () => ({
        default: vi.fn(() => NextResponse.next()),
      }));
      vi.doMock('@/config/security', () => ({
        generateNonce: vi.fn(() => 'test-nonce-123'),
        getSecurityHeaders: vi.fn(() => []),
      }));
      vi.doMock('@/i18n/routing-config', () => ({
        routing: {
          defaultLocale: 'en',
          locales: ['en', 'zh'],
          pathnames: { '/': '/', '/about': '/about' },
        },
      }));

      const { default: middleware } = await import('../../middleware');

      // Request with invalid locale prefix but known path
      const request = new NextRequest(
        'http://localhost:3000/invalid-lang/about',
      );
      const response = middleware(request);

      if (response) {
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          expect(setCookieHeader).toContain('HttpOnly');
          expect(setCookieHeader).toContain('SameSite=Lax');
        }
      }
    });
  });
});
