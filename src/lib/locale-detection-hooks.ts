import type { Locale } from '@/types/i18n';
import {
  BROWSER_LOCALE_MAP,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from '@/lib/locale-constants';
import type { LocaleDetectionResult } from '@/lib/locale-detection-types';
import { LocaleStorageManager } from '@/lib/locale-storage';
import { ONE } from '@/constants';
import { MAGIC_0_5, MAGIC_0_7 } from '@/constants/decimal';

/**
 * 客户端语言检测 Hook
 */
export function useClientLocaleDetection() {
  const detectClientLocale = (): LocaleDetectionResult => {
    // 客户端检测逻辑
    const userOverride = LocaleStorageManager.getUserOverride();
    if (userOverride) {
      return {
        locale: userOverride,
        source: 'user',
        confidence: ONE,
        details: { userOverride },
      };
    }

    // 浏览器语言检测
    if (typeof navigator !== 'undefined') {
      const languages = navigator.languages || [navigator.language];

      for (const lang of languages) {
        const normalizedLang = lang.toLowerCase();
        // 安全的对象属性访问，避免对象注入
        const detectedLocale = Object.prototype.hasOwnProperty.call(
          BROWSER_LOCALE_MAP,
          normalizedLang,
        )
          ? Object.prototype.hasOwnProperty.call(
              BROWSER_LOCALE_MAP,
              normalizedLang,
            )
            ? (BROWSER_LOCALE_MAP as Record<string, Locale>)[
                normalizedLang as keyof typeof BROWSER_LOCALE_MAP
              ]
            : undefined
          : undefined;

        if (detectedLocale && SUPPORTED_LOCALES.includes(detectedLocale)) {
          return {
            locale: detectedLocale,
            source: 'browser',
            confidence: MAGIC_0_7,
            details: { browserLanguages: [...languages] },
          };
        }
      }
    }

    return {
      locale: DEFAULT_LOCALE,
      source: 'default',
      confidence: MAGIC_0_5,
      details: { fallbackUsed: true },
    };
  };

  return { detectClientLocale };
}
