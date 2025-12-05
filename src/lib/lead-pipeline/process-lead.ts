/**
 * Lead Pipeline Core Processing Function
 * Unified handler for all lead sources: contact, product inquiry, newsletter
 */

import {
  isContactLead,
  isNewsletterLead,
  isProductLead,
  LEAD_TYPES,
  leadSchema,
  type ContactLeadInput,
  type LeadInput,
  type NewsletterLeadInput,
  type ProductLeadInput,
} from '@/lib/lead-pipeline/lead-schema';
import {
  generateLeadReferenceId,
  generateProductInquiryMessage,
  splitName,
} from '@/lib/lead-pipeline/utils';
import { logger } from '@/lib/logger';

/**
 * Result of lead processing operation
 */
export interface LeadResult {
  success: boolean;
  emailSent: boolean;
  recordCreated: boolean;
  referenceId?: string | undefined;
  error?: 'VALIDATION_ERROR' | 'PROCESSING_FAILED' | string | undefined;
}

/**
 * Internal result type for service operations
 */
interface ServiceResult {
  success: boolean;
  id?: string | undefined;
  error?: Error | undefined;
}

/**
 * Timeout wrapper for async operations
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string,
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error(`${operationName} timed out`)),
      timeoutMs,
    );
  });
  return Promise.race([promise, timeoutPromise]);
}

const OPERATION_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Process contact lead
 */
async function processContactLead(
  lead: ContactLeadInput,
  referenceId: string,
): Promise<{ emailResult: ServiceResult; crmResult: ServiceResult }> {
  const { firstName, lastName } = splitName(lead.fullName);

  // Lazy import to avoid circular dependencies
  const { resendService } = await import('@/lib/resend');
  const { airtableService } = await import('@/lib/airtable');

  const emailData = {
    firstName,
    lastName,
    email: lead.email,
    company: lead.company ?? '',
    subject: lead.subject,
    message: lead.message,
    submittedAt: lead.submittedAt || new Date().toISOString(),
    marketingConsent: lead.marketingConsent,
  };

  const [emailResult, crmResult] = await Promise.allSettled([
    withTimeout(
      resendService.sendContactFormEmail(emailData),
      OPERATION_TIMEOUT_MS,
      'Email send',
    ),
    withTimeout(
      airtableService.createLead(LEAD_TYPES.CONTACT, {
        firstName,
        lastName,
        email: lead.email,
        company: lead.company,
        subject: lead.subject,
        message: lead.message,
        marketingConsent: lead.marketingConsent,
        referenceId,
      }),
      OPERATION_TIMEOUT_MS,
      'CRM record',
    ),
  ]);

  return {
    emailResult:
      emailResult.status === 'fulfilled'
        ? { success: true, id: emailResult.value }
        : { success: false, error: emailResult.reason },
    crmResult:
      crmResult.status === 'fulfilled'
        ? { success: true, id: crmResult.value?.id }
        : { success: false, error: crmResult.reason },
  };
}

/**
 * Process product inquiry lead
 */
async function processProductLead(
  lead: ProductLeadInput,
  referenceId: string,
): Promise<{ emailResult: ServiceResult; crmResult: ServiceResult }> {
  const { firstName, lastName } = splitName(lead.fullName);
  const message = generateProductInquiryMessage(
    lead.productName,
    lead.quantity,
    lead.requirements,
  );

  // Lazy import to avoid circular dependencies
  const { resendService } = await import('@/lib/resend');
  const { airtableService } = await import('@/lib/airtable');

  const [emailResult, crmResult] = await Promise.allSettled([
    withTimeout(
      resendService.sendProductInquiryEmail({
        firstName,
        lastName,
        email: lead.email,
        company: lead.company,
        productName: lead.productName,
        productSlug: lead.productSlug,
        quantity: lead.quantity,
        requirements: lead.requirements,
        marketingConsent: lead.marketingConsent,
      }),
      OPERATION_TIMEOUT_MS,
      'Email send',
    ),
    withTimeout(
      airtableService.createLead(LEAD_TYPES.PRODUCT, {
        firstName,
        lastName,
        email: lead.email,
        company: lead.company,
        message,
        productSlug: lead.productSlug,
        productName: lead.productName,
        quantity: lead.quantity,
        requirements: lead.requirements,
        marketingConsent: lead.marketingConsent,
        referenceId,
      }),
      OPERATION_TIMEOUT_MS,
      'CRM record',
    ),
  ]);

  return {
    emailResult:
      emailResult.status === 'fulfilled'
        ? { success: true, id: emailResult.value }
        : { success: false, error: emailResult.reason },
    crmResult:
      crmResult.status === 'fulfilled'
        ? { success: true, id: crmResult.value?.id }
        : { success: false, error: crmResult.reason },
  };
}

/**
 * Process newsletter subscription lead
 */
async function processNewsletterLead(
  lead: NewsletterLeadInput,
  referenceId: string,
): Promise<{ emailResult: ServiceResult; crmResult: ServiceResult }> {
  // Lazy import to avoid circular dependencies
  const { airtableService } = await import('@/lib/airtable');

  // Newsletter only creates CRM record, no email notification
  const [crmResult] = await Promise.allSettled([
    withTimeout(
      airtableService.createLead(LEAD_TYPES.NEWSLETTER, {
        email: lead.email,
        referenceId,
      }),
      OPERATION_TIMEOUT_MS,
      'CRM record',
    ),
  ]);

  return {
    // Newsletter has no email operation - success depends solely on CRM
    emailResult: { success: false },
    crmResult:
      crmResult.status === 'fulfilled'
        ? { success: true, id: crmResult.value?.id }
        : { success: false, error: crmResult.reason },
  };
}

/**
 * Main lead processing function
 * Validates input, routes to appropriate handler, and ensures at least one service succeeds
 *
 * @param rawInput - Raw input data (will be validated)
 * @returns LeadResult indicating success/failure and service statuses
 */
// eslint-disable-next-line complexity, max-statements -- orchestration logic requires branching
export async function processLead(rawInput: unknown): Promise<LeadResult> {
  // Step 1: Validate input
  const validationResult = leadSchema.safeParse(rawInput);

  if (!validationResult.success) {
    logger.warn('Lead validation failed', {
      errors: validationResult.error.issues,
    });
    return {
      success: false,
      emailSent: false,
      recordCreated: false,
      error: 'VALIDATION_ERROR',
    };
  }

  const lead: LeadInput = validationResult.data;
  const referenceId = generateLeadReferenceId(lead.type);

  logger.info('Processing lead', {
    type: lead.type,
    email: lead.email,
    referenceId,
  });

  try {
    // Step 2: Route to appropriate handler
    let results: { emailResult: ServiceResult; crmResult: ServiceResult };

    if (isContactLead(lead)) {
      results = await processContactLead(lead, referenceId);
    } else if (isProductLead(lead)) {
      results = await processProductLead(lead, referenceId);
    } else if (isNewsletterLead(lead)) {
      results = await processNewsletterLead(lead, referenceId);
    } else {
      // This should never happen due to discriminated union
      throw new Error('Unknown lead type');
    }

    const { emailResult, crmResult } = results;

    // Log individual failures
    if (!emailResult.success) {
      logger.error('Lead email send failed', {
        type: lead.type,
        referenceId,
        error: emailResult.error?.message,
      });
    }

    if (!crmResult.success) {
      logger.error('Lead CRM record failed', {
        type: lead.type,
        referenceId,
        error: crmResult.error?.message,
      });
    }

    // Step 3: At least one success = overall success
    const success = emailResult.success || crmResult.success;

    if (success) {
      logger.info('Lead processed successfully', {
        type: lead.type,
        referenceId,
        emailSent: emailResult.success,
        recordCreated: crmResult.success,
      });
    } else {
      logger.error('Lead processing failed completely', {
        type: lead.type,
        referenceId,
        emailError: emailResult.error?.message,
        crmError: crmResult.error?.message,
      });
    }

    return {
      success,
      emailSent: emailResult.success,
      recordCreated: crmResult.success,
      referenceId: success ? referenceId : undefined,
      error: success ? undefined : 'PROCESSING_FAILED',
    };
  } catch (error) {
    logger.error('Lead processing unexpected error', {
      type: lead.type,
      referenceId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      emailSent: false,
      recordCreated: false,
      referenceId,
      error: 'PROCESSING_FAILED',
    };
  }
}
