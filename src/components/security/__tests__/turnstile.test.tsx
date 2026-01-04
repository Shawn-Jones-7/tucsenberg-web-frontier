import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TurnstileWidget, useTurnstile } from '@/components/security/turnstile';

// 最早时机设置环境变量 - 在任何模块导入之前
vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'test-site-key-12345');
vi.stubEnv('NEXT_PUBLIC_TEST_MODE', 'false');
vi.stubEnv('NODE_ENV', 'test');

// 使用vi.hoisted创建Mock函数
const mockTurnstile = vi.hoisted(() =>
  vi.fn((props) =>
    React.createElement('div', {
      'data-testid': 'turnstile-widget',
      'data-sitekey': props?.siteKey,
      'data-theme': props?.options?.theme,
      'data-size': props?.options?.size,
      'className': `turnstile-container ${props?.className || ''}`.trim(),
      'id': props?.id,
    }),
  ),
);

// Mock @marsidev/react-turnstile
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: mockTurnstile,
}));

// 专家级解决方案：直接Mock env.mjs导出，绕过@t3-oss/env-nextjs的模块缓存
vi.mock('../../../../env.mjs', () => ({
  env: {
    // 服务器端环境变量
    NODE_ENV: 'test',
    TURNSTILE_SECRET_KEY: 'test-secret-key',
    RESEND_API_KEY: 'test-resend-key',
    AIRTABLE_API_KEY: 'test-airtable-key',
    AIRTABLE_BASE_ID: 'test-base-id',
    AIRTABLE_TABLE_NAME: 'test-table',
    EMAIL_FROM: 'test@example.com',
    EMAIL_REPLY_TO: 'reply@example.com',
    CSP_REPORT_URI: 'https://example.com/csp-report',
    ADMIN_TOKEN: 'test-admin-token',

    // 客户端环境变量 - 关键修复！
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'test-site-key-12345',
    NEXT_PUBLIC_TEST_MODE: false, // 确保组件正常渲染，不使用测试模式
    NEXT_PUBLIC_SITE_URL: 'https://example.com',
    NEXT_PUBLIC_VERCEL_URL: 'example.vercel.app',
    NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: '[PROJECT_NAME]',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_ENABLE_ANALYTICS: true,
    NEXT_PUBLIC_ENABLE_ERROR_REPORTING: true,
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: true,
    NEXT_PUBLIC_DISABLE_REACT_SCAN: false,
    NEXT_PUBLIC_DISABLE_DEV_TOOLS: false,
    NEXT_PUBLIC_DEFAULT_LOCALE: 'en',
    NEXT_PUBLIC_SUPPORTED_LOCALES: 'en,zh',
    NEXT_PUBLIC_SECURITY_MODE: 'strict',
  },
}));

// 获取Mock组件的引用
const getMockTurnstile = () => mockTurnstile;

describe('TurnstileWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules(); // 清除Node模块缓存，防止跨测试污染
  });

  describe('基础渲染', () => {
    it('应该正确渲染TurnstileWidget组件', () => {
      const { container } = render(<TurnstileWidget onVerify={vi.fn()} />);

      // 检查是否有任何内容被渲染
      expect(container.firstChild).not.toBeNull();

      // 应该渲染turnstile-widget
      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();

      // 应该有turnstile-container类
      expect(
        container.querySelector('.turnstile-container'),
      ).toBeInTheDocument();
    });

    it('应该调用Turnstile组件', () => {
      render(<TurnstileWidget onVerify={vi.fn()} />);

      expect(getMockTurnstile()).toHaveBeenCalled();
    });

    it('应该传递正确的siteKey', () => {
      render(<TurnstileWidget onVerify={vi.fn()} />);

      const mockCall = getMockTurnstile().mock.calls[0];
      expect(mockCall?.[0]).toMatchObject({
        siteKey: 'test-site-key-12345',
      });
    });
  });

  describe('组件配置', () => {
    it('应该处理自定义主题', () => {
      render(
        <TurnstileWidget
          onVerify={vi.fn()}
          theme='dark'
        />,
      );

      const mockCall = getMockTurnstile().mock.calls[0];
      expect(mockCall?.[0]).toMatchObject({
        options: {
          theme: 'dark',
        },
      });
    });

    it('应该处理自定义尺寸', () => {
      render(
        <TurnstileWidget
          onVerify={vi.fn()}
          size='compact'
        />,
      );

      const mockCall = getMockTurnstile().mock.calls[0];
      expect(mockCall?.[0]).toMatchObject({
        options: {
          size: 'compact',
        },
      });
    });

    it('应该处理自定义className', () => {
      render(
        <TurnstileWidget
          onVerify={vi.fn()}
          className='custom-class'
        />,
      );

      // className应该传递给外层容器，而不是内层的turnstile-widget
      const container = screen.getByTestId('turnstile-widget').parentElement;
      expect(container).toHaveClass('turnstile-container');
      expect(container).toHaveClass('custom-class');
    });

    it('应该处理自定义ID', () => {
      render(
        <TurnstileWidget
          onVerify={vi.fn()}
          id='custom-id'
        />,
      );

      const mockCall = getMockTurnstile().mock.calls[0];
      expect(mockCall?.[0]).toMatchObject({
        id: 'custom-id',
      });
    });
  });

  describe('回调处理', () => {
    it('应该接受onVerify回调', () => {
      const onVerify = vi.fn();
      render(<TurnstileWidget onVerify={onVerify} />);

      const mockCall = getMockTurnstile().mock.calls[0];
      expect(mockCall?.[0]).toMatchObject({
        onSuccess: expect.any(Function),
      });
    });

    it('应该接受onError回调', () => {
      const onError = vi.fn();
      render(
        <TurnstileWidget
          onVerify={vi.fn()}
          onError={onError}
        />,
      );

      const mockCall = getMockTurnstile().mock.calls[0];
      expect(mockCall?.[0]).toMatchObject({
        onError: expect.any(Function),
      });
    });

    it('应该接受onExpire回调', () => {
      const onExpire = vi.fn();
      render(
        <TurnstileWidget
          onVerify={vi.fn()}
          onExpire={onExpire}
        />,
      );

      const mockCall = getMockTurnstile().mock.calls[0];
      expect(mockCall?.[0]).toMatchObject({
        onExpire: expect.any(Function),
      });
    });

    it('应该在成功时调用onSuccess回调', () => {
      const onSuccess = vi.fn();
      render(<TurnstileWidget onSuccess={onSuccess} />);

      const mockCall = getMockTurnstile().mock.calls[0];
      const handleSuccess = mockCall?.[0]?.onSuccess;
      handleSuccess?.('test-token-123');

      expect(onSuccess).toHaveBeenCalledWith('test-token-123');
    });

    it('应该在成功时调用onVerify回调（向后兼容）', () => {
      const onVerify = vi.fn();
      render(<TurnstileWidget onVerify={onVerify} />);

      const mockCall = getMockTurnstile().mock.calls[0];
      const handleSuccess = mockCall?.[0]?.onSuccess;
      handleSuccess?.('test-token-456');

      expect(onVerify).toHaveBeenCalledWith('test-token-456');
    });

    it('应该在错误时调用onError回调', () => {
      const onError = vi.fn();
      render(
        <TurnstileWidget
          onVerify={vi.fn()}
          onError={onError}
        />,
      );

      const mockCall = getMockTurnstile().mock.calls[0];
      const handleError = mockCall?.[0]?.onError;
      handleError?.('test-error');

      expect(onError).toHaveBeenCalledWith('test-error');
    });

    it('应该在过期时调用onExpire回调', () => {
      const onExpire = vi.fn();
      render(
        <TurnstileWidget
          onVerify={vi.fn()}
          onExpire={onExpire}
        />,
      );

      const mockCall = getMockTurnstile().mock.calls[0];
      const handleExpire = mockCall?.[0]?.onExpire;
      handleExpire?.();

      expect(onExpire).toHaveBeenCalled();
    });

    it('应该在加载时调用onLoad回调', () => {
      const onLoad = vi.fn();
      render(
        <TurnstileWidget
          onVerify={vi.fn()}
          onLoad={onLoad}
        />,
      );

      const mockCall = getMockTurnstile().mock.calls[0];
      const handleLoad = mockCall?.[0]?.onLoad;
      handleLoad?.();

      expect(onLoad).toHaveBeenCalled();
    });

    it('应该处理没有onError回调的错误', () => {
      render(<TurnstileWidget onVerify={vi.fn()} />);

      const mockCall = getMockTurnstile().mock.calls[0];
      const handleError = mockCall?.[0]?.onError;

      expect(() => handleError?.('test-error')).not.toThrow();
    });

    it('应该处理没有onExpire回调的过期', () => {
      render(<TurnstileWidget onVerify={vi.fn()} />);

      const mockCall = getMockTurnstile().mock.calls[0];
      const handleExpire = mockCall?.[0]?.onExpire;

      expect(() => handleExpire?.()).not.toThrow();
    });

    it('应该处理没有onLoad回调的加载', () => {
      render(<TurnstileWidget onVerify={vi.fn()} />);

      const mockCall = getMockTurnstile().mock.calls[0];
      const handleLoad = mockCall?.[0]?.onLoad;

      expect(() => handleLoad?.()).not.toThrow();
    });
  });

  describe('错误处理', () => {
    it('应该处理空的onVerify回调', () => {
      expect(() => {
        render(
          <TurnstileWidget
            onVerify={undefined as unknown as (_token: string) => void}
          />,
        );
      }).not.toThrow();
    });
  });
});

describe('useTurnstile Hook', () => {
  it('应该返回初始状态', () => {
    const TestComponent = () => {
      const turnstile = useTurnstile();
      return (
        <div>
          <span data-testid='verified'>{turnstile.isVerified.toString()}</span>
          <span data-testid='loading'>{turnstile.isLoading.toString()}</span>
          <span data-testid='token'>{turnstile.token || 'null'}</span>
          <span data-testid='error'>{turnstile.error || 'null'}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('verified')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('error')).toHaveTextContent('null');
  });

  it('应该支持重置功能', () => {
    const TestComponent = () => {
      const turnstile = useTurnstile();

      React.useEffect(() => {
        turnstile.reset();
      }, [turnstile]);

      return (
        <div>
          <span data-testid='verified'>{turnstile.isVerified.toString()}</span>
          <span data-testid='token'>{turnstile.token || 'null'}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('verified')).toHaveTextContent('false');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
  });

  it('应该提供handlers对象', () => {
    const TestComponent = () => {
      const turnstile = useTurnstile();

      return (
        <div>
          <span data-testid='has-handlers'>
            {typeof turnstile.handlers === 'object' ? 'true' : 'false'}
          </span>
          <span data-testid='has-onSuccess'>
            {typeof turnstile.handlers.onSuccess === 'function'
              ? 'true'
              : 'false'}
          </span>
          <span data-testid='has-onError'>
            {typeof turnstile.handlers.onError === 'function'
              ? 'true'
              : 'false'}
          </span>
          <span data-testid='has-onExpire'>
            {typeof turnstile.handlers.onExpire === 'function'
              ? 'true'
              : 'false'}
          </span>
          <span data-testid='has-onLoad'>
            {typeof turnstile.handlers.onLoad === 'function' ? 'true' : 'false'}
          </span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('has-handlers')).toHaveTextContent('true');
    expect(screen.getByTestId('has-onSuccess')).toHaveTextContent('true');
    expect(screen.getByTestId('has-onError')).toHaveTextContent('true');
    expect(screen.getByTestId('has-onExpire')).toHaveTextContent('true');
    expect(screen.getByTestId('has-onLoad')).toHaveTextContent('true');
  });
});
