import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { EnterpriseAnalytics } from '@/components/monitoring/enterprise-analytics';
import { generateJSONLD } from '@/lib/structured-data';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import type { ReactNode } from 'react';
// 临时禁用所有性能监控组件以排查 "Maximum update depth exceeded" 错误
// import {
//     DevelopmentPerformanceMonitor,
//     DevelopmentWebVitalsIndicator,
//     DynamicDevToolsController,
//     DynamicDevToolsStatusIndicator,
//     DynamicThemePerformanceMonitor,
//     DynamicTranslationPreloader,
// } from '@/components/shared/dynamic-imports';
import { getFontClassNames } from '@/app/[locale]/layout-fonts';
import { generateLocaleMetadata } from '@/app/[locale]/layout-metadata';
import { generatePageStructuredData } from '@/app/[locale]/layout-structured-data';
import '@/app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { COUNT_1600 } from "@/constants/count";
import { ANIMATION_DURATION_NORMAL, COUNT_TRIPLE } from "@/constants/magic-numbers";
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
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: generateJSONLD(organizationData),
        }}
      />
      <script
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

            {/* 临时禁用：I18n性能优化组件 - 动态导入 */}
            {/* <DynamicTranslationPreloader /> */}

            {/* 临时禁用：主题性能监控组件 - 动态导入 */}
            {/* <DynamicThemePerformanceMonitor /> */}

            {/* 临时禁用：Web Vitals 性能监控 - 动态导入 */}
            {/* <DevelopmentWebVitalsIndicator /> */}

            {/* 导航栏 */}
            <Header />

            {/* 主要内容 */}
            <main className='flex-1'>{children}</main>

            {/* 页脚 */}
            <Footer />

            {/* 企业级监控组件已集成到AnalyticsProvider中 */}

            {/* 临时禁用：开发环境性能指示器 - 动态导入 */}
            {/* <DevelopmentPerformanceMonitor /> */}

            {/* 临时禁用：开发工具控制器 - 统一管理所有开发工具 */}
            {/* <DynamicDevToolsController /> */}

            {/* 临时禁用：开发工具状态指示器 */}
            {/* <DynamicDevToolsStatusIndicator /> */}
          </ThemeProvider>
        </EnterpriseAnalytics>
      </NextIntlClientProvider>
    </div>
  );
}
