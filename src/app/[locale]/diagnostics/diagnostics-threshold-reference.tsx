// 诊断页面阈值参考组件

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DISPLAY_THRESHOLDS, ThresholdDisplay } from '@/app/[locale]/diagnostics/diagnostics-constants';

/**
 * 阈值参考组件
 * 显示基于 Google Core Web Vitals 标准的性能指标阈值
 */
export function ThresholdReference() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>性能指标阈值参考</CardTitle>
        <CardDescription>基于 Google Core Web Vitals 标准</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <ThresholdDisplay
            title='CLS (累积布局偏移)'
            goodThreshold={DISPLAY_THRESHOLDS.CLS_GOOD}
            needsImprovementThreshold={DISPLAY_THRESHOLDS.CLS_NEEDS_IMPROVEMENT}
          />
          <ThresholdDisplay
            title='LCP (最大内容绘制)'
            goodThreshold={DISPLAY_THRESHOLDS.LCP_GOOD}
            needsImprovementThreshold={DISPLAY_THRESHOLDS.LCP_NEEDS_IMPROVEMENT}
            unit='s'
          />
          <ThresholdDisplay
            title='FID (首次输入延迟)'
            goodThreshold={DISPLAY_THRESHOLDS.FID_GOOD}
            needsImprovementThreshold={DISPLAY_THRESHOLDS.FID_NEEDS_IMPROVEMENT}
            unit='ms'
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 详细阈值参考组件
 * 包含更多指标的详细说明
 */
export function DetailedThresholdReference() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>详细性能指标阈值参考</CardTitle>
        <CardDescription>完整的 Web Vitals 指标说明和阈值标准</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {/* Core Web Vitals */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>Core Web Vitals</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <div>
                <h4 className='mb-3 font-semibold text-green-600'>
                  CLS (累积布局偏移)
                </h4>
                <div className='space-y-2 text-sm'>
                  <p className='text-muted-foreground mb-2'>
                    测量页面加载期间意外布局偏移的累积分数
                  </p>
                  <div className='flex justify-between'>
                    <span className='text-green-600'>良好:</span>
                    <span>≤ {DISPLAY_THRESHOLDS.CLS_GOOD}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-yellow-600'>需要改进:</span>
                    <span>
                      {DISPLAY_THRESHOLDS.CLS_GOOD} -{' '}
                      {DISPLAY_THRESHOLDS.CLS_NEEDS_IMPROVEMENT}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-red-600'>较差:</span>
                    <span>&gt; {DISPLAY_THRESHOLDS.CLS_NEEDS_IMPROVEMENT}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className='mb-3 font-semibold text-blue-600'>
                  LCP (最大内容绘制)
                </h4>
                <div className='space-y-2 text-sm'>
                  <p className='text-muted-foreground mb-2'>
                    测量页面主要内容完成渲染的时间
                  </p>
                  <div className='flex justify-between'>
                    <span className='text-green-600'>良好:</span>
                    <span>≤ {DISPLAY_THRESHOLDS.LCP_GOOD}s</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-yellow-600'>需要改进:</span>
                    <span>
                      {DISPLAY_THRESHOLDS.LCP_GOOD}s -{' '}
                      {DISPLAY_THRESHOLDS.LCP_NEEDS_IMPROVEMENT}s
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-red-600'>较差:</span>
                    <span>
                      &gt; {DISPLAY_THRESHOLDS.LCP_NEEDS_IMPROVEMENT}s
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className='mb-3 font-semibold text-purple-600'>
                  FID (首次输入延迟)
                </h4>
                <div className='space-y-2 text-sm'>
                  <p className='text-muted-foreground mb-2'>
                    测量用户首次与页面交互时的响应延迟
                  </p>
                  <div className='flex justify-between'>
                    <span className='text-green-600'>良好:</span>
                    <span>≤ {DISPLAY_THRESHOLDS.FID_GOOD}ms</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-yellow-600'>需要改进:</span>
                    <span>
                      {DISPLAY_THRESHOLDS.FID_GOOD}ms -{' '}
                      {DISPLAY_THRESHOLDS.FID_NEEDS_IMPROVEMENT}ms
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-red-600'>较差:</span>
                    <span>
                      &gt; {DISPLAY_THRESHOLDS.FID_NEEDS_IMPROVEMENT}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 其他重要指标 */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>其他重要指标</h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <h4 className='mb-3 font-semibold text-orange-600'>
                  FCP (首次内容绘制)
                </h4>
                <div className='space-y-2 text-sm'>
                  <p className='text-muted-foreground mb-2'>
                    测量页面开始渲染任何内容的时间
                  </p>
                  <div className='flex justify-between'>
                    <span className='text-green-600'>良好:</span>
                    <span>≤ 1.8s</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-yellow-600'>需要改进:</span>
                    <span>1.8s - 3.0s</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-red-600'>较差:</span>
                    <span>&gt; 3.0s</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className='mb-3 font-semibold text-teal-600'>
                  TTFB (首字节时间)
                </h4>
                <div className='space-y-2 text-sm'>
                  <p className='text-muted-foreground mb-2'>
                    测量从请求开始到接收第一个字节的时间
                  </p>
                  <div className='flex justify-between'>
                    <span className='text-green-600'>良好:</span>
                    <span>≤ 800ms</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-yellow-600'>需要改进:</span>
                    <span>800ms - 1800ms</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-red-600'>较差:</span>
                    <span>&gt; 1800ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 优化建议 */}
          <div>
            <h3 className='mb-4 text-lg font-semibold'>优化建议</h3>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='rounded-lg border p-4'>
                <h4 className='mb-2 font-semibold text-green-600'>CLS 优化</h4>
                <ul className='text-muted-foreground space-y-1 text-sm'>
                  <li>• 为图片和视频设置尺寸属性</li>
                  <li>• 避免在现有内容上方插入内容</li>
                  <li>• 使用 transform 动画而非改变布局的属性</li>
                  <li>• 预留广告和嵌入内容的空间</li>
                </ul>
              </div>

              <div className='rounded-lg border p-4'>
                <h4 className='mb-2 font-semibold text-blue-600'>LCP 优化</h4>
                <ul className='text-muted-foreground space-y-1 text-sm'>
                  <li>• 优化服务器响应时间</li>
                  <li>• 使用 CDN 加速资源加载</li>
                  <li>• 压缩和优化图片</li>
                  <li>• 预加载关键资源</li>
                </ul>
              </div>

              <div className='rounded-lg border p-4'>
                <h4 className='mb-2 font-semibold text-purple-600'>FID 优化</h4>
                <ul className='text-muted-foreground space-y-1 text-sm'>
                  <li>• 减少 JavaScript 执行时间</li>
                  <li>• 拆分长任务</li>
                  <li>• 使用 Web Workers</li>
                  <li>• 延迟加载非关键 JavaScript</li>
                </ul>
              </div>

              <div className='rounded-lg border p-4'>
                <h4 className='mb-2 font-semibold text-orange-600'>通用优化</h4>
                <ul className='text-muted-foreground space-y-1 text-sm'>
                  <li>• 启用 HTTP/2 和 HTTP/3</li>
                  <li>• 使用现代图片格式 (WebP, AVIF)</li>
                  <li>• 实施资源提示 (preload, prefetch)</li>
                  <li>• 优化关键渲染路径</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 简化阈值参考组件
 * 仅显示核心指标的基本阈值
 */
export function SimpleThresholdReference() {
  return (
    <div className='rounded-lg border p-4'>
      <h3 className='mb-3 font-semibold'>性能标准</h3>
      <div className='grid grid-cols-3 gap-4 text-sm'>
        <div>
          <div className='font-medium text-green-600'>CLS</div>
          <div className='text-muted-foreground'>
            ≤ {DISPLAY_THRESHOLDS.CLS_GOOD}
          </div>
        </div>
        <div>
          <div className='font-medium text-blue-600'>LCP</div>
          <div className='text-muted-foreground'>
            ≤ {DISPLAY_THRESHOLDS.LCP_GOOD}s
          </div>
        </div>
        <div>
          <div className='font-medium text-purple-600'>FID</div>
          <div className='text-muted-foreground'>
            ≤ {DISPLAY_THRESHOLDS.FID_GOOD}ms
          </div>
        </div>
      </div>
    </div>
  );
}
