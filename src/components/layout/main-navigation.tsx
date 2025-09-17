/**
 * Main Navigation Component (Desktop)
 *
 * Horizontal navigation menu for desktop and tablet viewports.
 * Features active state highlighting, keyboard navigation, and accessibility.
 */
'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { COUNT_4 } from "@/constants/count";
import { ZERO } from "@/constants/magic-numbers";
import { Link } from '@/i18n/routing';
import {
  isActivePath,
  mainNavigation,
  NAVIGATION_ARIA,
} from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

// Component implementation

interface MainNavigationProps {
  className?: string;
  variant?: 'default' | 'compact';
  maxItems?: number;
}

export function MainNavigation({
  className,
  variant = 'default',
  maxItems,
}: MainNavigationProps) {
  const t = useTranslations();
  const pathname = usePathname();

  // Get navigation items (limit if specified)
  const navItems = maxItems
    ? mainNavigation.slice(ZERO, maxItems)
    : mainNavigation;

  // Render compact variant
  if (variant === 'compact') {
    return (
      <nav
        className={cn('hidden items-center space-x-1 md:flex', className)}
        aria-label={NAVIGATION_ARIA.mainNav}
      >
        {navItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.key}
              href={
                item.href as
                  | '/'
                  | '/about'
                  | '/contact'
                  | '/blog'
                  | '/products'
                  | '/diagnostics'
              }
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {t(item.translationKey)}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Render default variant
  return (
    <NavigationMenu className={cn('hidden md:flex', className)}>
      <NavigationMenuList>
        {navItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          return (
            <NavigationMenuItem key={item.key}>
              <NavigationMenuLink asChild>
                <Link
                  href={
                    item.href as
                      | '/'
                      | '/about'
                      | '/contact'
                      | '/blog'
                      | '/products'
                      | '/diagnostics'
                  }
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'transition-colors duration-200',
                    isActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {t(item.translationKey)}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

// Convenience component for compact navigation
export function MainNavigationCompact({ className }: { className?: string }) {
  return (
    <MainNavigation
      variant='compact'
      maxItems={COUNT_4}
      {...(className && { className })}
    />
  );
}
