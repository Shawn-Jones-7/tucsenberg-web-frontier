import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Import after mocking
import {
  appendAttributionToFormData,
  captureClickIds,
  captureUtmParams,
  getAttributionAsObject,
  getAttributionSnapshot,
  storeAttributionData,
} from '../utm';

// Mock window and sessionStorage before importing the module
const mockSessionStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockSessionStorage.store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockSessionStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockSessionStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockSessionStorage.store = {};
  }),
};

Object.defineProperty(global, 'window', {
  value: {
    location: {
      search: '',
      pathname: '/test-page',
      href: 'https://example.com/test-page',
    },
    sessionStorage: mockSessionStorage,
  },
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('UTM Parameter Tracking', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.location.search = '';
  });

  describe('captureUtmParams', () => {
    it('should capture all UTM parameters from URL', () => {
      window.location.search =
        '?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale&utm_term=shoes&utm_content=banner1';

      const params = captureUtmParams();

      expect(params).toEqual({
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'spring_sale',
        utmTerm: 'shoes',
        utmContent: 'banner1',
      });
    });

    it('should return empty object when no UTM params present', () => {
      window.location.search = '';

      const params = captureUtmParams();

      expect(params).toEqual({});
    });

    it('should capture partial UTM parameters', () => {
      window.location.search = '?utm_source=newsletter&utm_medium=email';

      const params = captureUtmParams();

      expect(params).toEqual({
        utmSource: 'newsletter',
        utmMedium: 'email',
      });
    });

    it('should sanitize invalid characters', () => {
      window.location.search =
        '?utm_source=valid_source-123&utm_medium=<script>';

      const params = captureUtmParams();

      expect(params).toEqual({
        utmSource: 'valid_source-123',
      });
      expect(params.utmMedium).toBeUndefined();
    });

    it('should truncate long values', () => {
      const longValue = 'a'.repeat(300);
      window.location.search = `?utm_source=${longValue}`;

      const params = captureUtmParams();

      expect(params.utmSource?.length).toBeLessThanOrEqual(256);
    });
  });

  describe('captureClickIds', () => {
    it('should capture Google click ID (gclid)', () => {
      window.location.search = '?gclid=abc123xyz';

      const ids = captureClickIds();

      expect(ids).toEqual({
        gclid: 'abc123xyz',
      });
    });

    it('should capture Facebook click ID (fbclid)', () => {
      window.location.search = '?fbclid=fb_click_123';

      const ids = captureClickIds();

      expect(ids).toEqual({
        fbclid: 'fb_click_123',
      });
    });

    it('should capture Microsoft click ID (msclkid)', () => {
      window.location.search = '?msclkid=ms_click_456';

      const ids = captureClickIds();

      expect(ids).toEqual({
        msclkid: 'ms_click_456',
      });
    });

    it('should capture multiple click IDs', () => {
      window.location.search = '?gclid=g123&fbclid=f456';

      const ids = captureClickIds();

      expect(ids).toEqual({
        gclid: 'g123',
        fbclid: 'f456',
      });
    });

    it('should return empty object when no click IDs present', () => {
      window.location.search = '';

      const ids = captureClickIds();

      expect(ids).toEqual({});
    });
  });

  describe('storeAttributionData', () => {
    it('should store attribution data in sessionStorage', () => {
      window.location.search = '?utm_source=google&gclid=abc123';

      storeAttributionData();

      expect(mockSessionStorage.setItem).toHaveBeenCalled();
      const storedData = JSON.parse(
        mockSessionStorage.store['marketing_attribution'],
      );
      expect(storedData.utmSource).toBe('google');
      expect(storedData.gclid).toBe('abc123');
      expect(storedData.landingPage).toBe('/test-page');
      expect(storedData.capturedAt).toBeDefined();
    });

    it('should not overwrite existing attribution data (first-touch)', () => {
      mockSessionStorage.store['marketing_attribution'] = JSON.stringify({
        utmSource: 'original',
      });

      window.location.search = '?utm_source=new_source';

      storeAttributionData();

      const storedData = JSON.parse(
        mockSessionStorage.store['marketing_attribution'],
      );
      expect(storedData.utmSource).toBe('original');
    });

    it('should not store if no attribution data present', () => {
      window.location.search = '';

      storeAttributionData();

      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getAttributionSnapshot', () => {
    it('should return stored attribution data', () => {
      mockSessionStorage.store['marketing_attribution'] = JSON.stringify({
        utmSource: 'google',
        utmMedium: 'cpc',
        gclid: 'abc123',
      });

      const snapshot = getAttributionSnapshot();

      expect(snapshot).toEqual({
        utmSource: 'google',
        utmMedium: 'cpc',
        gclid: 'abc123',
      });
    });

    it('should fallback to current URL params if no stored data', () => {
      window.location.search = '?utm_source=fallback&fbclid=fb123';

      const snapshot = getAttributionSnapshot();

      expect(snapshot.utmSource).toBe('fallback');
      expect(snapshot.fbclid).toBe('fb123');
    });

    it('should return empty object if no data available', () => {
      window.location.search = '';

      const snapshot = getAttributionSnapshot();

      expect(snapshot).toEqual({});
    });
  });

  describe('getAttributionAsObject', () => {
    it('should return attribution as plain object', () => {
      mockSessionStorage.store['marketing_attribution'] = JSON.stringify({
        utmSource: 'google',
        utmMedium: 'cpc',
        landingPage: '/test',
        capturedAt: '2024-01-01',
      });

      const obj = getAttributionAsObject();

      expect(obj).toEqual({
        utmSource: 'google',
        utmMedium: 'cpc',
      });
      // Should not include non-attribution fields
      expect(obj).not.toHaveProperty('landingPage');
      expect(obj).not.toHaveProperty('capturedAt');
    });
  });

  describe('appendAttributionToFormData', () => {
    it('should append attribution data to FormData', () => {
      mockSessionStorage.store['marketing_attribution'] = JSON.stringify({
        utmSource: 'google',
        utmMedium: 'cpc',
        gclid: 'abc123',
      });

      const formData = new FormData();
      appendAttributionToFormData(formData);

      expect(formData.get('utmSource')).toBe('google');
      expect(formData.get('utmMedium')).toBe('cpc');
      expect(formData.get('gclid')).toBe('abc123');
    });

    it('should not append undefined values', () => {
      mockSessionStorage.store['marketing_attribution'] = JSON.stringify({
        utmSource: 'google',
      });

      const formData = new FormData();
      appendAttributionToFormData(formData);

      expect(formData.get('utmSource')).toBe('google');
      expect(formData.get('utmMedium')).toBeNull();
    });
  });
});
