import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessagesComplete } from '@/lib/i18n/server/getMessagesComplete';

interface FaqLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * FAQ page layout that provides complete translation messages.
 *
 * FAQ 页面使用 deferred.json 中的文案（如 faq 命名空间），
 * 因此需要在本地布局中加载完整的消息集，而不仅是 critical.json。
 */
export default async function FaqLayout({ children, params }: FaqLayoutProps) {
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
