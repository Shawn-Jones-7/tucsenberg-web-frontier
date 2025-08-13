'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Turnstile } from '@marsidev/react-turnstile';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import {
  ContactFormData,
  contactFormSchema,
  FormSubmissionStatus,
  validationHelpers
} from '@/lib/validations';
import { logger } from '@/lib/logger';
import { NameFields, ContactFields, AdditionalFields, CheckboxFields } from './contact-form-fields';

/**
 * Status message component
 */
interface StatusMessageProps {
  status: FormSubmissionStatus;
  t: (_key: string) => string;
}

function StatusMessage({ status, t }: StatusMessageProps) {
  if (status === 'idle') return null;

  const statusConfig: Record<FormSubmissionStatus, { className: string; message: string } | undefined> = {
    success: {
      className: 'bg-green-50 border-green-200 text-green-800',
      message: t('submitSuccess')
    },
    error: {
      className: 'bg-red-50 border-red-200 text-red-800',
      message: t('submitError')
    },
    submitting: {
      className: 'bg-blue-50 border-blue-200 text-blue-800',
      message: t('submitting')
    },
    idle: undefined
  };

  const config = statusConfig[status];
  if (!config) return null;

  return (
    <div className={`p-4 border rounded-md ${config.className}`} role="alert">
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
  setSubmitStatus: (status: FormSubmissionStatus) => void,
  setLastSubmissionTime: (time: Date) => void,
  reset: () => void
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
 * Main contact form container component
 */
export function ContactFormContainer() {
  const t = useTranslations('contact.form');
  const [submitStatus, setSubmitStatus] = useState<FormSubmissionStatus>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [lastSubmissionTime, setLastSubmissionTime] = useState<Date | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
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

  const watchedValues = watch();

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
      reset
    );
  };

  // Rate limiting check
  const isRateLimited = lastSubmissionTime &&
    Date.now() - lastSubmissionTime.getTime() < validationHelpers.RATE_LIMIT_WINDOW;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
        <StatusMessage status={submitStatus} t={t} />

        <NameFields register={register} errors={errors} isSubmitting={isSubmitting} t={t} />
        <ContactFields register={register} errors={errors} isSubmitting={isSubmitting} t={t} />
        <AdditionalFields register={register} errors={errors} isSubmitting={isSubmitting} t={t} />
        <CheckboxFields
          errors={errors}
          isSubmitting={isSubmitting}
          watchedValues={watchedValues}
          setValue={setValue}
          t={t}
        />

        {/* Turnstile CAPTCHA */}
        <div className="space-y-2">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
            onVerify={setTurnstileToken}
            onError={() => setTurnstileToken('')}
            onExpire={() => setTurnstileToken('')}
            theme="auto"
            size="normal"
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isSubmitting || !turnstileToken || isRateLimited}
          className="w-full"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>

        {isRateLimited && (
          <p className="text-sm text-amber-600 text-center">
            {t('rateLimitMessage')}
          </p>
        )}
      </form>
    </Card>
  );
}
