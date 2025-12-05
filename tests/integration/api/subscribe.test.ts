import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as route from '@/app/api/subscribe/route';

vi.mock('@/app/api/contact/contact-api-utils', () => ({
  checkRateLimit: vi.fn(() => true),
  getClientIP: vi.fn(() => '1.1.1.1'),
  verifyTurnstile: vi.fn(async () => true),
}));

vi.mock('@/lib/lead-pipeline', () => ({
  processLead: vi.fn(async () => ({
    success: true,
    referenceId: 'ref-123',
    recordCreated: true,
    emailSent: false,
  })),
}));

const makeReq = (body: unknown, headers: HeadersInit = {}) =>
  new NextRequest(
    new Request('http://localhost/api/subscribe', {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    }),
  );

describe('api/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles malformed payload gracefully (returns JSON response)', async () => {
    const malformedReq = new NextRequest(
      new Request('http://localhost/api/subscribe', {
        method: 'POST',
        body: 'this is not json',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const res = await route.POST(malformedReq);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('INVALID_JSON');
  });

  it('accepts valid email with idempotency key and caches', async () => {
    const headers = { 'Idempotency-Key': 'key-1' };
    const res1 = await route.POST(
      makeReq(
        { email: 'ok@example.com', turnstileToken: 'valid-token' },
        headers,
      ),
    );
    expect(res1.status).toBe(200);
    const res2 = await route.POST(
      makeReq(
        { email: 'ok@example.com', turnstileToken: 'valid-token' },
        headers,
      ),
    );
    expect(res2.status).toBe(200);
    const json2 = await res2.json();
    expect(json2.success).toBe(true);
  });

  it('returns 400 when turnstileToken is missing', async () => {
    const res = await route.POST(makeReq({ email: 'test@example.com' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toBe('Security verification required');
  });

  it('returns 400 when turnstile verification fails', async () => {
    const utils = await import('@/app/api/contact/contact-api-utils');
    (utils.verifyTurnstile as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      false,
    );

    const res = await route.POST(
      makeReq({ email: 'test@example.com', turnstileToken: 'invalid-token' }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toBe(
      'Security verification failed. Please try again.',
    );
  });

  it('returns 429 when rate limited', async () => {
    const utils = await import('@/app/api/contact/contact-api-utils');
    (utils.checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      false,
    );

    const res = await route.POST(
      makeReq({ email: 'test@example.com', turnstileToken: 'valid-token' }),
    );
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('returns 400 when email is missing', async () => {
    const res = await route.POST(makeReq({ turnstileToken: 'valid-token' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toBe('Email is required');
  });
});
