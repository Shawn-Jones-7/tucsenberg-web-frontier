import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 静态 UI Showcase 组件 - 用于 PPR 试点
 * 包含不需要客户端交互的静态内容
 */
export function UIShowcaseStatic() {
  return (
    <div className='space-y-8'>
      {/* 页面标题 - 静态内容 */}
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>
          UI Enhancement Components Showcase
        </h1>
        <p className='text-muted-foreground mt-2'>
          Demonstrating the newly implemented UI components with PPR
        </p>
        <div className='mt-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'>
          🚀 PPR Enabled - Partial Prerendering Active
        </div>
      </div>

      {/* 静态信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>Component Overview</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <h4 className='font-semibold text-green-600'>
                ✅ Available Components
              </h4>
              <ul className='mt-2 space-y-1 text-sm'>
                <li>• Sonner toast notifications</li>
                <li>• @tailwindcss/typography</li>
                <li>• Embla Carousel component</li>
                <li>• @bprogress/next progress bar</li>
                <li>• Theme system integration</li>
                <li>• Internationalization support</li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold text-blue-600'>
                📊 Performance Impact
              </h4>
              <ul className='mt-2 space-y-1 text-sm'>
                <li>• Typography: ~8KB</li>
                <li>• Sonner: ~15KB</li>
                <li>• Progress Bar: ~3KB</li>
                <li>• Carousel: 0KB (existing)</li>
                <li>• Total: ~26KB added</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PPR 说明卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>Partial Prerendering (PPR) Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <p className='text-muted-foreground text-sm'>
              This page demonstrates Next.js 15 Partial Prerendering (PPR)
              capabilities. Static content above is prerendered at build time,
              while interactive components below are rendered dynamically.
            </p>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <div className='rounded-lg bg-green-50 p-3 dark:bg-green-900/20'>
                <h5 className='font-medium text-green-800 dark:text-green-200'>
                  Static Content (Prerendered)
                </h5>
                <p className='mt-1 text-xs text-green-600 dark:text-green-300'>
                  Headers, descriptions, and informational cards
                </p>
              </div>
              <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20'>
                <h5 className='font-medium text-blue-800 dark:text-blue-200'>
                  Dynamic Content (Client-side)
                </h5>
                <p className='mt-1 text-xs text-blue-600 dark:text-blue-300'>
                  Interactive demos and real-time components
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
