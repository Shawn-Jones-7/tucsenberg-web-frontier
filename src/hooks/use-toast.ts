'use client';

import { useTranslations } from 'next-intl';
import { toast as sonnerToast } from 'sonner';

/**
 * Custom toast hook with internationalization support
 * Specifically designed for form submission feedback
 */
export function useToast() {
  const t = useTranslations('common.toast');

  const toast = {
    success: (message: string, description?: string) => {
      sonnerToast.success(message, {
        description,
        duration: 4000,
      });
    },

    error: (message: string, description?: string) => {
      sonnerToast.error(message, {
        description,
        duration: 6000,
      });
    },

    info: (message: string, description?: string) => {
      sonnerToast.info(message, {
        description,
        duration: 4000,
      });
    },

    warning: (message: string, description?: string) => {
      sonnerToast.warning(message, {
        description,
        duration: 5000,
      });
    },

    // Form-specific toast methods
    formSuccess: (formType: 'contact' | 'newsletter' | 'feedback') => {
      const message = t(`form.${formType}.success`);
      const description = t(`form.${formType}.successDescription`);
      sonnerToast.success(message, {
        description,
        duration: 4000,
      });
    },

    formError: (
      formType: 'contact' | 'newsletter' | 'feedback',
      error?: string,
    ) => {
      const message = t(`form.${formType}.error`);
      const description = error || t(`form.${formType}.errorDescription`);
      sonnerToast.error(message, {
        description,
        duration: 6000,
      });
    },

    // Loading toast for form submissions
    formLoading: (formType: 'contact' | 'newsletter' | 'feedback') => {
      const message = t(`form.${formType}.loading`);
      return sonnerToast.loading(message);
    },

    // Dismiss specific toast
    dismiss: (toastId?: string | number) => {
      sonnerToast.dismiss(toastId);
    },
  };

  return { toast };
}
