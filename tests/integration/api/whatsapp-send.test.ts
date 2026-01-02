import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as route from '@/app/api/whatsapp/send/route';

const TEST_API_KEY = 'test-whatsapp-api-key';

vi.mock('@/lib/whatsapp-service', () => ({
  sendWhatsAppMessage: vi.fn(async () => ({
    success: true,
    data: { messages: [{ id: 'mid-1' }] },
  })),
  getClientEnvironmentInfo: vi.fn(() => ({
    environment: 'test',
    clientType: 'mock',
    hasCredentials: false,
  })),
}));

describe('api/whatsapp/send', () => {
  beforeEach(() => {
    vi.stubEnv('WHATSAPP_API_KEY', TEST_API_KEY);
  });

  const makeReq = (body: unknown) =>
    new NextRequest(
      new Request('http://localhost/api/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_API_KEY}`,
        },
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
        headers: {
          Authorization: `Bearer ${TEST_API_KEY}`,
        },
      }),
    );

    const res = await route.POST(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('INVALID_JSON');
  });

  it('returns 401 without authorization', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify({
          to: '123',
          type: 'text',
          content: { body: 'hi' },
        }),
      }),
    );
    const res = await route.POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 503 when API key not configured', async () => {
    vi.stubEnv('WHATSAPP_API_KEY', '');
    const req = new NextRequest(
      new Request('http://localhost/api/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify({
          to: '123',
          type: 'text',
          content: { body: 'hi' },
        }),
        headers: {
          Authorization: `Bearer ${TEST_API_KEY}`,
        },
      }),
    );
    const res = await route.POST(req);
    expect(res.status).toBe(503);
  });
});
