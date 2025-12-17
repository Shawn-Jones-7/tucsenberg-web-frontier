import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getClientIP, getIPChain } from '../client-ip';

describe('client-ip', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    process.env = { ...originalEnv };
    delete process.env.DEPLOYMENT_PLATFORM;
    delete process.env.VERCEL;
    delete process.env.CF_PAGES;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  function createMockRequest(
    options: {
      headers?: Record<string, string>;
      ip?: string;
    } = {},
  ): NextRequest {
    const url = 'http://localhost/api/test';
    const headers = new Headers(options.headers);
    const request = new NextRequest(url, { headers });

    // Mock request.ip (Next.js property)
    if (options.ip) {
      Object.defineProperty(request, 'ip', {
        value: options.ip,
        writable: false,
      });
    }

    return request;
  }

  describe('getClientIP', () => {
    describe('no platform configured', () => {
      it('should fallback to request.ip when no platform', () => {
        const request = createMockRequest({ ip: '10.0.0.50' });
        const ip = getClientIP(request);
        expect(ip).toBe('10.0.0.50');
      });

      it('should return fallback IP when no request.ip', () => {
        const request = createMockRequest();
        const ip = getClientIP(request);
        expect(ip).toBe('0.0.0.0');
      });

      it('should NOT trust x-forwarded-for without platform', () => {
        const request = createMockRequest({
          headers: { 'x-forwarded-for': '1.2.3.4' },
          ip: '10.0.0.50',
        });
        const ip = getClientIP(request);
        // Should use request.ip, not x-forwarded-for
        expect(ip).toBe('10.0.0.50');
      });
    });

    describe('Vercel platform', () => {
      beforeEach(() => {
        process.env.VERCEL = '1';
      });

      it('should extract IP from x-real-ip header', () => {
        const request = createMockRequest({
          headers: { 'x-real-ip': '203.0.113.50' },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('203.0.113.50');
      });

      it('should extract first IP from x-forwarded-for', () => {
        const request = createMockRequest({
          headers: { 'x-forwarded-for': '203.0.113.50, 10.0.0.1, 172.16.0.1' },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('203.0.113.50');
      });

      it('should prefer x-real-ip over x-forwarded-for', () => {
        const request = createMockRequest({
          headers: {
            'x-real-ip': '198.51.100.10',
            'x-forwarded-for': '203.0.113.50',
          },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('198.51.100.10');
      });

      it('should fallback to request.ip when no headers', () => {
        const request = createMockRequest({ ip: '10.0.0.99' });
        const ip = getClientIP(request);
        expect(ip).toBe('10.0.0.99');
      });
    });

    describe('Cloudflare platform', () => {
      beforeEach(() => {
        process.env.CF_PAGES = '1';
      });

      it('should extract IP from cf-connecting-ip header', () => {
        const request = createMockRequest({
          headers: { 'cf-connecting-ip': '192.0.2.100' },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('192.0.2.100');
      });

      it('should prefer cf-connecting-ip over x-forwarded-for', () => {
        const request = createMockRequest({
          headers: {
            'cf-connecting-ip': '192.0.2.100',
            'x-forwarded-for': '203.0.113.50',
          },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('192.0.2.100');
      });
    });

    describe('development platform', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
      });

      it('should trust x-forwarded-for in development', () => {
        const request = createMockRequest({
          headers: { 'x-forwarded-for': '192.168.1.100' },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('192.168.1.100');
      });

      it('should return localhost when no IP available', () => {
        const request = createMockRequest();
        const ip = getClientIP(request);
        expect(ip).toBe('127.0.0.1');
      });
    });

    describe('explicit DEPLOYMENT_PLATFORM', () => {
      it('should respect explicit platform over auto-detection', () => {
        process.env.DEPLOYMENT_PLATFORM = 'cloudflare';
        process.env.VERCEL = '1'; // Would normally trigger Vercel

        const request = createMockRequest({
          headers: {
            'cf-connecting-ip': '192.0.2.100',
            'x-real-ip': '198.51.100.10',
          },
        });
        const ip = getClientIP(request);
        // Should use Cloudflare config, not Vercel
        expect(ip).toBe('192.0.2.100');
      });
    });

    describe('IP validation and normalization', () => {
      beforeEach(() => {
        process.env.VERCEL = '1';
      });

      it('should reject invalid IP addresses', () => {
        const request = createMockRequest({
          headers: { 'x-real-ip': 'not-an-ip' },
          ip: '10.0.0.1',
        });
        const ip = getClientIP(request);
        // Should fallback to request.ip
        expect(ip).toBe('10.0.0.1');
      });

      it('should strip port from IPv4 address', () => {
        const request = createMockRequest({
          headers: { 'x-real-ip': '192.168.1.100:8080' },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('192.168.1.100');
      });

      it('should strip port from bracketed IPv6 address', () => {
        const request = createMockRequest({
          headers: { 'x-real-ip': '[::1]:8080' },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('::1');
      });

      it('should handle IPv6 without brackets', () => {
        const request = createMockRequest({
          headers: { 'x-real-ip': '2001:db8::1' },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('2001:db8::1');
      });

      it('should reject malformed IP with invalid octets', () => {
        const request = createMockRequest({
          headers: { 'x-real-ip': '256.256.256.256' },
          ip: '10.0.0.1',
        });
        const ip = getClientIP(request);
        // Should fallback to request.ip due to invalid octet values
        expect(ip).toBe('10.0.0.1');
      });

      it('should handle "unknown" value in header', () => {
        const request = createMockRequest({
          headers: { 'x-forwarded-for': 'unknown, 192.168.1.1' },
        });
        const ip = getClientIP(request);
        // First value "unknown" is invalid, should try next header or fallback
        expect(ip).not.toBe('unknown');
      });
    });

    describe('x-forwarded-for parsing', () => {
      beforeEach(() => {
        process.env.VERCEL = '1';
      });

      it('should extract first IP from comma-separated list', () => {
        const request = createMockRequest({
          headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1, 172.16.0.1' },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('203.0.113.1');
      });

      it('should trim whitespace from IPs', () => {
        const request = createMockRequest({
          headers: { 'x-forwarded-for': '  203.0.113.50  , 10.0.0.1' },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('203.0.113.50');
      });

      it('should strip port from first IP in chain', () => {
        const request = createMockRequest({
          headers: { 'x-forwarded-for': '203.0.113.50:12345, 10.0.0.1' },
        });
        const ip = getClientIP(request);
        expect(ip).toBe('203.0.113.50');
      });
    });
  });

  describe('getIPChain', () => {
    beforeEach(() => {
      process.env.VERCEL = '1';
    });

    it('should return empty array when no IPs', () => {
      const request = createMockRequest();
      const chain = getIPChain(request);
      expect(chain).toEqual([]);
    });

    it('should collect IPs from x-forwarded-for', () => {
      const request = createMockRequest({
        headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
      });
      const chain = getIPChain(request);
      expect(chain).toContain('203.0.113.1');
      expect(chain).toContain('10.0.0.1');
    });

    it('should include x-real-ip in chain', () => {
      const request = createMockRequest({
        headers: { 'x-real-ip': '198.51.100.10' },
      });
      const chain = getIPChain(request);
      expect(chain).toContain('198.51.100.10');
    });

    it('should prioritize cf-connecting-ip at start', () => {
      const request = createMockRequest({
        headers: {
          'cf-connecting-ip': '192.0.2.100',
          'x-forwarded-for': '203.0.113.1',
        },
      });
      const chain = getIPChain(request);
      expect(chain[0]).toBe('192.0.2.100');
    });

    it('should deduplicate IPs', () => {
      const request = createMockRequest({
        headers: {
          'x-forwarded-for': '203.0.113.1, 10.0.0.1',
          'x-real-ip': '203.0.113.1', // Duplicate
        },
      });
      const chain = getIPChain(request);
      const occurrences = chain.filter((ip) => ip === '203.0.113.1').length;
      expect(occurrences).toBe(1);
    });

    it('should include request.ip in chain', () => {
      const request = createMockRequest({
        headers: { 'x-forwarded-for': '203.0.113.1' },
        ip: '10.0.0.50',
      });
      const chain = getIPChain(request);
      expect(chain).toContain('10.0.0.50');
    });

    it('should filter out invalid IPs', () => {
      const request = createMockRequest({
        headers: { 'x-forwarded-for': 'invalid, 203.0.113.1, unknown' },
      });
      const chain = getIPChain(request);
      expect(chain).toContain('203.0.113.1');
      expect(chain).not.toContain('invalid');
      expect(chain).not.toContain('unknown');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string IP', () => {
      process.env.VERCEL = '1';
      const request = createMockRequest({
        headers: { 'x-real-ip': '' },
        ip: '10.0.0.1',
      });
      const ip = getClientIP(request);
      expect(ip).toBe('10.0.0.1');
    });

    it('should handle whitespace-only IP', () => {
      process.env.VERCEL = '1';
      const request = createMockRequest({
        headers: { 'x-forwarded-for': '   ' },
        ip: '10.0.0.1',
      });
      const ip = getClientIP(request);
      expect(ip).toBe('10.0.0.1');
    });

    it('should handle empty x-forwarded-for list', () => {
      process.env.VERCEL = '1';
      const request = createMockRequest({
        headers: { 'x-forwarded-for': ',,' },
        ip: '10.0.0.1',
      });
      const ip = getClientIP(request);
      expect(ip).toBe('10.0.0.1');
    });
  });
});
