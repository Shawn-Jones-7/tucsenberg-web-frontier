'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MAGIC_2000 } from "@/constants/count";
import { ANIMATION_DURATION_VERY_SLOW } from "@/constants/magic-numbers";
import { Link, usePathname } from '@/i18n/routing';
import { Check, Languages, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { memo, useState, useTransition } from 'react';

const TRANSITION_TIMEOUT = ANIMATION_DURATION_VERY_SLOW; // 1 second timeout for language switch

// Custom hook for language switching logic
const useLanguageSwitch = () => {
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [switchSuccess, setSwitchSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLanguageSwitch = (newLocale: string) => {
    setSwitchingTo(newLocale);
    setSwitchSuccess(false);

    startTransition(() => {
      // The transition will be handled by the Link component
      setTimeout(() => {
        setSwitchingTo(null);
        setSwitchSuccess(true);
        // Hide success indicator after 2 seconds
        setTimeout(() => setSwitchSuccess(false), MAGIC_2000);
      }, TRANSITION_TIMEOUT);
    });
  };

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
