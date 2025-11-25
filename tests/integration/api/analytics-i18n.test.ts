import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import * as route from '@/app/api/analytics/i18n/route';

const makeRequest = (body: unknown) =>
  new NextRequest(
    new Request('http://localhost/api/analytics/i18n', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  );

describe('api/analytics/i18n', () => {
  it('accepts valid payload', async () => {
    const now = Date.now();
    const req = makeRequest({
      locale: 'en',
      event: 'translation_load',
      timestamp: now,
      metadata: {
        sourcePage: '/home',
        durationMs: 42,
      },
    });

    const res = await route.POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.locale).toBe('en');
    expect(body.data.event).toBe('translation_load');
  });

  it('rejects invalid payload shape', async () => {
    const req = makeRequest({
      locale: 'en',
      // missing event and timestamp
    });

    const res = await route.POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid i18n analytics data format');
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/analytics/i18n', {
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
});
