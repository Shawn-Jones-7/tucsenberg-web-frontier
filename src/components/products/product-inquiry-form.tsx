'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle, Loader2, MessageSquare, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getAttributionAsObject, storeAttributionData } from '@/lib/utm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

export interface ProductInquiryFormProps {
  /** Product name to display in the form */
  productName: string;
  /** Product slug for reference */
  productSlug: string;
  /** Custom class name */
  className?: string;
  /** Callback when form is submitted successfully */
  onSuccess?: () => void;
}

interface FormState {
  success: boolean;
  error: string | undefined;
}

const initialState: FormState = {
  success: false,
  error: undefined,
};

// Success message component
function SuccessMessage({ message }: { message: string }) {
  return (
    <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
      <CheckCircle className='mb-4 h-12 w-12 text-green-500' />
      <p className='text-lg font-medium'>{message}</p>
    </CardContent>
  );
}

// Form header component
interface FormHeaderProps {
  title: string;
  description: string;
}

function FormHeader({ title, description }: FormHeaderProps) {
  return (
    <CardHeader className='bg-muted/50'>
      <CardTitle className='flex items-center gap-2 text-lg'>
        <MessageSquare className='h-5 w-5' />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
}

// Error display component
function ErrorMessage({ error }: { error: string }) {
  return (
    <div className='flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600'>
      <XCircle className='h-4 w-4' />
      {error}
    </div>
  );
}

// Submit button component
interface SubmitButtonProps {
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  disabled?: boolean;
}

function SubmitButton({
  isSubmitting,
  submitLabel,
  submittingLabel,
  disabled,
}: SubmitButtonProps) {
  return (
    <Button
      type='submit'
      className='w-full'
      disabled={isSubmitting || disabled}
    >
      {isSubmitting ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          {submittingLabel}
        </>
      ) : (
        submitLabel
      )}
    </Button>
  );
}

// Product display component
function ProductDisplay({
  label,
  productName,
}: {
  label: string;
  productName: string;
}) {
  return (
    <div className='rounded-md bg-muted/50 p-3'>
      <Label className='text-xs text-muted-foreground'>{label}</Label>
      <p className='font-medium'>{productName}</p>
    </div>
  );
}

// Contact fields component
interface ContactFieldsProps {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
}

function ContactFields({
  nameLabel,
  namePlaceholder,
  emailLabel,
  emailPlaceholder,
}: ContactFieldsProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label htmlFor='inquiry-name'>{nameLabel} *</Label>
        <Input
          id='inquiry-name'
          name='name'
          required
          placeholder={namePlaceholder}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='inquiry-email'>{emailLabel} *</Label>
        <Input
          id='inquiry-email'
          name='email'
          type='email'
          required
          placeholder={emailPlaceholder}
        />
      </div>
    </div>
  );
}

// Company field component
function CompanyField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor='inquiry-company'>{label}</Label>
      <Input
        id='inquiry-company'
        name='company'
        placeholder={placeholder}
      />
    </div>
  );
}

// Quantity and price fields component
interface QuantityPriceFieldsProps {
  quantityLabel: string;
  quantityPlaceholder: string;
  priceLabel: string;
  pricePlaceholder: string;
}

function QuantityPriceFields({
  quantityLabel,
  quantityPlaceholder,
  priceLabel,
  pricePlaceholder,
}: QuantityPriceFieldsProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label htmlFor='inquiry-quantity'>{quantityLabel} *</Label>
        <Input
          id='inquiry-quantity'
          name='quantity'
          required
          placeholder={quantityPlaceholder}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='inquiry-targetPrice'>{priceLabel}</Label>
        <Input
          id='inquiry-targetPrice'
          name='targetPrice'
          placeholder={pricePlaceholder}
        />
      </div>
    </div>
  );
}

// Requirements field component
function RequirementsField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor='inquiry-requirements'>{label}</Label>
      <Textarea
        id='inquiry-requirements'
        name='requirements'
        rows={4}
        placeholder={placeholder}
      />
    </div>
  );
}

// Extract form data from FormData object
function extractFormData(formData: FormData) {
  const fullName = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim();
  const quantity = String(formData.get('quantity') ?? '').trim();
  const targetPrice = String(formData.get('targetPrice') ?? '').trim();
  const requirementsRaw = String(formData.get('requirements') ?? '').trim();
  const requirements =
    targetPrice !== ''
      ? `${requirementsRaw}\n\nTarget Price: ${targetPrice}`.trim()
      : requirementsRaw;
  return { fullName, email, company, quantity, requirements };
}

// Submit inquiry to API
interface SubmitInquiryParams {
  data: ReturnType<typeof extractFormData>;
  productSlug: string;
  productName: string;
  token: string;
}

async function submitInquiry({
  data,
  productSlug,
  productName,
  token,
}: SubmitInquiryParams): Promise<{ ok: boolean; error?: string }> {
  const attribution = getAttributionAsObject();
  const requestBody = {
    type: 'product',
    fullName: data.fullName,
    email: data.email,
    productSlug,
    productName,
    quantity: data.quantity,
    turnstileToken: token,
    ...(data.company !== '' && { company: data.company }),
    ...(data.requirements !== '' && { requirements: data.requirements }),
    ...attribution,
  };

  const response = await fetch('/api/inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  const result = await response.json();
  return { ok: response.ok && result.success === true, error: result.error };
}

/**
 * Product inquiry form for B2B product pages.
 */
export function ProductInquiryForm({
  productName,
  productSlug,
  className,
  onSuccess,
}: ProductInquiryFormProps) {
  const t = useTranslations('products.inquiry');
  const tContact = useTranslations('contact.form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileTokenRef = useRef<string | null>(null);

  // Capture UTM parameters on mount (first-touch attribution)
  useEffect(() => {
    storeAttributionData();
  }, []);

  const handleTurnstileSuccess = useCallback((token: string) => {
    turnstileTokenRef.current = token;
    setTurnstileToken(token);
  }, []);

  const handleTurnstileReset = useCallback(() => {
    turnstileTokenRef.current = null;
    setTurnstileToken(null);
  }, []);

  async function handleSubmit(
    _prevState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    setIsSubmitting(true);
    try {
      const token = turnstileTokenRef.current;
      if (!token) return { success: false, error: t('turnstileRequired') };

      const data = extractFormData(formData);
      const result = await submitInquiry({
        data,
        productSlug,
        productName,
        token,
      });
      if (!result.ok)
        return { success: false, error: result.error ?? t('error') };

      onSuccess?.();
      return { success: true, error: undefined };
    } catch {
      return { success: false, error: t('error') };
    } finally {
      setIsSubmitting(false);
    }
  }

  const [state, formAction] = useActionState(handleSubmit, initialState);

  if (state.success) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <SuccessMessage message={t('success')} />
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <FormHeader
        title={t('title')}
        description={t('description')}
      />
      <CardContent className='pt-6'>
        <form
          action={formAction}
          className='space-y-4'
        >
          <input
            type='hidden'
            name='productSlug'
            value={productSlug}
          />
          <input
            type='hidden'
            name='productName'
            value={productName}
          />
          <ProductDisplay
            label={t('productName')}
            productName={productName}
          />
          <ContactFields
            nameLabel={tContact('firstName')}
            namePlaceholder={tContact('firstNamePlaceholder')}
            emailLabel={tContact('email')}
            emailPlaceholder={tContact('emailPlaceholder')}
          />
          <CompanyField
            label={tContact('company')}
            placeholder={tContact('companyPlaceholder')}
          />
          <QuantityPriceFields
            quantityLabel={t('quantity')}
            quantityPlaceholder={t('quantityPlaceholder')}
            priceLabel={t('targetPrice')}
            pricePlaceholder={t('targetPricePlaceholder')}
          />
          <RequirementsField
            label={t('requirements')}
            placeholder={t('requirementsPlaceholder')}
          />
          <TurnstileWidget
            onSuccess={handleTurnstileSuccess}
            onError={handleTurnstileReset}
            onExpire={handleTurnstileReset}
            action='product_inquiry'
            size='compact'
            theme='auto'
          />
          {state.error !== undefined && <ErrorMessage error={state.error} />}
          <SubmitButton
            isSubmitting={isSubmitting}
            submitLabel={t('submit')}
            submittingLabel={t('submitting')}
            disabled={!turnstileToken}
          />
        </form>
      </CardContent>
    </Card>
  );
}
