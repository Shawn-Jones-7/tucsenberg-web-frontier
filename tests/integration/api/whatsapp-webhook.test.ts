import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import * as route from '@/app/api/whatsapp/webhook/route';

vi.mock('@/lib/whatsapp', () => ({
  getWhatsAppService: () => ({
    verifyWebhook: (mode: string, token: string, challenge: string) =>
      mode === 'subscribe' && token === 'token' ? challenge : null,
    handleIncomingMessage: vi.fn(async () => {}),
  }),
}));

describe('api/whatsapp/webhook', () => {
  it('verifies webhook challenge', async () => {
    const url =
      'http://localhost/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=token&hub.challenge=123';
    const res = await route.GET(new NextRequest(new Request(url)));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('123');
  });

  it('rejects missing params', async () => {
    const res = await route.GET(
      new NextRequest(new Request('http://localhost/api/whatsapp/webhook')),
    );
    expect(res.status).toBe(400);
  });

  it('processes incoming message', async () => {
    const res = await route.POST(
      new NextRequest(
        new Request('http://localhost/api/whatsapp/webhook', {
          method: 'POST',
          body: JSON.stringify({ entry: [] }),
        }),
      ),
    );
    expect(res.status).toBe(200);
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/whatsapp/webhook', {
        method: 'POST',
        body: 'invalid json',
      }),
    );

    const res = await route.POST(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('INVALID_JSON');
  });
});
