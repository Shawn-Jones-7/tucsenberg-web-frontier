import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import * as route from '@/app/api/analytics/web-vitals/route';

const baseMetric = {
  name: 'CLS',
  value: 0.02,
  rating: 'good',
  delta: 0.01,
  id: 'id-1',
  navigationType: 'navigate',
  url: 'https://example.com',
  userAgent: 'test-agent',
  timestamp: Date.now(),
};

describe('api/analytics/web-vitals', () => {
  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/analytics/web-vitals', {
        method: 'POST',
        body: 'invalid json',
      }),
    );

    const res = await route.POST(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body._error).toBe('INVALID_JSON');
  });

  it('rejects invalid payload', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/analytics/web-vitals', {
        method: 'POST',
        body: JSON.stringify({ bad: true }),
      }),
    );

    const res = await route.POST(req);
    expect(res.status).toBe(400);
  });

  it('accepts valid payload', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/analytics/web-vitals', {
        method: 'POST',
        body: JSON.stringify(baseMetric),
      }),
    );

    const res = await route.POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('returns metric-specific stats when metric query provided', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/analytics/web-vitals?metric=TTFB'),
    );
    const res = await route.GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.metric).toBe('TTFB');
  });
});
