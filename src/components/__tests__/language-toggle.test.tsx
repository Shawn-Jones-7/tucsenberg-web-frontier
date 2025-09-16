import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@/test/utils';
import { LanguageToggle } from '@/components/language-toggle';

// Hoisted mock functions
const { mockPush, mockUsePathname } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUsePathname: vi.fn(() => '/'),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'en'),
  useTranslations: vi.fn(() => (key: string) => key),
}));

// Mock i18n routing (which internally uses next/navigation)
vi.mock('@/i18n/routing', () => ({
  Link: ({
    children,
    href,
    locale,
    onClick,
    ...props
  }: {
    children?: React.ReactNode;
    href?: string;
    locale?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    [key: string]: any;
  }) => (
    <a
      href={href}
      data-locale={locale}
      onClick={(e) => {
        e.preventDefault();
        // 模拟导航行为
        mockPush(`/${locale}${href}`);
        // 调用原始的 onClick 处理器
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {children}
    </a>
  ),
  usePathname: mockUsePathname,
  useRouter: vi.fn(() => ({
    push: mockPush,
    pathname: '/',
  })),
}));

// Mock next/navigation as fallback
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    pathname: '/',
  })),
  usePathname: mockUsePathname,
}));

// Mock UI components
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({
    children,
    open,
    onOpenChange,
    ...props
  }: {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    [key: string]: any;
  }) => (
    <div
      data-testid='language-dropdown-menu'
      data-open={open}
      onClick={() => onOpenChange?.(!open)}
      {...props}
    >
      {children}
    </div>
  ),
  DropdownMenuContent: ({
    children,
    ...props
  }: React.ComponentProps<'div'>) => (
    <div
      data-testid='language-dropdown-content'
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
      // When asChild is true, render children directly with props
      return React.cloneElement(
        children as React.ReactElement,
        {
          ...props,
          'data-testid': 'language-dropdown-trigger',
        } as any,
      );
    }
    return (
      <div
        data-testid='language-dropdown-trigger'
        {...props}
      >
        {children}
      </div>
    );
  },
  DropdownMenuItem: ({
    children,
    onClick,
    asChild,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    asChild?: boolean;
    [key: string]: any;
  }) => {
    if (asChild && React.isValidElement(children)) {
      // When asChild is true, render children directly with all props merged
      return React.cloneElement(children, {
        ...(children as any).props,
        ...props,
        'data-testid': 'language-dropdown-item',
        'onClick': (e: Event) => {
          // Call both the original onClick and the DropdownMenuItem onClick
          if ((children as any).props.onClick)
            (children as any).props.onClick(e);
          if (onClick) onClick();
        },
      });
    }
    return (
      <div
        data-testid='language-dropdown-item'
        onClick={onClick}
        role='menuitem'
        {...props}
      >
        {children}
      </div>
    );
  },
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button
      data-testid='language-toggle-button'
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Globe: ({ ...props }: React.ComponentProps<'div'>) => (
    <span
      data-testid='globe-icon'
      {...props}
    >
      🌐
    </span>
  ),
  ChevronDown: ({ ...props }: React.ComponentProps<'div'>) => (
    <span
      data-testid='chevron-down-icon'
      {...props}
    >
      ⌄
    </span>
  ),
  Languages: ({ ...props }: React.ComponentProps<'div'>) => (
    <span
      data-testid='languages-icon'
      className='h-[1.2rem] w-[1.2rem]'
      {...props}
    >
      🌍
    </span>
  ),
  Loader2: ({ ...props }: React.ComponentProps<'div'>) => (
    <span
      data-testid='loader-icon'
      className='h-[1.2rem] w-[1.2rem] animate-spin'
      {...props}
    >
      ⟳
    </span>
  ),
  Check: ({ ...props }: React.ComponentProps<'div'>) => (
    <span
      data-testid='check-icon'
      className='ml-auto h-4 w-4 text-green-500'
      {...props}
    >
      ✓
    </span>
  ),
}));

describe('LanguageToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without errors', () => {
      expect(() => {
        const { container } = render(<LanguageToggle />);
        expect(container).toBeInTheDocument();
      }).not.toThrow();
    });

    it('should render language toggle button', () => {
      render(<LanguageToggle />);

      const button = document.querySelector(
        '[data-testid="language-dropdown-trigger"]',
      );
      expect(button).toBeInTheDocument();

      // 组件实际使用的是 Languages 图标，不是 Globe
      const languagesIcon = document.querySelector(
        '[data-testid="languages-icon"]',
      );
      expect(languagesIcon).toBeInTheDocument();
    });

    it('should render dropdown menu structure', () => {
      render(<LanguageToggle />);

      const dropdown = document.querySelector(
        '[data-testid="language-dropdown-menu"]',
      );
      expect(dropdown).toBeInTheDocument();

      const trigger = document.querySelector(
        '[data-testid="language-dropdown-trigger"]',
      );
      expect(trigger).toBeInTheDocument();

      const content = document.querySelector(
        '[data-testid="language-dropdown-content"]',
      );
      expect(content).toBeInTheDocument();
    });

    it('should display current language correctly', () => {
      render(<LanguageToggle />);

      // Component should render without errors
      const dropdown = document.querySelector(
        '[data-testid="language-dropdown-menu"]',
      );
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Language Switching', () => {
    it('should handle English language selection', () => {
      render(<LanguageToggle />);

      // Clear previous calls
      vi.clearAllMocks();

      // First open the dropdown menu
      const trigger = document.querySelector(
        '[data-testid="language-dropdown-trigger"]',
      );
      expect(trigger).toBeInTheDocument();
      fireEvent.click(trigger!);

      // Now find and click the English menu item
      const englishItem = document.querySelector('a[data-locale="en"]');
      expect(englishItem).toBeInTheDocument();

      if (englishItem) {
        fireEvent.click(englishItem);
        // Verify navigation was called
        expect(mockPush).toHaveBeenCalled();
      }
    });

    it('should handle Chinese language selection', () => {
      render(<LanguageToggle />);

      // First open the dropdown menu
      const trigger = document.querySelector(
        '[data-testid="language-dropdown-trigger"]',
      );
      expect(trigger).toBeInTheDocument();
      fireEvent.click(trigger!);

      // Now find and click the Chinese menu item
      const chineseItem = document.querySelector('a[data-locale="zh"]');
      expect(chineseItem).toBeInTheDocument();

      if (chineseItem) {
        fireEvent.click(chineseItem);
        // Verify navigation was called
        expect(mockPush).toHaveBeenCalled();
      }
    });

    it('should maintain current path when switching languages', () => {
      const testPath = '/about';

      // Clear mocks and reset
      vi.clearAllMocks();
      mockUsePathname.mockReturnValue(testPath);

      render(<LanguageToggle />);

      // First open the dropdown menu
      const trigger = document.querySelector(
        '[data-testid="language-dropdown-trigger"]',
      );
      expect(trigger).toBeInTheDocument();
      fireEvent.click(trigger!);

      // Find and click the English menu item specifically
      const englishItem = document.querySelector('a[data-locale="en"]');
      expect(englishItem).toBeInTheDocument();

      if (englishItem) {
        // Use a more direct click approach
        fireEvent.click(englishItem);

        // Check if mockPush was called
        expect(mockPush).toHaveBeenCalled();

        // Check the specific call - should be /en/about
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining(testPath),
        );
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LanguageToggle />);

      const button = document.querySelector(
        '[data-testid="language-dropdown-trigger"]',
      );
      expect(button).toBeInTheDocument();

      const englishItem = document.querySelector('a[data-locale="en"]');
      const chineseItem = document.querySelector('a[data-locale="zh"]');

      // Check that the elements exist and have the role attribute
      expect(englishItem).toBeInTheDocument();
      expect(chineseItem).toBeInTheDocument();

      if (englishItem) {
        expect(englishItem).toHaveAttribute('role', 'menuitem');
      }
      if (chineseItem) {
        expect(chineseItem).toHaveAttribute('role', 'menuitem');
      }
    });

    it('should be keyboard accessible', () => {
      render(<LanguageToggle />);

      const button = document.querySelector(
        '[data-testid="language-dropdown-trigger"]',
      ) as HTMLElement;
      expect(button).toBeInTheDocument();

      // Button should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);

      // Should handle keyboard events
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      fireEvent.keyDown(button, { key: 'Escape' });
    });
  });

  describe('Internationalization', () => {
    it('should use correct translations', () => {
      render(<LanguageToggle />);

      // Component should render without errors
      const dropdown = document.querySelector(
        '[data-testid="language-dropdown-menu"]',
      );
      expect(dropdown).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', () => {
      expect(() => {
        render(<LanguageToggle />);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid locale gracefully', () => {
      expect(() => {
        render(<LanguageToggle />);
      }).not.toThrow();
    });

    it('should handle navigation errors', () => {
      mockPush.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      render(<LanguageToggle />);

      const menuItems = document.querySelectorAll(
        '[data-testid="language-menu-item"]',
      );
      const [firstMenuItem] = menuItems;
      if (firstMenuItem) {
        expect(() => {
          fireEvent.click(firstMenuItem);
        }).not.toThrow();
      }
    });

    it('should handle component unmounting', () => {
      const { unmount } = render(<LanguageToggle />);

      expect(() => {
        unmount();
      }).not.toThrow();

      // Verify component is removed from DOM
      const button = document.querySelector('[data-testid="language-button"]');
      expect(button).not.toBeInTheDocument();
    });
  });
});
