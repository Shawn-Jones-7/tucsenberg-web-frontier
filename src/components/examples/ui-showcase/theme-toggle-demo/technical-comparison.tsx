'use client';

import { useState } from 'react';

/**
 * 技术对比组件
 */
export function TechnicalComparison() {
  // 直接在useState中初始化状态，避免在useEffect中设置
  const [supportsViewTransitions] = useState(
    () => typeof document !== 'undefined' && 'startViewTransition' in document,
  );
  // 使用useState的惰性初始化来避免在useEffect中设置状态
  const [mounted] = useState(() => {
    // 在客户端渲染时立即设置为true，服务端渲染时为false
    return typeof window !== 'undefined';
  });

  return (
    <div className='bg-muted/50 space-y-4 rounded-lg p-6'>
      <h4 className='mb-3 font-semibold'>✨ 动画技术对比</h4>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Circle Blur 动画特性 */}
        <div className='space-y-3'>
          <h5 className='flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400'>
            🌀 Circle Blur 动画
            <span className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
              现代浏览器
            </span>
          </h5>
          <ul className='text-muted-foreground space-y-1 text-sm'>
            <li>• 基于 View Transition API 实现</li>
            <li>• 圆形展开动画：clip-path: circle()</li>
            <li>• 模糊过渡效果：filter: blur(8px → 0px)</li>
            <li>• 动态定位：基于点击位置计算中心点</li>
            <li>• 动画时长：0.6s cubic-bezier(0.4, 0, 0.2, 1)</li>
            <li>• 自动降级：不支持时回退到普通切换</li>
          </ul>
        </div>

        {/* Framer Motion 动画特性 */}
        <div className='space-y-3'>
          <h5 className='flex items-center gap-2 font-medium text-purple-600 dark:text-purple-400'>
            🎯 Framer Motion 动画
            <span className='rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
              兼容性好
            </span>
          </h5>
          <ul className='text-muted-foreground space-y-1 text-sm'>
            <li>• 基于 Framer Motion 库实现</li>
            <li>• 背景滑动动画：layoutId 共享元素</li>
            <li>• Spring 动画参数：duration: 0.5s, bounce: 0.2</li>
            <li>• 广泛的浏览器支持</li>
            <li>• 性能优化：GPU 加速</li>
            <li>• 完整的手势支持</li>
          </ul>
        </div>
      </div>

      {/* 通用特性 */}
      <div className='border-_t pt-4'>
        <h5 className='mb-2 font-medium'>🛡️ 通用特性</h5>
        <ul className='text-muted-foreground grid grid-cols-1 space-y-1 gap-x-6 text-sm md:grid-cols-2'>
          <li>• 支持 prefers-reduced-motion 检测</li>
          <li>• 完整的无障碍性支持和键盘导航</li>
          <li>• TypeScript 类型安全</li>
          <li>• 响应式设计适配</li>
          <li>• 主题系统集成</li>
          <li>• 国际化支持</li>
        </ul>
      </div>

      {/* 浏览器支持说明 */}
      <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20'>
        <div className='mb-3 flex items-center justify-between'>
          <h5 className='font-medium text-amber-800 dark:text-amber-200'>
            🌐 浏览器支持说明
          </h5>
          {mounted && (
            <div className='flex items-center gap-2'>
              <span className='text-xs text-amber-700 dark:text-amber-300'>
                当前浏览器：
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  supportsViewTransitions
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                }`}
              >
                {supportsViewTransitions
                  ? '✅ 支持 Circle Blur'
                  : '⚠️ 仅支持 Framer Motion'}
              </span>
            </div>
          )}
        </div>
        <div className='space-y-1 text-sm text-amber-700 dark:text-amber-300'>
          <p>
            <strong>Circle Blur 动画：</strong>需要支持 View Transition
            API（Chrome 111+, Edge 111+）
          </p>
          <p>
            <strong>Framer Motion 动画：</strong>支持所有现代浏览器（Chrome,
            Firefox, Safari, Edge）
          </p>
          <p>
            <strong>自动降级：</strong>不支持的浏览器会自动使用普通主题切换
          </p>
        </div>
      </div>
    </div>
  );
}
