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
import { Link, routing } from '@/i18n/routing';
import { DropdownContent } from './vercel-dropdown-content';

// Type for valid pathnames from routing configuration
type ValidPathname = keyof typeof routing.pathnames;

interface VercelNavigationProps {
  className?: string;
}

// Hook for hover delay interaction
function useHoverDelay() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const openTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const closeTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

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
  hoverState: {
    openItem: string | null;
    handleMouseEnter: (key: string) => void;
    handleMouseLeave: () => void;
    handleClick: (key: string) => void;
  };
}

function renderDropdownItem({ item, t, hoverState }: RenderDropdownItemProps) {
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
          'text-muted-foreground hover:text-foreground data-[state=open]:text-foreground',
          'hover:bg-muted/40 data-[state=open]:bg-muted/60',
          'dark:hover:bg-foreground/10 dark:data-[state=open]:bg-foreground/15',
          'shadow-none',
          'transition-colors duration-150 ease-out',
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
function renderLinkItem(item: NavigationItem, t: (key: string) => string) {
  return (
    <NavigationMenuItem key={item.key}>
      <NavigationMenuLink asChild>
        <Link
          href={item.href as ValidPathname}
          className={cn(
            'relative inline-flex items-center rounded-full bg-transparent px-3 py-2 text-sm font-medium tracking-[0.01em]',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-muted/40 data-[state=open]:bg-muted/60',
            'dark:hover:bg-foreground/10 dark:data-[state=open]:bg-foreground/15',
            'shadow-none',
            'transition-colors duration-150 ease-out',
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
  const hoverState = useHoverDelay();

  return (
    <nav
      className={cn('hidden md:flex', className)}
      aria-label={NAVIGATION_ARIA.mainNav}
    >
      <NavigationMenu>
        <NavigationMenuList>
          {mainNavigation.map((item) => {
            if (item.children && item.children.length > 0) {
              return renderDropdownItem({
                item,
                t,
                hoverState,
              });
            }
            return renderLinkItem(item, t);
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}
