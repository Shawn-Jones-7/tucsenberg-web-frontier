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
  categorizeError,
  createLatencyTimer,
  leadPipelineMetrics,
  METRIC_SERVICES,
  type PipelineSummary,
} from '@/lib/lead-pipeline/metrics';
import {
  generateLeadReferenceId,
  generateProductInquiryMessage,
  splitName,
} from '@/lib/lead-pipeline/utils';
import { logger, sanitizeEmail } from '@/lib/logger';
import { CONTACT_FORM_CONFIG } from '@/config/contact-form-config';

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
  latencyMs: number;
}

/**
 * Timeout wrapper for async operations with latency tracking
 */
interface TimedResult<T> {
  result: T;
  latencyMs: number;
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string,
): Promise<TimedResult<T>> {
  const timer = createLatencyTimer();
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error(`${operationName} timed out`)),
      timeoutMs,
    );
  });
  const result = await Promise.race([promise, timeoutPromise]);
  return { result, latencyMs: timer.stop() };
}

const OPERATION_TIMEOUT_MS = 10000; // 10 seconds
const DEFAULT_LATENCY = 0;

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

  const emailTimer = createLatencyTimer();
  const crmTimer = createLatencyTimer();

  const [emailSettled, crmSettled] = await Promise.allSettled([
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

  // Send confirmation email if enabled (fire-and-forget, non-blocking)
  if (CONTACT_FORM_CONFIG.features.sendConfirmationEmail) {
    resendService.sendConfirmationEmail(emailData).catch((error) => {
      logger.warn('Confirmation email failed (non-blocking)', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: sanitizeEmail(lead.email),
      });
    });
  }

  const emailLatency =
    emailSettled.status === 'fulfilled'
      ? emailSettled.value.latencyMs
      : emailTimer.stop();
  const crmLatency =
    crmSettled.status === 'fulfilled'
      ? crmSettled.value.latencyMs
      : crmTimer.stop();

  return {
    emailResult:
      emailSettled.status === 'fulfilled'
        ? {
            success: true,
            id: emailSettled.value.result,
            latencyMs: emailLatency,
          }
        : {
            success: false,
            error: emailSettled.reason,
            latencyMs: emailLatency,
          },
    crmResult:
      crmSettled.status === 'fulfilled'
        ? {
            success: true,
            id: crmSettled.value.result?.id,
            latencyMs: crmLatency,
          }
        : { success: false, error: crmSettled.reason, latencyMs: crmLatency },
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

  const emailTimer = createLatencyTimer();
  const crmTimer = createLatencyTimer();

  const [emailSettled, crmSettled] = await Promise.allSettled([
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

  const emailLatency =
    emailSettled.status === 'fulfilled'
      ? emailSettled.value.latencyMs
      : emailTimer.stop();
  const crmLatency =
    crmSettled.status === 'fulfilled'
      ? crmSettled.value.latencyMs
      : crmTimer.stop();

  return {
    emailResult:
      emailSettled.status === 'fulfilled'
        ? {
            success: true,
            id: emailSettled.value.result,
            latencyMs: emailLatency,
          }
        : {
            success: false,
            error: emailSettled.reason,
            latencyMs: emailLatency,
          },
    crmResult:
      crmSettled.status === 'fulfilled'
        ? {
            success: true,
            id: crmSettled.value.result?.id,
            latencyMs: crmLatency,
          }
        : { success: false, error: crmSettled.reason, latencyMs: crmLatency },
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

  const crmTimer = createLatencyTimer();

  // Newsletter only creates CRM record, no email notification
  const [crmSettled] = await Promise.allSettled([
    withTimeout(
      airtableService.createLead(LEAD_TYPES.NEWSLETTER, {
        email: lead.email,
        referenceId,
      }),
      OPERATION_TIMEOUT_MS,
      'CRM record',
    ),
  ]);

  const crmLatency =
    crmSettled.status === 'fulfilled'
      ? crmSettled.value.latencyMs
      : crmTimer.stop();

  return {
    // Newsletter has no email operation - success depends solely on CRM
    emailResult: { success: false, latencyMs: DEFAULT_LATENCY },
    crmResult:
      crmSettled.status === 'fulfilled'
        ? {
            success: true,
            id: crmSettled.value.result?.id,
            latencyMs: crmLatency,
          }
        : { success: false, error: crmSettled.reason, latencyMs: crmLatency },
  };
}

/**
 * Emit metrics for service results
 */
function emitServiceMetrics(
  emailResult: ServiceResult,
  crmResult: ServiceResult,
  hasEmailOperation: boolean,
): void {
  // Emit Resend metrics (only for leads with email operations)
  if (hasEmailOperation) {
    if (emailResult.success) {
      leadPipelineMetrics.recordSuccess(
        METRIC_SERVICES.RESEND,
        emailResult.latencyMs,
      );
    } else {
      leadPipelineMetrics.recordFailure(
        METRIC_SERVICES.RESEND,
        emailResult.latencyMs,
        emailResult.error,
      );
    }
  }

  // Emit Airtable metrics
  if (crmResult.success) {
    leadPipelineMetrics.recordSuccess(
      METRIC_SERVICES.AIRTABLE,
      crmResult.latencyMs,
    );
  } else {
    leadPipelineMetrics.recordFailure(
      METRIC_SERVICES.AIRTABLE,
      crmResult.latencyMs,
      crmResult.error,
    );
  }
}

/**
 * Parameters for logging pipeline summary
 */
interface LogPipelineSummaryParams {
  referenceId: string;
  leadType: string;
  emailResult: ServiceResult;
  crmResult: ServiceResult;
  totalLatencyMs: number;
  overallSuccess: boolean;
}

/**
 * Log pipeline processing summary
 */
function logPipelineSummary(params: LogPipelineSummaryParams): void {
  const {
    referenceId,
    leadType,
    emailResult,
    crmResult,
    totalLatencyMs,
    overallSuccess,
  } = params;
  const summary: PipelineSummary = {
    leadId: referenceId,
    leadType,
    totalLatencyMs,
    resend: {
      success: emailResult.success,
      latencyMs: emailResult.latencyMs,
      ...(emailResult.error
        ? { errorType: categorizeError(emailResult.error) }
        : {}),
    },
    airtable: {
      success: crmResult.success,
      latencyMs: crmResult.latencyMs,
      ...(crmResult.error
        ? { errorType: categorizeError(crmResult.error) }
        : {}),
    },
    overallSuccess,
    timestamp: new Date().toISOString(),
  };

  leadPipelineMetrics.logPipelineSummary(summary);
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
  const pipelineTimer = createLatencyTimer();

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
    email: sanitizeEmail(lead.email),
    referenceId,
  });

  try {
    // Step 2: Route to appropriate handler
    let results: { emailResult: ServiceResult; crmResult: ServiceResult };
    let hasEmailOperation = true;

    if (isContactLead(lead)) {
      results = await processContactLead(lead, referenceId);
    } else if (isProductLead(lead)) {
      results = await processProductLead(lead, referenceId);
    } else if (isNewsletterLead(lead)) {
      results = await processNewsletterLead(lead, referenceId);
      hasEmailOperation = false;
    } else {
      // This should never happen due to discriminated union
      throw new Error('Unknown lead type');
    }

    const { emailResult, crmResult } = results;
    const totalLatencyMs = pipelineTimer.stop();

    // Step 3: Emit metrics for service results
    emitServiceMetrics(emailResult, crmResult, hasEmailOperation);

    // Log individual failures
    if (hasEmailOperation && !emailResult.success) {
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

    // Step 4: At least one success = overall success
    const success = emailResult.success || crmResult.success;

    // Step 5: Log pipeline summary
    logPipelineSummary({
      referenceId,
      leadType: lead.type,
      emailResult,
      crmResult,
      totalLatencyMs,
      overallSuccess: success,
    });

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
    const totalLatencyMs = pipelineTimer.stop();

    logger.error('Lead processing unexpected error', {
      type: lead.type,
      referenceId,
      error: error instanceof Error ? error.message : 'Unknown error',
      totalLatencyMs,
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
