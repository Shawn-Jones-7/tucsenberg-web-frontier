import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from '@/lib/logger';
import {
  getCORSHeaders,
  getSecurityMiddlewareHeaders,
  validateSecurityHeaders,
  verifyTurnstileToken,
} from '@/lib/security-headers';

describe('security-headers', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('should return whitelisted origin and credentials for allowed origin', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const headers = getCORSHeaders('https://example.com');

    expect(headers['Access-Control-Allow-Origin']).toBe('https://example.com');
    expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    expect(headers['Access-Control-Allow-Methods']).toContain('GET');
  });

  it('should fall back to wildcard origin in development', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const headers = getCORSHeaders('https://untrusted.example');

    expect(headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('should respect middleware toggles and custom frame option', () => {
    const headers = getSecurityMiddlewareHeaders(
      {
        enableCSP: false,
        enableFrameOptions: true,
        frameOptionsValue: 'SAMEORIGIN',
      },
      'nonce-value',
    );

    expect(headers['Content-Security-Policy']).toBeUndefined();
    expect(headers['X-Frame-Options']).toBe('SAMEORIGIN');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
  });

  it('should report missing required headers', () => {
    const result = validateSecurityHeaders({
      'Content-Security-Policy': 'default-src self',
    });

    expect(result.valid).toBe(false);
    expect(result.missing).toContain('X-Frame-Options');
    expect(result.recommendations).toContain('Strict-Transport-Security');
  });

  it('should verify Turnstile token via fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const ok = await verifyTurnstileToken('token-123', '1.1.1.1');

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('/api/verify-turnstile', {
      body: JSON.stringify({ token: 'token-123', remoteip: '1.1.1.1' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
  });

  it('should return false when fetch fails and log error', async () => {
    const error = new Error('network');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
    const logSpy = vi.spyOn(logger, 'error');

    const ok = await verifyTurnstileToken('token-fail');

    expect(ok).toBe(false);
    expect(logSpy).toHaveBeenCalled();
  });
});
