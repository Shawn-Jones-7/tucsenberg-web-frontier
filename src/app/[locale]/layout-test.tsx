import '@/app/globals.css';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function TestLocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'en' | 'zh')) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className='flex min-h-screen flex-col antialiased'>
        <NextIntlClientProvider messages={messages}>
          {/* 简化的Header用于测试 */}
          <header className='w-full border-b bg-background/95'>
            <div className='container mx-auto px-4'>
              <div className='flex h-16 items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div>Logo</div>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    data-testid='language-dropdown-trigger'
                    className='rounded border px-3 py-2'
                  >
                    Language
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* 主要内容 */}
          <main className='flex-1'>{children}</main>

          {/* 简化的Footer */}
          <footer className='border-_t bg-background py-4'>
            <div className='container mx-auto px-4 text-center'>
              <p>Test Footer</p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
