'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { WhatsAppChatWindowTranslations } from '@/components/whatsapp/whatsapp-chat-window';
import {
  WhatsAppFloatingButton,
  type WhatsAppFloatingButtonProps,
} from '@/components/whatsapp/whatsapp-floating-button';

type WhatsAppButtonWithTranslationsProps = Omit<
  WhatsAppFloatingButtonProps,
  'translations' | 'defaultMessage' | 'label'
>;

/**
 * Generate contextual default message based on current page
 */
function useContextualMessage(defaultMessage: string): string {
  const pathname = usePathname();

  // If on product page, add product context
  if (pathname.includes('/products/')) {
    const productSlug = pathname.split('/products/')[1]?.split('/')[0];
    if (productSlug) {
      return `${defaultMessage}\n\nProduct: ${productSlug}\nPage: ${typeof window !== 'undefined' ? window.location.href : ''}`;
    }
  }

  // Add page URL for context
  if (typeof window !== 'undefined') {
    return `${defaultMessage}\n\nPage: ${window.location.href}`;
  }

  return defaultMessage;
}

/**
 * WhatsApp button with i18n translations loaded from next-intl
 * This is a Client Component wrapper to access translations
 */
export function WhatsAppButtonWithTranslations({
  number,
  className,
}: WhatsAppButtonWithTranslationsProps) {
  const t = useTranslations('common.whatsapp');
  const tClose = useTranslations('common');

  const translations: WhatsAppChatWindowTranslations = {
    greeting: t('greeting'),
    responseTime: t('responseTime'),
    placeholder: t('placeholder'),
    startChat: t('startChat'),
    close: tClose('close'),
  };

  const defaultMessage = t('defaultMessage');
  const contextualMessage = useContextualMessage(defaultMessage);
  const label = t('buttonLabel');

  return (
    <WhatsAppFloatingButton
      number={number}
      translations={translations}
      defaultMessage={contextualMessage}
      label={label}
      {...(className ? { className } : {})}
    />
  );
}
