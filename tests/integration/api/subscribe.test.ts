import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import * as route from '@/app/api/subscribe/route';

const makeReq = (body: unknown, headers: HeadersInit = {}) =>
  new NextRequest(
    new Request('http://localhost/api/subscribe', {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    }),
  );

describe('api/subscribe', () => {
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
      makeReq({ email: 'ok@example.com' }, headers),
    );
    expect(res1.status).toBe(200);
    const res2 = await route.POST(
      makeReq({ email: 'ok@example.com' }, headers),
    );
    expect(res2.status).toBe(200);
    const json2 = await res2.json();
    expect(json2.success).toBe(true);
  });
});
