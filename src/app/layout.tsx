import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { getFontClassNames } from '@/app/[locale]/layout-fonts';
import { routing } from '@/i18n/routing';

interface RootLayoutProps {
  children: ReactNode;
}

// 基础 metadata 配置
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000',
  ),
  title: '[PROJECT_NAME]',
  description: 'Modern B2B Enterprise Web Platform with Next.js 15',
};

// Root layout renders the document shell so that metadata can be injected into <head>.
// Note: We use the default locale for the root layout since getLocale() is a request-scoped
// API that's incompatible with Cache Components static generation. Pages under [locale]/
// will have the correct lang attribute set by their own layout.
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang={routing.defaultLocale}
      className={getFontClassNames()}
      suppressHydrationWarning
    >
      <body
        className='flex min-h-screen flex-col antialiased'
        suppressHydrationWarning
      >
        {children}

        {/* React Grab: AI 上下文提取工具 (仅开发环境) */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <Script
              src='https://unpkg.com/react-grab/dist/index.global.js'
              strategy='afterInteractive'
            />
            <Script
              src='https://unpkg.com/@react-grab/claude-code/dist/client.global.js'
              strategy='lazyOnload'
            />
          </>
        )}
      </body>
    </html>
  );
}
