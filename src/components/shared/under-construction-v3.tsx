'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/under-construction-v3/page-header';
import { SocialLinks } from '@/components/shared/under-construction-v3/social-links';
import { SubscriptionForm } from '@/components/shared/under-construction-v3/subscription-form';

interface UnderConstructionV3Props {
  pageType: 'products' | 'blog' | 'about' | 'contact';
  className?: string;
}

export function UnderConstructionV3({
  pageType,
  className,
}: UnderConstructionV3Props) {
  const tPage = useTranslations(`underConstruction.pages.${pageType}`);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pageType }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubscribed(true);
        setEmail('');
      } else {
        logger.error('订阅失败', { message: data.message });
      }
    } catch (_error) {
      // 忽略错误变量
      logger.error('订阅请求失败', { error: _error as Error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        'bg-background relative min-h-screen overflow-hidden',
        className,
      )}
    >
      <div className='relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16'>
        <div className='mx-auto w-full max-w-xl space-y-12 text-center'>
          {/* 主要信息区 - 极简版 */}
          <PageHeader
            title={tPage('title')}
            description={tPage('description')}
          />

          {/* 邮件订阅 - 简化版 */}
          <SubscriptionForm
            email={email}
            setEmail={setEmail}
            isSubscribed={isSubscribed}
            isSubmitting={isSubmitting}
            onSubmit={handleEmailSubscription}
            tPage={tPage}
          />

          {/* 社交媒体链接 - 精简版 */}
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}
