import type { Locale } from '@/types/i18n';
import {
  BROWSER_LOCALE_MAP,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from '@/lib/locale-constants';
import type { LocaleDetectionResult } from '@/lib/locale-detection-types';
import { CONFIDENCE_WEIGHTS } from '@/lib/locale-detector-constants';
import { LocaleStorageManager } from '@/lib/locale-storage';
import { ONE } from '@/constants';
import { MAGIC_0_7 } from '@/constants/decimal';

/**
 * 客户端语言检测 Hook
 */
export function useClientLocaleDetection() {
  const detectClientLocale = (): LocaleDetectionResult => {
    // 客户端检测逻辑
    const userOverride = LocaleStorageManager.getUserOverride();
    if (userOverride && SUPPORTED_LOCALES.includes(userOverride)) {
      return {
        locale: userOverride,
        source: 'user',
        confidence: ONE,
        details: { userOverride },
      };
    }

    // 浏览器语言检测
    if (typeof navigator !== 'undefined') {
      const languages =
        navigator.languages || (navigator.language ? [navigator.language] : []);

      for (const lang of languages) {
        if (!lang || typeof lang !== 'string') continue;
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
            details: {
              browserLocale: detectedLocale,
              browserLanguages: [...languages],
            },
          };
        }
      }
    }

    return {
      locale: DEFAULT_LOCALE,
      source: 'default',
      confidence: CONFIDENCE_WEIGHTS.DEFAULT_FALLBACK,
      details: { fallbackUsed: true },
    };
  };

  return { detectClientLocale };
}
