import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as route from '@/app/api/verify-turnstile/route';

vi.mock('@/lib/env', () => ({
  env: {
    TURNSTILE_SECRET_KEY: 'secret-key',
  },
}));

vi.mock('@/lib/security/turnstile-config', () => ({
  getAllowedTurnstileHosts: () => ['example.com'],
  getExpectedTurnstileAction: () => 'contact',
  isAllowedTurnstileHostname: (h?: string) => h === 'example.com',
  isAllowedTurnstileAction: (a?: string) => a === 'contact',
}));

describe('api/verify-turnstile', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const makeRequest = (body: unknown) =>
    new NextRequest(
      new Request('http://localhost/api/verify-turnstile', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );

  it('returns 400 when token missing', async () => {
    const res = await route.POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/verify-turnstile', {
        method: 'POST',
        body: 'invalid json',
      }),
    );

    const res = await route.POST(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('INVALID_JSON');
  });

  it('verifies successfully with Cloudflare', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            hostname: 'example.com',
            action: 'contact',
            challenge_ts: 'ts',
          }),
      }),
    );

    const res = await route.POST(makeRequest({ token: 'abc' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('handles verification failure response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ 'success': false, 'error-codes': ['bad'] }),
      }),
    );

    const res = await route.POST(makeRequest({ token: 'abc' }));
    expect(res.status).toBe(400);
  });
});
