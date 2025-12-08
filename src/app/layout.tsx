import '@/app/globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getFontClassNames } from '@/app/[locale]/layout-fonts';
import { routing, type Locale } from '@/i18n/routing';

interface RootLayoutProps {
  children: ReactNode;
}

const localeSet = new Set<Locale>(routing.locales);
const localeCookieName =
  typeof routing.localeCookie === 'object' && routing.localeCookie?.name
    ? routing.localeCookie.name
    : 'NEXT_LOCALE';

async function resolveLocaleFromRequest(): Promise<Locale> {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get('x-next-intl-locale');
  if (headerLocale && localeSet.has(headerLocale as Locale)) {
    return headerLocale as Locale;
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  if (cookieLocale && localeSet.has(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  return routing.defaultLocale;
}

// 基础 metadata 配置
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3001',
  ),
  title: 'Tucsenberg Web Frontier',
  description: 'Modern B2B Enterprise Web Platform with Next.js 15',
};

// Root layout 负责渲染唯一的 <html> 与 <body>，并根据路由 locale 设置 lang
export default async function RootLayout({ children }: RootLayoutProps) {
  const resolvedLocale = await resolveLocaleFromRequest();

  return (
    <html
      lang={resolvedLocale}
      className={getFontClassNames()}
      suppressHydrationWarning
    >
      <body
        className='flex min-h-screen flex-col antialiased'
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
