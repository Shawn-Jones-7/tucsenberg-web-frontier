import { THEME_OPTIONS } from '@/components/theme/horizontal-theme-toggle/theme-config';
import { ONE, ZERO } from "@/constants/magic-numbers";

/**
 * 处理键盘导航
 */
export const createKeyboardHandler = (
  theme: string | undefined,
  handleThemeChange: (
    newTheme: string,
    buttonElement?: HTMLButtonElement,
  ) => void,
) => {
  return (
    event: React.KeyboardEvent<HTMLButtonElement>,
    _themeValue: string,
  ) => {
    const currentIndex = THEME_OPTIONS.findIndex(
      (option) => option.value === theme,
    );
    let nextIndex = currentIndex;
    const buttonElement = event.currentTarget;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault();
        nextIndex =
          currentIndex > ZERO ? currentIndex - ONE : THEME_OPTIONS.length - ONE;
        const prevOption = THEME_OPTIONS[nextIndex];
        if (prevOption) {
          handleThemeChange(prevOption.value, buttonElement);
        }
        break;
      }
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault();
        nextIndex =
          currentIndex < THEME_OPTIONS.length - ONE ? currentIndex + ONE : ZERO;
        const nextOption = THEME_OPTIONS[nextIndex];
        if (nextOption) {
          handleThemeChange(nextOption.value, buttonElement);
        }
        break;
      }
      case 'Home': {
        event.preventDefault();
        const firstOption = THEME_OPTIONS[ZERO];
        if (firstOption) {
          handleThemeChange(firstOption.value, buttonElement);
        }
        break;
      }
      case 'End': {
        event.preventDefault();
        const lastOption = THEME_OPTIONS[THEME_OPTIONS.length - ONE];
        if (lastOption) {
          handleThemeChange(lastOption.value, buttonElement);
        }
        break;
      }
    }
  };
};
