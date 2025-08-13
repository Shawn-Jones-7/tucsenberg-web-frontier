import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { ContactFormData } from '@/lib/validations';

/**
 * Name fields component
 */
interface NameFieldsProps {
  register: ReturnType<typeof useForm<ContactFormData>>['register'];
  errors: ReturnType<typeof useForm<ContactFormData>>['formState']['errors'];
  isSubmitting: boolean;
  t: (_key: string) => string;
}

export function NameFields({ register, errors, isSubmitting, t }: NameFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          {t('firstName')}
        </Label>
        <Input
          id="firstName"
          placeholder={t('firstNamePlaceholder')}
          disabled={isSubmitting}
          className={errors.firstName ? 'border-red-500 focus:border-red-500' : ''}
          aria-invalid={!!errors.firstName}
          {...register('firstName')}
        />
        {errors.firstName && (
          <p className="text-sm text-red-500" role="alert">
            {errors.firstName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          {t('lastName')}
        </Label>
        <Input
          id="lastName"
          placeholder={t('lastNamePlaceholder')}
          disabled={isSubmitting}
          className={errors.lastName ? 'border-red-500 focus:border-red-500' : ''}
          aria-invalid={!!errors.lastName}
          {...register('lastName')}
        />
        {errors.lastName && (
          <p className="text-sm text-red-500" role="alert">
            {errors.lastName.message}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Contact fields component
 */
interface ContactFieldsProps {
  register: ReturnType<typeof useForm<ContactFormData>>['register'];
  errors: ReturnType<typeof useForm<ContactFormData>>['formState']['errors'];
  isSubmitting: boolean;
  t: (_key: string) => string;
}

export function ContactFields({ register, errors, isSubmitting, t }: ContactFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          {t('email')}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          disabled={isSubmitting}
          className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-500" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">
          {t('company')}
        </Label>
        <Input
          id="company"
          placeholder={t('companyPlaceholder')}
          disabled={isSubmitting}
          className={errors.company ? 'border-red-500 focus:border-red-500' : ''}
          aria-invalid={!!errors.company}
          {...register('company')}
        />
        {errors.company && (
          <p className="text-sm text-red-500" role="alert">
            {errors.company.message}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Additional fields component
 */
interface AdditionalFieldsProps {
  register: ReturnType<typeof useForm<ContactFormData>>['register'];
  errors: ReturnType<typeof useForm<ContactFormData>>['formState']['errors'];
  isSubmitting: boolean;
  t: (_key: string) => string;
}

export function AdditionalFields({ register, errors, isSubmitting, t }: AdditionalFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">
            {t('phone')}
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder={t('phonePlaceholder')}
            disabled={isSubmitting}
            className={errors.phone ? 'border-red-500 focus:border-red-500' : ''}
            aria-invalid={!!errors.phone}
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-sm text-red-500" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject" className="after:content-['*'] after:ml-0.5 after:text-red-500">
            {t('subject')}
          </Label>
          <Input
            id="subject"
            placeholder={t('subjectPlaceholder')}
            disabled={isSubmitting}
            className={errors.subject ? 'border-red-500 focus:border-red-500' : ''}
            aria-invalid={!!errors.subject}
            {...register('subject')}
          />
          {errors.subject && (
            <p className="text-sm text-red-500" role="alert">
              {errors.subject.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          {t('message')}
        </Label>
        <Textarea
          id="message"
          placeholder={t('messagePlaceholder')}
          disabled={isSubmitting}
          rows={6}
          className={errors.message ? 'border-red-500 focus:border-red-500' : ''}
          aria-invalid={!!errors.message}
          {...register('message')}
        />
        {errors.message && (
          <p className="text-sm text-red-500" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>
    </>
  );
}

/**
 * Checkbox fields component
 */
interface CheckboxFieldsProps {
  errors: ReturnType<typeof useForm<ContactFormData>>['formState']['errors'];
  isSubmitting: boolean;
  watchedValues: ContactFormData;
  setValue: ReturnType<typeof useForm<ContactFormData>>['setValue'];
  t: (_key: string) => string;
}

export function CheckboxFields({ errors, isSubmitting, watchedValues, setValue, t }: CheckboxFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptPrivacy"
            checked={watchedValues.acceptPrivacy}
            onCheckedChange={(checked) => setValue('acceptPrivacy', Boolean(checked))}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.acceptPrivacy)}
          />
          <Label
            htmlFor="acceptPrivacy"
            className="text-sm after:content-['*'] after:ml-0.5 after:text-red-500"
          >
            {t('acceptPrivacy')}
          </Label>
        </div>
        {errors.acceptPrivacy && (
          <p className="text-sm text-red-500" role="alert">
            {errors.acceptPrivacy.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="marketingConsent"
            checked={watchedValues.marketingConsent || false}
            onCheckedChange={(checked) => setValue('marketingConsent', Boolean(checked))}
            disabled={isSubmitting}
          />
          <Label htmlFor="marketingConsent" className="text-sm">
            {t('marketingConsent')}
          </Label>
        </div>
      </div>
    </div>
  );
}
