import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
// 导入要测试的组件
import { TechStackSection } from '@/components/home/tech-stack-section';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const {
  mockUseTranslations,
  mockUseIntersectionObserver,
  mockUseState,
  mockUseMemo,
} = vi.hoisted(() => ({
  mockUseTranslations: vi.fn(),
  mockUseIntersectionObserver: vi.fn(),
  mockUseState: vi.fn(),
  mockUseMemo: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: mockUseTranslations,
}));

// Mock intersection observer hook
vi.mock('@/hooks/use-intersection-observer', () => ({
  useIntersectionObserver: mockUseIntersectionObserver,
}));

// Mock React hooks
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: mockUseState,
    useMemo: mockUseMemo,
  };
});

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  ExternalLink: () => <div data-testid='external-link-icon'>ExternalLink</div>,
}));

// Mock tech stack data
vi.mock('@/lib/tech-stack-data', () => ({
  techStackCategories: {
    core: 'Core Technologies',
    frontend: 'Frontend',
    backend: 'Backend',
    tools: 'Development Tools',
  },
  techStackData: [
    {
      id: 'nextjs',
      name: 'Next.js',
      category: 'core',
      description: 'React framework',
      url: 'https://nextjs.org',
      icon: 'nextjs',
    },
    {
      id: 'react',
      name: 'React',
      category: 'frontend',
      description: 'UI library',
      url: 'https://react.dev',
      icon: 'react',
    },
  ],
}));

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
    <span
      data-testid='badge'
      className={className}
      {...props}
    >
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    variant: _variant,
    size: _size,
    className,
    onClick,
    disabled: _disabled,
    ...props
  }: {
    children?: React.ReactNode;
    asChild?: boolean;
    variant?: string;
    size?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    [key: string]: unknown;
  }) => {
    if (asChild) {
      return (
        <div
          data-testid='button-as-child'
          className={className}
          {...props}
        >
          {children}
        </div>
      );
    }
    return (
      <button
        data-testid='button'
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  },
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
    <div
      data-testid='card'
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
    ...props
  }: React.ComponentProps<'div'>) => (
    <div
      data-testid='card-content'
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  CardDescription: ({
    children,
    className,
    ...props
  }: React.ComponentProps<'div'>) => (
    <div
      data-testid='card-description'
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    className,
    ...props
  }: React.ComponentProps<'div'>) => (
    <div
      data-testid='card-header'
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    className,
    ...props
  }: React.ComponentProps<'div'>) => (
    <div
      data-testid='card-title'
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({
    children,
    value,
    onValueChange,
    className,
    ...props
  }: {
    children?: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    [key: string]: any;
  }) => (
    <div
      data-testid='tabs'
      data-value={value}
      className={className}
      {...props}
      onClick={() => onValueChange && onValueChange('frontend')}
    >
      {children}
    </div>
  ),
  TabsContent: ({
    children,
    value,
    className,
    ...props
  }: {
    children?: React.ReactNode;
    value?: string;
    className?: string;
    [key: string]: any;
  }) => (
    <div
      data-testid='tabs-content'
      data-value={value}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  TabsList: ({
    children,
    className,
    ...props
  }: React.ComponentProps<'div'>) => (
    <div
      data-testid='tabs-list'
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  TabsTrigger: ({
    children,
    value,
    className,
    ...props
  }: {
    children?: React.ReactNode;
    value?: string;
    className?: string;
    [key: string]: any;
  }) => (
    <button
      data-testid='tabs-trigger'
      data-value={value}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('TechStackSection', () => {
  // 默认Mock返回值
  const defaultTranslations = {
    'title': 'Tech Stack',
    'subtitle': 'Modern technologies we use',
    'stats.totalTech': 'Total Technologies',
    'stats.categories': 'Categories',
    'stats.modern': 'Modern',
    'stats.quality': 'Quality',
    'learnMore': 'Learn More',
    'categories.core': 'Core',
    'categories.frontend': 'Frontend',
    'categories.backend': 'Backend',
    'categories.tools': 'Tools',
  };

  const defaultIntersectionObserver = {
    ref: vi.fn(),
    isVisible: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认Mock返回值 - 修复：useTranslations应该返回一个函数
    const mockTranslationFunction = vi.fn((key: string) => {
      return (
        defaultTranslations[key as keyof typeof defaultTranslations] || key
      );
    });
    mockUseTranslations.mockReturnValue(mockTranslationFunction);
    mockUseIntersectionObserver.mockReturnValue(defaultIntersectionObserver);
    mockUseState.mockImplementation((initial) => [initial, vi.fn()]);
    mockUseMemo.mockImplementation((fn) => fn());
  });

  describe('基础渲染测试', () => {
    it('应该正确渲染组件的基本结构', () => {
      render(<TechStackSection />);

      // 验证主要结构元素 - 修复：使用正确的选择器
      expect(
        screen.getByRole('heading', { name: 'Tech Stack' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Tech Stack')).toBeInTheDocument();
      expect(
        screen.getByText('Modern technologies we use'),
      ).toBeInTheDocument();
    });

    it('应该渲染统计信息', () => {
      render(<TechStackSection />);

      // 验证统计数据
      expect(screen.getByText('2')).toBeInTheDocument(); // techStackData.length
      expect(screen.getByText('4')).toBeInTheDocument(); // categories count
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('A+')).toBeInTheDocument();

      // 验证统计标签
      expect(screen.getByText('Total Technologies')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Modern')).toBeInTheDocument();
      expect(screen.getByText('Quality')).toBeInTheDocument();
    });

    it('应该渲染技术栈标签页', () => {
      render(<TechStackSection />);

      // 验证标签页组件存在
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该处理标签页切换', () => {
      const mockSetState = vi.fn();
      mockUseState.mockReturnValue(['core', mockSetState]);

      render(<TechStackSection />);

      const tabs = screen.getByTestId('tabs');
      fireEvent.click(tabs);

      // 验证状态更新被调用
      expect(mockSetState).toHaveBeenCalled();
    });
  });

  describe('动画和可见性测试', () => {
    it('应该处理元素可见时的动画', () => {
      mockUseIntersectionObserver.mockReturnValue({
        ref: vi.fn(),
        isVisible: true,
      });

      render(<TechStackSection />);

      // 验证可见状态下的CSS类
      const titleElement = screen.getByText('Tech Stack').closest('div');
      expect(titleElement).toHaveClass('translate-y-0', 'opacity-100');
    });

    it('应该处理元素不可见时的动画', () => {
      mockUseIntersectionObserver.mockReturnValue({
        ref: vi.fn(),
        isVisible: false,
      });

      render(<TechStackSection />);

      // 验证不可见状态下的CSS类
      const titleElement = screen.getByText('Tech Stack').closest('div');
      expect(titleElement).toHaveClass('translate-y-8', 'opacity-0');
    });
  });

  describe('数据处理测试', () => {
    it('应该正确处理技术栈数据分类', () => {
      const mockCategorizedData = {
        core: [{ id: 'nextjs', name: 'Next.js', category: 'core' }],
        frontend: [{ id: 'react', name: 'React', category: 'frontend' }],
        backend: [],
        tools: [],
      };

      mockUseMemo.mockReturnValue(mockCategorizedData);

      render(<TechStackSection />);

      // 验证useMemo被调用
      expect(mockUseMemo).toHaveBeenCalled();
    });
  });

  describe('国际化测试', () => {
    it('应该正确使用翻译键', () => {
      render(<TechStackSection />);

      // 验证useTranslations被正确调用
      expect(mockUseTranslations).toHaveBeenCalledWith('home.techStack');
    });

    it('应该处理缺失的翻译键', () => {
      // Mock useTranslations返回缺失键的情况
      const mockTranslationFunction = vi.fn((key: string) => `missing.${key}`);
      mockUseTranslations.mockReturnValue(mockTranslationFunction);

      render(<TechStackSection />);

      // 验证缺失翻译的处理
      expect(screen.getByText('missing.title')).toBeInTheDocument();
    });
  });

  describe('子组件测试', () => {
    it('应该渲染TechStackStats组件', () => {
      render(<TechStackSection />);

      // 验证统计组件的存在
      expect(screen.getByText('Total Technologies')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('应该渲染TechStackTitle组件', () => {
      render(<TechStackSection />);

      // 验证标题组件
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByText('Tech Stack')).toBeInTheDocument();
      expect(
        screen.getByText('Modern technologies we use'),
      ).toBeInTheDocument();
    });

    it('应该渲染TechStackTabs组件', () => {
      render(<TechStackSection />);

      // 验证标签页组件
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理useIntersectionObserver错误', () => {
      mockUseIntersectionObserver.mockImplementation(() => {
        throw new Error('IntersectionObserver error');
      });

      expect(() => render(<TechStackSection />)).toThrow(
        'IntersectionObserver error',
      );
    });

    it('应该处理useState错误', () => {
      mockUseState.mockImplementation(() => {
        throw new Error('useState error');
      });

      expect(() => render(<TechStackSection />)).toThrow('useState error');
    });

    it('应该处理useMemo错误', () => {
      mockUseMemo.mockImplementation(() => {
        throw new Error('useMemo error');
      });

      expect(() => render(<TechStackSection />)).toThrow('useMemo error');
    });
  });

  describe('边缘情况测试', () => {
    it('应该处理空的技术栈数据', () => {
      // 修复：直接Mock useMemo返回空的分类数据
      mockUseMemo.mockReturnValueOnce({});

      render(<TechStackSection />);

      // 验证空数据的处理 - 组件应该仍然渲染基本结构
      expect(screen.getByText('Tech Stack')).toBeInTheDocument();
      expect(
        screen.getByText('Modern technologies we use'),
      ).toBeInTheDocument();
    });

    it('应该处理不同的选中分类', () => {
      mockUseState.mockReturnValue(['frontend', vi.fn()]);

      render(<TechStackSection />);

      // 验证不同分类的处理
      const tabs = screen.getByTestId('tabs');
      expect(tabs).toHaveAttribute('data-value', 'frontend');
    });

    it('应该处理多个intersection observer实例', () => {
      let callCount = 0;
      mockUseIntersectionObserver.mockImplementation(() => {
        callCount++;
        return {
          ref: vi.fn(),
          isVisible: callCount % 2 === 0, // 交替返回true/false
        };
      });

      render(<TechStackSection />);

      // 验证多次调用intersection observer
      expect(mockUseIntersectionObserver).toHaveBeenCalledTimes(3); // title, tabs, stats
    });
  });

  describe('性能测试', () => {
    it('应该正确使用useMemo优化性能', () => {
      render(<TechStackSection />);

      // 验证useMemo被调用用于数据分类
      expect(mockUseMemo).toHaveBeenCalledWith(expect.any(Function), []);
    });

    it('应该正确设置intersection observer配置', () => {
      render(<TechStackSection />);

      // 验证intersection observer配置
      expect(mockUseIntersectionObserver).toHaveBeenCalledWith({
        threshold: 0.3,
        triggerOnce: true,
      });
    });
  });

  describe('可访问性测试', () => {
    it('应该有正确的语义结构', () => {
      render(<TechStackSection />);

      // 验证语义元素 - 修复：使用正确的选择器
      const section = document.querySelector('#tech-stack');
      expect(section).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('应该有正确的section id', () => {
      render(<TechStackSection />);

      // 验证section id用于锚点导航
      const section = document.querySelector('#tech-stack');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'tech-stack');
    });
  });
});
