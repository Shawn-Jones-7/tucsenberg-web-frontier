import '@/app/globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

interface RootLayoutProps {
  children: ReactNode;
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

// Root layout - only contains html and body tags
// All application logic is in [locale]/layout.tsx
export default async function RootLayout({ children }: RootLayoutProps) {
  const headerList = await headers();
  const detectedLocale = headerList.get('x-detected-locale') || 'en';

  return (
    <html
      lang={detectedLocale}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
