'use client';

import { Phone } from 'lucide-react';

export interface WhatsAppFloatingButtonProps {
  number: string;
  label?: string;
  className?: string;
}

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return null;
  return digits;
};

export function WhatsAppFloatingButton({
  number,
  label = 'Chat with us on WhatsApp',
  className = '',
}: WhatsAppFloatingButtonProps) {
  const normalizedNumber = normalizePhoneNumber(number);
  if (!normalizedNumber) return null;

  const href = `https://wa.me/${normalizedNumber}`;

  return (
    // 为悬浮组件提供语义化地域 landmark，满足 axe 的 region 规则
    <div
      role='complementary'
      aria-label='Support chat'
    >
      <a
        aria-label={label}
        className={`fixed bottom-6 right-6 z-[1100] flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${className}`}
        href={href}
        rel='noreferrer'
        target='_blank'
      >
        <Phone
          className='h-4 w-4'
          aria-hidden='true'
        />
        <span>{label}</span>
      </a>
    </div>
  );
}
