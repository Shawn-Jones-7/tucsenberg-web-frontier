import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/verify-turnstile/route';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
vi.mock('@/lib/env', () => ({
  env: {
    TURNSTILE_SECRET_KEY: 'test-secret-key',
    TURNSTILE_SITE_KEY: 'test-site-key',
  },
}));

describe('Verify Turnstile API Route', () => {
  const validRequestBody = {
    token: 'valid-turnstile-token',
    remoteip: '127.0.0.1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('POST /api/verify-turnstile', () => {
    it('应该成功验证有效的Turnstile token', async () => {
      // Mock successful Cloudflare response
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            challenge_ts: '2024-01-01T00:00:00.000Z',
            hostname: 'localhost',
            action: 'submit',
          }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: JSON.stringify(validRequestBody),
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '127.0.0.1',
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Verification successful');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );
    });

    it('应该处理Turnstile验证失败', async () => {
      // Mock failed Cloudflare response
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            'success': false,
            'error-codes': ['invalid-input-response'],
          }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: JSON.stringify(validRequestBody),
          headers: {
            'content-type': 'application/json',
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Verification failed');
      expect(data.errorCodes).toEqual(['invalid-input-response']);
    });

    it('应该处理缺少token的请求', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: JSON.stringify({}),
          headers: {
            'content-type': 'application/json',
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing token');
    });

    it('应该处理空token的请求', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: JSON.stringify({ token: '' }),
          headers: {
            'content-type': 'application/json',
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing token');
    });

    it('应该处理无效的JSON请求体', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: 'invalid-json',
          headers: {
            'content-type': 'application/json',
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('应该处理Cloudflare API网络错误', async () => {
      // Mock network error
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: JSON.stringify(validRequestBody),
          headers: {
            'content-type': 'application/json',
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('应该处理Cloudflare API响应错误', async () => {
      // Mock HTTP error response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: JSON.stringify(validRequestBody),
          headers: {
            'content-type': 'application/json',
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Verification request failed');
    });

    it('应该正确提取客户端IP地址', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: JSON.stringify({ token: 'test-token' }),
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '192.168.1.1, 10.0.0.1',
            'x-real-ip': '192.168.1.1',
          },
        },
      );

      await POST(request);

      // 验证fetch调用中包含了正确的IP地址（完整的x-forwarded-for值）
      const fetchCall = mockFetch.mock.calls[0];
      const formData = fetchCall?.[1]?.body;
      const formDataString = formData?.toString();
      expect(formDataString).toContain('remoteip=192.168.1.1%2C+10.0.0.1'); // URL encoded "192.168.1.1, 10.0.0.1"
    });

    it('应该使用提供的remoteip参数', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const requestWithRemoteIp = {
        token: 'test-token',
        remoteip: '203.0.113.1',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: JSON.stringify(requestWithRemoteIp),
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '192.168.1.1',
          },
        },
      );

      await POST(request);

      // 验证使用了提供的remoteip而不是从headers提取的IP
      const fetchCall = mockFetch.mock.calls[0];
      const formData = fetchCall?.[1]?.body;
      const formDataString = formData?.toString();
      expect(formDataString).toContain('remoteip=203.0.113.1'); // 使用提供的remoteip参数
    });
  });

  describe('GET /api/verify-turnstile', () => {
    it('应该返回健康检查信息（配置已启用）', async () => {
      // GET request doesn't need request object

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('Turnstile verification endpoint active');
      expect(data.configured).toBe(true);
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('配置验证', () => {
    it('应该处理未配置Turnstile的情况', async () => {
      // 直接mock env模块的TURNSTILE_SECRET_KEY为空字符串
      const envModule = await import('@/lib/env');
      const originalSecretKey = envModule.env.TURNSTILE_SECRET_KEY;

      // 临时修改env对象
      Object.defineProperty(envModule.env, 'TURNSTILE_SECRET_KEY', {
        value: '',
        writable: true,
        configurable: true,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: JSON.stringify(validRequestBody),
          headers: {
            'content-type': 'application/json',
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Turnstile not configured');

      // 恢复原始值
      Object.defineProperty(envModule.env, 'TURNSTILE_SECRET_KEY', {
        value: originalSecretKey,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('安全性测试', () => {
    it('应该记录验证尝试', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            hostname: 'localhost',
            challenge_ts: '2024-01-01T00:00:00.000Z',
          }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: JSON.stringify(validRequestBody),
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '127.0.0.1',
          },
        },
      );

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Turnstile verification:',
        expect.objectContaining({
          success: true,
          hostname: 'localhost',
          clientIP: '127.0.0.1',
        }),
      );

      consoleSpy.mockRestore();
    });

    it('应该记录验证失败', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            'success': false,
            'error-codes': ['timeout-or-duplicate'],
          }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/verify-turnstile',
        {
          method: 'POST',
          body: JSON.stringify(validRequestBody),
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '127.0.0.1',
          },
        },
      );

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Turnstile verification failed:',
        expect.objectContaining({
          errorCodes: ['timeout-or-duplicate'],
          clientIP: '127.0.0.1',
        }),
      );

      consoleSpy.mockRestore();
    });
  });
});
