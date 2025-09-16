/**
 * Enhanced Locale Switcher 高级语言切换测试
 * 包含复杂场景、边缘情况和高级功能测试
 *
 * 注意：基础测试请参考 enhanced-locale-switcher-language-switching-core.test.tsx
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnhancedLocaleSwitcher } from '@/components/i18n/enhanced-locale-switcher';

// Mock next-intl
const mockT = vi.fn();
const useTranslations = vi.fn(() => mockT);
const useLocale = vi.fn(() => 'en');

vi.mock('next-intl', () => ({
  useTranslations,
  useLocale,
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const useRouter = vi.fn(() => ({
  push: mockPush,
  replace: mockReplace,
}));
const usePathname = vi.fn(() => '/');
const useSearchParams = vi.fn(() => new URLSearchParams());

vi.mock('next/navigation', () => ({
  useRouter,
  usePathname,
  useSearchParams,
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='check-icon'
      {...props}
    >
      <path d='M9 12l2 2 4-4' />
    </svg>
  ),
  ChevronDown: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='chevron-down-icon'
      {...props}
    >
      <path d='M6 9l6 6 6-6' />
    </svg>
  ),
  Globe: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='globe-icon'
      {...props}
    >
      <circle
        cx='12'
        cy='12'
        r='10'
      />
    </svg>
  ),
}));

describe('Enhanced Locale Switcher - 高级语言切换功能', () => {
  let user: ReturnType<typeof userEvent.setup>;

  const defaultMocks = {
    locale: 'en',
    pathname: '/',
    translations: {
      toggle: 'Toggle language',
      selectLanguage: 'Select Language',
      currentLanguage: 'Current language: {language}',
      switchTo: 'Switch to {language}',
      languages: {
        en: 'English',
        zh: '中文',
      },
    },
  };

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();

    // Setup default mocks
    useLocale.mockReturnValue(defaultMocks.locale);
    usePathname.mockReturnValue(defaultMocks.pathname);
    useSearchParams.mockReturnValue(new URLSearchParams());

    mockT.mockImplementation((key: string) => {
      if (key === 'languages.en') return 'English';
      if (key === 'languages.zh') return '中文';
      if (key === 'languages') return defaultMocks.translations.languages;
      if (key === 'toggle') return defaultMocks.translations.toggle;
      if (key === 'selectLanguage')
        return defaultMocks.translations.selectLanguage;
      return key;
    });

    useTranslations.mockImplementation(((namespace: string) => {
      if (namespace === 'LocaleSwitcher') {
        return mockT;
      }
      return (key: string) => key;
    }) as any);
  });

  describe('复杂路径处理', () => {
    it('正确处理复杂路径名', async () => {
      usePathname.mockReturnValue('/blog/post-title');

      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const chineseOption = screen.getByText('中文');
      await user.click(chineseOption);

      expect(mockPush).toHaveBeenCalledWith('/zh/blog/post-title');
    });

    it('保持搜索参数在语言切换时', async () => {
      useSearchParams.mockReturnValue(
        new URLSearchParams('?tab=settings&view=grid'),
      );

      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const chineseOption = screen.getByText('中文');
      await user.click(chineseOption);

      expect(mockPush).toHaveBeenCalledWith('/zh?tab=settings&view=grid');
    });

    it('处理路径名中的特殊字符', async () => {
      usePathname.mockReturnValue('/search/query-with-dashes');

      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const chineseOption = screen.getByText('中文');
      await user.click(chineseOption);

      expect(mockPush).toHaveBeenCalledWith('/zh/search/query-with-dashes');
    });
  });

  describe('长语言名称处理', () => {
    it('处理长语言名称的语言选项', async () => {
      // Mock with longer language names
      mockT.mockImplementation((key: string) => {
        if (key === 'languages.en') return 'English (United States)';
        if (key === 'languages.zh') return '中文 (简体中文)';
        if (key === 'languages') {
          return {
            en: 'English (United States)',
            zh: '中文 (简体中文)',
          };
        }
        return key;
      });

      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('English (United States)')).toBeInTheDocument();
      expect(screen.getByText('中文 (简体中文)')).toBeInTheDocument();
    });
  });

  describe('缺失翻译处理', () => {
    it('优雅处理缺失的语言翻译', async () => {
      // Mock with missing translations
      mockT.mockImplementation((key: string) => {
        if (key === 'languages') {
          return {
            en: undefined, // Missing translation
            zh: '中文',
          };
        }
        return key;
      });

      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Should still render options even with missing translations
      const options = screen.getAllByRole('menuitem');
      expect(options).toHaveLength(2);
    });
  });

  describe('键盘交互', () => {
    it('处理语言的键盘选择', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      // 使用键盘导航
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      // 应该选择第一个选项（中文，因为英文是当前语言）
      expect(mockPush).toHaveBeenCalledWith('/zh');
    });
  });

  describe('自定义setUserOverride', () => {
    it('处理自定义setUserOverride的切换', async () => {
      const mockSetUserOverride = vi.fn();

      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const chineseOption = screen.getByText('中文');
      await user.click(chineseOption);

      expect(mockSetUserOverride).toHaveBeenCalledWith('zh');
      expect(mockPush).toHaveBeenCalledWith('/zh');
    });
  });

  describe('语言切换反馈', () => {
    it('在切换语言时提供反馈', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const chineseOption = screen.getByText('中文');
      await user.click(chineseOption);

      // 验证切换后的状态
      expect(mockPush).toHaveBeenCalledWith('/zh');
    });
  });

  describe('活跃语言指示', () => {
    it('当语言环境改变时更新活跃语言', async () => {
      const { rerender } = render(<EnhancedLocaleSwitcher />);

      let button = screen.getByRole('button');
      await user.click(button);

      // 初始状态：英文是活跃的
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();

      // 模拟语言环境改变
      useLocale.mockReturnValue('zh');

      rerender(<EnhancedLocaleSwitcher />);

      button = screen.getByRole('button');
      await user.click(button);

      // 现在中文应该是活跃的
      const checkIcon = screen.getByTestId('check-icon');
      expect(checkIcon).toBeInTheDocument();
    });

    it('为当前语言提供正确的aria-label', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const englishOption = screen.getByText('English');
      expect(englishOption.closest('[role="menuitem"]')).toHaveAttribute(
        'aria-current',
        'true',
      );
    });
  });
});
