'use client';

import { useActionState, useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle, Loader2, Mail, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Lazy load Turnstile for performance
const TurnstileWidget = dynamic(
  () =>
    import('@/components/security/turnstile').then((m) => m.TurnstileWidget),
  {
    ssr: false,
    loading: () => (
      <div
        className='h-[65px] w-full animate-pulse rounded-md bg-muted'
        aria-hidden='true'
      />
    ),
  },
);

export interface BlogNewsletterProps {
  /** Custom class name */
  className?: string;
  /** Variant style */
  variant?: 'default' | 'compact' | 'inline';
}

interface FormState {
  success: boolean;
  error: string | undefined;
}

const initialState: FormState = {
  success: false,
  error: undefined,
};

/**
 * Success message component
 */
function SuccessMessage({ message }: { message: string }) {
  return (
    <div className='flex items-center gap-3 py-4 text-green-600'>
      <CheckCircle className='h-5 w-5 shrink-0' />
      <p className='text-sm font-medium'>{message}</p>
    </div>
  );
}

/**
 * Error message component
 */
function ErrorMessage({ error }: { error: string }) {
  return (
    <div className='flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600'>
      <XCircle className='h-4 w-4 shrink-0' />
      {error}
    </div>
  );
}

/**
 * Newsletter form component
 */
function NewsletterForm({
  onSubmit,
  isSubmitting,
  error,
  placeholder,
  submitLabel,
  submittingLabel,
  variant,
  turnstileToken,
  onTurnstileSuccess,
  onTurnstileError,
  onTurnstileExpire,
}: {
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
  error: string | undefined;
  placeholder: string;
  submitLabel: string;
  submittingLabel: string;
  variant: 'default' | 'compact' | 'inline';
  turnstileToken: string | null;
  onTurnstileSuccess: (token: string) => void;
  onTurnstileError: () => void;
  onTurnstileExpire: () => void;
}) {
  const isInline = variant === 'inline';
  const isButtonDisabled = isSubmitting || !turnstileToken;

  return (
    <form
      action={onSubmit}
      className='space-y-3'
    >
      <div className={cn(isInline && 'flex gap-2')}>
        <Input
          type='email'
          name='email'
          required
          placeholder={placeholder}
          className={cn(isInline && 'flex-1')}
          disabled={isSubmitting}
        />
        <Button
          type='submit'
          disabled={isButtonDisabled}
          className={cn(!isInline && 'w-full')}
        >
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {submittingLabel}
            </>
          ) : (
            <>
              <Mail className='mr-2 h-4 w-4' />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
      <TurnstileWidget
        onSuccess={onTurnstileSuccess}
        onError={onTurnstileError}
        onExpire={onTurnstileExpire}
        action='newsletter_subscribe'
        size='compact'
        theme='auto'
      />
      {error !== undefined && <ErrorMessage error={error} />}
    </form>
  );
}

// Compact variant renderer
function CompactVariant({
  className,
  title,
  description,
  success,
  successMessage,
  formProps,
}: {
  className: string | undefined;
  title: string;
  description: string;
  success: boolean;
  successMessage: string;
  formProps: Parameters<typeof NewsletterForm>[0];
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className='text-lg font-semibold'>{title}</h3>
      <p className='text-sm text-muted-foreground'>{description}</p>
      {success ? (
        <SuccessMessage message={successMessage} />
      ) : (
        <NewsletterForm {...formProps} />
      )}
    </div>
  );
}

// Inline variant renderer
function InlineVariant({
  className,
  title,
  description,
  success,
  successMessage,
  formProps,
}: {
  className: string | undefined;
  title: string;
  description: string;
  success: boolean;
  successMessage: string;
  formProps: Parameters<typeof NewsletterForm>[0];
}) {
  return (
    <div className={cn('rounded-lg border bg-muted/30 p-4', className)}>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0 flex-1'>
          <h3 className='font-semibold'>{title}</h3>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </div>
        <div className='sm:w-80'>
          {success ? (
            <SuccessMessage message={successMessage} />
          ) : (
            <NewsletterForm {...formProps} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Blog Newsletter Component - subscription form for blog email notifications.
 */
export function BlogNewsletter({
  className,
  variant = 'default',
}: BlogNewsletterProps) {
  const t = useTranslations('blog.newsletter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileTokenRef = useRef<string | null>(null);

  const handleTurnstileSuccess = useCallback((token: string) => {
    turnstileTokenRef.current = token;
    setTurnstileToken(token);
  }, []);

  const handleTurnstileError = useCallback(() => {
    turnstileTokenRef.current = null;
    setTurnstileToken(null);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    turnstileTokenRef.current = null;
    setTurnstileToken(null);
  }, []);

  async function handleSubmit(
    _prevState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    setIsSubmitting(true);
    try {
      const email = String(formData.get('email') ?? '').trim();
      const token = turnstileTokenRef.current;
      if (!token) return { success: false, error: t('turnstileRequired') };

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pageType: 'blog',
          turnstileToken: token,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        return { success: false, error: result.message ?? t('error') };
      }
      return { success: true, error: undefined };
    } catch {
      return { success: false, error: t('error') };
    } finally {
      setIsSubmitting(false);
    }
  }

  const [state, formAction] = useActionState(handleSubmit, initialState);

  const formProps = {
    onSubmit: formAction,
    isSubmitting,
    error: state.error,
    placeholder: t('placeholder'),
    submitLabel: t('submit'),
    submittingLabel: t('submitting'),
    variant,
    turnstileToken,
    onTurnstileSuccess: handleTurnstileSuccess,
    onTurnstileError: handleTurnstileError,
    onTurnstileExpire: handleTurnstileExpire,
  };

  const commonProps = {
    className,
    title: t('title'),
    description: t('description'),
    success: state.success,
    successMessage: t('success'),
    formProps,
  };

  if (variant === 'compact') return <CompactVariant {...commonProps} />;
  if (variant === 'inline') return <InlineVariant {...commonProps} />;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className='bg-muted/50'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Mail className='h-5 w-5' />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className='pt-6'>
        {state.success ? (
          <SuccessMessage message={t('success')} />
        ) : (
          <NewsletterForm {...formProps} />
        )}
      </CardContent>
    </Card>
  );
}
