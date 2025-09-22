'use client';

import { useEffect, useState } from 'react';

interface DevToolConfig {
  id: string;
  name: string;
  priority: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isVisible: boolean;
  zIndex: number;
}

/**
 * 开发工具控制器
 *
 * 提供统一的开发工具管理界面，包括：
 * - 显示/隐藏所有开发工具
 * - 工具布局信息
 * - 快速切换功能
 */
export function DevToolsController() {
  const { getLayoutInfo } = useDevToolsLayout();
  const [isVisible, setIsVisible] = useState(false);
  const [layoutInfo, setLayoutInfo] = useState<
    Array<{ toolId: string; config: DevToolConfig }>
  >([]);

  // 始终调用 Hooks，但在非开发环境中不执行逻辑
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return undefined;
    }

    const updateLayoutInfo = () => {
      setLayoutInfo(getLayoutInfo());
    };

    updateLayoutInfo();

    // 定期更新布局信息
    const interval = setInterval(
      updateLayoutInfo,
      DEV_TOOLS_CONSTANTS.PERFORMANCE.DELAY,
    );

    return () => clearInterval(interval);
  }, [getLayoutInfo]);

  // 键盘快捷键支持
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+D 切换开发工具控制器
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className='fixed top-4 left-1/2 z-[1002] -translate-x-1/2 rounded-full bg-gray-900 px-3 py-1 text-xs text-white shadow-lg transition-colors hover:bg-gray-800'
        title='开发工具控制器 (Ctrl+Shift+D)'
      >
        🛠️ Dev Tools
      </button>
    );
  }

  return (
    <div className='fixed top-4 left-1/2 z-[1002] max-w-md -translate-x-1/2 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800'>
      {/* 标题栏 */}
      <div className='flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-700'>
        <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
          🛠️ 开发工具控制器
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className='text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300'
          title='关闭 (Ctrl+Shift+D)'
        >
          ×
        </button>
      </div>

      {/* 工具列表 */}
      <div className='p-3'>
        <div className='space-y-2'>
          <div className='mb-2 text-xs text-gray-500 dark:text-gray-400'>
            活跃工具 ({layoutInfo.length})
          </div>

          {layoutInfo.length === 0 ? (
            <div className='text-xs text-gray-400 italic'>
              没有活跃的开发工具
            </div>
          ) : (
            layoutInfo.map(({ toolId, config }) => (
              <div
                key={toolId}
                className='flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-700'
              >
                <div className='flex-1'>
                  <div className='text-xs font-medium text-gray-900 dark:text-gray-100'>
                    {config.name}
                  </div>
                  <div className='text-xs text-gray-500 dark:text-gray-400'>
                    {config.position} • z-{config.zIndex} • 优先级{' '}
                    {config.priority}
                  </div>
                </div>

                <div className='flex items-center gap-1'>
                  {config.collapsible && (
                    <span
                      className='text-xs text-blue-500'
                      title='可折叠'
                    >
                      📁
                    </span>
                  )}
                  <div
                    className={`h-2 w-2 rounded-full ${
                      config.priority >= DEV_TOOLS_CONSTANTS.LAYOUT.GRID_GAP
                        ? 'bg-red-500'
                        : config.priority >=
                            DEV_TOOLS_CONSTANTS.LAYOUT.BORDER_RADIUS
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    title={`优先级: ${config.priority}`}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* 快捷键提示 */}
        <div className='mt-3 border-t border-gray-200 pt-3 dark:border-gray-700'>
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            <div className='mb-1'>快捷键:</div>
            <div>
              •{' '}
              <kbd className='rounded bg-gray-200 px-1 text-xs dark:bg-gray-600'>
                Ctrl+Shift+D
              </kbd>{' '}
              切换控制器
            </div>
            <div>
              •{' '}
              <kbd className='rounded bg-gray-200 px-1 text-xs dark:bg-gray-600'>
                Ctrl+Shift+X
              </kbd>{' '}
              React Scan
            </div>
          </div>
        </div>

        {/* 布局信息 */}
        <div className='mt-3 border-t border-gray-200 pt-3 dark:border-gray-700'>
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            <div className='mb-1'>布局状态:</div>
            <div className='grid grid-cols-2 gap-1 text-xs'>
              <div>
                左上:{' '}
                {
                  layoutInfo.filter((i) => i.config.position === 'top-left')
                    .length
                }
              </div>
              <div>
                右上:{' '}
                {
                  layoutInfo.filter((i) => i.config.position === 'top-right')
                    .length
                }
              </div>
              <div>
                左下:{' '}
                {
                  layoutInfo.filter((i) => i.config.position === 'bottom-left')
                    .length
                }
              </div>
              <div>
                右下:{' '}
                {
                  layoutInfo.filter((i) => i.config.position === 'bottom-right')
                    .length
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 开发工具状态指示器
 *
 * 简化版本，只显示工具数量和快速访问按钮
 */
export function DevToolsStatusIndicator() {
  const { getLayoutInfo } = useDevToolsLayout();
  const [toolCount, setToolCount] = useState(0);

  // 始终调用 Hook，但在非开发环境中不执行逻辑
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const updateCount = () => {
      setToolCount(getLayoutInfo().length);
    };

    updateCount();
    const interval = setInterval(
      updateCount,
      DEV_TOOLS_CONSTANTS.PERFORMANCE.DELAY,
    );

    // eslint-disable-next-line consistent-return
    return () => clearInterval(interval); // useEffect 清理函数
  }, [getLayoutInfo]);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (toolCount === 0) {
    return null;
  }

  return (
    <div className='fixed top-4 right-1/2 z-[999] translate-x-1/2 rounded-full bg-blue-500 px-2 py-1 text-xs text-white shadow-lg'>
      🛠️ {toolCount}
    </div>
  );
}
