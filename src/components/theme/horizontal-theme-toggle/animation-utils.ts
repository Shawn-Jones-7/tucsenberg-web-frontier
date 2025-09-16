import { COUNT_PAIR } from '@/constants/magic-numbers';

/**
 * 主题切换动画工具函数
 */
export const createCircleBlurAnimation = (
  buttonElement: HTMLElement | null,
) => {
  if (!buttonElement) return '';

  const rect = buttonElement.getBoundingClientRect();
  const centerX = ((rect.left + rect.width / COUNT_PAIR) / window.innerWidth) * 100;
  const centerY = ((rect.top + rect.height / COUNT_PAIR) / window.innerHeight) * 100;

  return `
    @supports (view-transition-name: root) {
      ::view-transition-old(root) {
        animation: none;
      }
      ::view-transition-new(root) {
        animation: circle-blur-expand 0.6s cubic-bezier(0.4, 0, 0.COUNT_PAIR, 1);
        transform-origin: ${centerX}% ${centerY}%;
      }
      @keyframes circle-blur-expand {
        from {
          clip-path: circle(0% at ${centerX}% ${centerY}%);
          filter: blur(8px);
        }
        50% {
          filter: blur(4px);
        }
        to {
          clip-path: circle(150% at ${centerX}% ${centerY}%);
          filter: blur(0);
        }
      }
    }
  `;
};

/**
 * 应用主题切换动画
 */
export const applyThemeAnimation = (
  newTheme: string,
  buttonElement: HTMLButtonElement | null,
  animationVariant: 'circle-blur' | 'framer-motion',
  shouldDisableAnimations: boolean,
  setTheme: (theme: string) => void,
) => {
  // 确定使用的动画变体
  const shouldUseCircleBlur =
    animationVariant === 'circle-blur' &&
    !shouldDisableAnimations &&
    'startViewTransition' in document;

  if (shouldUseCircleBlur && buttonElement) {
    // 创建动画样式
    const styleId = `theme-transition-${Date.now()}`;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = createCircleBlurAnimation(buttonElement);
    document.head.appendChild(style);

    // 使用 View Transition API
    (document as any).startViewTransition(() => {
      setTheme(newTheme);
    });

    // 清理动画样式
    setTimeout(() => {
      const styleEl = document.getElementById(styleId);
      if (styleEl) {
        styleEl.remove();
      }
    }, 1000);
  } else {
    // 直接切换主题，不使用动画
    setTheme(newTheme);
  }
};
