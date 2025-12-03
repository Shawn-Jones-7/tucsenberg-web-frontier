import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessagesComplete } from '@/lib/i18n/server/getMessagesComplete';

interface PrivacyLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Privacy page layout that provides complete translation messages.
 *
 * 隐私政策页会使用 deferred.json 中的文案（privacy 命名空间），
 * 因此需要在本地 layout 中加载完整 messages 集合，而不仅是 critical.json。
 */
export default async function PrivacyLayout({
  children,
  params,
}: PrivacyLayoutProps) {
  const { locale } = await params;
  const messages = await getMessagesComplete(locale as 'en' | 'zh');

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}
