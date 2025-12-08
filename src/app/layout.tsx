import type { ReactNode } from 'react';
import type { Metadata } from 'next';

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

// Root layout is a minimal wrapper.
// The <html> and <body> tags are rendered in [locale]/layout.tsx
// to properly set the lang attribute from route params (Cache Components compatible).
export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
