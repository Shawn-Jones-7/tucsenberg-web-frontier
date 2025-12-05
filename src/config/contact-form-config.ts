import { z } from 'zod';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TEN,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  SECONDS_PER_MINUTE,
} from '@/constants';
import { MAGIC_15 } from '@/constants/count';

/* eslint-disable security/detect-object-injection */

/**
 * 表单字段枚举键值
 */
export const CONTACT_FORM_FIELD_KEYS = [
  'firstName',
  'lastName',
  'email',
  'company',
  'phone',
  'subject',
  'message',
  'acceptPrivacy',
  'marketingConsent',
  'website',
] as const;

export type ContactFormFieldKey = (typeof CONTACT_FORM_FIELD_KEYS)[number];

export type ContactFormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'checkbox'
  | 'hidden';

/**
 * 单字段配置
 */
export interface ContactFormFieldConfig {
  key: ContactFormFieldKey;
  enabled: boolean;
  required: boolean;
  type: ContactFormFieldType;
  order: number;
  i18nKey: string;
}

/**
 * 特性配置
 */
export interface ContactFormFeatures {
  enableTurnstile: boolean;
  showPrivacyCheckbox: boolean;
  showMarketingConsent: boolean;
  useWebsiteHoneypot: boolean;
}

/**
 * 验证配置
 */
export interface ContactFormValidationSettings {
  emailDomainWhitelist: string[];
  messageMinLength: number;
  messageMaxLength: number;
}

/**
 * 表单配置整体契约
 */
export interface ContactFormConfig {
  schemaVersion: number;
  fields: Record<ContactFormFieldKey, ContactFormFieldConfig>;
  features: ContactFormFeatures;
  validation: ContactFormValidationSettings;
}

export interface ContactFormFieldValues {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  message: string;
  phone?: string | undefined;
  subject?: string | undefined;
  acceptPrivacy: boolean;
  marketingConsent?: boolean | undefined;
  website?: string | undefined;
}

export const CONTACT_FORM_VALIDATION_CONSTANTS = {
  NAME_MIN_LENGTH: COUNT_PAIR,
  NAME_MAX_LENGTH: PERCENTAGE_HALF,
  EMAIL_MAX_LENGTH: PERCENTAGE_FULL,
  COMPANY_MIN_LENGTH: COUNT_PAIR,
  COMPANY_MAX_LENGTH: PERCENTAGE_FULL,
  MESSAGE_MIN_LENGTH: COUNT_TEN,
  MESSAGE_MAX_LENGTH: ANIMATION_DURATION_VERY_SLOW,
  SUBJECT_MIN_LENGTH: COUNT_FIVE,
  SUBJECT_MAX_LENGTH: PERCENTAGE_FULL,
  PHONE_MAX_DIGITS: MAGIC_15,
  HONEYPOT_MAX_LENGTH: 0,
  DEFAULT_COOLDOWN_MINUTES: COUNT_FIVE,
  COOLDOWN_TO_MS_MULTIPLIER: SECONDS_PER_MINUTE * 1000,
  MS_PER_SECOND: ANIMATION_DURATION_VERY_SLOW,
} as const;

/**
 * 默认字段配置
 */
const DEFAULT_FIELD_CONFIGS: Record<
  ContactFormFieldKey,
  ContactFormFieldConfig
> = {
  firstName: {
    key: 'firstName',
    enabled: true,
    required: true,
    type: 'text',
    order: 1,
    i18nKey: 'firstName',
  },
  lastName: {
    key: 'lastName',
    enabled: true,
    required: true,
    type: 'text',
    order: 2,
    i18nKey: 'lastName',
  },
  email: {
    key: 'email',
    enabled: true,
    required: true,
    type: 'email',
    order: 3,
    i18nKey: 'email',
  },
  company: {
    key: 'company',
    enabled: true,
    required: true,
    type: 'text',
    order: 4,
    i18nKey: 'company',
  },
  phone: {
    key: 'phone',
    enabled: false, // Disabled per Lead Pipeline requirements - simplify form
    required: false,
    type: 'tel',
    order: 5,
    i18nKey: 'phone',
  },
  subject: {
    key: 'subject',
    enabled: true,
    required: false,
    type: 'text',
    order: 6,
    i18nKey: 'subject',
  },
  message: {
    key: 'message',
    enabled: true,
    required: true,
    type: 'textarea',
    order: 7,
    i18nKey: 'message',
  },
  acceptPrivacy: {
    key: 'acceptPrivacy',
    enabled: true,
    required: true,
    type: 'checkbox',
    order: 8,
    i18nKey: 'acceptPrivacy',
  },
  marketingConsent: {
    key: 'marketingConsent',
    enabled: true,
    required: false,
    type: 'checkbox',
    order: 9,
    i18nKey: 'marketingConsent',
  },
  website: {
    key: 'website',
    enabled: true,
    required: false,
    type: 'hidden',
    order: 10,
    i18nKey: 'website',
  },
};

export const CONTACT_FORM_CONFIG: ContactFormConfig = {
  schemaVersion: 1,
  fields: DEFAULT_FIELD_CONFIGS,
  features: {
    enableTurnstile: true,
    showPrivacyCheckbox: true,
    showMarketingConsent: true,
    useWebsiteHoneypot: true,
  },
  validation: {
    emailDomainWhitelist: [],
    messageMinLength: CONTACT_FORM_VALIDATION_CONSTANTS.MESSAGE_MIN_LENGTH,
    messageMaxLength: CONTACT_FORM_VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH,
  },
};

const FIELD_CONFIG_SCHEMA = z.object({
  key: z.enum(CONTACT_FORM_FIELD_KEYS as readonly string[]),
  enabled: z.boolean(),
  required: z.boolean(),
  type: z.enum(['text', 'email', 'tel', 'textarea', 'checkbox', 'hidden']),
  order: z.number().int().nonnegative(),
  i18nKey: z.string().min(1),
});

const FEATURES_SCHEMA = z.object({
  enableTurnstile: z.boolean(),
  showPrivacyCheckbox: z.boolean(),
  showMarketingConsent: z.boolean(),
  useWebsiteHoneypot: z.boolean(),
});

const VALIDATION_SCHEMA = z
  .object({
    emailDomainWhitelist: z.array(z.string().min(1)).default([]),
    messageMinLength: z.number().int().positive(),
    messageMaxLength: z.number().int().positive(),
  })
  .refine((value) => value.messageMinLength <= value.messageMaxLength, {
    message: 'messageMinLength must be <= messageMaxLength',
  });

const CONTACT_FORM_FIELD_KEYS_ENUM = z.enum(
  CONTACT_FORM_FIELD_KEYS as readonly string[],
);

// 注意：Zod v4 中 ZodRecord 不支持 superRefine，这里改用 refine 实现必备键校验
const FIELDS_SCHEMA = z
  .record(CONTACT_FORM_FIELD_KEYS_ENUM, FIELD_CONFIG_SCHEMA)
  .refine((value) => CONTACT_FORM_FIELD_KEYS.every((key) => key in value), {
    message: 'Missing required field configs',
  });

export const contactFormConfigSchema = z.object({
  schemaVersion: z.number().int().min(1),
  fields: FIELDS_SCHEMA,
  features: FEATURES_SCHEMA,
  validation: VALIDATION_SCHEMA,
});

export interface ContactFormFieldDescriptor extends ContactFormFieldConfig {
  labelKey: string;
  placeholderKey?: string | undefined;
  isCheckbox: boolean;
  isHoneypot: boolean;
}

const PLACEHOLDER_KEYS: Partial<Record<ContactFormFieldKey, string>> = {
  firstName: 'firstNamePlaceholder',
  lastName: 'lastNamePlaceholder',
  email: 'emailPlaceholder',
  company: 'companyPlaceholder',
  phone: 'phonePlaceholder',
  subject: 'subjectPlaceholder',
  message: 'messagePlaceholder',
};

function shouldRenderField(
  field: ContactFormFieldConfig,
  features: ContactFormFeatures,
): boolean {
  if (field.key === 'acceptPrivacy' && !features.showPrivacyCheckbox) {
    return false;
  }
  if (field.key === 'marketingConsent' && !features.showMarketingConsent) {
    return false;
  }
  if (field.key === 'website' && !features.useWebsiteHoneypot) {
    return false;
  }
  return field.enabled;
}

export function buildFormFieldsFromConfig(
  config: ContactFormConfig,
): ContactFormFieldDescriptor[] {
  return CONTACT_FORM_FIELD_KEYS.map((key) => {
    return config.fields[key];
  })
    .filter((field) => shouldRenderField(field, config.features))
    .sort((a, b) => a.order - b.order)
    .map((field) => ({
      // nosemgrep: object-injection-sink-spread-operator
      // Safe spread: field is a strongly typed ContactFormFieldConfig from
      // static form configuration, not user-provided input.
      ...field,
      labelKey: field.i18nKey,
      // nosemgrep: object-injection-sink-dynamic-property
      // Safe lookup: PLACEHOLDER_KEYS is keyed by ContactFormFieldKey union type,
      // and field.key is a trusted enum-like key from config, not user input.
      placeholderKey: PLACEHOLDER_KEYS[field.key],
      isCheckbox: field.type === 'checkbox',
      isHoneypot: field.key === 'website',
    }));
}

export interface ContactFormFieldValidatorContext {
  config: ContactFormConfig;
  field: ContactFormFieldConfig;
}

export type ContactFormFieldValidator = (
  context: ContactFormFieldValidatorContext,
) => z.ZodTypeAny;

export type ContactFormFieldValidators = Record<
  ContactFormFieldKey,
  ContactFormFieldValidator
>;

export function createContactFormSchemaFromConfig(
  config: ContactFormConfig,
  validators: ContactFormFieldValidators,
) {
  const shape = CONTACT_FORM_FIELD_KEYS.reduce<Record<string, z.ZodTypeAny>>(
    (acc, key) => {
      const field = config.fields[key];
      if (!shouldRenderField(field, config.features)) {
        return acc;
      }

      const validator = validators[key];
      if (!validator) {
        throw new Error(`Missing validator for field key: ${key}`);
      }

      acc[key] = validator({ config, field });
      return acc;
    },
    {},
  );

  return z.object(shape);
}

/* eslint-enable security/detect-object-injection */
