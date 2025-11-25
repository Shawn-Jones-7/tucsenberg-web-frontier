import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import * as route from '@/app/api/whatsapp/send/route';

vi.mock('@/lib/whatsapp-service', () => ({
  sendWhatsAppMessage: vi.fn(async () => ({
    success: true,
    data: { messages: [{ id: 'mid-1' }] },
  })),
}));

describe('api/whatsapp/send', () => {
  const makeReq = (body: unknown) =>
    new NextRequest(
      new Request('http://localhost/api/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );

  it('sends text message successfully', async () => {
    const res = await route.POST(
      makeReq({ to: '123', type: 'text', content: { body: 'hi' } }),
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.messageId).toBe('mid-1');
  });

  it('returns 400 on missing content', async () => {
    const res = await route.POST(
      makeReq({ to: '123', type: 'text', content: {} }),
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/whatsapp/send', {
        method: 'POST',
        body: 'invalid json',
      }),
    );

    const res = await route.POST(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body._error).toBe('INVALID_JSON');
  });
});
