/**
 * 语言检测器基础方法
 *
 * 提供浏览器检测、地理位置检测、时区检测等基础检测方法
 */

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/locale-constants';
import { ANIMATION_DURATION_VERY_SLOW, COUNT_TEN, SECONDS_PER_MINUTE } from '@/constants';

import type { Locale } from '@/types/i18n';
import {
  COUNTRY_CODE_TO_LOCALE_MAP,
  DETECTION_TIMEOUTS,
  GEO_API_CONFIG,
  LANGUAGE_CODE_TO_LOCALE_MAP,
  TIMEZONE_TO_LOCALE_MAP,
} from '@/lib/locale-detector-constants';

/**
 * 基础语言检测器
 * Base locale detector with fundamental detection methods
 */
export class BaseLocaleDetector {
  /**
   * 安全地从语言映射中获取语言
   * Safely get locale from language mapping
   * 使用白名单验证，避免 Object Injection Sink
   */
  protected getLocaleFromLanguageCode(
    normalizedLang: string,
  ): Locale | undefined {
    if (!normalizedLang || typeof normalizedLang !== 'string') {
      return undefined;
    }

    const locale = LANGUAGE_CODE_TO_LOCALE_MAP.get(
      normalizedLang.toLowerCase(),
    );
    return locale && SUPPORTED_LOCALES.includes(locale) ? locale : undefined;
  }

  /**
   * 安全地从地理位置映射中获取语言
   * Safely get locale from geo mapping
   * 使用白名单验证，避免 Object Injection Sink
   */
  protected getLocaleFromCountryCode(
    countryCode: string | undefined,
  ): Locale | undefined {
    if (!countryCode || typeof countryCode !== 'string') {
      return undefined;
    }

    const locale = COUNTRY_CODE_TO_LOCALE_MAP.get(countryCode.toUpperCase());
    return locale && SUPPORTED_LOCALES.includes(locale) ? locale : undefined;
  }

  /**
   * 安全地从时区映射中获取语言
   * Safely get locale from timezone mapping
   */
  protected getLocaleFromTimeZone(
    timeZone: string | undefined,
  ): Locale | undefined {
    if (!timeZone || typeof timeZone !== 'string') {
      return undefined;
    }

    const locale = TIMEZONE_TO_LOCALE_MAP.get(timeZone);
    return locale && SUPPORTED_LOCALES.includes(locale) ? locale : undefined;
  }

  /**
   * 从浏览器检测语言
   * Detect locale from browser
   */
  detectFromBrowser(): Locale {
    try {
      if (typeof navigator === 'undefined') {
        return DEFAULT_LOCALE;
      }

      const languages = navigator.languages || [navigator.language];

      for (const lang of languages) {
        const normalizedLang = lang.toLowerCase();
        const detectedLocale = this.getLocaleFromLanguageCode(normalizedLang);

        if (detectedLocale) {
          return detectedLocale;
        }

        // 尝试提取主要语言代码 (例如: 'zh-CN' -> 'zh')
        const [primaryLang] = normalizedLang.split('-');
        const primaryLocale = this.getLocaleFromLanguageCode(primaryLang);

        if (primaryLocale) {
          return primaryLocale;
        }
      }

      return DEFAULT_LOCALE;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Browser locale detection failed:', error);
      }
      return DEFAULT_LOCALE;
    }
  }

  /**
   * 从地理位置检测语言
   * Detect locale from geolocation
   */
  async detectFromGeolocation(): Promise<Locale> {
    try {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return DEFAULT_LOCALE;
      }

      return await new Promise<Locale>((resolve) => {
        const timeoutId = setTimeout(() => {
          resolve(DEFAULT_LOCALE);
        }, DETECTION_TIMEOUTS.GEOLOCATION);

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            clearTimeout(timeoutId);
            try {
              const countryCode = await this.getCountryFromCoordinates(
                position.coords.latitude,
                position.coords.longitude,
              );

              const detectedLocale = this.getLocaleFromCountryCode(countryCode);
              resolve(detectedLocale || DEFAULT_LOCALE);
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('Geolocation API failed:', error);
              }
              resolve(DEFAULT_LOCALE);
            }
          },
          (error) => {
            clearTimeout(timeoutId);
            if (process.env.NODE_ENV === 'development') {
              console.warn('Geolocation permission denied or failed:', error);
            }
            resolve(DEFAULT_LOCALE);
          },
          {
            timeout: DETECTION_TIMEOUTS.GEOLOCATION,
            enableHighAccuracy: false,
            maximumAge: COUNT_TEN * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW, // 10分钟缓存
          },
        );
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Geolocation detection failed:', error);
      }
      return DEFAULT_LOCALE;
    }
  }

  /**
   * 从时区检测语言
   * Detect locale from timezone
   */
  detectFromTimeZone(): Locale {
    try {
      if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
        return DEFAULT_LOCALE;
      }

      const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
      const detectedLocale = this.getLocaleFromTimeZone(timeZone);

      return detectedLocale || DEFAULT_LOCALE;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Timezone detection failed:', error);
      }
      return DEFAULT_LOCALE;
    }
  }

  /**
   * 从IP地址检测语言
   * Detect locale from IP address
   */
  async detectFromIP(): Promise<Locale> {
    try {
      const countryCode = await this.getCountryFromIP();
      const detectedLocale = this.getLocaleFromCountryCode(countryCode);

      return detectedLocale || DEFAULT_LOCALE;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('IP-based detection failed:', error);
      }
      return DEFAULT_LOCALE;
    }
  }

  /**
   * 根据坐标获取国家代码
   * Get country code from coordinates
   */
  private async getCountryFromCoordinates(
    lat: number,
    lng: number,
  ): Promise<string | undefined> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      DETECTION_TIMEOUTS.NETWORK_REQUEST,
    );

    try {
      // 在实际应用中，这里应该调用真实的地理位置API
      // 例如: Google Geocoding API, OpenStreetMap Nominatim, 等
      const response = await fetch(
        `https://api.example.com/geo?lat=${lat}&lng=${lng}`,
        {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.country || data.country_code || data.countryCode;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Geolocation API request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 根据IP地址获取国家代码
   * Get country code from IP address
   */
  private async getCountryFromIP(): Promise<string | undefined> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      DETECTION_TIMEOUTS.NETWORK_REQUEST,
    );

    try {
      // 尝试多个IP地理位置API
      for (const endpoint of GEO_API_CONFIG.ENDPOINTS) {
        const cc = await this.fetchCountryCode(endpoint, controller.signal);
        if (cc) return cc;
      }

      throw new Error('All IP geolocation endpoints failed');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('IP geolocation request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 单个端点获取国家代码（早返回，降低嵌套）
   */
  private async fetchCountryCode(
    endpoint: string,
    signal: AbortSignal,
  ): Promise<string | undefined> {
    try {
      const response = await fetch(endpoint, {
        signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return undefined;
      const data = await response.json();
      const cc = data.country || data.country_code || data.countryCode;
      return typeof cc === 'string' ? cc : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * 验证检测到的语言是否受支持
   * Validate if detected locale is supported
   */
  protected validateLocale(locale: Locale | undefined): Locale {
    return locale && SUPPORTED_LOCALES.includes(locale)
      ? locale
      : DEFAULT_LOCALE;
  }

  /**
   * 获取浏览器支持的语言列表
   * Get browser supported languages
   */
  getBrowserLanguages(): string[] {
    try {
      if (typeof navigator === 'undefined') {
        return [];
      }

      return navigator.languages
        ? Array.from(navigator.languages)
        : [navigator.language];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to get browser languages:', error);
      }
      return [];
    }
  }

  /**
   * 获取当前时区信息
   * Get current timezone info
   */
  getTimeZoneInfo(): { timeZone: string; offset: number } | null {
    try {
      if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
        return null;
      }

      const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
      const offset = new Date().getTimezoneOffset();

      return { timeZone, offset };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to get timezone info:', error);
      }
      return null;
    }
  }
}
