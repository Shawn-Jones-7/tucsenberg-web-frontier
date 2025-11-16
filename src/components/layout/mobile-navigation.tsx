/**
 * Mobile Navigation Component
 *
 * Responsive mobile navigation with hamburger menu and slide-out sidebar.
 * Features smooth animations, keyboard navigation, and accessibility.
 */
'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  isActivePath,
  mobileNavigation,
  NAVIGATION_ARIA,
} from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Link, usePathname } from '@/i18n/routing';

/**
 * Mobile Navigation Component
 *
 * Responsive mobile navigation with hamburger menu and slide-out sidebar.
 * Features smooth animations, keyboard navigation, and accessibility.
 */

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className={cn('md:hidden', className)}>
      <Sheet
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SheetTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='relative'
            aria-label={NAVIGATION_ARIA.mobileMenuButton}
            aria-expanded={isOpen}
            aria-controls='mobile-navigation'
            data-state={isOpen ? 'open' : 'closed'}
          >
            <Menu className='h-5 w-5' />
            <span className='sr-only'>
              {isOpen
                ? t('accessibility.closeMenu')
                : t('accessibility.openMenu')}
            </span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side='left'
          className='w-[300px] sm:w-[350px]'
          id='mobile-navigation'
          onEscapeKeyDown={() => setIsOpen(false)}
        >
          <SheetHeader className='text-left'>
            <SheetTitle className='text-lg font-semibold'>
              {t('seo.siteName')}
            </SheetTitle>
            <SheetDescription className='text-sm text-muted-foreground'>
              {t('seo.description')}
            </SheetDescription>
          </SheetHeader>

          <Separator className='my-4' />

          <nav
            className='flex flex-col space-y-1'
            aria-label={NAVIGATION_ARIA.mobileMenu}
          >
            {mobileNavigation.map((item) => {
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
                  }
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {t(item.translationKey)}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Hamburger menu button component (can be used separately)
export function MobileMenuButton({
  isOpen,
  onClick,
  className,
}: {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}) {
  const t = useTranslations();

  return (
    <Button
      variant='ghost'
      size='icon'
      className={cn('md:hidden', className)}
      onClick={onClick}
      aria-label={NAVIGATION_ARIA.mobileMenuButton}
      aria-expanded={isOpen}
      data-state={isOpen ? 'open' : 'closed'}
    >
      {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
      <span className='sr-only'>
        {isOpen ? t('accessibility.closeMenu') : t('accessibility.openMenu')}
      </span>
    </Button>
  );
}
