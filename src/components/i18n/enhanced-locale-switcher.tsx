import { memo } from 'react';
import { EnhancedLocaleSwitcherComponent } from '@/components/i18n/locale-switcher/enhanced-locale-switcher-component';

export const EnhancedLocaleSwitcher = memo(EnhancedLocaleSwitcherComponent);
EnhancedLocaleSwitcher.displayName = 'EnhancedLocaleSwitcher';

/**
 * 简化版语言切换器 (向后兼容)
 */
export const SimpleLocaleSwitcher = memo((props: { className?: string }) => (
  <EnhancedLocaleSwitcher
    compact
    showDetectionInfo={false}
    {...props}
  />
));

SimpleLocaleSwitcher.displayName = 'SimpleLocaleSwitcher';

/**
 * 带检测信息的语言切换器
 */
export const LocaleSwitcherWithInfo = memo(() => (
  <EnhancedLocaleSwitcher showDetectionInfo />
));

LocaleSwitcherWithInfo.displayName = 'LocaleSwitcherWithInfo';
