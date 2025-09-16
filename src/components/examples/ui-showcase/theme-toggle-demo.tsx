import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimationVariants } from '@/components/examples/ui-showcase/theme-toggle-demo/animation-variants';
import { FeatureVariants } from '@/components/examples/ui-showcase/theme-toggle-demo/feature-variants';
import { SizeVariants } from '@/components/examples/ui-showcase/theme-toggle-demo/size-variants';
import { TechnicalComparison } from '@/components/examples/ui-showcase/theme-toggle-demo/technical-comparison';

/**
 * 主题切换演示组件
 */
export function ThemeToggleDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🎨 Horizontal Theme Toggle</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-3'>
          <p className='text-muted-foreground'>
            新的横版主题切换组件，支持两种先进的动画效果：Circle Blur 和 Framer
            Motion。
          </p>
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20'>
            <h5 className='mb-2 font-medium text-blue-800 dark:text-blue-200'>
              🧪 动画测试指南
            </h5>
            <ul className='space-y-1 text-sm text-blue-700 dark:text-blue-300'>
              <li>
                • <strong>Circle Blur 测试：</strong>在 Chrome/Edge
                浏览器中点击主题切换按钮，观察圆形展开动画
              </li>
              <li>
                • <strong>降级测试：</strong>在 Firefox/Safari
                中测试，应自动降级到普通切换
              </li>
              <li>
                • <strong>性能测试：</strong>
                快速连续点击测试动画流畅性和防抖机制
              </li>
              <li>
                • <strong>无障碍测试：</strong>使用键盘 Tab 和 Enter
                键导航和切换主题
              </li>
            </ul>
          </div>
        </div>

        <div className='space-y-6'>
          <AnimationVariants />
          <SizeVariants />
          <FeatureVariants />
        </div>

        <TechnicalComparison />
      </CardContent>
    </Card>
  );
}
