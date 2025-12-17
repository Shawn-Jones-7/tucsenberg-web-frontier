/**
 * Product Inquiry API Route
 * Handles product-specific inquiries via product page drawer
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCorsPreflightResponse } from '@/lib/api/cors-utils';
import { getApiMessages, type ApiMessages } from '@/lib/api/get-request-locale';
import { safeParseJson } from '@/lib/api/safe-parse-json';
import { processLead, type LeadResult } from '@/lib/lead-pipeline';
import { LEAD_TYPES } from '@/lib/lead-pipeline/lead-schema';
import { logger } from '@/lib/logger';
import {
  checkDistributedRateLimit,
  createRateLimitHeaders,
} from '@/lib/security/distributed-rate-limit';
import {
  getClientIP,
  verifyTurnstile,
} from '@/app/api/contact/contact-api-utils';

// HTTP status codes as named constants
const HTTP_BAD_REQUEST = 400;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_INTERNAL_ERROR = 500;

interface SuccessResponseOptions {
  result: LeadResult;
  clientIP: string;
  processingTime: number;
  headers?: Headers;
  successMessage: string;
}

/**
 * Create success response for product inquiry
 */
function createSuccessResponse(options: SuccessResponseOptions): NextResponse {
  const { result, clientIP, processingTime, headers, successMessage } = options;
  logger.info('Product inquiry submitted successfully', {
    referenceId: result.referenceId,
    ip: clientIP,
    processingTime,
    emailSent: result.emailSent,
    recordCreated: result.recordCreated,
  });

  return NextResponse.json(
    {
      success: true,
      message: successMessage,
      referenceId: result.referenceId,
    },
    ...(headers ? [{ headers }] : []),
  );
}

interface ErrorResponseOptions {
  result: LeadResult;
  clientIP: string;
  processingTime: number;
  messages: ApiMessages;
}

/**
 * Create error response for failed inquiry
 */
function createErrorResponse(options: ErrorResponseOptions): NextResponse {
  const { result, clientIP, processingTime, messages } = options;
  logger.warn('Product inquiry submission failed', {
    error: result.error,
    ip: clientIP,
    processingTime,
  });

  const isValidationError = result.error === 'VALIDATION_ERROR';
  return NextResponse.json(
    {
      success: false,
      error: isValidationError
        ? messages.validationError
        : messages.inquiry.processingError,
    },
    { status: isValidationError ? HTTP_BAD_REQUEST : HTTP_INTERNAL_ERROR },
  );
}

interface RateLimitCheckResult {
  rateLimitResult: Awaited<ReturnType<typeof checkDistributedRateLimit>>;
  errorResponse?: NextResponse;
}

/**
 * Check rate limit and return early response if exceeded
 */
async function checkRateLimitOrFail(
  clientIP: string,
  messages: ApiMessages,
): Promise<RateLimitCheckResult> {
  const rateLimitResult = await checkDistributedRateLimit(clientIP, 'inquiry');
  if (!rateLimitResult.allowed) {
    logger.warn('Product inquiry rate limit exceeded', {
      ip: clientIP,
      retryAfter: rateLimitResult.retryAfter,
    });
    const headers = createRateLimitHeaders(rateLimitResult);
    return {
      rateLimitResult,
      errorResponse: NextResponse.json(
        { success: false, error: messages.rateLimit },
        { status: HTTP_TOO_MANY_REQUESTS, headers },
      ),
    };
  }
  return { rateLimitResult };
}

interface TurnstileValidationOptions {
  token: string | undefined;
  clientIP: string;
  messages: ApiMessages;
}

/**
 * Validate Turnstile token and return error response if invalid
 */
async function validateTurnstile(
  options: TurnstileValidationOptions,
): Promise<NextResponse | null> {
  const { token, clientIP, messages } = options;

  if (!token) {
    logger.warn('Product inquiry missing Turnstile token', { ip: clientIP });
    return NextResponse.json(
      { success: false, error: messages.inquiry.securityRequired },
      { status: HTTP_BAD_REQUEST },
    );
  }

  const isValid = await verifyTurnstile(token, clientIP);
  if (!isValid) {
    logger.warn('Product inquiry Turnstile verification failed', {
      ip: clientIP,
    });
    return NextResponse.json(
      {
        success: false,
        error: messages.inquiry.securityFailed,
      },
      { status: HTTP_BAD_REQUEST },
    );
  }

  return null;
}

/**
 * POST /api/inquiry
 * Handle product inquiry form submission
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  const messages = getApiMessages(request);

  try {
    const { rateLimitResult, errorResponse } = await checkRateLimitOrFail(
      clientIP,
      messages,
    );
    if (errorResponse) return errorResponse;

    const parsedBody = await safeParseJson<{
      turnstileToken?: string;
      [key: string]: unknown;
    }>(request, { route: '/api/inquiry' });

    if (!parsedBody.ok) {
      return NextResponse.json(
        { success: false, error: parsedBody.error },
        { status: HTTP_BAD_REQUEST },
      );
    }

    const turnstileError = await validateTurnstile({
      token: parsedBody.data?.turnstileToken,
      clientIP,
      messages,
    });
    if (turnstileError) return turnstileError;

    const { turnstileToken: _token, ...leadData } = parsedBody.data ?? {};
    const result = await processLead({ type: LEAD_TYPES.PRODUCT, ...leadData });
    const processingTime = Date.now() - startTime;
    const headers = createRateLimitHeaders(rateLimitResult);

    return result.success
      ? createSuccessResponse({
          result,
          clientIP,
          processingTime,
          headers,
          successMessage: messages.inquiry.success,
        })
      : createErrorResponse({ result, clientIP, processingTime, messages });
  } catch (error) {
    logger.error('Product inquiry submission failed unexpectedly', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: clientIP,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json(
      { success: false, error: messages.serverError },
      { status: HTTP_INTERNAL_ERROR },
    );
  }
}

/**
 * OPTIONS /api/inquiry
 * Handle CORS preflight requests
 */
export function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}
