/**
 * Enhanced Locale Switcher 核心语言切换测试
 * 包含基础语言选项显示和切换功能测试
 *
 * 注意：高级测试场景请参考 enhanced-locale-switcher-language-switching.test.tsx
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

describe('Enhanced Locale Switcher - 核心语言切换功能', () => {
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

  describe('基础语言选项', () => {
    it('渲染所有可用的语言选项', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    it('显示正确的语言选项结构', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const options = screen.getAllByRole('menuitem');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('English');
      expect(options[1]).toHaveTextContent('中文');
    });

    it('为当前语言显示选中图标', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const checkIcon = screen.getByTestId('check-icon');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  describe('基础语言切换', () => {
    it('点击语言选项时调用router.push', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const chineseOption = screen.getByText('中文');
      await user.click(chineseOption);

      expect(mockPush).toHaveBeenCalledWith('/zh');
    });

    it('切换语言时保持路径名', async () => {
      usePathname.mockReturnValue('/about');

      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const chineseOption = screen.getByText('中文');
      await user.click(chineseOption);

      expect(mockPush).toHaveBeenCalledWith('/zh/about');
    });

    it('语言选择后关闭下拉菜单', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      // 确认菜单是打开的
      expect(screen.getByText('中文')).toBeInTheDocument();

      const chineseOption = screen.getByText('中文');
      await user.click(chineseOption);

      // 菜单应该关闭
      expect(screen.queryByText('中文')).not.toBeInTheDocument();
    });

    it('阻止切换到当前语言', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const englishOption = screen.getByText('English');
      await user.click(englishOption);

      // 不应该调用router.push，因为已经是当前语言
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('URL构建', () => {
    it('为不同语言构建正确的URL', async () => {
      const testCases = [
        { pathname: '/', locale: 'zh', expected: '/zh' },
        { pathname: '/about', locale: 'zh', expected: '/zh/about' },
        { pathname: '/blog/post', locale: 'zh', expected: '/zh/blog/post' },
      ];

      for (const testCase of testCases) {
        usePathname.mockReturnValue(testCase.pathname);

        render(<EnhancedLocaleSwitcher />);

        const button = screen.getByRole('button');
        await user.click(button);

        const chineseOption = screen.getByText('中文');
        await user.click(chineseOption);

        expect(mockPush).toHaveBeenCalledWith(testCase.expected);

        // 清理
        vi.clearAllMocks();
      }
    });

    it('正确处理空路径名', async () => {
      usePathname.mockReturnValue('');

      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const chineseOption = screen.getByText('中文');
      await user.click(chineseOption);

      expect(mockPush).toHaveBeenCalledWith('/zh');
    });
  });

  describe('错误处理', () => {
    it('优雅处理语言切换过程中的错误', async () => {
      mockPush.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const chineseOption = screen.getByText('中文');

      // 不应该抛出错误
      expect(async () => {
        await user.click(chineseOption);
      }).not.toThrow();
    });
  });
});
