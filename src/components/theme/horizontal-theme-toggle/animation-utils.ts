import { ANIMATION_DURATION_VERY_SLOW, COUNT_PAIR, PERCENTAGE_FULL } from '@/constants';

type ViewTransitionCapable = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

const supportsViewTransition = (doc: Document): doc is ViewTransitionCapable =>
  typeof (doc as ViewTransitionCapable).startViewTransition === 'function';

/**
 * 主题切换动画工具函数
 */
export const createCircleBlurAnimation = (
  buttonElement: HTMLElement | null,
) => {
  if (!buttonElement) return '';

  const rect = buttonElement.getBoundingClientRect();
  const centerX = ((rect.left + rect.width / COUNT_PAIR) / window.innerWidth) * PERCENTAGE_FULL;
  const centerY = ((rect.top + rect.height / COUNT_PAIR) / window.innerHeight) * PERCENTAGE_FULL;

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
interface ThemeAnimationOptions {
  newTheme: string;
  buttonElement: HTMLButtonElement | null;
  animationVariant: 'circle-blur' | 'framer-motion';
  shouldDisableAnimations: boolean;
  setTheme: (theme: string) => void;
}

export const applyThemeAnimation = ({
  newTheme,
  buttonElement,
  animationVariant,
  shouldDisableAnimations,
  setTheme,
}: ThemeAnimationOptions) => {
  const canUseCircleBlur =
    animationVariant === 'circle-blur' &&
    !shouldDisableAnimations &&
    typeof document !== 'undefined' &&
    supportsViewTransition(document);

  if (canUseCircleBlur && buttonElement) {
    const styleId = `theme-transition-${Date.now()}`;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = createCircleBlurAnimation(buttonElement);
    document.head.appendChild(style);

    (document as ViewTransitionCapable).startViewTransition?.(() => {
      setTheme(newTheme);
    });

    setTimeout(() => {
      const styleEl = document.getElementById(styleId);
      if (styleEl) {
        styleEl.remove();
      }
    }, ANIMATION_DURATION_VERY_SLOW);
    return;
  }

  setTheme(newTheme);
};
