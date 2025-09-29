'use client';

/**
 * 动态导入基础组件和工具
 *
 * 提供加载状态组件、高阶组件包装器等基础功能
 */
import React, { Suspense, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { logger } from '@/lib/logger';
import { LoadingSpinner } from '@/components/loading-spinner';
import { PERCENTAGE_FULL } from '@/constants';

// ==================== 加载状态组件 ====================

/**
 * 组件加载状态回退
 * Component loading fallback
 */
export function ComponentLoadingFallback() {
  return (
    <div className='flex items-center justify-center p-8'>
      <LoadingSpinner />
    </div>
  );
}

/**
 * 最小化加载状态回退
 * Minimal loading fallback
 */
export function MinimalLoadingFallback() {
  return (
    <div className='animate-pulse'>
      <div className='bg-muted mb-2 h-4 w-3/4 rounded'></div>
      <div className='bg-muted h-4 w-1/2 rounded'></div>
    </div>
  );
}

/**
 * 骨架屏加载状态
 * Skeleton loading fallback
 */
export function SkeletonLoadingFallback() {
  return (
    <div className='animate-pulse space-y-4'>
      <div className='bg-muted h-4 w-full rounded'></div>
      <div className='bg-muted h-4 w-5/6 rounded'></div>
      <div className='bg-muted h-4 w-4/6 rounded'></div>
    </div>
  );
}

/**
 * 卡片骨架屏加载状态
 * Card skeleton loading fallback
 */
export function CardSkeletonFallback() {
  return (
    <div className='animate-pulse rounded-lg border p-6'>
      <div className='bg-muted mb-4 h-6 w-3/4 rounded'></div>
      <div className='space-y-2'>
        <div className='bg-muted h-4 w-full rounded'></div>
        <div className='bg-muted h-4 w-5/6 rounded'></div>
        <div className='bg-muted h-4 w-4/6 rounded'></div>
      </div>
    </div>
  );
}

// ==================== 高阶组件包装器 ====================

/**
 * 带Suspense的动态组件包装器
 * Dynamic component wrapper with Suspense
 */
export function withDynamicSuspense<T extends object>(
  DynamicComponent: React.ComponentType<T>,
  fallback?: React.ReactNode,
) {
  return function WrappedComponent(props: T) {
    return (
      <Suspense fallback={fallback || <ComponentLoadingFallback />}>
        <DynamicComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * 条件动态加载包装器
 * Conditional dynamic loading wrapper
 * 只在满足条件时才加载组件
 */
export function withConditionalDynamic<T extends object>(
  DynamicComponent: React.ComponentType<T>,
  condition: () => boolean,
) {
  return function ConditionalComponent(props: T) {
    if (!condition()) {
      return null;
    }

    return (
      <Suspense fallback={<ComponentLoadingFallback />}>
        <DynamicComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * 延迟加载包装器
 * Lazy loading wrapper with delay
 */
export function withDelayedDynamic<T extends object>(
  DynamicComponent: React.ComponentType<T>,
  delayMs: number = PERCENTAGE_FULL,
) {
  return function DelayedComponent(props: T) {
    const [shouldLoad, setShouldLoad] = React.useState(false);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, delayMs);

      return () => clearTimeout(timer);
    }, []);

    if (!shouldLoad) {
      return <MinimalLoadingFallback />;
    }

    return (
      <Suspense fallback={<ComponentLoadingFallback />}>
        <DynamicComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * 错误边界包装器
 * Error boundary wrapper for dynamic components
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class DynamicComponentErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ReactNode }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ReactNode }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Dynamic component error', { error, errorInfo });
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className='border-destructive/20 bg-destructive/5 rounded-lg border p-4 text-center'>
            <p className='text-destructive text-sm'>
              组件加载失败
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <span className='mt-1 block text-xs opacity-70'>
                  {this.state.error.message}
                </span>
              )}
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * 带错误边界的动态组件包装器
 * Dynamic component wrapper with error boundary
 */
export function withErrorBoundary<T extends object>(
  DynamicComponent: React.ComponentType<T>,
  errorFallback?: React.ReactNode,
) {
  return function ErrorBoundaryWrappedComponent(props: T) {
    return (
      <DynamicComponentErrorBoundary fallback={errorFallback}>
        <Suspense fallback={<ComponentLoadingFallback />}>
          <DynamicComponent {...props} />
        </Suspense>
      </DynamicComponentErrorBoundary>
    );
  };
}

interface StandardDynamicOptions {
  ssr?: boolean;
  loading?: () => React.ReactNode;
}

type DynamicLoader<TProps> = () => Promise<
  ComponentType<TProps> | { default: ComponentType<TProps> }
>;

/**
 * 标准化动态组件工厂
 * Standard factory for dynamic imports with shared defaults
 */
export function createStandardDynamicComponent<TProps>(
  loader: DynamicLoader<TProps>,
  options: StandardDynamicOptions = {},
) {
  const { ssr = true, loading = MinimalLoadingFallback } = options;

  return dynamic<TProps>(
    async () => {
      const resolved = await loader();
      if ('default' in resolved) {
        return resolved;
      }

      return { default: resolved };
    },
    {
      ssr,
      loading,
    },
  );
}

// ==================== 动态导入工具函数 ====================

/**
 * 创建动态导入配置
 * Create dynamic import configuration
 */
export interface DynamicImportConfig {
  loading?: () => React.ReactNode;
  ssr?: boolean;
  errorFallback?: React.ReactNode;
  delay?: number;
  condition?: () => boolean;
}

/**
 * 标准化动态导入配置
 * Standardize dynamic import configuration
 */
export function createDynamicConfig(config: DynamicImportConfig = {}) {
  return {
    loading: config.loading || (() => <MinimalLoadingFallback />),
    ssr: config.ssr ?? true,
    ...config,
  };
}

/**
 * 开发环境条件检查
 * Development environment condition check
 */
export const isDevelopment = () => process.env.NODE_ENV === 'development';

/**
 * 生产环境条件检查
 * Production environment condition check
 */
export const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * 客户端条件检查
 * Client-side condition check
 */
export const isClient = () => typeof window !== 'undefined';

// ==================== 预设配置 ====================

/**
 * 开发工具组件配置
 * Development tools component configuration
 */
export const DEV_TOOLS_CONFIG: DynamicImportConfig = {
  loading: () => null,
  ssr: false,
  condition: isDevelopment,
};

/**
 * 性能监控组件配置
 * Performance monitoring component configuration
 */
export const PERFORMANCE_CONFIG: DynamicImportConfig = {
  loading: () => <ComponentLoadingFallback />,
  ssr: false,
};

/**
 * UI组件配置
 * UI component configuration
 */
export const UI_COMPONENT_CONFIG: DynamicImportConfig = {
  loading: () => <MinimalLoadingFallback />,
  ssr: true,
};

/**
 * 展示组件配置
 * Showcase component configuration
 */
export const SHOWCASE_CONFIG: DynamicImportConfig = {
  loading: () => <CardSkeletonFallback />,
  ssr: true,
};
