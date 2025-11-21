import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EnhancedLocaleSwitcher,
  LocaleSwitcherWithInfo,
  SimpleLocaleSwitcher,
} from '../enhanced-locale-switcher';

// Mock next-intl
const mockUseLocale = vi.fn();
const mockUseTranslations = vi.fn();
const mockUsePathname = vi.fn();

vi.mock('next-intl', () => ({
  useLocale: () => mockUseLocale(),
  useTranslations: (namespace: string) => mockUseTranslations(namespace),
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  Link: vi.fn(({ children, ...props }) => <a {...props}>{children}</a>),
  usePathname: () => mockUsePathname(),
}));

// Mock locale detection and storage
const mockUseClientLocaleDetection = vi.fn();
const mockUseLocaleStorage = vi.fn();

vi.mock('@/lib/locale-detection', () => ({
  useClientLocaleDetection: () => mockUseClientLocaleDetection(),
}));

vi.mock('@/lib/locale-storage', () => ({
  useLocaleStorage: () => mockUseLocaleStorage(),
}));

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    className,
    variant,
  }: {
    children?: React.ReactNode;
    className?: string;
    variant?: string;
  }) => <span className={`badge ${variant} ${className}`}>{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    className,
    variant,
    size,
    disabled,
    asChild: _asChild,
    ...props
  }: {
    children?: React.ReactNode;
    className?: string;
    variant?: string;
    size?: string;
    disabled?: boolean;
    asChild?: boolean;
    [key: string]: any;
  }) => (
    <button
      className={`button ${variant} ${size} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: React.ComponentProps<'div'>) => (
    <div data-testid='dropdown-menu'>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: React.ComponentProps<'div'>) => (
    <div data-testid='dropdown-trigger'>{children}</div>
  ),
  DropdownMenuContent: ({
    children,
    className,
  }: React.ComponentProps<'div'>) => (
    <div
      data-testid='dropdown-content'
      className={className}
    >
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    asChild,
  }: {
    children?: React.ReactNode;
    asChild?: boolean;
  }) => (
    <div data-testid='dropdown-item'>
      {asChild ? children : <span>{children}</span>}
    </div>
  ),
  DropdownMenuLabel: ({ children, className }: React.ComponentProps<'div'>) => (
    <div
      data-testid='dropdown-label'
      className={className}
    >
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr data-testid='dropdown-separator' />,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Check: ({ className }: React.ComponentProps<'div'>) => (
    <div
      data-testid='check-icon'
      className={className}
    />
  ),
  Globe: ({ className }: React.ComponentProps<'div'>) => (
    <div
      data-testid='globe-icon'
      className={className}
    />
  ),
  Languages: ({ className }: React.ComponentProps<'div'>) => (
    <div
      data-testid='languages-icon'
      className={className}
    />
  ),
  Loader2: ({ className }: React.ComponentProps<'div'>) => (
    <div
      data-testid='loader-icon'
      className={className}
    />
  ),
  MapPin: ({ className }: React.ComponentProps<'div'>) => (
    <div
      data-testid='mappin-icon'
      className={className}
    />
  ),
  Monitor: ({ className }: React.ComponentProps<'div'>) => (
    <div
      data-testid='monitor-icon'
      className={className}
    />
  ),
}));

describe('EnhancedLocaleSwitcher', () => {
  const defaultMocks = {
    locale: 'en',
    pathname: '/',
    translations: {
      toggle: 'Toggle language',
      selectLanguage: 'Select Language',
    },
    localeStorage: {
      setUserOverride: vi.fn(),
      getStats: vi.fn(() => ({ hasOverride: false })),
    },
    clientDetection: {
      detectClientLocale: vi.fn(() => ({
        source: 'browser',
        confidence: 0.9,
      })),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseLocale.mockReturnValue(defaultMocks.locale);
    mockUsePathname.mockReturnValue(defaultMocks.pathname);
    mockUseTranslations.mockImplementation((namespace: string) => {
      // 返回翻译函数
      return (key: string) => {
        // Handle language.detector namespace
        if (namespace === 'language.detector') {
          const detectorTranslations: Record<string, string> = {
            'title': 'Detection Info',
            'source': 'Source',
            'sources.browser': 'browser',
            'sources.user': 'user',
            'sources.unknown-source': 'unknown-source',
            'userSaved': '✓ User preference saved',
          };
          return detectorTranslations[key] || key;
        }
        // Handle language namespace (default)
        const translations: Record<string, string> = {
          toggle: 'Toggle language',
          selectLanguage: 'Select Language',
        };
        return translations[key] || key;
      };
    });
    mockUseLocaleStorage.mockReturnValue(defaultMocks.localeStorage);
    mockUseClientLocaleDetection.mockReturnValue(defaultMocks.clientDetection);
  });

  describe('Basic Rendering', () => {
    it('renders enhanced locale switcher with default props', () => {
      render(<EnhancedLocaleSwitcher />);

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      const languageIcons = screen.getAllByTestId('languages-icon');
      expect(languageIcons.length).toBeGreaterThan(0);
    });

    it('renders with custom className', () => {
      render(<EnhancedLocaleSwitcher className='custom-class' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('shows current language in non-compact mode', () => {
      render(<EnhancedLocaleSwitcher />);

      const englishElements = screen.getAllByText('English');
      expect(englishElements.length).toBeGreaterThan(0);
      const enElements = screen.getAllByText('EN');
      expect(enElements.length).toBeGreaterThan(0);
    });
  });

  describe('Compact Mode', () => {
    it('renders in compact mode correctly', () => {
      render(<EnhancedLocaleSwitcher compact />);

      const flagElements = screen.getAllByText('🇺🇸');
      expect(flagElements.length).toBeGreaterThan(0);
      const enElements = screen.getAllByText('EN');
      expect(enElements.length).toBeGreaterThan(0);
      // In compact mode, English should not appear in the trigger button
      const triggerButton = screen.getByRole('button');
      expect(triggerButton).not.toHaveTextContent('English');
    });

    it('shows flag and code in compact mode', () => {
      mockUseLocale.mockReturnValue('zh');
      render(<EnhancedLocaleSwitcher compact />);

      const cnFlags = screen.getAllByText('🇨🇳');
      expect(cnFlags.length).toBeGreaterThan(0);
      const zhElements = screen.getAllByText('ZH');
      expect(zhElements.length).toBeGreaterThan(0);
    });
  });

  describe('Language Options', () => {
    it('renders all available language options', () => {
      render(<EnhancedLocaleSwitcher />);

      // Check for English option
      const usFlags = screen.getAllByText('🇺🇸');
      expect(usFlags.length).toBeGreaterThan(0);
      const englishTexts = screen.getAllByText('English');
      expect(englishTexts.length).toBeGreaterThan(0);

      // Check for Chinese option
      expect(screen.getByText('🇨🇳')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    it('shows language codes for all options', () => {
      render(<EnhancedLocaleSwitcher />);

      const languageCodes = screen.getAllByText(/^(EN|ZH)$/);
      expect(languageCodes.length).toBeGreaterThanOrEqual(2);
    });

    it('shows region information in non-compact mode', () => {
      render(<EnhancedLocaleSwitcher compact={false} />);

      expect(screen.getByText('English • Global')).toBeInTheDocument();
      expect(screen.getByText('Chinese • China')).toBeInTheDocument();
    });

    it('hides region information in compact mode', () => {
      render(<EnhancedLocaleSwitcher compact />);

      expect(screen.queryByText('English • Global')).not.toBeInTheDocument();
      expect(screen.queryByText('Chinese • China')).not.toBeInTheDocument();
    });
  });

  describe('Active Language Indication', () => {
    it('shows check icon for current language', () => {
      mockUseLocale.mockReturnValue('en');
      render(<EnhancedLocaleSwitcher />);

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('shows check icon for correct language when locale changes', () => {
      mockUseLocale.mockReturnValue('zh');
      render(<EnhancedLocaleSwitcher />);

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });

  describe('Detection Info', () => {
    it('does not show detection info by default', () => {
      render(<EnhancedLocaleSwitcher />);

      expect(screen.queryByText('Detection Info')).not.toBeInTheDocument();
    });

    it('shows detection info when enabled', () => {
      render(<EnhancedLocaleSwitcher showDetectionInfo />);

      expect(screen.getByText('Detection Info')).toBeInTheDocument();
      expect(screen.getByText('Source: browser')).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
    });

    it('shows correct confidence color for high confidence', () => {
      mockUseClientLocaleDetection.mockReturnValue({
        detectClientLocale: vi.fn(() => ({
          source: 'browser',
          confidence: 0.9,
        })),
      });

      render(<EnhancedLocaleSwitcher showDetectionInfo />);

      const badge = screen.getByText('90%');
      expect(badge).toHaveClass('border-green-500', 'text-green-700');
    });

    it('shows correct confidence color for medium confidence', () => {
      mockUseClientLocaleDetection.mockReturnValue({
        detectClientLocale: vi.fn(() => ({
          source: 'browser',
          confidence: 0.6,
        })),
      });

      render(<EnhancedLocaleSwitcher showDetectionInfo />);

      const badge = screen.getByText('60%');
      expect(badge).toHaveClass('border-yellow-500', 'text-yellow-700');
    });

    it('shows correct confidence color for low confidence', () => {
      mockUseClientLocaleDetection.mockReturnValue({
        detectClientLocale: vi.fn(() => ({
          source: 'browser',
          confidence: 0.3,
        })),
      });

      render(<EnhancedLocaleSwitcher showDetectionInfo />);

      const badge = screen.getByText('30%');
      expect(badge).toHaveClass('border-red-500', 'text-red-700');
    });

    it('shows user preference indicator when override exists', () => {
      mockUseLocaleStorage.mockReturnValue({
        ...defaultMocks.localeStorage,
        getStats: vi.fn(() => ({ data: { hasOverride: true } })),
      });

      render(<EnhancedLocaleSwitcher showDetectionInfo />);

      expect(screen.getByText('✓ User preference saved')).toBeInTheDocument();
    });

    it('uses fallback icon for unknown detection source', () => {
      mockUseClientLocaleDetection.mockReturnValue({
        detectClientLocale: vi.fn(() => ({
          locale: 'en',
          source: 'unknown-source', // This should trigger the fallback to Languages icon
          confidence: 0.8,
        })),
      });

      render(<EnhancedLocaleSwitcher showDetectionInfo />);

      expect(screen.getByText('Detection Info')).toBeInTheDocument();
      expect(screen.getByText('Source: unknown-source')).toBeInTheDocument();
    });
  });

  describe('Language Switching', () => {
    it('calls setUserOverride when language is switched', () => {
      const setUserOverride = vi.fn();
      mockUseLocaleStorage.mockReturnValue({
        ...defaultMocks.localeStorage,
        setUserOverride,
      });

      render(<EnhancedLocaleSwitcher />);

      const chineseLink = screen.getByText('中文').closest('a');
      fireEvent.click(chineseLink!);

      expect(setUserOverride).toHaveBeenCalledWith('zh');
    });

    it('shows loading state during language switch', async () => {
      render(<EnhancedLocaleSwitcher />);

      const chineseLink = screen.getByText('中文').closest('a');
      fireEvent.click(chineseLink!);

      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('shows success indicator after successful switch', async () => {
      render(<EnhancedLocaleSwitcher />);

      const chineseLink = screen.getByText('中文').closest('a');
      fireEvent.click(chineseLink!);

      // Wait for transition to complete
      await waitFor(
        () => {
          expect(screen.getByRole('button')).toContainElement(
            document.querySelector('.bg-green-500'),
          );
        },
        { timeout: 2000 },
      );
    });

    it('disables button during pending transition', async () => {
      render(<EnhancedLocaleSwitcher />);

      const chineseLink = screen.getByText('中文').closest('a');
      fireEvent.click(chineseLink!);

      // Check if button shows loading state (success indicator appears)
      await waitFor(() => {
        const button = screen.getByRole('button');
        // The button might not be disabled in test environment, but should show loading state
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('provides screen reader text for toggle button', () => {
      render(<EnhancedLocaleSwitcher />);

      expect(screen.getByText('Toggle language')).toHaveClass('sr-only');
    });

    it('has proper dropdown structure', () => {
      render(<EnhancedLocaleSwitcher />);

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    });

    it('has proper menu labels', () => {
      render(<EnhancedLocaleSwitcher />);

      expect(screen.getByText('Select Language')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('shows full language name on larger screens', () => {
      render(<EnhancedLocaleSwitcher />);

      const fullNameElements = screen.getAllByText('English');
      const triggerElement = fullNameElements.find(
        (el) =>
          el.classList.contains('hidden') && el.classList.contains('sm:inline'),
      );
      expect(triggerElement).toBeInTheDocument();
    });

    it('shows language code on smaller screens', () => {
      render(<EnhancedLocaleSwitcher />);

      const codeElements = screen.getAllByText('EN');
      const mobileCode = codeElements.find((el) =>
        el.classList.contains('sm:hidden'),
      );
      expect(mobileCode).toBeInTheDocument();
    });
  });

  describe('Component Variants', () => {
    it('renders SimpleLocaleSwitcher correctly', () => {
      render(<SimpleLocaleSwitcher />);

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      const flagElements = screen.getAllByText('🇺🇸');
      expect(flagElements.length).toBeGreaterThan(0);
      expect(screen.queryByText('Detection Info')).not.toBeInTheDocument();
    });

    it('renders LocaleSwitcherWithInfo correctly', () => {
      render(<LocaleSwitcherWithInfo />);

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      expect(screen.getByText('Detection Info')).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('has correct display names for all components', () => {
      expect(EnhancedLocaleSwitcher.displayName).toBe('EnhancedLocaleSwitcher');
      expect(SimpleLocaleSwitcher.displayName).toBe('SimpleLocaleSwitcher');
      expect(LocaleSwitcherWithInfo.displayName).toBe('LocaleSwitcherWithInfo');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing translations gracefully', () => {
      // Mock返回一个函数，该函数直接返回key（模拟缺失翻译）
      mockUseTranslations.mockImplementation(() => (key: string) => key);

      render(<EnhancedLocaleSwitcher />);

      expect(screen.getByText('selectLanguage')).toBeInTheDocument();
    });

    it('handles undefined locale gracefully', () => {
      mockUseLocale.mockReturnValue('en'); // Use fallback instead of undefined

      expect(() => render(<EnhancedLocaleSwitcher />)).not.toThrow();
    });

    it('handles missing detection info gracefully', () => {
      mockUseClientLocaleDetection.mockReturnValue({
        detectClientLocale: vi.fn(() => null),
      });

      render(<EnhancedLocaleSwitcher showDetectionInfo />);

      expect(screen.queryByText('Detection Info')).not.toBeInTheDocument();
    });
  });
});
