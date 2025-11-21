'use client';

import React, { useMemo } from 'react';
import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/types/i18n';
import { useClientLocaleDetection } from '@/lib/locale-detection';
import type { DetectionSource } from '@/lib/locale-detector';
import { useLocaleStorage } from '@/lib/locale-storage';
import {
  getLanguageConfig,
  SOURCE_ICONS,
  SUPPORTED_LOCALES,
  type EnhancedLocaleSwitcherProps,
} from '@/components/i18n/locale-switcher/config';
import { LanguageItem } from '@/components/i18n/locale-switcher/language-item';
import { useLanguageSwitch } from '@/components/i18n/locale-switcher/use-language-switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MAGIC_0_5, MAGIC_0_8, PERCENTAGE_FULL } from '@/constants/decimal';
import { usePathname } from '@/i18n/routing';

const resolveLanguageConfig = (locale: Locale) => getLanguageConfig(locale);

const resolveSourceIcon = (source: DetectionSource): typeof Languages => {
  switch (source) {
    case 'user':
    case 'stored':
      return SOURCE_ICONS.user;
    case 'geo':
    case 'timezone':
      return SOURCE_ICONS.geo;
    case 'browser':
    case 'combined':
    case 'default':
      return SOURCE_ICONS.browser;
    default:
      return Languages;
  }
};

interface DetectionMeta {
  source: DetectionSource;
  confidence: number;
  isUserOverride: boolean;
}

function DetectionInfoSection({
  visible,
  source,
  confidence,
  isUserOverride,
}: {
  visible: boolean;
  source: DetectionSource;
  confidence: number;
  isUserOverride: boolean;
}) {
  const t = useTranslations('language.detector');
  // ✅ Fixed: Memoize icon component reference to avoid re-resolving on each render
  const IconComponent = useMemo(() => resolveSourceIcon(source), [source]);
  if (!visible) return null;
  const confidenceColor =
    confidence > MAGIC_0_8
      ? 'green'
      : confidence > MAGIC_0_5
        ? 'yellow'
        : 'red';
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className='text-xs text-muted-foreground'>
        {t('title')}
      </DropdownMenuLabel>
      <div className='px-2 py-1 text-xs'>
        <div className='mb-1 flex items-center justify-between'>
          <div className='flex items-center space-x-1'>
            {React.createElement(IconComponent, { className: 'h-3 w-3' })}
            <span>
              {t('source')}: {t(`sources.${source}`)}
            </span>
          </div>
          <Badge
            variant='outline'
            className={`text-xs ${
              confidenceColor === 'green'
                ? 'border-green-500 text-green-700'
                : confidenceColor === 'yellow'
                  ? 'border-yellow-500 text-yellow-700'
                  : 'border-red-500 text-red-700'
            }`}
          >
            {Math.round(confidence * PERCENTAGE_FULL)}%
          </Badge>
        </div>
        {isUserOverride && (
          <div className='text-xs text-blue-600'>{t('userSaved')}</div>
        )}
      </div>
    </>
  );
}

function LocaleTrigger({
  locale,
  compact,
  className,
  isPending,
  switchSuccess,
}: {
  locale: Locale;
  compact: boolean;
  className: string;
  isPending: boolean;
  switchSuccess: boolean;
}) {
  const cfg = resolveLanguageConfig(locale);
  const t = useTranslations('language');
  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className={`relative ${className}`}
        disabled={isPending}
      >
        {compact ? (
          <div className='flex items-center space-x-1'>
            <span className='text-sm'>{cfg.flag}</span>
            <span className='font-mono text-xs'>{cfg.code}</span>
          </div>
        ) : (
          <div className='flex items-center space-x-2'>
            <Languages className='h-4 w-4' />
            <span className='hidden sm:inline'>{cfg.nativeName}</span>
            <span className='font-mono text-xs sm:hidden'>{cfg.code}</span>
          </div>
        )}
        {switchSuccess && (
          <div className='absolute -right-1 -top-1'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
          </div>
        )}
        <span className='sr-only'>{t('toggle')}</span>
      </Button>
    </>
  );
}

export const EnhancedLocaleSwitcherComponent = ({
  showDetectionInfo = false,
  compact = false,
  className = '',
}: EnhancedLocaleSwitcherProps) => {
  const t = useTranslations('language');
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const { switchingTo, switchSuccess, isPending, handleLanguageSwitch } =
    useLanguageSwitch();
  const { getStats } = useLocaleStorage();
  const { detectClientLocale: _detectClientLocale } =
    useClientLocaleDetection();

  // 计算检测信息 - 使用useMemo避免派生状态
  const detectionInfo = useMemo<DetectionMeta | null>(() => {
    if (!showDetectionInfo) return null;

    const stats = getStats();
    const detection = _detectClientLocale();

    if (!detection) return null;

    const resolvedSource = (
      stats.data?.hasOverride ? 'user' : detection.source
    ) as DetectionSource;

    return {
      source: resolvedSource,
      confidence: detection.confidence,
      isUserOverride: stats.data?.hasOverride || false,
    };
  }, [showDetectionInfo, getStats, _detectClientLocale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <LocaleTrigger
          locale={locale}
          compact={compact}
          className={className}
          isPending={isPending}
          switchSuccess={switchSuccess}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='w-56'
      >
        <DropdownMenuLabel className='flex items-center space-x-2'>
          <Languages className='h-4 w-4' />
          <span>{t('selectLanguage')}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {SUPPORTED_LOCALES.map((supportedLocale) => (
          <LanguageItem
            key={supportedLocale}
            targetLocale={supportedLocale}
            currentLocale={locale}
            switchingTo={switchingTo}
            pathname={pathname}
            compact={compact}
            onLanguageSwitch={handleLanguageSwitch}
          />
        ))}
        <DetectionInfoSection
          visible={Boolean(showDetectionInfo && detectionInfo)}
          source={detectionInfo?.source ?? 'browser'}
          confidence={detectionInfo?.confidence ?? 0}
          isUserOverride={Boolean(detectionInfo?.isUserOverride)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
