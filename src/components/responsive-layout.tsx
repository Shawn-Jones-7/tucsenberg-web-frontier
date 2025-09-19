'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useBreakpoint } from '@/hooks/use-breakpoint';

// 自定义hook处理hydration
function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state
    setMounted(true);
  }, []);

  return mounted;
}

interface ResponsiveLayoutProps {
  'children': ReactNode;
  'className'?: string;
  'mobileLayout'?: ReactNode;
  'tabletLayout'?: ReactNode;
  'desktopLayout'?: ReactNode;
  // Additional props for testing and flexibility
  'mobileNavigation'?: ReactNode;
  'tabletSidebar'?: ReactNode;
  'desktopSidebar'?: ReactNode;
  'onTouchStart'?: () => void;
  'onTouchEnd'?: () => void;
  'onMouseEnter'?: () => void;
  'onMouseLeave'?: () => void;
  'onLayoutChange'?: (_layout: string) => void;
  'role'?: string;
  'aria-label'?: string;
  'data-testid'?: string;
  'tabIndex'?: number;
}

// 获取当前布局类型的辅助函数
function getCurrentLayoutType(
  isMobile: boolean,
  isTablet: boolean,
): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

// 布局内容配置接口
interface LayoutContentConfig {
  mobileLayout?: ReactNode;
  mobileNavigation?: ReactNode;
  tabletLayout?: ReactNode;
  tabletSidebar?: ReactNode;
  desktopLayout?: ReactNode;
  desktopSidebar?: ReactNode;
}

// 获取特定布局内容的辅助函数
function getSpecificLayoutContent(
  layoutType: 'mobile' | 'tablet' | 'desktop',
  config: LayoutContentConfig,
): ReactNode | null {
  switch (layoutType) {
    case 'mobile':
      return config.mobileLayout || config.mobileNavigation || null;
    case 'tablet':
      return config.tabletLayout || config.tabletSidebar || null;
    case 'desktop':
      return config.desktopLayout || config.desktopSidebar || null;
    default:
      return null;
  }
}

// 生成响应式CSS类名的辅助函数
function generateResponsiveClasses(
  className: string,
  flags: { isMobile: boolean; isTablet: boolean; isDesktop: boolean },
): string {
  const classes = [className];

  if (flags.isMobile) classes.push('responsive-mobile');
  if (flags.isTablet) classes.push('responsive-tablet');
  if (flags.isDesktop) classes.push('responsive-desktop');

  return classes.filter(Boolean).join(' ').trim();
}

export function ResponsiveLayout({
  children,
  className = '',
  mobileLayout,
  tabletLayout,
  desktopLayout,
  mobileNavigation,
  tabletSidebar,
  desktopSidebar,
  onTouchStart,
  onTouchEnd,
  onMouseEnter,
  onMouseLeave,
  onLayoutChange,
  role,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  tabIndex,
}: ResponsiveLayoutProps) {
  const { currentBreakpoint, isBelow, isAbove } = useBreakpoint();

  // 使用自定义hook处理hydration
  const mounted = useMounted();

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  const isMobile = isBelow('md');
  const isTablet = currentBreakpoint === 'md' || currentBreakpoint === 'lg';
  const isDesktop = isAbove('lg');

  const layoutType = getCurrentLayoutType(isMobile, isTablet);
  const specificContent = getSpecificLayoutContent(layoutType, {
    mobileLayout,
    mobileNavigation,
    tabletLayout,
    tabletSidebar,
    desktopLayout,
    desktopSidebar,
  });

  // Use specific layouts if provided
  if (specificContent) {
    return <div className={className}>{specificContent}</div>;
  }

  // Notify layout change
  if (onLayoutChange) {
    onLayoutChange(layoutType);
  }

  // Default responsive behavior
  const responsiveClasses = generateResponsiveClasses(className, {
    isMobile,
    isTablet,
    isDesktop,
  });

  return (
    <div
      className={responsiveClasses}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role={role}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
}
