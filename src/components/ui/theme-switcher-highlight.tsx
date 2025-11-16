'use client';

/**
 * Theme Switcher Highlight Component
 * 使用CSS动画替代motion库，减少Bundle大小
 */
export function ThemeSwitcherHighlight() {
  return (
    <div
      className='ease-spring absolute inset-0 rounded-full bg-secondary transition-all duration-500'
      style={{
        transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      }}
    />
  );
}
