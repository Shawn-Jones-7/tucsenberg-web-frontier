import { ZERO } from '@/constants';

/**
 * WhatsApp Template Message Type Definitions
 *
 * This module provides type definitions for WhatsApp Business API template messages,
 * including template parameters, components, and language settings.
 */

// Template Parameter Types
export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  image?: {
    id?: string;
    link?: string;
  };
  document?: {
    id?: string;
    link?: string;
    filename?: string;
  };
  video?: {
    id?: string;
    link?: string;
  };
}

// Template Component Types
export interface TemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button';
  sub_type?: 'quick_reply' | 'url' | 'phone_number';
  index?: number;
  parameters?: TemplateParameter[];
}

// Template Language Configuration
export interface TemplateLanguage {
  policy: 'deterministic';
  code: string;
}

// Main Template Message Structure
export interface TemplateMessage {
  name: string;
  language: TemplateLanguage;
  components?: TemplateComponent[];
}

// Extended Template Types
export interface HeaderComponent extends TemplateComponent {
  type: 'header';
  parameters?: Array<
    TemplateParameter & {
      type: 'text' | 'image' | 'document' | 'video';
    }
  >;
}

export interface BodyComponent extends TemplateComponent {
  type: 'body';
  parameters?: Array<
    TemplateParameter & {
      type: 'text' | 'currency' | 'date_time';
    }
  >;
}

export interface FooterComponent extends TemplateComponent {
  type: 'footer';
  parameters?: Array<
    TemplateParameter & {
      type: 'text';
    }
  >;
}

export interface ButtonComponent extends TemplateComponent {
  type: 'button';
  sub_type: 'quick_reply' | 'url' | 'phone_number';
  index: number;
  parameters?: Array<
    TemplateParameter & {
      type: 'text';
    }
  >;
}

// Template Builder Types
export interface TemplateBuilder {
  name: string;
  language: string;
  components: TemplateComponent[];
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Template Parameter Builder Helpers
export interface TextParameterBuilder {
  type: 'text';
  text: string;
}

export interface CurrencyParameterBuilder {
  type: 'currency';
  fallback_value: string;
  code: string;
  amount_1000: number;
}

export interface DateTimeParameterBuilder {
  type: 'date_time';
  fallback_value: string;
}

export interface MediaParameterBuilder {
  type: 'image' | 'document' | 'video';
  id?: string;
  link?: string;
  filename?: string; // Only for documents
}

// Template Utility Types
export type TemplateComponentType = TemplateComponent['type'];
export type TemplateParameterType = TemplateParameter['type'];
export type ButtonSubType = ButtonComponent['sub_type'];

// Template Constants
export const TEMPLATE_COMPONENT_TYPES = [
  'header',
  'body',
  'footer',
  'button',
] as const;

export const TEMPLATE_PARAMETER_TYPES = [
  'text',
  'currency',
  'date_time',
  'image',
  'document',
  'video',
] as const;

export const BUTTON_SUB_TYPES = ['quick_reply', 'url', 'phone_number'] as const;

export const SUPPORTED_LANGUAGE_CODES = [
  'en_US', // English (US)
  'en_GB', // English (UK)
  'es_ES', // Spanish (Spain)
  'es_MX', // Spanish (Mexico)
  'pt_BR', // Portuguese (Brazil)
  'fr_FR', // French (France)
  'de_DE', // German (Germany)
  'it_IT', // Italian (Italy)
  'ru_RU', // Russian (Russia)
  'ar_AR', // Arabic
  'hi_IN', // Hindi (India)
  'zh_CN', // Chinese (Simplified)
  'zh_TW', // Chinese (Traditional)
  'ja_JP', // Japanese (Japan)
  'ko_KR', // Korean (South Korea)
] as const;

// Type Guards
export function isValidTemplateComponentType(
  type: string,
): type is TemplateComponentType {
  return TEMPLATE_COMPONENT_TYPES.includes(type as TemplateComponentType);
}

export function isValidTemplateParameterType(
  type: string,
): type is TemplateParameterType {
  return TEMPLATE_PARAMETER_TYPES.includes(type as TemplateParameterType);
}

export function isValidButtonSubType(
  subType: string,
): subType is ButtonSubType {
  return BUTTON_SUB_TYPES.includes(subType as ButtonSubType);
}

export function isValidLanguageCode(
  code: string,
): code is (typeof SUPPORTED_LANGUAGE_CODES)[number] {
  return SUPPORTED_LANGUAGE_CODES.includes(
    code as (typeof SUPPORTED_LANGUAGE_CODES)[number],
  );
}

export function isHeaderComponent(
  component: TemplateComponent,
): component is HeaderComponent {
  return component.type === 'header';
}

export function isBodyComponent(
  component: TemplateComponent,
): component is BodyComponent {
  return component.type === 'body';
}

export function isFooterComponent(
  component: TemplateComponent,
): component is FooterComponent {
  return component.type === 'footer';
}

export function isButtonComponent(
  component: TemplateComponent,
): component is ButtonComponent {
  return component.type === 'button';
}

// Template Validation Functions
export function validateTemplateParameter(
  parameter: TemplateParameter,
): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const validateText = () => {
    if (!parameter.text) {
      errors.push('Text parameter must have text value');
    }
  };

  const validateCurrency = () => {
    if (!parameter.currency) {
      errors.push('Currency parameter must have currency object');
      return;
    }
    if (!parameter.currency.code) {
      errors.push('Currency parameter must have currency code');
    }
    if (!parameter.currency.fallback_value) {
      errors.push('Currency parameter must have fallback value');
    }
    if (typeof parameter.currency.amount_1000 !== 'number') {
      errors.push('Currency parameter must have numeric amount_1000');
    }
  };

  const validateDateTime = () => {
    if (!parameter.date_time?.fallback_value) {
      errors.push('Date time parameter must have fallback value');
    }
  };

  const validateMedia = () => {
    const media = parameter[parameter.type as 'image' | 'document' | 'video'];
    if (!media?.id && !media?.link) {
      errors.push(`${parameter.type} parameter must have either id or link`);
    }
  };

  if (!isValidTemplateParameterType(parameter.type)) {
    errors.push(`Invalid parameter type: ${parameter.type}`);
  }

  switch (parameter.type) {
    case 'text':
      validateText();
      break;
    case 'currency':
      validateCurrency();
      break;
    case 'date_time':
      validateDateTime();
      break;
    case 'image':
    case 'document':
    case 'video':
      validateMedia();
      break;
    default:
      // 其他类型目前不需要额外校验
      break;
  }

  return {
    isValid: errors.length === ZERO,
    errors,
    warnings,
  };
}

export function validateTemplateComponent(
  component: TemplateComponent,
): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isValidTemplateComponentType(component.type)) {
    errors.push(`Invalid component type: ${component.type}`);
  }

  if (component.type === 'button') {
    if (!component.sub_type) {
      errors.push('Button component must have sub_type');
    } else if (!isValidButtonSubType(component.sub_type)) {
      errors.push(`Invalid button sub_type: ${component.sub_type}`);
    }

    if (typeof component.index !== 'number') {
      errors.push('Button component must have numeric index');
    }
  }

  if (component.parameters) {
    component.parameters.forEach((param, index) => {
      const paramValidation = validateTemplateParameter(param);
      if (!paramValidation.isValid) {
        errors.push(
          ...paramValidation.errors.map((err) => `Parameter ${index}: ${err}`),
        );
      }
      warnings.push(
        ...paramValidation.warnings.map(
          (warn) => `Parameter ${index}: ${warn}`,
        ),
      );
    });
  }

  return {
    isValid: errors.length === ZERO,
    errors,
    warnings,
  };
}

export function validateTemplateMessage(
  template: TemplateMessage,
): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!template.name) {
    errors.push('Template must have a name');
  }

  if (!template.language?.code) {
    errors.push('Template must have language code');
  } else if (!isValidLanguageCode(template.language.code)) {
    warnings.push(
      `Language code ${template.language.code} may not be supported`,
    );
  }

  if (template.language?.policy !== 'deterministic') {
    errors.push('Template language policy must be "deterministic"');
  }

  if (template.components) {
    template.components.forEach((component, index) => {
      const componentValidation = validateTemplateComponent(component);
      if (!componentValidation.isValid) {
        errors.push(
          ...componentValidation.errors.map(
            (err) => `Component ${index}: ${err}`,
          ),
        );
      }
      warnings.push(
        ...componentValidation.warnings.map(
          (warn) => `Component ${index}: ${warn}`,
        ),
      );
    });
  }

  return {
    isValid: errors.length === ZERO,
    errors,
    warnings,
  };
}

// Template Builder Helper Functions
export function createTextParameter(text: string): TextParameterBuilder {
  return {
    type: 'text',
    text,
  };
}

export function createCurrencyParameter(
  code: string,
  amount_1000: number,
  fallback_value: string,
): CurrencyParameterBuilder {
  return {
    type: 'currency',
    code,
    amount_1000,
    fallback_value,
  };
}

export function createDateTimeParameter(
  fallback_value: string,
): DateTimeParameterBuilder {
  return {
    type: 'date_time',
    fallback_value,
  };
}

export function createMediaParameter(
  type: 'image' | 'document' | 'video',
  options: { id?: string; link?: string; filename?: string },
): MediaParameterBuilder {
  return {
    type,
    ...options,
  };
}

// Export commonly used types with shorter names
export type {
  TemplateComponent as Component,
  TemplateLanguage as Language,
  TemplateParameter as Parameter,
  TemplateMessage as Template,
};
