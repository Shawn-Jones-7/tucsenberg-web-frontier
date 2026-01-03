import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '../route';

// Mock dependencies
const mockVerifyWebhook = vi.hoisted(() => vi.fn());
const mockHandleIncomingMessage = vi.hoisted(() => vi.fn());
const mockVerifyWebhookSignature = vi.hoisted(() => vi.fn());
const mockCheckDistributedRateLimit = vi.hoisted(() => vi.fn());

vi.mock('@/lib/whatsapp-service', () => ({
  verifyWebhook: mockVerifyWebhook,
  handleIncomingMessage: mockHandleIncomingMessage,
  verifyWebhookSignature: mockVerifyWebhookSignature,
}));

vi.mock('@/lib/security/distributed-rate-limit', () => ({
  checkDistributedRateLimit: mockCheckDistributedRateLimit,
  createRateLimitHeaders: vi.fn(() => new Headers()),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

function createMockGetRequest(
  searchParams: Record<string, string>,
): NextRequest {
  const url = new URL('http://localhost:3000/api/whatsapp/webhook');
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return new NextRequest(url.toString(), { method: 'GET' });
}

function createMockPostRequest(
  body: Record<string, unknown>,
  signature = 'sha256=valid-signature',
): NextRequest {
  const url = 'http://localhost:3000/api/whatsapp/webhook';
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': signature,
    },
  });
}

describe('WhatsApp Webhook Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyWebhook.mockReturnValue(null);
    mockHandleIncomingMessage.mockResolvedValue(undefined);
    mockVerifyWebhookSignature.mockReturnValue(true);
    mockCheckDistributedRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetTime: Date.now() + 60000,
      retryAfter: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET - Webhook Verification', () => {
    it('should verify webhook with valid parameters', () => {
      mockVerifyWebhook.mockReturnValue('challenge-token-123');

      const request = createMockGetRequest({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'my-verify-token',
        'hub.challenge': 'challenge-token-123',
      });

      const response = GET(request);

      expect(response.status).toBe(200);
      expect(mockVerifyWebhook).toHaveBeenCalledWith(
        'subscribe',
        'my-verify-token',
        'challenge-token-123',
      );
    });

    it('should return challenge as plain text on successful verification', async () => {
      mockVerifyWebhook.mockReturnValue('challenge-token-123');

      const request = createMockGetRequest({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'my-verify-token',
        'hub.challenge': 'challenge-token-123',
      });

      const response = GET(request);
      const text = await response.text();

      expect(text).toBe('challenge-token-123');
      expect(response.headers.get('Content-Type')).toBe('text/plain');
    });

    it('should return 403 when verification fails', async () => {
      mockVerifyWebhook.mockReturnValue(null);

      const request = createMockGetRequest({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'invalid-token',
        'hub.challenge': 'challenge-123',
      });

      const response = GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Webhook verification failed');
    });

    it('should return 400 when hub.mode is missing', async () => {
      const request = createMockGetRequest({
        'hub.verify_token': 'my-token',
        'hub.challenge': 'challenge-123',
      });

      const response = GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should return 400 when hub.verify_token is missing', async () => {
      const request = createMockGetRequest({
        'hub.mode': 'subscribe',
        'hub.challenge': 'challenge-123',
      });

      const response = GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should return 400 when hub.challenge is missing', async () => {
      const request = createMockGetRequest({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'my-token',
      });

      const response = GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should return 400 when all parameters are missing', async () => {
      const request = createMockGetRequest({});

      const response = GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should return 500 when verification throws an error', async () => {
      mockVerifyWebhook.mockImplementation(() => {
        throw new Error('Service unavailable');
      });

      const request = createMockGetRequest({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'my-token',
        'hub.challenge': 'challenge-123',
      });

      const response = GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST - Message Reception', () => {
    it('should process incoming message successfully', async () => {
      const messagePayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '1234567890',
                    phone_number_id: 'PHONE_NUMBER_ID',
                  },
                  messages: [
                    {
                      from: '9876543210',
                      id: 'wamid.abc123',
                      timestamp: '1234567890',
                      type: 'text',
                      text: { body: 'Hello' },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const request = createMockPostRequest(messagePayload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockHandleIncomingMessage).toHaveBeenCalledWith(messagePayload);
    });

    it('should handle status update webhooks', async () => {
      const statusPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '1234567890',
                    phone_number_id: 'PHONE_NUMBER_ID',
                  },
                  statuses: [
                    {
                      id: 'wamid.abc123',
                      status: 'delivered',
                      timestamp: '1234567890',
                      recipient_id: '9876543210',
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const request = createMockPostRequest(statusPayload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 401 when signature verification fails', async () => {
      mockVerifyWebhookSignature.mockReturnValue(false);

      const request = createMockPostRequest({
        object: 'whatsapp_business_account',
        entry: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid signature');
      expect(mockHandleIncomingMessage).not.toHaveBeenCalled();
    });

    it('should return 401 when signature header is missing', async () => {
      mockVerifyWebhookSignature.mockReturnValue(false);

      const url = 'http://localhost:3000/api/whatsapp/webhook';
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          object: 'whatsapp_business_account',
          entry: [],
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid signature');
    });

    it('should verify signature with raw body and header', async () => {
      const payload = { object: 'whatsapp_business_account', entry: [] };
      const signature = 'sha256=test-signature';
      const request = createMockPostRequest(payload, signature);

      await POST(request);

      expect(mockVerifyWebhookSignature).toHaveBeenCalledWith(
        JSON.stringify(payload),
        signature,
      );
    });

    it('should return 400 for invalid JSON', async () => {
      const url = 'http://localhost:3000/api/whatsapp/webhook';
      const request = new NextRequest(url, {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': 'sha256=test-signature',
        },
      });

      const response = await POST(request);
      await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 500 when message handler throws an error', async () => {
      mockHandleIncomingMessage.mockRejectedValue(new Error('Handler error'));

      const request = createMockPostRequest({
        object: 'whatsapp_business_account',
        entry: [],
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Failed to process message');
    });

    it('should process empty entry array gracefully', async () => {
      const request = createMockPostRequest({
        object: 'whatsapp_business_account',
        entry: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle multiple entries', async () => {
      const multiEntryPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'ACCOUNT_1',
            changes: [{ value: {}, field: 'messages' }],
          },
          {
            id: 'ACCOUNT_2',
            changes: [{ value: {}, field: 'messages' }],
          },
        ],
      };

      const request = createMockPostRequest(multiEntryPayload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockHandleIncomingMessage).toHaveBeenCalledWith(multiEntryPayload);
    });
  });

  describe('Signature-First Rate Limiting', () => {
    it('should NOT call rate limit check when signature is invalid', async () => {
      mockVerifyWebhookSignature.mockReturnValue(false);

      const request = createMockPostRequest({
        object: 'whatsapp_business_account',
        entry: [],
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      expect(mockVerifyWebhookSignature).toHaveBeenCalled();
      expect(mockCheckDistributedRateLimit).not.toHaveBeenCalled();
    });

    it('should call rate limit check ONLY after signature is valid', async () => {
      mockVerifyWebhookSignature.mockReturnValue(true);

      const request = createMockPostRequest({
        object: 'whatsapp_business_account',
        entry: [],
      });

      await POST(request);

      expect(mockVerifyWebhookSignature).toHaveBeenCalled();
      expect(mockCheckDistributedRateLimit).toHaveBeenCalled();
    });

    it('should return 429 when rate limit exceeded for valid signature', async () => {
      mockVerifyWebhookSignature.mockReturnValue(true);
      mockCheckDistributedRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60,
      });

      const request = createMockPostRequest({
        object: 'whatsapp_business_account',
        entry: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many requests');
      expect(mockHandleIncomingMessage).not.toHaveBeenCalled();
    });

    it('should not consume rate limit quota for invalid signatures', async () => {
      mockVerifyWebhookSignature.mockReturnValue(false);

      // Simulate multiple invalid signature requests
      for (let i = 0; i < 5; i++) {
        const request = createMockPostRequest(
          { object: 'whatsapp_business_account', entry: [] },
          `sha256=invalid-signature-${i}`,
        );
        await POST(request);
      }

      // Rate limit should never be called for invalid signatures
      expect(mockCheckDistributedRateLimit).not.toHaveBeenCalled();
    });
  });
});
