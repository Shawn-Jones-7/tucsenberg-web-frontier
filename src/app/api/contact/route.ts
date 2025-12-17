/**
 * 联系表单API路由
 * Contact form API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCorsPreflightResponse } from '@/lib/api/cors-utils';
import { getApiMessages } from '@/lib/api/get-request-locale';
import { safeParseJson } from '@/lib/api/safe-parse-json';
import { logger } from '@/lib/logger';
import {
  checkDistributedRateLimit,
  createRateLimitHeaders,
  type RateLimitPreset,
} from '@/lib/security/distributed-rate-limit';
import { getClientIP } from '@/app/api/contact/contact-api-utils';
import {
  getContactFormStats,
  processFormSubmission,
  validateAdminAccess,
  validateFormData,
} from '@/app/api/contact/contact-api-validation';

/**
 * Check rate limit and return early response if exceeded
 */
async function checkRateLimitOrFail(
  clientIP: string,
  preset: RateLimitPreset,
  rateLimitMessage: string,
): Promise<{
  rateLimitResult: Awaited<ReturnType<typeof checkDistributedRateLimit>>;
  errorResponse?: NextResponse;
}> {
  const rateLimitResult = await checkDistributedRateLimit(clientIP, preset);
  if (!rateLimitResult.allowed) {
    logger.warn('Rate limit exceeded', {
      ip: clientIP,
      retryAfter: rateLimitResult.retryAfter,
    });
    const headers = createRateLimitHeaders(rateLimitResult);
    return {
      rateLimitResult,
      errorResponse: NextResponse.json(
        { success: false, error: rateLimitMessage },
        { status: 429, headers },
      ),
    };
  }
  return { rateLimitResult };
}

/**
 * POST /api/contact
 * 处理联系表单提交
 * Handle contact form submission
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  const messages = getApiMessages(request);

  try {
    const { rateLimitResult, errorResponse } = await checkRateLimitOrFail(
      clientIP,
      'contact',
      messages.rateLimit,
    );
    if (errorResponse) return errorResponse;

    const parsedBody = await safeParseJson<unknown>(request, {
      route: '/api/contact',
    });
    if (!parsedBody.ok) {
      return NextResponse.json(
        { success: false, error: parsedBody.error },
        { status: 400 },
      );
    }

    const validation = await validateFormData(parsedBody.data, clientIP);
    if (!validation.success || !validation.data) {
      return NextResponse.json(validation, { status: 400 });
    }

    const submissionResult = await processFormSubmission(validation.data);
    const processingTime = Date.now() - startTime;

    logger.info('Contact form submitted successfully', {
      email: validation.data.email,
      company: validation.data.company,
      ip: clientIP,
      processingTime,
      emailSent: submissionResult.emailSent,
      recordCreated: submissionResult.recordCreated,
    });

    return NextResponse.json(
      {
        success: true,
        message: messages.contact.success,
        messageId: submissionResult.emailMessageId,
        recordId: submissionResult.airtableRecordId,
      },
      { headers: createRateLimitHeaders(rateLimitResult) },
    );
  } catch (error) {
    logger.error('Contact form submission failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: clientIP,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: messages.serverError,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/contact
 * 获取联系表单统计信息（仅管理员）
 * Get contact form statistics (admin only)
 */
export async function GET(request: NextRequest) {
  const messages = getApiMessages(request);

  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');

    if (!validateAdminAccess(authHeader)) {
      logger.warn('Unauthorized access attempt to contact statistics');
      return NextResponse.json(
        { success: false, error: messages.unauthorized },
        { status: 401 },
      );
    }

    // 获取统计信息
    const statsResult = await getContactFormStats();

    return NextResponse.json(statsResult);
  } catch (error) {
    logger.error('Failed to get contact statistics', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { success: false, error: messages.contact.statsError },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/contact
 * 处理CORS预检请求
 * Handle CORS preflight requests
 */
export function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request, ['GET'], ['Authorization']);
}
