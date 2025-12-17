/**
 * Header Component (Server)
 *
 * 服务端渲染的头部，交互部件以客户端小岛方式注入，减少首屏 JS 体积。
 */
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import {
  LanguageToggleIsland,
  MobileNavigationIsland,
  NavSwitcherIsland,
} from '@/components/layout/header-client';
import { HeaderScrollChrome } from '@/components/layout/header-scroll-chrome';
import { Logo } from '@/components/layout/logo';
import { Idle } from '@/components/lazy/idle';
import { Button } from '@/components/ui/button';

/**
 * Header Component
 *
 * Main navigation header with responsive design, logo, navigation menus,
 * and utility controls (language switcher, theme toggle).
 */

// Simplified header props interface
interface HeaderProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'transparent';
  sticky?: boolean;
  locale?: 'en' | 'zh';
}

export async function Header({
  className,
  variant = 'default',
  sticky = true,
  locale,
}: HeaderProps) {
  // 透明头部不吸顶
  const isSticky = variant === 'transparent' ? false : sticky;
  const isMinimal = variant === 'minimal';
  const isTransparent = variant === 'transparent';

  // Check if using Vercel navigation variant
  const isVercelNav = process.env.NEXT_PUBLIC_NAV_VARIANT !== 'legacy';

  // A/B 支持：可通过 NEXT_PUBLIC_IDLE_ROOTMARGIN='200px 0px 200px 0px' 等调整
  const VISIBLE_MARGIN =
    process.env.NEXT_PUBLIC_IDLE_ROOTMARGIN ?? '400px 0px 400px 0px';

  // Get translations for CTA button
  const t = await getTranslations('navigation');

  return (
    <header
      className={cn(
        'w-full bg-background',
        isSticky && 'sticky top-0 z-50',
        isTransparent && 'border-transparent bg-transparent',
        // Scroll shadow effect via data-scrolled attribute
        isVercelNav
          ? 'border-b border-border/30 transition-all duration-200 data-[scrolled=true]:border-border/60 data-[scrolled=true]:shadow-sm'
          : !isTransparent && 'border-b border-border',
        className,
      )}
    >
      {/* Scroll detection client island */}
      {isVercelNav && <HeaderScrollChrome />}
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='relative flex h-16 items-center justify-between'>
          {/* Left section: Logo + Mobile Menu */}
          <div
            className='flex items-center gap-4'
            {...(!locale ? { 'data-testid': 'mobile-navigation' } : {})}
          >
            {/* 客户端：移动端导航按钮（可见性触发加载）；预留空间避免 CLS */}
            {locale ? (
              <div className='h-10 w-10'>
                <Idle
                  strategy='visible'
                  rootMargin={VISIBLE_MARGIN}
                >
                  <MobileNavigationIsland />
                </Idle>
              </div>
            ) : null}
            <Logo />
          </div>

          {/* Center section: Main Navigation (Desktop) - Absolutely centered */}
          <CenterNav
            isMinimal={isMinimal}
            locale={locale}
            VISIBLE_MARGIN={VISIBLE_MARGIN}
          />

          {/* Right section: Utility Controls */}
          <div
            className='flex items-center gap-2'
            {...(!locale ? { 'data-testid': 'language-toggle-button' } : {})}
          >
            {/* 客户端：语言切换（可见性触发加载）；预留空间避免 CLS */}
            {locale ? (
              <div className='flex h-10 w-28 items-center justify-end'>
                <Idle
                  strategy='visible'
                  rootMargin={VISIBLE_MARGIN}
                >
                  <LanguageToggleIsland locale={locale} />
                </Idle>
              </div>
            ) : null}
            {/* Desktop CTA Button - Hidden on mobile */}
            {locale && (
              <Button
                variant='default'
                size='sm'
                asChild
                className='hidden md:inline-flex'
              >
                <Link href={`/${locale}/contact?source=header_cta`}>
                  {t('contactSales')}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function CenterNav({
  isMinimal,
  locale,
  VISIBLE_MARGIN,
}: {
  isMinimal: boolean;
  locale?: 'en' | 'zh' | undefined;
  VISIBLE_MARGIN: string;
}) {
  if (isMinimal) return null;
  return (
    <div
      className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      {...(!locale ? { 'data-testid': 'nav-switcher' } : {})}
    >
      {/* 客户端：导航切换器（更晚加载，避免首屏竞争） */}
      <Idle
        strategy='visible'
        rootMargin={VISIBLE_MARGIN}
      >
        {locale ? <NavSwitcherIsland /> : null}
      </Idle>
    </div>
  );
}

// Simplified convenience components (only keep the most commonly used ones)
export function HeaderMinimal({ className }: { className?: string }) {
  return (
    <Header
      variant='minimal'
      {...(className && { className })}
    />
  );
}

export function HeaderTransparent({ className }: { className?: string }) {
  return (
    <Header
      variant='transparent'
      {...(className && { className })}
    />
  );
}
