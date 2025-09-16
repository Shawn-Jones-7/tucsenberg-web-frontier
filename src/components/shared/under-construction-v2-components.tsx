'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  Github,
  Linkedin,
  Mail,
  Twitter,
  Users,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
// cn utility is imported but not used in this file
// import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';
import { AnimatedIcon } from '@/components/shared/animated-icon';
import { ProgressIndicator } from '@/components/shared/progress-indicator';

interface EmailSubscriptionProps {
  showEmailSubscription: boolean;
}

export function EmailSubscription({
  showEmailSubscription,
}: EmailSubscriptionProps) {
  const _t = useTranslations('underConstruction');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleEmailSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubscribed(true);
        setEmail('');
      }
    } catch (error) {
      logger.error('Subscription error', { error: error as Error });
    }
  };

  if (!showEmailSubscription) return null;

  return (
    <Card className='mx-auto w-full max-w-md'>
      <CardHeader className='text-center'>
        <CardTitle className='flex items-center justify-center gap-2'>
          <Bell className='h-5 w-5' />
          {_t('emailSubscription.title')}
        </CardTitle>
        <CardDescription>{_t('emailSubscription.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isSubscribed ? (
          <div className='space-y-2 text-center'>
            <CheckCircle className='mx-auto h-8 w-8 text-green-500' />
            <p className='text-muted-foreground text-sm'>
              {_t('emailSubscription.success')}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleEmailSubscription}
            className='space-y-4'
          >
            <Input
              type='email'
              placeholder={_t('emailSubscription.placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type='submit'
              className='w-full'
            >
              {_t('emailSubscription.button')}
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

interface SocialLinksProps {
  showSocialLinks: boolean;
}

export function SocialLinks({ showSocialLinks }: SocialLinksProps) {
  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  if (!showSocialLinks) return null;

  return (
    <div className='flex justify-center space-x-4'>
      {socialLinks.map((social) => (
        <Button
          key={social.label}
          variant='outline'
          size='icon'
          asChild
          className='transition-transform hover:scale-110'
        >
          <Link
            href={social.href as any}
            aria-label={social.label}
          >
            <social.icon className='h-4 w-4' />
          </Link>
        </Button>
      ))}
    </div>
  );
}

interface FeaturePreviewProps {
  showFeaturePreview: boolean;
}

export function FeaturePreview({ showFeaturePreview }: FeaturePreviewProps) {
  const _t = useTranslations('underConstruction');

  const features = [
    {
      icon: Zap,
      title: _t('features.performance'),
      description: _t('features.performanceDesc'),
    },
    {
      icon: Users,
      title: _t('features.collaboration'),
      description: _t('features.collaborationDesc'),
    },
    {
      icon: CheckCircle,
      title: _t('features.quality'),
      description: _t('features.qualityDesc'),
    },
  ];

  if (!showFeaturePreview) return null;

  return (
    <div className='mx-auto w-full max-w-4xl'>
      <h3 className='mb-8 text-center text-xl font-semibold'>
        {_t('features.title')}
      </h3>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {features.map((feature, index) => (
          <Card
            key={index}
            className='text-center transition-shadow hover:shadow-lg'
          >
            <CardHeader>
              <feature.icon className='text-primary mx-auto h-8 w-8' />
              <CardTitle className='text-lg'>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface HeaderSectionProps {
  pageType: 'products' | 'blog' | 'about' | 'contact';
  expectedDate: string;
}

export function HeaderSection({ pageType, expectedDate }: HeaderSectionProps) {
  const _t = useTranslations('underConstruction');
  const tPage = useTranslations(`underConstruction.pages.${pageType}`);

  return (
    <div className='space-y-6 text-center'>
      <div className='space-y-4'>
        <AnimatedIcon
          variant='construction'
          size='xl'
          className='text-primary drop-shadow-lg'
        />
        <div className='space-y-2'>
          <h1 className='from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-6xl'>
            {tPage('title')}
          </h1>
          <p className='text-muted-foreground mx-auto max-w-2xl text-xl md:text-2xl'>
            {tPage('subtitle')}
          </p>
        </div>
      </div>

      <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
        <Badge
          variant='secondary'
          className='px-4 py-2 text-sm'
        >
          <Clock className='mr-2 h-4 w-4' />
          {_t('expectedLaunch')}: {expectedDate}
        </Badge>
        <Button
          asChild
          variant='outline'
        >
          <Link href='/'>{_t('backToHome')}</Link>
        </Button>
      </div>
    </div>
  );
}

interface ProgressSectionProps {
  showProgress: boolean;
  currentStep: number;
}

export function ProgressSection({
  showProgress,
  currentStep,
}: ProgressSectionProps) {
  const _t = useTranslations('underConstruction');

  if (!showProgress) return null;

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <h3 className='mb-6 text-center text-lg font-semibold'>
        {_t('progress.title')}
      </h3>
      <ProgressIndicator currentStep={currentStep} />
    </div>
  );
}

interface ContactSectionProps {
  pageType: 'products' | 'blog' | 'about' | 'contact';
}

export function ContactSection({ pageType: _pageType }: ContactSectionProps) {
  const _t = useTranslations('underConstruction');

  return (
    <Card className='mx-auto w-full max-w-md'>
      <CardHeader className='text-center'>
        <CardTitle className='flex items-center justify-center gap-2'>
          <Mail className='h-5 w-5' />
          {_t('contact.title')}
        </CardTitle>
        <CardDescription>{_t('contact.description')}</CardDescription>
      </CardHeader>
      <CardContent className='text-center'>
        <Button
          asChild
          className='w-full'
        >
          <Link href='/contact'>
            {_t('contact.button')}
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
