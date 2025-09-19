/**
 * Language Switcher Component
 *
 * Enhanced language switching component for the navigation bar.
 * Features smooth transitions, loading states, and accessibility.
 */
'use client';

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Check, Globe, Languages, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { NAVIGATION_ARIA } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LOCALES_CONFIG } from '@/config/paths';
import { COUNT_PAIR } from '@/constants';
import { UI_TIMINGS } from '@/constants/i18n-constants';
import { Link, usePathname } from '@/i18n/routing';

/**
 * Language Switcher Component
 *
 * Enhanced language switching component for the navigation bar.
 * Features smooth transitions, loading states, and accessibility.
 */

// Use centralized timing constants to avoid magic numbers
const TRANSITION_DIVISOR = COUNT_PAIR;
const TRANSITION_TIMEOUT =
  UI_TIMINGS.LANGUAGE_SWITCH_ANIMATION / TRANSITION_DIVISOR; // 1 second for transition
const SUCCESS_INDICATOR_TIMEOUT = UI_TIMINGS.SUCCESS_DISPLAY_DURATION; // 2 seconds for success indicator

// Language configuration - using centralized config to avoid hardcoding
const LANGUAGES = [
  {
    code: 'en' as const,
    name: 'English',
    nativeName: LOCALES_CONFIG.displayNames.en,
    flag: '🇺🇸',
  },
  {
    code: 'zh' as const,
    name: 'Chinese',
    nativeName: LOCALES_CONFIG.displayNames.zh,
    flag: '🇨🇳',
  },
] as const;

// Custom hook for language switching logic
const useLanguageSwitch = () => {
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  type TimeoutHandle = ReturnType<typeof setTimeout>;

  const transitionTimeoutRef = useRef<TimeoutHandle | null>(null);
  const successTimeoutRef = useRef<TimeoutHandle | null>(null);

  const clearTimers = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (successTimeoutRef.current !== null) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  }, []);

  const resetSuccessIndicator = useCallback(() => {
    setSwitchSuccess(false);
    successTimeoutRef.current = null;
  }, []);

  const scheduleSuccessReset = useCallback(() => {
    successTimeoutRef.current = setTimeout(
      resetSuccessIndicator,
      SUCCESS_INDICATOR_TIMEOUT,
    );
  }, [resetSuccessIndicator]);

  const finalizeSwitch = useCallback(() => {
    setSwitchingTo(null);
    setSwitchSuccess(true);
    scheduleSuccessReset();
    transitionTimeoutRef.current = null;
  }, [scheduleSuccessReset]);

  const scheduleTransition = useCallback(() => {
    transitionTimeoutRef.current = setTimeout(
      finalizeSwitch,
      TRANSITION_TIMEOUT,
    );
  }, [finalizeSwitch]);

  const handleLanguageSwitch = useCallback(
    (newLocale: string) => {
      clearTimers();
      setSwitchingTo(newLocale);
      setSwitchSuccess(false);
      startTransition(scheduleTransition);
    },
    [clearTimers, scheduleTransition],
  );

  useEffect(() => clearTimers, [clearTimers]);

  return {
    switchingTo,
    switchSuccess,
    isPending,
    handleLanguageSwitch,
  };
};

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact';
  showLabel?: boolean;
}

export const LanguageSwitcher = memo(
  ({
    className,
    variant = 'default',
    showLabel = false,
  }: LanguageSwitcherProps) => {
    const t = useTranslations('language');
    const locale = useLocale();
    const pathname = usePathname();
    const { switchingTo, isPending, handleLanguageSwitch } =
      useLanguageSwitch();

    const currentLanguage = LANGUAGES.find((lang) => lang.code === locale);
    const isCompact = variant === 'compact';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size={isCompact ? 'sm' : 'icon'}
            disabled={isPending}
            className={cn(
              'transition-colors duration-200',
              isCompact && 'gap-1 px-2',
              className,
            )}
            aria-label={NAVIGATION_ARIA.languageSelector}
          >
            {isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : isCompact ? (
              <Globe className='h-4 w-4' />
            ) : (
              <Languages className='h-4 w-4' />
            )}

            {isCompact && currentLanguage && (
              <span className='text-xs font-medium'>
                {currentLanguage.code.toUpperCase()}
              </span>
            )}

            {showLabel && <span className='ml-1 text-sm'>{t('toggle')}</span>}

            <span className='sr-only'>{t('toggle')}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          className='w-48'
          aria-label={t('selectLanguage')}
        >
          {LANGUAGES.map((language) => {
            const isActive = locale === language.code;
            const isSwitching = switchingTo === language.code;

            return (
              <DropdownMenuItem
                key={language.code}
                asChild
              >
                <Link
                  href={pathname}
                  locale={language.code as 'en' | 'zh'}
                  className={cn(
                    'flex w-full cursor-pointer items-center',
                    isActive && 'bg-accent',
                  )}
                  onClick={() => handleLanguageSwitch(language.code)}
                >
                  <span
                    className='mr-2 text-base'
                    role='img'
                    aria-hidden='true'
                  >
                    {language.flag}
                  </span>

                  <div className='flex flex-1 flex-col'>
                    <span className='font-medium'>{language.nativeName}</span>
                    <span className='text-muted-foreground text-xs'>
                      {language.name}
                    </span>
                  </div>

                  {isSwitching && (
                    <Loader2 className='ml-auto h-4 w-4 animate-spin' />
                  )}

                  {isActive && !isSwitching && (
                    <Check className='ml-auto h-4 w-4 text-green-500' />
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

LanguageSwitcher.displayName = 'LanguageSwitcher';

// Compact version for mobile or space-constrained areas
export const LanguageSwitcherCompact = memo(
  ({ className }: { className?: string }) => {
    const props = {
      variant: 'compact' as const,
      ...(className && { className }),
    };

    return <LanguageSwitcher {...props} />;
  },
);

LanguageSwitcherCompact.displayName = 'LanguageSwitcherCompact';
