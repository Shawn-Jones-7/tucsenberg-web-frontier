import { THEME_OPTIONS } from '@/components/theme/horizontal-theme-toggle/theme-config';

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
          currentIndex > 0 ? currentIndex - 1 : THEME_OPTIONS.length - 1;
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
          currentIndex < THEME_OPTIONS.length - 1 ? currentIndex + 1 : 0;
        const nextOption = THEME_OPTIONS[nextIndex];
        if (nextOption) {
          handleThemeChange(nextOption.value, buttonElement);
        }
        break;
      }
      case 'Home': {
        event.preventDefault();
        const firstOption = THEME_OPTIONS[0];
        if (firstOption) {
          handleThemeChange(firstOption.value, buttonElement);
        }
        break;
      }
      case 'End': {
        event.preventDefault();
        const lastOption = THEME_OPTIONS[THEME_OPTIONS.length - 1];
        if (lastOption) {
          handleThemeChange(lastOption.value, buttonElement);
        }
        break;
      }
    }
  };
};
