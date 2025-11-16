import { memo } from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { Locale } from '@/types/i18n';
import { getLanguageConfig } from '@/components/i18n/locale-switcher/config';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/routing';

interface LanguageItemProps {
  targetLocale: Locale;
  currentLocale: Locale;
  switchingTo: Locale | null;
  pathname: string;
  compact: boolean;
  onLanguageSwitch: (_locale: Locale) => void;
}

export const LanguageItem = memo(
  ({
    targetLocale,
    currentLocale,
    switchingTo,
    pathname,
    compact,
    onLanguageSwitch,
  }: LanguageItemProps) => {
    const config = getLanguageConfig(targetLocale);
    const isActive = currentLocale === targetLocale;
    const isSwitching = switchingTo === targetLocale;

    return (
      <DropdownMenuItem
        key={targetLocale}
        asChild
      >
        <Link
          href={pathname as '/' | '/about' | '/contact' | '/blog' | '/products'}
          locale={targetLocale}
          className='flex w-full items-center justify-between'
          onClick={() => onLanguageSwitch(targetLocale)}
        >
          <div className='flex items-center space-x-3'>
            <span className='text-lg'>{config.flag}</span>
            <div className='flex flex-col'>
              <div className='flex items-center space-x-2'>
                <span className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
                  {config.code}
                </span>
                <span className='font-medium'>{config.nativeName}</span>
              </div>
              {!compact && (
                <span className='text-xs text-muted-foreground'>
                  {config.name} • {config.region}
                </span>
              )}
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            {isSwitching && (
              <Loader2 className='h-4 w-4 animate-spin text-blue-500' />
            )}
            {isActive && !isSwitching && (
              <Check className='h-4 w-4 text-green-500' />
            )}
          </div>
        </Link>
      </DropdownMenuItem>
    );
  },
);

LanguageItem.displayName = 'LanguageItem';
