import { generateLocaleMetadata } from '@/app/[locale]/layout-metadata';
import { generatePageStructuredData } from '@/app/[locale]/layout-structured-data';
import '@/app/globals.css';
import { Suspense, type ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CookieConsentProvider } from '@/lib/cookie-consent';
import { loadCompleteMessages } from '@/lib/load-messages';
import { generateJSONLD } from '@/lib/structured-data';
import { LazyCookieBanner } from '@/components/cookie/lazy-cookie-banner';
import { Footer } from '@/components/footer';
import { LangUpdater } from '@/components/i18n/lang-updater';
import { Header } from '@/components/layout/header';
import { LazyToaster } from '@/components/lazy/lazy-toaster';
import { LazyTopLoader } from '@/components/lazy/lazy-top-loader';
import { EnterpriseAnalyticsIsland } from '@/components/monitoring/enterprise-analytics-island';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { LazyWhatsAppButton } from '@/components/whatsapp/lazy-whatsapp-button';
import { getAppConfig } from '@/config/app';
import { FOOTER_COLUMNS, FOOTER_STYLE_TOKENS } from '@/config/footer-links';
import { SITE_CONFIG } from '@/config/paths/site-config';
import { routing } from '@/i18n/routing';

// Client analytics are rendered as an island to avoid impacting LCP

// 重新导出元数据生成函数
export const generateMetadata = generateLocaleMetadata;

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}
interface AsyncLocaleLayoutContentProps {
  locale: 'en' | 'zh';
  children: ReactNode;
}

async function AsyncLocaleLayoutContent({
  locale,
  children,
}: AsyncLocaleLayoutContentProps) {
  // Set request locale inside Suspense boundary
  setRequestLocale(locale);

  // Load translations for layout-level strings inside Suspense boundary
  const tFooter = await getTranslations({
    locale,
    namespace: 'footer',
  });

  const footerSystemStatus = tFooter('systemStatus');

  const appConfig = getAppConfig();
  const showWhatsAppButton =
    appConfig.features.ENABLE_WHATSAPP_CHAT &&
    Boolean(SITE_CONFIG.contact.whatsappNumber);

  // Note: Removed headers() call for CSP nonce to enable Cache Components static generation.
  // JSON-LD scripts are data-only and don't require nonce for CSP compliance.
  // For client-side scripts that need nonce, consider using a dynamic island component.

  // Load complete messages for root provider (eliminates need for nested providers)
  const messages = await loadCompleteMessages(locale);

  // 生成结构化数据
  const { organizationData, websiteData } =
    await generatePageStructuredData(locale);

  return (
    <>
      {/* Client-side html[lang] correction (PPR root layout is static) */}
      <LangUpdater locale={locale} />

      {/*
        JSON-LD Structured Data for SEO
        --------------------------------
        CSP nonce is NOT required for these scripts because:
        1. type="application/ld+json" declares data-only content (not executable JavaScript)
        2. Per CSP Level 3 spec, script-src restrictions apply only to executable scripts
        3. Reference: https://www.w3.org/TR/CSP3/#should-block-inline
      */}
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
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
        >
          <CookieConsentProvider>
            {/* 页面导航进度条 - P1 优化：懒加载，减少 vendors chunk */}
            <LazyTopLoader />

            {/* 导航栏 */}
            <Header locale={locale} />

            {/* 主要内容 */}
            <main className='flex-1'>{children}</main>

            {/* 页脚：使用新 Footer 组件与配置数据，附加主题切换与状态插槽 */}
            <Footer
              columns={FOOTER_COLUMNS}
              tokens={FOOTER_STYLE_TOKENS}
              statusSlot={
                <span className='text-xs font-medium text-muted-foreground sm:text-sm'>
                  {footerSystemStatus}
                </span>
              }
              themeToggleSlot={
                <ThemeSwitcher data-testid='footer-theme-toggle' />
              }
            />

            {/* Toast 消息容器 - P1 优化：懒加载，减少 vendors chunk */}
            <LazyToaster />

            {showWhatsAppButton && (
              <LazyWhatsAppButton number={SITE_CONFIG.contact.whatsappNumber} />
            )}

            {/* Cookie Consent Banner - 懒加载，仅在未同意时显示 */}
            <Suspense fallback={null}>
              <LazyCookieBanner />
            </Suspense>

            {/* 企业级监控组件：延迟加载的客户端岛，避免阻塞首屏 */}
            {process.env.NODE_ENV === 'production' ? (
              <EnterpriseAnalyticsIsland />
            ) : null}
          </CookieConsentProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </>
  );
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

  const typedLocale = locale as 'en' | 'zh';

  // Root layout renders <html>/<body> to ensure metadata is injected.
  // This layout provides locale context and page skeleton only.
  // All async operations (setRequestLocale, getTranslations) are inside Suspense.
  return (
    <Suspense fallback={null}>
      <AsyncLocaleLayoutContent locale={typedLocale}>
        {children}
      </AsyncLocaleLayoutContent>
    </Suspense>
  );
}
