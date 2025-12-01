import { describe, expect, it } from 'vitest';
import * as route from '@/app/api/health/route';

describe('api/health', () => {
  it('returns ok status', async () => {
    // route.GET() does not accept any arguments per the signature in route.ts
    const res = await route.GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});
