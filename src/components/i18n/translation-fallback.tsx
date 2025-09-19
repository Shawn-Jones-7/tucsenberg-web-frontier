'use client';

import { memo, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { TranslationParams } from '@/types/i18n';
import { MAGIC_0_1, PERCENTAGE_FULL } from '@/constants/decimal';
import { ZERO } from '@/constants/magic-numbers';

// import { Alert, AlertDescription } from '@/components/ui/alert';

interface TranslationFallbackProps {
  translationKey: string;
  fallbackText?: string | undefined;
  showWarning?: boolean;
  className?: string | undefined;
}

export const TranslationFallback = memo(
  ({
    translationKey,
    fallbackText,
    showWarning = process.env.NODE_ENV === 'development',
    className,
  }: TranslationFallbackProps) => {
    const t = useTranslations();
    const locale = useLocale();
    const [hasMissingTranslation, setHasMissingTranslation] = useState(false);

    useEffect(() => {
      // Check if translation exists
      try {
        const translation = t(translationKey as never);
        if (translation === translationKey) {
          setHasMissingTranslation(true);
          // Log missing translation in development
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `Missing translation for key: ${translationKey} in locale: ${locale}`,
            );
          }
        }
      } catch {
        setHasMissingTranslation(true);
      }
    }, [translationKey, locale, t]);

    if (hasMissingTranslation) {
      const displayText = fallbackText || translationKey;

      return (
        <span className={className}>
          {displayText}
          {showWarning && (
            <span
              className='ml-1 text-yellow-500'
              title='Translation missing'
            >
              ⚠️
            </span>
          )}
        </span>
      );
    }

    return <span className={className}>{t(translationKey as never)}</span>;
  },
);
TranslationFallback.displayName = 'TranslationFallback';

interface SafeTranslationProps {
  translationKey: string;
  values?: TranslationParams;
  fallbackText?: string | undefined;
  className?: string | undefined;
}

export const SafeTranslation = memo(
  ({
    translationKey,
    values,
    fallbackText,
    className,
  }: SafeTranslationProps) => {
    const t = useTranslations();
    const locale = useLocale();

    try {
      // 某些严格消息类型配置下，useTranslations 第二参数在未声明消息形状时会被推断为不可用
      // 通过宽松的局部签名适配（不使用 any）避免类型不匹配，同时保留运行时安全
      const tAny = t as unknown as (
        key: string,
        params?: Record<string, unknown>,
      ) => string;
      const translation = values
        ? tAny(translationKey, values as Record<string, unknown>)
        : tAny(translationKey);

      // Check if translation actually exists (not just returning the key)
      if (translation === translationKey && !fallbackText) {
        return (
          <TranslationFallback
            translationKey={translationKey}
            fallbackText={fallbackText}
            className={className}
          />
        );
      }

      return (
        <span
          className={className}
          lang={locale}
        >
          {translation}
        </span>
      );
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Translation error for key: ${translationKey}`, error);
      }

      return (
        <TranslationFallback
          translationKey={translationKey}
          fallbackText={fallbackText || 'Translation error'}
          className={className}
        />
      );
    }
  },
);
SafeTranslation.displayName = 'SafeTranslation';

interface TranslationStatusProps {
  className?: string;
}

export const TranslationStatus = memo(
  ({ className }: TranslationStatusProps) => {
    const locale = useLocale();
    const t = useTranslations('language');
    const [missingCount, setMissingCount] = useState(ZERO);

    useEffect(() => {
      // In a real application, you would check translation coverage
      // This is a simplified example
      const checkTranslationCoverage = () => {
        // Simulate checking translation coverage
        const coverage = Math.random() * 100;
        if (coverage < 95) {
          setMissingCount(Math.floor((PERCENTAGE_FULL - coverage) * MAGIC_0_1));
        }
      };

      checkTranslationCoverage();
    }, [locale]);

    if (missingCount === 0) {
      return null;
    }

    return (
      <div
        className={`flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 ${className || ''}`}
      >
        <AlertTriangle className='h-4 w-4 text-yellow-600' />
        <span className='text-sm text-yellow-800'>{t('fallbackWarning')}</span>
      </div>
    );
  },
);
TranslationStatus.displayName = 'TranslationStatus';

// Hook for checking translation completeness
export function useTranslationStatus() {
  const locale = useLocale();
  const [status, setStatus] = useState({
    isComplete: true,
    missingKeys: [] as string[],
    coverage: PERCENTAGE_FULL,
  });

  useEffect(() => {
    // In a real application, you would implement actual translation checking
    // This is a placeholder implementation
    const checkStatus = async () => {
      try {
        // Simulate API call to check translation status
        const response = await fetch(
          `/api/translations/status?locale=${locale}`,
        );
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch {
        // Fallback to optimistic status
        setStatus({
          isComplete: true,
          missingKeys: [],
          coverage: PERCENTAGE_FULL,
        });
      }
    };

    checkStatus();
  }, [locale]);

  return status;
}
