import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ERROR_CODES } from '@/constants/api-error-codes';
import { handleGetRequest } from '../get-handler';

const mockValidateAdminAccess = vi.hoisted(() => vi.fn());

// Mock validateAdminAccess
vi.mock('@/app/api/contact/contact-api-validation', () => ({
  validateAdminAccess: mockValidateAdminAccess,
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock api-cache-utils
vi.mock('@/lib/api-cache-utils', () => ({
  createCachedResponse: vi.fn((data, options) => {
    const { NextResponse } = require('next/server');
    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', `public, max-age=${options.maxAge}`);
    return response;
  }),
}));

describe('handleGetRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateAdminAccess.mockReturnValue(true);
  });

  describe('authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockValidateAdminAccess.mockReturnValue(false);
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when auth header is missing', async () => {
      mockValidateAdminAccess.mockReturnValue(false);
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
      );

      const response = handleGetRequest(request);

      expect(response.status).toBe(401);
      expect(mockValidateAdminAccess).toHaveBeenCalledWith(null);
    });

    it('should allow access with valid admin token', async () => {
      mockValidateAdminAccess.mockReturnValue(true);
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        { headers: { authorization: 'Bearer valid-token' } },
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockValidateAdminAccess).toHaveBeenCalledWith(
        'Bearer valid-token',
      );
    });
  });

  describe('basic requests', () => {
    it('should return dashboard data with default parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        { headers: { authorization: 'Bearer valid-token' } },
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.timeRange).toBe('1h');
      expect(data.data.environment).toBe('production');
      expect(data.data.source).toBe('all');
    });

    it('should include system health data', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(data.data.systemHealth).toBeDefined();
      expect(data.data.systemHealth.status).toBe('healthy');
      expect(data.data.systemHealth.uptime).toBeDefined();
      expect(data.data.systemHealth.responseTime).toBeDefined();
      expect(data.data.systemHealth.errorRate).toBeDefined();
    });

    it('should include performance data', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(data.data.performance).toBeDefined();
      expect(data.data.performance.webVitals).toBeDefined();
      expect(data.data.performance.bundleSize).toBeDefined();
      expect(data.data.performance.cacheHitRate).toBeDefined();
    });

    it('should include i18n data', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(data.data.i18n).toBeDefined();
      expect(data.data.i18n.translationCoverage).toBeDefined();
      expect(data.data.i18n.localeDistribution).toBeDefined();
    });

    it('should include security data', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(data.data.security).toBeDefined();
      expect(data.data.security.cspViolations).toBeDefined();
      expect(data.data.security.rateLimitHits).toBeDefined();
    });

    it('should include alerts array', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(data.data.alerts).toBeDefined();
      expect(Array.isArray(data.data.alerts)).toBe(true);
    });

    it('should include summary data', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(data.data.summary).toBeDefined();
      expect(data.data.summary.totalRequests).toBeDefined();
      expect(data.data.summary.uniqueUsers).toBeDefined();
      expect(data.data.summary.lastUpdated).toBeDefined();
    });
  });

  describe('query parameters', () => {
    it('should filter by source', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard?source=web-vitals',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.source).toBe('web-vitals');
    });

    it('should use custom time range', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard?timeRange=24h',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(data.data.timeRange).toBe('24h');
    });

    it('should use custom environment', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard?environment=staging',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(data.data.environment).toBe('staging');
    });

    it('should handle all parameters together', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard?source=performance&timeRange=7d&environment=development',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(data.data.source).toBe('performance');
      expect(data.data.timeRange).toBe('7d');
      expect(data.data.environment).toBe('development');
    });

    it('should return "all" source when source is explicitly "all"', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard?source=all',
      );

      const response = handleGetRequest(request);
      const data = await response.json();

      expect(data.data.source).toBe('all');
    });
  });

  describe('caching', () => {
    it('should set cache headers', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
      );

      const response = handleGetRequest(request);

      const cacheControl = response.headers.get('Cache-Control');
      expect(cacheControl).toContain('max-age');
    });
  });

  describe('error handling', () => {
    it('should handle URL parsing errors', async () => {
      const mockRequest = {
        url: 'invalid-url',
      } as unknown as NextRequest;

      const response = handleGetRequest(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.errorCode).toBe(API_ERROR_CODES.MONITORING_RETRIEVE_FAILED);
    });
  });
});
