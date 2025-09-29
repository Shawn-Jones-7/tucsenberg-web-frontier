import { getFontClassNames } from '@/app/[locale]/layout-fonts';
import { generateLocaleMetadata } from '@/app/[locale]/layout-metadata';
import { generatePageStructuredData } from '@/app/[locale]/layout-structured-data';
import '@/app/globals.css';
import { Suspense, type ReactNode } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import NextTopLoader from 'nextjs-toploader';
import { generateJSONLD } from '@/lib/structured-data';
import { ErrorBoundary } from '@/components/error-boundary';
import { TranslationPreloader } from '@/components/i18n/translation-preloader';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { EnterpriseAnalytics } from '@/components/monitoring/enterprise-analytics';
import { WebVitalsIndicator } from '@/components/performance/web-vitals-indicator';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemePerformanceMonitor } from '@/components/theme/theme-performance-monitor';
import { Toaster } from '@/components/ui/toaster';
import {
  ANIMATION_DURATION_NORMAL,
  COUNT_1600,
  COUNT_TRIPLE,
} from '@/constants';
import { routing } from '@/i18n/routing';

// 重新导出元数据生成函数
export const generateMetadata = generateLocaleMetadata;

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'en' | 'zh')) {
    notFound();
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  const headerList = await headers();
  const nonce = headerList.get('x-csp-nonce') ?? undefined;

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // 生成结构化数据
  const { organizationData, websiteData } = await generatePageStructuredData(
    locale as 'en' | 'zh',
  );

  return (
    <div
      lang={locale}
      className={`${getFontClassNames()} flex min-h-screen flex-col antialiased`}
    >
      {/* JSON-LD 结构化数据 */}
      <script
        nonce={nonce}
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: generateJSONLD(organizationData),
        }}
      />
      <script
        nonce={nonce}
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: generateJSONLD(websiteData),
        }}
      />
      <NextIntlClientProvider messages={messages}>
        <EnterpriseAnalytics>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
          >
            {/* 页面导航进度条 - 全局生效 */}
            <NextTopLoader
              color='hsl(var(--primary))'
              height={COUNT_TRIPLE}
              showSpinner={false}
              easing='ease-in-out'
              speed={ANIMATION_DURATION_NORMAL}
              shadow='0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))'
              zIndex={COUNT_1600}
            />

            {isDevelopment && (
              <Suspense fallback={null}>
                <ErrorBoundary
                  fallback={
                    <div className='bg-destructive/80 fixed right-4 bottom-4 z-[1100] rounded-md px-3 py-2 text-xs text-white shadow-lg'>
                      监控组件加载失败
                    </div>
                  }
                >
                  <TranslationPreloader strategy='idle' />
                  <ThemePerformanceMonitor />
                  <WebVitalsIndicator />
                </ErrorBoundary>
              </Suspense>
            )}

            {/* 导航栏 */}
            <Header />

            {/* 主要内容 */}
            <main className='flex-1'>{children}</main>

            {/* 页脚 */}
            <Footer />

            {/* Toast 消息容器 - 全局生效 */}
            <Toaster />

            {/* 企业级监控组件已集成到AnalyticsProvider中 */}
          </ThemeProvider>
        </EnterpriseAnalytics>
      </NextIntlClientProvider>
    </div>
  );
}
