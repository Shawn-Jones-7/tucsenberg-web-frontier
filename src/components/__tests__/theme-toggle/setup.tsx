import React from 'react';
import { vi } from 'vitest';

// Use vi.hoisted to ensure mocks are set up before imports
const mocks = vi.hoisted(() => ({
  // Mock next-themes
  mockSetTheme: vi.fn(),
  mockTheme: 'light',
  mockSystemTheme: 'light',
  mockResolvedTheme: 'light',

  // Mock useThemeToggle hook
  mockUseThemeToggle: {
    theme: 'light',
    isOpen: false,
    setIsOpen: vi.fn(),
    supportsViewTransitions: true,
    prefersReducedMotion: false,
    prefersHighContrast: false,
    handleThemeChange: vi.fn(),
    handleKeyDown: vi.fn(),
    ariaAttributes: {
      'aria-label': '主题切换',
      'aria-expanded': 'false',
      'aria-haspopup': 'menu',
      'aria-current': 'light',
    },
  },
}));

// Export for external access
const {
  mockSetTheme,
  mockTheme,
  mockSystemTheme,
  mockResolvedTheme,
  mockUseThemeToggle,
} = mocks;
export {
  mockResolvedTheme,
  mockSetTheme,
  mockSystemTheme,
  mockTheme,
  mockUseThemeToggle,
};

vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    theme: mocks.mockTheme,
    setTheme: mocks.mockSetTheme,
    systemTheme: mocks.mockSystemTheme,
    resolvedTheme: mocks.mockResolvedTheme,
  })),
}));

vi.mock('@/hooks/use-theme-toggle', () => ({
  useThemeToggle: vi.fn(() => mocks.mockUseThemeToggle),
}));

// Mock UI components
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({
    children,
    open,
    onOpenChange,
  }: {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div
      data-testid='dropdown-menu'
      data-open={open}
      onClick={() => onOpenChange?.(!open)}
    >
      {children}
    </div>
  ),
  DropdownMenuContent: ({
    children,
    align,
    className,
    role,
    ...props
  }: {
    children?: React.ReactNode;
    align?: string;
    className?: string;
    role?: string;
    [key: string]: any;
  }) => (
    <div
      data-testid='dropdown-content'
      data-align={align}
      className={className}
      role={role}
      {...props}
    >
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
    ...props
  }: {
    children?: React.ReactNode;
    asChild?: boolean;
    [key: string]: any;
  }) => {
    if (asChild && React.isValidElement(children)) {
      // When asChild is true, clone children and add data-slot attribute
      return React.cloneElement(children, {
        'data-slot': 'dropdown-menu-trigger',
        ...props,
        ...(children.props || {}),
      });
    }
    return (
      <div
        data-testid='dropdown-trigger'
        data-slot='dropdown-menu-trigger'
        {...props}
      >
        {children}
      </div>
    );
  },
  DropdownMenuItem: ({
    children,
    onClick,
    onKeyDown,
    className,
    role,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    className?: string;
    role?: string;
    [key: string]: any;
  }) => (
    <div
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={className}
      role={role}
      {...props}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    variant,
    size,
    className,
    ...props
  }: {
    children?: React.ReactNode;
    asChild?: boolean;
    variant?: string;
    size?: string;
    className?: string;
    [key: string]: any;
  }) => {
    if (asChild && React.isValidElement(children)) {
      // When asChild is true, clone children and add button props
      return React.cloneElement(children, {
        'data-slot': 'button',
        'data-variant': variant,
        'data-size': size,
        'className': className,
        ...props,
        ...(children.props || {}),
      });
    }
    return (
      <button
        data-testid='theme-button'
        data-slot='button'
        data-variant={variant}
        data-size={size}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  },
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Sun: ({
    className,
    ...props
  }: {
    className?: string;
    [key: string]: any;
  }) => (
    <span
      data-testid='sun-icon'
      className={className}
      {...props}
    >
      ☀️
    </span>
  ),
  Moon: ({
    className,
    ...props
  }: {
    className?: string;
    [key: string]: any;
  }) => (
    <span
      data-testid='moon-icon'
      className={className}
      {...props}
    >
      🌙
    </span>
  ),
  Monitor: ({
    className,
    ...props
  }: {
    className?: string;
    [key: string]: any;
  }) => (
    <span
      data-testid='monitor-icon'
      className={className}
      {...props}
    >
      🖥️
    </span>
  ),
}));

// Mock theme components
vi.mock('@/components/theme/theme-toggle-button', () => {
  const MockThemeToggleButton = React.forwardRef(
    (
      {
        ariaAttributes,
        onKeyDown,
        onClick,
        prefersHighContrast: _prefersHighContrast,
        prefersReducedMotion: _prefersReducedMotion,
        ...props
      }: {
        ariaAttributes?: Record<string, any>;
        onKeyDown?: (event: React.KeyboardEvent) => void;
        onClick?: () => void;
        prefersHighContrast?: boolean;
        prefersReducedMotion?: boolean;
        [key: string]: any;
      },
      ref: React.Ref<HTMLButtonElement>,
    ) => {
      return (
        <button
          ref={ref}
          data-testid='theme-toggle-button'
          data-variant='outline'
          data-size='icon'
          className='inline-flex items-center justify-center'
          onKeyDown={onKeyDown}
          onClick={onClick}
          {...ariaAttributes}
          {...props}
        >
          <span
            data-testid='sun-icon'
            className='lucide-sun'
            aria-hidden='true'
          >
            ☀️
          </span>
          <span
            data-testid='moon-icon'
            className='lucide-moon'
            aria-hidden='true'
          >
            🌙
          </span>
          <span className='sr-only'>主题切换按钮</span>
        </button>
      );
    },
  );

  MockThemeToggleButton.displayName = 'MockThemeToggleButton';

  return {
    ThemeToggleButton: MockThemeToggleButton,
  };
});

vi.mock('@/components/theme/theme-menu-item', () => ({
  ThemeMenuItem: ({
    theme,
    currentTheme,
    label,
    ariaLabel,
    icon: Icon,
    onClick,
    onKeyDown,
    supportsViewTransitions: _supportsViewTransitions,
    prefersReducedMotion: _prefersReducedMotion,
    ...props
  }: {
    theme?: string;
    currentTheme?: string;
    label?: string;
    ariaLabel?: string;
    icon?: React.ComponentType<any>;
    onClick?: () => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    supportsViewTransitions?: boolean;
    prefersReducedMotion?: boolean;
    [key: string]: any;
  }) => {
    return (
      <div
        data-testid={`theme-menu-item-${theme}`}
        data-theme={theme}
        data-current={currentTheme}
        aria-label={ariaLabel}
        onClick={onClick}
        onKeyDown={onKeyDown}
        role='menuitem'
        {...props}
      >
        {Icon && <Icon data-testid={`${theme}-icon`} />}
        <span>{label}</span>
      </div>
    );
  },
}));

// Mock View Transitions API
export const mockStartViewTransition = vi.fn();
if (!document.startViewTransition) {
  Object.defineProperty(document, 'startViewTransition', {
    value: mockStartViewTransition,
    configurable: true,
    writable: true,
  });
}

// Mock localStorage
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock matchMedia
export const mockMatchMedia = vi.fn();

// Mock ResizeObserver
export const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Set up global mocks
if (!global.ResizeObserver) {
  global.ResizeObserver = mockResizeObserver;
}

// Setup function for tests
export function setupThemeToggleTest() {
  vi.clearAllMocks();
  vi.useFakeTimers();

  // Reset mock implementations
  mockMatchMedia.mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  mockLocalStorage.getItem.mockReturnValue(null);
  mockStartViewTransition.mockImplementation((callback) => {
    callback?.();
    return Promise.resolve();
  });

  // Reset useThemeToggle mock to default values
  Object.assign(mocks.mockUseThemeToggle, {
    theme: 'light',
    isOpen: false,
    setIsOpen: vi.fn(),
    supportsViewTransitions: true,
    prefersReducedMotion: false,
    prefersHighContrast: false,
    handleThemeChange: vi.fn(),
    handleKeyDown: vi.fn(),
    ariaAttributes: {
      'aria-label': '主题切换按钮，当前主题：light',
      'aria-expanded': 'false',
      'aria-haspopup': 'menu',
      'role': 'button',
      'type': 'button',
      'data-state': 'closed',
    },
  });
}

// Cleanup function for tests
export function cleanupThemeToggleTest() {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
}
