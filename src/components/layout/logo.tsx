/**
 * Logo Component
 *
 * Responsive logo component with proper accessibility and theming support.
 * Supports both text and image logos with automatic dark mode handling.
 * P0-2 Fix: Converted to Server Component (no interactivity needed)
 */

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SITE_CONFIG } from '@/config/paths/site-config';
import { HOURS_PER_DAY } from '@/constants';
import { COUNT_120 } from '@/constants/count';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  locale?: string | undefined;
}

export function Logo({
  className,
  showText = true,
  size = 'md',
  ariaLabel = SITE_CONFIG.name,
  locale,
}: LogoProps) {
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
      href={locale ? `/${locale}` : '/'}
      className={cn(
        'flex items-center gap-2 transition-opacity hover:opacity-80',
        className,
      )}
      aria-label={ariaLabel}
    >
      {/* Logo Image - Using Next.js logo as placeholder */}
      <Image
        src='/next.svg'
        alt={`${SITE_CONFIG.name} Logo`}
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
            'header-logo-text-desktop-only font-bold text-foreground',
            getTextSizeClass(size),
          )}
        >
          {SITE_CONFIG.name}
        </span>
      )}
    </Link>
  );
}

// Compact logo for mobile/small spaces
export function LogoCompact({
  className,
  locale,
}: {
  className?: string;
  locale?: string;
}) {
  return (
    <Logo
      showText={false}
      size='sm'
      className={className ?? ''}
      locale={locale}
    />
  );
}

// Large logo for headers/hero sections
export function LogoLarge({
  className,
  locale,
}: {
  className?: string;
  locale?: string;
}) {
  return (
    <Logo
      showText={true}
      size='lg'
      className={className ?? ''}
      locale={locale}
    />
  );
}
