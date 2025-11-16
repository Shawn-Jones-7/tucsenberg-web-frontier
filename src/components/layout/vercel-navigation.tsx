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

import React from 'react';
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
  const [openItem, setOpenItem] = React.useState<string | null>(null);
  const openTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const closeTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = React.useCallback((key: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    openTimerRef.current = setTimeout(() => {
      setOpenItem(key);
    }, 50); // 50ms delay to open (faster response)
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setOpenItem(null);
    }, 80); // 80ms delay to close (faster response)
  }, []);

  const handleClick = React.useCallback((key: string) => {
    setOpenItem((current) => (current === key ? null : key));
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
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
          'relative rounded-xl bg-transparent px-4 py-2.5 text-[15px] font-medium tracking-[0.01em]',
          'text-foreground/90 hover:text-foreground',
          'hover:bg-zinc-950/[.03] dark:hover:bg-white/10',
          'dark:data-[state=open]:bg-white/12 data-[state=open]:bg-zinc-950/[.05]',
          'outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50',
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
            'relative inline-flex h-9 items-center rounded-xl bg-transparent px-4 py-2 text-[15px] font-medium tracking-[0.01em]',
            'text-foreground/90 hover:text-foreground',
            'hover:bg-zinc-950/[.03] dark:hover:bg-white/10',
            'outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50',
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
