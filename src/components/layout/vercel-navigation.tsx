/**
 * Vercel-Style Navigation Component
 *
 * A navigation variant inspired by Vercel's design:
 * - Hover delay interaction (80ms open / 120ms close)
 * - Clean and minimal design
 * - Integrates with existing navigation data and i18n
 *
 * Note: Scroll shadow effect is handled by the Header component
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  isActivePath,
  mainNavigation,
  NAVIGATION_ARIA,
  type NavigationItem,
} from '@/lib/navigation';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Link, usePathname } from '@/i18n/routing';
import { DropdownContent } from './vercel-dropdown-content';

// Type for static pathnames (excludes dynamic route patterns)
type StaticPathname =
  | '/'
  | '/about'
  | '/contact'
  | '/blog'
  | '/products'
  | '/faq'
  | '/privacy'
  | '/terms';

interface VercelNavigationProps {
  className?: string;
}

// Hook for hover delay interaction
function useHoverDelay() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handleMouseEnter = useCallback((key: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    openTimerRef.current = setTimeout(() => {
      setOpenItem(key);
    }, 50); // 50ms delay to open (faster response)
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setOpenItem(null);
    }, 80); // 80ms delay to close (faster response)
  }, []);

  const handleClick = useCallback((key: string) => {
    setOpenItem((current) => (current === key ? null : key));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return { openItem, handleMouseEnter, handleMouseLeave, handleClick };
}

// Render dropdown navigation item
interface RenderDropdownItemProps {
  item: NavigationItem;
  t: (key: string) => string;
  isActive: boolean;
  hoverState: {
    openItem: string | null;
    handleMouseEnter: (key: string) => void;
    handleMouseLeave: () => void;
    handleClick: (key: string) => void;
  };
}

function renderDropdownItem({
  item,
  t,
  isActive,
  hoverState,
}: RenderDropdownItemProps) {
  const isOpen = hoverState.openItem === item.key;

  return (
    <NavigationMenuItem
      key={item.key}
      onMouseEnter={() => hoverState.handleMouseEnter(item.key)}
      onMouseLeave={hoverState.handleMouseLeave}
    >
      <NavigationMenuTrigger
        className={cn(
          'relative inline-flex items-center rounded-full px-3 py-2 text-sm font-medium tracking-[0.01em]',
          // Default state - Vercel exact colors
          'text-vercel-nav-light-default dark:text-vercel-nav-dark-default',
          // Active state - same as hover (Vercel behavior for current page)
          isActive &&
            'bg-vercel-nav-light-bg-hover text-vercel-nav-light-hover dark:bg-vercel-nav-dark-bg-hover dark:text-vercel-nav-dark-hover',
          // Hover state - Vercel exact colors
          'hover:bg-vercel-nav-light-bg-hover hover:text-vercel-nav-light-hover',
          'dark:hover:bg-vercel-nav-dark-bg-hover dark:hover:text-vercel-nav-dark-hover',
          // Open state - same as hover (Vercel behavior)
          'data-[state=open]:bg-vercel-nav-light-bg-hover data-[state=open]:text-vercel-nav-light-hover',
          'dark:data-[state=open]:bg-vercel-nav-dark-bg-hover dark:data-[state=open]:text-vercel-nav-dark-hover',
          // Keyboard focus ring - dual layer (inner + outer), disable default ring
          '!focus-visible:ring-0 !focus-visible:ring-offset-0',
          'focus-visible:shadow-[0_0_0_2px_var(--color-vercel-nav-focus-inner),0_0_0_4px_var(--color-vercel-nav-focus-outer)]',
          // Vercel timing: 90ms with ease (not ease-out)
          'transition-[color,background-color] duration-[90ms]',
        )}
        onClick={() => hoverState.handleClick(item.key)}
        aria-expanded={isOpen}
      >
        {t(item.translationKey)}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <DropdownContent
          items={item.children || []}
          t={t}
        />
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

// Render link navigation item
function renderLinkItem(
  item: NavigationItem,
  t: (key: string) => string,
  isActive: boolean,
) {
  return (
    <NavigationMenuItem key={item.key}>
      <NavigationMenuLink asChild>
        <Link
          href={item.href as StaticPathname}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'relative inline-flex items-center rounded-full bg-transparent px-3 py-2 text-sm font-medium tracking-[0.01em]',
            // Default state - Vercel exact colors
            'text-vercel-nav-light-default dark:text-vercel-nav-dark-default',
            // Active state - same as hover (Vercel behavior for current page)
            isActive &&
              'bg-vercel-nav-light-bg-hover text-vercel-nav-light-hover dark:bg-vercel-nav-dark-bg-hover dark:text-vercel-nav-dark-hover',
            // Hover state - Vercel exact colors
            'hover:bg-vercel-nav-light-bg-hover hover:text-vercel-nav-light-hover',
            'dark:hover:bg-vercel-nav-dark-bg-hover dark:hover:text-vercel-nav-dark-hover',
            // Keyboard focus ring - dual layer (inner + outer), disable default ring
            '!focus-visible:ring-0 !focus-visible:ring-offset-0',
            'focus-visible:shadow-[0_0_0_2px_var(--color-vercel-nav-focus-inner),0_0_0_4px_var(--color-vercel-nav-focus-outer)]',
            // Vercel timing: 90ms with ease (not ease-out)
            'transition-[color,background-color] duration-[90ms]',
          )}
        >
          {t(item.translationKey)}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

export function VercelNavigation({ className }: VercelNavigationProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const hoverState = useHoverDelay();

  return (
    <nav
      className={cn('hidden md:flex', className)}
      aria-label={NAVIGATION_ARIA.mainNav}
    >
      <NavigationMenu>
        <NavigationMenuList>
          {mainNavigation.map((item) => {
            const itemIsActive = isActivePath(pathname, item.href);
            if (item.children && item.children.length > 0) {
              return renderDropdownItem({
                item,
                t,
                hoverState,
                isActive: itemIsActive,
              });
            }
            return renderLinkItem(item, t, itemIsActive);
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}
