/**
 * Header Component (Server)
 *
 * 服务端渲染的头部，交互部件以客户端小岛方式注入，减少首屏 JS 体积。
 */
import { cn } from '@/lib/utils';
import {
  LanguageToggleIsland,
  MobileNavigationIsland,
  NavSwitcherIsland,
} from '@/components/layout/header-client';
import { Logo } from '@/components/layout/logo';
import { Idle } from '@/components/lazy/idle';

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

export function Header({
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

  return (
    <header
      className={cn(
        'w-full bg-background',
        isSticky && 'sticky top-0 z-50',
        isTransparent && 'border-transparent bg-transparent',
        // 简化：默认透明边框，滚动阴影效果移至客户端小岛或后续优化
        isVercelNav
          ? 'border-b border-transparent transition-all duration-200'
          : !isTransparent && 'border-b border-border',
        className,
      )}
    >
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='relative flex h-16 items-center justify-between'>
          {/* Left section: Logo + Mobile Menu */}
          <div
            className='flex items-center gap-4'
            {...(!locale ? { 'data-testid': 'mobile-navigation' } : {})}
          >
            {/* 客户端：移动端导航按钮（可见性触发加载） */}
            <Idle
              strategy='visible'
              rootMargin={VISIBLE_MARGIN}
            >
              {locale && <MobileNavigationIsland locale={locale} />}
            </Idle>
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
            {/* 客户端：语言切换（可见性触发加载） */}
            <Idle
              strategy='visible'
              rootMargin={VISIBLE_MARGIN}
            >
              {locale && <LanguageToggleIsland locale={locale} />}
            </Idle>
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
      className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
      {...(!locale ? { 'data-testid': 'nav-switcher' } : {})}
    >
      {/* 客户端：导航切换器（更晚加载，避免首屏竞争） */}
      <Idle
        strategy='visible'
        rootMargin={VISIBLE_MARGIN}
      >
        {locale && <NavSwitcherIsland locale={locale} />}
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
