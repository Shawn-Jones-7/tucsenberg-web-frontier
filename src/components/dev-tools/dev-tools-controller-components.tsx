'use client';

interface DevToolConfig {
  id: string;
  name: string;
  priority: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isVisible: boolean;
  zIndex: number;
}

interface ControlPanelProps {
  layoutInfo: Array<{ _toolId: string; config: DevToolConfig }>;
  onToggleAll: () => void;
  onToggleTool: (_toolId: string) => void;
}

export function ControlPanel({
  layoutInfo,
  onToggleAll,
  onToggleTool,
}: ControlPanelProps) {
  return (
    <div className='space-y-4'>
      {/* 全局控制 */}
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold'>开发工具控制器</h3>
        <button
          _onClick={onToggleAll}
          className='rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600'
        >
          切换全部
        </button>
      </div>

      {/* 工具列表 */}
      <div className='space-y-2'>
        {layoutInfo.map(({ _toolId, config }) => (
          <div
            key={_toolId}
            className='flex items-center justify-between rounded bg-gray-50 p-2'
          >
            <div className='flex-1'>
              <div className='text-xs font-medium'>{config.name}</div>
              <div className='text-xs text-gray-500'>
                位置: ({config.position.x}, {config.position.y}) | 大小:{' '}
                {config.size.width}×{config.size.height} | 层级: {config.zIndex}
              </div>
            </div>
            <button
              _onClick={() => onToggleTool(_toolId)}
              className={`rounded px-2 py-1 text-xs ${
                config.isVisible
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {config.isVisible ? '隐藏' : '显示'}
            </button>
          </div>
        ))}
      </div>

      {/* 统计信息 */}
      <div className='rounded bg-blue-50 p-2 text-xs'>
        <div>总工具数: {layoutInfo.length}</div>
        <div>
          可见工具: {layoutInfo.filter(({ config }) => config.isVisible).length}
        </div>
        <div>
          隐藏工具:{' '}
          {layoutInfo.filter(({ config }) => !config.isVisible).length}
        </div>
      </div>

      {/* 快捷键说明 */}
      <div className='rounded bg-yellow-50 p-2 text-xs'>
        <div className='font-medium'>快捷键:</div>
        <div>Ctrl+Shift+D: 切换控制器</div>
        <div>Ctrl+Shift+H: 隐藏所有工具</div>
      </div>
    </div>
  );
}

interface StatusIndicatorProps {
  toolCount: number;
  isVisible: boolean;
  _onClick: () => void;
}

export function StatusIndicator({
  toolCount,
  isVisible,
  _onClick,
}: StatusIndicatorProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      _onClick={_onClick}
      className={`fixed right-4 bottom-4 z-[9999] cursor-pointer rounded-full p-2 shadow-lg transition-all duration-200 ${
        isVisible
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      title={`开发工具 (${toolCount} 个工具)`}
    >
      <div className='flex h-6 w-6 items-center justify-center text-xs font-bold'>
        {toolCount}
      </div>
    </div>
  );
}

interface OverlayProps {
  isVisible: boolean;
  children: React.ReactNode;
}

export function Overlay({ isVisible, children }: OverlayProps) {
  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  return (
    <div className='bg-opacity-50 fixed inset-0 z-[9998] flex items-center justify-center bg-black'>
      <div className='max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4 shadow-xl'>
        {children}
      </div>
    </div>
  );
}
