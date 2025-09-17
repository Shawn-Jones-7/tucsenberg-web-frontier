'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ANIMATION_DURATION_VERY_SLOW, COUNT_FIVE } from "@/constants/magic-numbers";
import { logger } from '@/lib/logger';
import type { ContactFormData, FormSubmissionStatus } from '@/lib/validations';
import { contactFormSchema } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    AdditionalFields,
    CheckboxFields,
    ContactFields,
    NameFields,
} from './contact-form-fields';

/**
 * Status message component
 */
interface StatusMessageProps {
  status: FormSubmissionStatus;
  t: (_key: string) => string;
}

function StatusMessage({ status, t }: StatusMessageProps) {
  if (status === 'idle') return null;

  const statusConfig: Record<
    FormSubmissionStatus,
    { className: string; message: string } | undefined
  > = {
    success: {
      className: 'bg-green-50 border-green-200 text-green-800',
      message: t('submitSuccess'),
    },
    error: {
      className: 'bg-red-50 border-red-200 text-red-800',
      message: t('submitError'),
    },
    submitting: {
      className: 'bg-blue-50 border-blue-200 text-blue-800',
      message: t('submitting'),
    },
    idle: undefined,
  };

  // Use Object.prototype.hasOwnProperty to safely access object properties
  const config = Object.prototype.hasOwnProperty.call(statusConfig, status)
    ? statusConfig[status as keyof typeof statusConfig]
    : undefined;
  if (!config) return null;

  return (
    <div
      className={`rounded-md border p-4 ${config.className}`}
      role='alert'
    >
      {config.message}
    </div>
  );
}

/**
 * Form submission handler
 */
async function handleFormSubmission(
  data: ContactFormData,
  turnstileToken: string,
  setSubmitStatus: (_status: FormSubmissionStatus) => void,
  setLastSubmissionTime: (_time: Date) => void,
  reset: () => void,
) {
  try {
    setSubmitStatus('submitting');

    // Rate limiting check
    const submissionData = {
      ...data,
      turnstileToken,
      submittedAt: new Date().toISOString(),
    };

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      setSubmitStatus('success');
      setLastSubmissionTime(new Date());
      reset();

      // Log successful submission
      logger.info('Contact form submitted successfully', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
    } else {
      throw new Error(result.message || 'Submission failed');
    }
  } catch (error) {
    setSubmitStatus('error');

    // Log submission error
    logger.error('Contact form submission failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * 自定义Hook：管理联系表单状态和逻辑
 */
function useContactForm() {
  const [submitStatus, setSubmitStatus] =
    useState<FormSubmissionStatus>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [lastSubmissionTime, setLastSubmissionTime] = useState<Date | null>(
    null,
  );

  // React Hook Form setup
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema as any),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      phone: '',
      subject: '',
      message: '',
      acceptPrivacy: false,
      marketingConsent: false,
    },
  });

  const watchedValues = form.watch();

  // Form submission handler
  const onSubmit = async (data: ContactFormData) => {
    if (!turnstileToken) {
      setSubmitStatus('error');
      return;
    }

    await handleFormSubmission(
      data,
      turnstileToken,
      setSubmitStatus,
      setLastSubmissionTime,
      form.reset,
    );
  };

  // Rate limiting check (5 minutes = 300000ms)
  const RATE_LIMIT_MINUTES = COUNT_FIVE;
  const SECONDS_PER_MINUTE = 60;
  const MS_PER_SECOND = ANIMATION_DURATION_VERY_SLOW;
  const RATE_LIMIT_WINDOW =
    RATE_LIMIT_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
  const isRateLimited =
    lastSubmissionTime &&
    Date.now() - lastSubmissionTime.getTime() < RATE_LIMIT_WINDOW;

  return {
    form,
    submitStatus,
    turnstileToken,
    setTurnstileToken,
    watchedValues,
    onSubmit,
    isRateLimited,
  };
}

/**
 * Main contact form container component
 */
export function ContactFormContainer() {
  const t = useTranslations('contact.form');
  const {
    form,
    submitStatus,
    turnstileToken,
    setTurnstileToken,
    watchedValues,
    onSubmit,
    isRateLimited,
  } = useContactForm();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = form;

  return (
    <Card className='mx-auto w-full max-w-2xl'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6 p-6'
      >
        <StatusMessage
          status={submitStatus}
          t={t}
        />

        <NameFields
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          t={t}
        />
        <ContactFields
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          t={t}
        />
        <AdditionalFields
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          t={t}
        />
        <CheckboxFields
          errors={errors}
          isSubmitting={isSubmitting}
          watchedValues={watchedValues}
          setValue={setValue}
          t={t}
        />

        {/* Turnstile CAPTCHA */}
        <div className='space-y-2'>
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
            onSuccess={setTurnstileToken}
            onError={() => setTurnstileToken('')}
            onExpire={() => setTurnstileToken('')}
            options={{
              theme: 'auto',
              size: 'normal',
            }}
          />
        </div>

        {/* Submit button */}
        <Button
          type='submit'
          disabled={Boolean(isSubmitting || !turnstileToken || isRateLimited)}
          className='w-full'
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>

        {isRateLimited && (
          <p className='text-center text-sm text-amber-600'>
            {t('rateLimitMessage')}
          </p>
        )}
      </form>
    </Card>
  );
}
