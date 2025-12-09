import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { getFontClassNames } from '@/app/[locale]/layout-fonts';

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale?: string }>;
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

// Root layout renders the document shell so that metadata can be injected into <head>.
// The lang attribute defaults to 'en' here and is overridden by locale layout's generateMetadata.
export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  const lang = locale ?? 'en';

  return (
    <html
      lang={lang}
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
