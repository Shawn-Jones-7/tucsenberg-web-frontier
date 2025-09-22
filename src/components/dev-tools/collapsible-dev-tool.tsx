'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface CollapsibleDevToolProps {
  toolId: string;
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
  showToggleButton?: boolean;
  className?: string;
}

/**
 * 可折叠开发工具包装器
 *
 * 为开发工具提供统一的折叠/展开功能
 * 支持键盘快捷键和自动布局管理
 */
export function CollapsibleDevTool({
  toolId,
  title,
  children,
  defaultCollapsed = false,
  showToggleButton = true,
  className = '',
}: CollapsibleDevToolProps) {
  const { registerTool, unregisterTool, getClasses, shouldCollapse } =
    useDevToolsLayout();
  const [isCollapsed, setIsCollapsed] = useState(
    defaultCollapsed || shouldCollapse(toolId),
  );

  // 注册工具到布局管理器 - 始终调用 Hook
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      registerTool(toolId);
      return () => unregisterTool(toolId);
    }
    return undefined;
  }, [toolId, registerTool, unregisterTool]);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const baseClasses = getClasses(toolId);

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className={`${baseClasses} rounded-full bg-gray-900 px-3 py-2 text-xs text-white shadow-lg transition-colors hover:bg-gray-800 ${className}`}
        title={`展开 ${title}`}
      >
        {title.split(' ')[0]} ▲
      </button>
    );
  }

  return (
    <div
      className={`${baseClasses} rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {/* 标题栏 */}
      {showToggleButton && (
        <div className='flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-700'>
          <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
            {title}
          </h3>
          <button
            onClick={() => setIsCollapsed(true)}
            className='text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300'
            title={`折叠 ${title}`}
          >
            ▼
          </button>
        </div>
      )}

      {/* 内容区域 */}
      <div className={showToggleButton ? 'p-3' : 'p-4'}>{children}</div>
    </div>
  );
}

/**
 * 简化的开发工具指示器
 *
 * 用于显示工具状态但不占用太多空间
 */
interface DevToolIndicatorProps {
  toolId: string;
  label: string;
  status: 'active' | 'warning' | 'error' | 'inactive';
  value?: string | number;
  onClick?: () => void;
  className?: string;
}

export function DevToolIndicator({
  toolId,
  label,
  status,
  value,
  onClick,
  className = '',
}: DevToolIndicatorProps) {
  const { registerTool, unregisterTool, getClasses } = useDevToolsLayout();

  // 注册工具到布局管理器 - 始终调用 Hook
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      registerTool(toolId);
      return () => unregisterTool(toolId);
    }
    return undefined;
  }, [toolId, registerTool, unregisterTool]);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const statusColors = {
    active: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
    inactive: 'bg-gray-500 text-white',
  };

  const baseClasses = getClasses(toolId);

  return (
    <div
      className={`${baseClasses} ${statusColors[status as keyof typeof statusColors] || statusColors.default} rounded-md px-3 py-2 text-xs shadow-lg ${
        onClick ? 'cursor-pointer transition-opacity hover:opacity-80' : ''
      } ${className}`}
      onClick={onClick}
      title={`${label}${value ? `: ${value}` : ''}`}
    >
      <div className='flex items-center gap-2'>
        <div
          className={`h-2 w-2 rounded-full ${
            status === 'active' ? 'animate-pulse bg-white' : 'bg-white/70'
          }`}
        />
        <span className='font-medium'>{label}</span>
        {value && (
          <span className='rounded bg-white/20 px-1 py-0.5 text-xs'>
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * 开发工具组合器
 *
 * 将多个相关的开发工具组合在一起，避免重叠
 */
interface DevToolGroupProps {
  groupId: string;
  title: string;
  tools: ReactNode[];
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export function DevToolGroup({
  groupId: _groupId,
  title,
  tools,
  position = 'bottom-right',
  className = '',
}: DevToolGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const positionClasses = {
    'top-left': 'fixed top-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`${positionClasses[position as keyof typeof positionClasses] || positionClasses['bottom-right']} z-[1001] rounded-full bg-gray-900 px-3 py-2 text-xs text-white shadow-lg transition-colors hover:bg-gray-800 ${className}`}
        title={`展开 ${title} (${tools.length} 工具)`}
      >
        🛠️ {tools.length}
      </button>
    );
  }

  return (
    <div
      className={`${positionClasses[position as keyof typeof positionClasses] || positionClasses['bottom-right']} z-[1001] max-w-sm ${className}`}
    >
      {/* 组标题 */}
      <div className='mb-2 flex items-center justify-between rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg'>
        <span className='font-medium'>{title}</span>
        <button
          onClick={() => setIsExpanded(false)}
          className='text-gray-400 transition-colors hover:text-white'
          title={`折叠 ${title}`}
        >
          ×
        </button>
      </div>

      {/* 工具列表 */}
      <div className='space-y-2'>
        {tools.map((tool, index) => (
          <div
            key={index}
            className='relative'
          >
            {tool}
          </div>
        ))}
      </div>
    </div>
  );
}
