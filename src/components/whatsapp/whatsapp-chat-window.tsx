'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WhatsAppChatWindowTranslations {
  greeting: string;
  responseTime: string;
  placeholder: string;
  startChat: string;
  close: string;
}

export interface WhatsAppChatWindowProps {
  number: string;
  defaultMessage?: string;
  onClose: () => void;
  translations: WhatsAppChatWindowTranslations;
  className?: string;
}

/**
 * Generate device-aware WhatsApp URL
 * Desktop: web.whatsapp.com
 * Mobile: native deep link (whatsapp://send)
 */
function getWhatsAppUrl(phone: string, message: string): string {
  const text = encodeURIComponent(message);
  const isMobile =
    typeof navigator !== 'undefined' &&
    /iPhone|iPad|Android/i.test(navigator.userAgent);

  return isMobile
    ? `whatsapp://send?phone=${phone}&text=${text}`
    : `https://web.whatsapp.com/send?phone=${phone}&text=${text}`;
}

export function WhatsAppChatWindow({
  number,
  defaultMessage = '',
  onClose,
  translations,
  className,
}: WhatsAppChatWindowProps) {
  const [message, setMessage] = useState(defaultMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Auto-focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleStartChat = () => {
    const url = getWhatsAppUrl(number, message);
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartChat();
    }
  };

  return (
    <div
      ref={windowRef}
      className={cn(
        // Prevent Draggable from intercepting mouse events
        'whatsapp-chat-window',
        // Positioning - appears above the button
        'absolute right-0 bottom-full mb-4 w-80',
        // Animation
        'animate-in fade-in zoom-in-95 slide-in-from-bottom-2 origin-bottom-right duration-200',
        // Styling
        'rounded-2xl border shadow-2xl backdrop-blur-md',
        'bg-background/95 supports-[backdrop-filter]:bg-background/90',
        'border-border',
        className,
      )}
      role='dialog'
      aria-modal='true'
      aria-label={translations.greeting}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 pb-2'>
        <h3 className='text-lg font-semibold text-foreground'>
          {translations.greeting}
        </h3>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={cn(
            'rounded-full p-1 transition-colors',
            'hover:bg-muted focus:ring-2 focus:ring-ring focus:outline-none',
          )}
          aria-label={translations.close}
        >
          <X className='h-5 w-5' />
        </button>
      </div>

      {/* Body */}
      <div className='space-y-4 p-4 pt-0'>
        <p className='text-sm text-muted-foreground'>
          {translations.responseTime}
        </p>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={translations.placeholder}
          rows={3}
          className={cn(
            'w-full resize-none rounded-xl p-3 text-sm transition-all outline-none',
            'bg-muted/50',
            'border border-border',
            'focus:border-primary focus:ring-1 focus:ring-primary',
            'placeholder:text-muted-foreground',
          )}
        />

        <button
          type='button'
          onClick={handleStartChat}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5',
            'bg-[#25D366] font-medium text-white shadow-lg',
            'transition-all hover:bg-[#20bd5a] active:scale-[0.98]',
            'focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:outline-none',
          )}
        >
          <span>{translations.startChat}</span>
          <Send className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}
