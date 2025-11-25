import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import * as route from '@/app/api/health/route';

describe('api/health', () => {
  it('returns ok status', async () => {
    const res = await route.GET(
      new NextRequest(new Request('http://localhost/api/health')),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});
