'use client';

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Check, Languages, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ANIMATION_DURATION_VERY_SLOW } from '@/constants';
import { MAGIC_2000 } from '@/constants/count';
import { Link, usePathname } from '@/i18n/routing';

const TRANSITION_TIMEOUT = ANIMATION_DURATION_VERY_SLOW; // 1 second timeout for language switch

// Custom hook for language switching logic
const useLanguageSwitch = () => {
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  type TimeoutHandle = ReturnType<typeof setTimeout>;

  const transitionTimeoutRef = useRef<TimeoutHandle | null>(null);
  const successResetRef = useRef<TimeoutHandle | null>(null);

  const clearTimers = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (successResetRef.current !== null) {
      clearTimeout(successResetRef.current);
      successResetRef.current = null;
    }
  }, []);

  const resetSuccessState = useCallback(() => {
    setSwitchSuccess(false);
    successResetRef.current = null;
  }, []);

  const scheduleSuccessReset = useCallback(() => {
    successResetRef.current = setTimeout(resetSuccessState, MAGIC_2000);
  }, [resetSuccessState]);

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

export const LanguageToggle = memo(() => {
  const t = useTranslations('language');
  const locale = useLocale();
  const pathname = usePathname();
  const { switchingTo, isPending, handleLanguageSwitch } = useLanguageSwitch();

  return (
    <DropdownMenu data-testid='language-dropdown-menu'>
      <DropdownMenuTrigger
        asChild
        data-testid='language-dropdown-trigger'
      >
        <Button
          variant='outline'
          size='icon'
          disabled={isPending}
          data-testid='language-toggle-button'
        >
          {isPending ? (
            <Loader2 className='h-[1.2rem] w-[1.2rem] animate-spin' />
          ) : (
            <Languages
              className='h-[1.2rem] w-[1.2rem]'
              data-testid='languages-icon'
            />
          )}
          <span className='sr-only'>{t('toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        data-testid='language-dropdown-content'
      >
        <DropdownMenuItem
          asChild
          data-testid='language-dropdown-item'
        >
          <Link
            href={pathname}
            locale='en'
            className='flex items-center'
            onClick={() => handleLanguageSwitch('en')}
            data-testid='language-link-en'
            data-locale='en'
            role='menuitem'
          >
            <span className='bg-muted mr-2 rounded px-1.5 py-0.5 font-mono text-xs'>
              EN
            </span>
            <span>{t('english')}</span>
            {switchingTo === 'en' && (
              <Loader2 className='ml-auto h-4 w-4 animate-spin' />
            )}
            {locale === 'en' && switchingTo !== 'en' && (
              <Check
                className='ml-auto h-4 w-4 text-green-500'
                data-testid='check-icon'
              />
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          data-testid='language-dropdown-item'
        >
          <Link
            href={pathname}
            locale='zh'
            className='flex items-center'
            onClick={() => handleLanguageSwitch('zh')}
            data-testid='language-link-zh'
            data-locale='zh'
            role='menuitem'
          >
            <span className='bg-muted mr-2 rounded px-1.5 py-0.5 font-mono text-xs'>
              ZH
            </span>
            <span>{t('chinese')}</span>
            {switchingTo === 'zh' && (
              <Loader2 className='ml-auto h-4 w-4 animate-spin' />
            )}
            {locale === 'zh' && switchingTo !== 'zh' && (
              <Check
                className='ml-auto h-4 w-4 text-green-500'
                data-testid='check-icon'
              />
            )}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

LanguageToggle.displayName = 'LanguageToggle';
