import { NextRequest, NextResponse } from 'next/server';
import { safeParseJson as safeParseJsonHelper } from '@/lib/api/safe-parse-json';
import { withIdempotency } from '@/lib/idempotency';
import { processLead, type LeadResult } from '@/lib/lead-pipeline';
import { LEAD_TYPES } from '@/lib/lead-pipeline/lead-schema';
import { logger } from '@/lib/logger';
import {
  checkRateLimit,
  getClientIP,
  verifyTurnstile,
} from '@/app/api/contact/contact-api-utils';
import { COUNT_TEN, HTTP_BAD_REQUEST_CONST } from '@/constants';

// HTTP status codes as named constants
const HTTP_INTERNAL_ERROR = 500;
const HTTP_TOO_MANY_REQUESTS = 429;

type SafeParseSuccess<T> = { ok: true; data: T };
type SafeParseFailure = { ok: false; error: string };

function safeParseJson<T>(
  req: NextRequest,
): Promise<SafeParseSuccess<T> | SafeParseFailure> {
  // 复用通用 safeParseJson helper，统一 JSON 解析行为和 INVALID_JSON 语义
  return safeParseJsonHelper<T>(req, { route: '/api/subscribe' });
}

/**
 * Create success response for newsletter subscription
 */
function createSuccessResponse(result: LeadResult, email: string): object {
  logger.info('Newsletter subscription successful', {
    referenceId: result.referenceId,
    email,
  });

  return {
    success: true,
    message: 'Successfully subscribed to notifications',
    email,
    referenceId: result.referenceId,
  };
}

/**
 * Create error response for failed subscription
 */
function createErrorResponse(result: LeadResult): NextResponse {
  logger.warn('Newsletter subscription failed', { error: result.error });

  const isValidationError = result.error === 'VALIDATION_ERROR';
  return NextResponse.json(
    {
      success: false,
      message: isValidationError
        ? 'Invalid email address'
        : 'An error occurred. Please try again.',
    },
    {
      status: isValidationError ? HTTP_BAD_REQUEST_CONST : HTTP_INTERNAL_ERROR,
    },
  );
}

export function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Check rate limit (10 requests per minute for newsletter)
  if (!checkRateLimit(clientIP, COUNT_TEN)) {
    logger.warn('Newsletter rate limit exceeded', { ip: clientIP });
    return NextResponse.json(
      {
        success: false,
        message: 'Too many requests. Please try again later.',
      },
      { status: HTTP_TOO_MANY_REQUESTS },
    );
  }

  // 使用幂等键中间件包装处理逻辑
  return withIdempotency(request, async () => {
    const parsedBody = await safeParseJson<{
      email?: string;
      pageType?: string;
      turnstileToken?: string;
    }>(request);

    if (!parsedBody.ok) {
      return NextResponse.json(
        {
          success: false,
          error: parsedBody.error,
        },
        { status: HTTP_BAD_REQUEST_CONST },
      );
    }

    const email = parsedBody.data?.email;
    const turnstileToken = parsedBody.data?.turnstileToken;

    if (email === undefined || email === '') {
      return NextResponse.json(
        {
          success: false,
          message: 'Email is required',
        },
        { status: HTTP_BAD_REQUEST_CONST },
      );
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      logger.warn('Newsletter subscription missing Turnstile token', {
        ip: clientIP,
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Security verification required',
        },
        { status: HTTP_BAD_REQUEST_CONST },
      );
    }

    const isValidTurnstile = await verifyTurnstile(turnstileToken, clientIP);
    if (!isValidTurnstile) {
      logger.warn('Newsletter Turnstile verification failed', { ip: clientIP });
      return NextResponse.json(
        {
          success: false,
          message: 'Security verification failed. Please try again.',
        },
        { status: HTTP_BAD_REQUEST_CONST },
      );
    }

    // Prepare lead input for newsletter subscription
    const leadInput = {
      type: LEAD_TYPES.NEWSLETTER,
      email,
    };

    // Process via unified Lead Pipeline
    const result = await processLead(leadInput);

    return result.success
      ? createSuccessResponse(result, email)
      : createErrorResponse(result);
  });
}

// 处理 OPTIONS 请求 (CORS)
export function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key',
    },
  });
}
