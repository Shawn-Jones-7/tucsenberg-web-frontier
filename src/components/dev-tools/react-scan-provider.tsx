'use client';

import React, { useEffect } from 'react';
import { REACT_SCAN_CONFIG } from '@/constants/react-scan';

/**
 * React Scan Provider
 *
 * 负责在开发环境中自动初始化 React Scan 性能监控工具
 * 特点：
 * - 开发环境自动启用，生产环境强制禁用
 * - 跟随开发服务器启用/关闭
 * - 可通过环境变量禁用（NEXT_PUBLIC_DISABLE_REACT_SCAN=true）
 * - 不影响生产构建
 * - 提供实时的 React 组件性能分析
 * - 自定义 Ctrl+Shift+X 快捷键切换功能
 */
export function ReactScanProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 生产环境强制禁用
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    // 非开发环境禁用
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // 检查是否明确禁用
    const explicitlyDisabled =
      process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN === 'true';

    if (explicitlyDisabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '🔍 React Scan disabled by NEXT_PUBLIC_DISABLE_REACT_SCAN=true',
        );
      }
      return;
    }

    // let reactScanInstance: unknown = null; // TODO: Use when needed
    let isReactScanEnabled = true;

    // 动态导入并初始化 React Scan
    const initReactScan = async () => {
      try {
        const { scan, setOptions } = await import('react-scan');

        // 初始化 React Scan
        scan({
          enabled: true,
          showToolbar: true,
          log: false, // 避免控制台噪音，保持日志清洁
          // trackUnnecessaryRenders: true, // 检测不必要的渲染 - 该选项不存在
          animationSpeed: 'fast',

          // 自定义回调 - 与现有性能监控系统集成
          onRender: (fiber, renders) => {
            // 可以在这里集成到现有的性能监控系统
            if (renders.length > REACT_SCAN_CONFIG.RENDER_WARNING_THRESHOLD) {
              if (process.env.NODE_ENV === 'development') {
                console.warn(
                  `🐌 Component ${fiber.type?.name || 'Unknown'} rendered ${renders.length} times`,
                );
              }
            }
          },
        });

        // 自定义快捷键处理器
        const handleKeyDown = (event: KeyboardEvent) => {
          // 检查 Ctrl+Shift+X 组合键
          if (
            event.ctrlKey &&
            event.shiftKey &&
            event.key.toLowerCase() === 'x'
          ) {
            event.preventDefault();

            try {
              // 切换 React Scan 启用状态
              isReactScanEnabled = !isReactScanEnabled;

              // 更新 React Scan 选项
              setOptions({
                enabled: isReactScanEnabled,
                showToolbar: isReactScanEnabled,
              });

              // 提供用户反馈
              const status = isReactScanEnabled ? 'enabled' : 'disabled';
              if (process.env.NODE_ENV === 'development') {
                console.log(`🔍 React Scan ${status} via Ctrl+Shift+X`);
              }

              // 可选：显示临时通知
              if (typeof window !== 'undefined') {
                const notification = document.createElement('div');
                notification.textContent = `React Scan ${status}`;
                notification.style.cssText = `
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: ${isReactScanEnabled ? '#10b981' : '#ef4444'};
                  color: white;
                  padding: 12px 16px;
                  border-radius: 8px;
                  font-family: system-ui, sans-serif;
                  font-size: 14px;
                  font-weight: 500;
                  z-index: 10000;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                  transition: opacity 0.3s ease;
                `;

                document.body.appendChild(notification);

                // 3秒后移除通知
                setTimeout(() => {
                  notification.style.opacity = '0';
                  setTimeout(() => {
                    if (notification.parentNode) {
                      notification.parentNode.removeChild(notification);
                    }
                  }, REACT_SCAN_CONFIG.NOTIFICATION_FADE_DURATION);
                }, REACT_SCAN_CONFIG.NOTIFICATION_DISPLAY_DURATION);
              }
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to toggle React Scan:', error);
              }
            }
          }
        };

        // 注册全局键盘事件监听器
        document.addEventListener('keydown', handleKeyDown, { capture: true });

        if (process.env.NODE_ENV === 'development') {
          console.log(
            '🔍 React Scan initialized - Performance monitoring active',
          );
          console.log('💡 Press Ctrl+Shift+X to toggle React Scan');
        }

        // 返回清理函数
        return () => {
          document.removeEventListener('keydown', handleKeyDown, {
            capture: true,
          });
        };
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to initialize React Scan:', error);
        }
        // eslint-disable-next-line no-empty-function
        return () => {}; // 返回空清理函数，错误情况下无需清理
      }
    };

    // 执行初始化并保存清理函数
    let cleanup: (() => void) | undefined;
    initReactScan().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    // 组件卸载时清理
    // eslint-disable-next-line consistent-return
    return () => {
      // useEffect 清理函数
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return <>{children}</>;
}

/**
 * React Scan 状态指示器
 *
 * 在开发环境显示 React Scan 的启用状态
 * 自动跟随开发环境启用，生产环境不显示
 */
export function ReactScanIndicator() {
  const { registerTool, unregisterTool, getClasses } = {
    registerTool: (_toolId: string) => {},
    unregisterTool: (_toolId: string) => {},
    getClasses: () => '',
  };

  // 检查是否明确禁用
  const explicitlyDisabled =
    process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN === 'true';

  // 注册工具到布局管理器 - 始终调用 Hook
  useEffect(() => {
    if (!explicitlyDisabled && process.env.NODE_ENV === 'development') {
      registerTool('reactScanIndicator');
      return () => unregisterTool('reactScanIndicator');
    }
    return undefined;
  }, [explicitlyDisabled, registerTool, unregisterTool]);

  // 生产环境不显示
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // 非开发环境不显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (explicitlyDisabled) {
    return null;
  }

  return (
    <div
      className={`${getClasses()} flex items-center gap-2 rounded-md bg-blue-500 px-3 py-2 text-xs text-white shadow-lg`}
    >
      <div className='h-2 w-2 animate-pulse rounded-full bg-white'></div>
      <span>🔍 React Scan Active</span>
    </div>
  );
}

/**
 * React Scan 控制面板
 *
 * 提供开发环境中的 React Scan 控制选项
 * 自动跟随开发环境启用，生产环境不显示
 */
export function ReactScanControlPanel() {
  const { registerTool, unregisterTool, getClasses } = {
    registerTool: (_toolId: string) => {},
    unregisterTool: (_toolId: string) => {},
    getClasses: () => '',
  };

  // 检查是否明确禁用
  const explicitlyDisabled =
    process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN === 'true';

  // 注册工具到布局管理器 - 始终调用 Hook
  useEffect(() => {
    if (!explicitlyDisabled && process.env.NODE_ENV === 'development') {
      registerTool('reactScanControlPanel');
      return () => unregisterTool('reactScanControlPanel');
    }
    return undefined;
  }, [explicitlyDisabled, registerTool, unregisterTool]);

  // 生产环境不显示
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // 非开发环境不显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (explicitlyDisabled) {
    return null;
  }

  return (
    <div
      className={`${getClasses()} rounded-lg bg-gray-900 p-4 text-white shadow-xl`}
    >
      <h3 className='mb-2 text-sm font-semibold'>React Scan Controls</h3>
      <div className='space-y-2 text-xs'>
        <div>
          • Press <kbd className='rounded bg-gray-700 px-1'>Ctrl+Shift+X</kbd>{' '}
          to toggle scanning
        </div>
        <div>• Red highlights = unnecessary renders</div>
        <div>• Green highlights = optimized renders</div>
        <div>• Use toolbar to inspect components</div>
      </div>
    </div>
  );
}
