import { useMemo } from 'react';
import { MAGIC_0_8, MAGIC_0_5 } from '@/constants/magic-numbers';

import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/types/i18n';
import { useClientLocaleDetection } from '@/lib/locale-detection';
import { useLocaleStorage } from '@/lib/locale-storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from '@/i18n/routing';
import type { EnhancedLocaleSwitcherProps } from '@/components/i18n/locale-switcher/config';
import { LANGUAGE_CONFIG, SOURCE_ICONS } from '@/components/i18n/locale-switcher/config';
import { LanguageItem } from '@/components/i18n/locale-switcher/language-item';
import { useLanguageSwitch } from '@/components/i18n/locale-switcher/use-language-switch';

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
  const detectionInfo = useMemo(() => {
    if (!showDetectionInfo) return null;

    const stats = getStats();
    const detection = _detectClientLocale();

    if (!detection) return null;

    return {
      source: stats.data?.hasOverride ? 'user' : detection.source,
      confidence: detection.confidence,
      isUserOverride: stats.data?.hasOverride || false,
    };
  }, [showDetectionInfo, getStats, _detectClientLocale]);

  const renderDetectionInfo = () => {
    if (!showDetectionInfo || !detectionInfo) return null;

    const SourceIcon =
      SOURCE_ICONS[detectionInfo.source as keyof typeof SOURCE_ICONS] ||
      Languages;
    const confidenceColor =
      detectionInfo.confidence > MAGIC_0_8
        ? 'green'
        : detectionInfo.confidence > MAGIC_0_5
          ? 'yellow'
          : 'red';

    return (
      <>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className='text-muted-foreground text-xs'>
          Detection Info
        </DropdownMenuLabel>
        <div className='px-2 py-1 text-xs'>
          <div className='mb-1 flex items-center justify-between'>
            <div className='flex items-center space-x-1'>
              <SourceIcon className='h-3 w-3' />
              <span>Source: {detectionInfo.source}</span>
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
              {Math.round(detectionInfo.confidence * 100)}%
            </Badge>
          </div>
          {detectionInfo.isUserOverride && (
            <div className='text-xs text-blue-600'>✓ User preference saved</div>
          )}
        </div>
      </>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className={`relative ${className}`}
          disabled={isPending}
        >
          {compact ? (
            <div className='flex items-center space-x-1'>
              <span className='text-sm'>{LANGUAGE_CONFIG[locale].flag}</span>
              <span className='font-mono text-xs'>
                {LANGUAGE_CONFIG[locale].code}
              </span>
            </div>
          ) : (
            <div className='flex items-center space-x-2'>
              <Languages className='h-4 w-4' />
              <span className='hidden sm:inline'>
                {LANGUAGE_CONFIG[locale].nativeName}
              </span>
              <span className='font-mono text-xs sm:hidden'>
                {LANGUAGE_CONFIG[locale].code}
              </span>
            </div>
          )}

          {switchSuccess && (
            <div className='absolute -top-1 -right-1'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
            </div>
          )}

          <span className='sr-only'>{t('toggle')}</span>
        </Button>
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

        {Object.keys(LANGUAGE_CONFIG).map((lang) => (
          <LanguageItem
            key={lang}
            targetLocale={lang as Locale}
            currentLocale={locale}
            switchingTo={switchingTo}
            pathname={pathname}
            compact={compact}
            onLanguageSwitch={handleLanguageSwitch}
          />
        ))}

        {renderDetectionInfo()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
