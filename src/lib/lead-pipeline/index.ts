/**
 * Lead Pipeline Module
 * Unified lead handling for all form submissions
 */

export {
  leadSchema,
  contactLeadSchema,
  productLeadSchema,
  newsletterLeadSchema,
  LEAD_TYPES,
  CONTACT_SUBJECTS,
  isContactLead,
  isProductLead,
  isNewsletterLead,
  type LeadInput,
  type ContactLeadInput,
  type ProductLeadInput,
  type NewsletterLeadInput,
  type LeadType,
  type ContactSubject,
} from '@/lib/lead-pipeline/lead-schema';

export {
  splitName,
  formatQuantity,
  generateProductInquiryMessage,
  sanitizeInput,
  generateLeadReferenceId,
  type SplitNameResult,
} from '@/lib/lead-pipeline/utils';

export { processLead, type LeadResult } from '@/lib/lead-pipeline/process-lead';
