import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MAGIC_6 } from "@/constants/count";
import type { ContactFormData } from '@/lib/validations';
import { useForm } from 'react-hook-form';

/**
 * Additional fields component
 */
interface AdditionalFieldsProps {
  register: ReturnType<typeof useForm<ContactFormData>>['register'];
  errors: ReturnType<typeof useForm<ContactFormData>>['formState']['errors'];
  isSubmitting: boolean;
  t: (_key: string) => string;
}

export function AdditionalFields({
  register,
  errors,
  isSubmitting,
  t,
}: AdditionalFieldsProps) {
  return (
    <>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='phone'>{t('phone')}</Label>
          <Input
            id='phone'
            type='tel'
            placeholder={t('phonePlaceholder')}
            disabled={isSubmitting}
            className={
              errors.phone ? 'border-red-500 focus:border-red-500' : ''
            }
            aria-invalid={Boolean(errors.phone)}
            {...register('phone')}
          />
          {errors.phone && (
            <p
              className='text-sm text-red-500'
              role='alert'
            >
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label
            htmlFor='subject'
            className="after:ml-0.5 after:text-red-500 after:content-['*']"
          >
            {t('subject')}
          </Label>
          <Input
            id='subject'
            placeholder={t('subjectPlaceholder')}
            disabled={isSubmitting}
            className={
              errors.subject ? 'border-red-500 focus:border-red-500' : ''
            }
            aria-invalid={Boolean(errors.subject)}
            {...register('subject')}
          />
          {errors.subject && (
            <p
              className='text-sm text-red-500'
              role='alert'
            >
              {errors.subject.message}
            </p>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='message'
          className="after:ml-0.5 after:text-red-500 after:content-['*']"
        >
          {t('message')}
        </Label>
        <Textarea
          id='message'
          placeholder={t('messagePlaceholder')}
          disabled={isSubmitting}
          rows={MAGIC_6}
          className={
            errors.message ? 'border-red-500 focus:border-red-500' : ''
          }
          aria-invalid={Boolean(errors.message)}
          {...register('message')}
        />
        {errors.message && (
          <p
            className='text-sm text-red-500'
            role='alert'
          >
            {errors.message.message}
          </p>
        )}
      </div>
    </>
  );
}
