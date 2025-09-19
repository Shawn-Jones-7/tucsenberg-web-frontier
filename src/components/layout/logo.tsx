/**
 * Logo Component
 *
 * Responsive logo component with proper accessibility and theming support.
 * Supports both text and image logos with automatic dark mode handling.
 */
'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { HOURS_PER_DAY } from '@/constants';
import { COUNT_120 } from '@/constants/count';
import { Link } from '@/i18n/routing';

/**
 * Logo Component
 *
 * Responsive logo component with proper accessibility and theming support.
 * Supports both text and image logos with automatic dark mode handling.
 */

/**
 * Logo Component
 *
 * Responsive logo component with proper accessibility and theming support.
 * Supports both text and image logos with automatic dark mode handling.
 */

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const t = useTranslations('seo');

  const getSizeClass = (sizeValue: 'sm' | 'md' | 'lg'): string => {
    switch (sizeValue) {
      case 'sm':
        return 'h-6 w-auto';
      case 'md':
        return 'h-8 w-auto';
      case 'lg':
        return 'h-10 w-auto';
      default:
        return 'h-8 w-auto';
    }
  };

  const getTextSizeClass = (sizeValue: 'sm' | 'md' | 'lg'): string => {
    switch (sizeValue) {
      case 'sm':
        return 'text-lg';
      case 'md':
        return 'text-xl';
      case 'lg':
        return 'text-2xl';
      default:
        return 'text-xl';
    }
  };

  return (
    <Link
      href='/'
      className={cn(
        'flex items-center gap-2 transition-opacity hover:opacity-80',
        className,
      )}
      aria-label={t('siteName')}
    >
      {/* Logo Image - Using Next.js logo as placeholder */}
      <Image
        src='/next.svg'
        alt=''
        width={COUNT_120}
        height={HOURS_PER_DAY}
        className={cn(
          'transition-all duration-200 dark:invert',
          getSizeClass(size),
        )}
        priority
      />

      {/* Logo Text */}
      {showText && (
        <span
          className={cn(
            'text-foreground hidden font-bold sm:block',
            getTextSizeClass(size),
          )}
        >
          Tucsenberg
        </span>
      )}
    </Link>
  );
}

// Compact logo for mobile/small spaces
export function LogoCompact({ className }: { className?: string }) {
  const props = {
    showText: false as const,
    size: 'sm' as const,
    ...(className && { className }),
  };

  return <Logo {...props} />;
}

// Large logo for headers/hero sections
export function LogoLarge({ className }: { className?: string }) {
  const props = {
    showText: true as const,
    size: 'lg' as const,
    ...(className && { className }),
  };

  return <Logo {...props} />;
}
