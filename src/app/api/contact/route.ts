/**
 * 联系表单API路由
 * Contact form API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import {
  checkRateLimit,
  getClientIP,
} from '@/app/api/contact/contact-api-utils';
import {
  getContactFormStats,
  processFormSubmission,
  validateAdminAccess,
  validateFormData,
} from '@/app/api/contact/contact-api-validation';

/**
 * POST /api/contact
 * 处理联系表单提交
 * Handle contact form submission
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);

  try {
    // 检查速率限制
    if (!checkRateLimit(clientIP)) {
      logger.warn('Rate limit exceeded', { ip: clientIP });
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        { status: 429 },
      );
    }

    // 解析请求体
    const body = await request.json();

    // 验证表单数据
    const validation = await validateFormData(body, clientIP);
    if (!validation.success || !validation.data) {
      return NextResponse.json(validation, { status: 400 });
    }

    const formData = validation.data;

    // 处理表单提交
    const submissionResult = await processFormSubmission(formData);

    // 记录成功提交
    const processingTime = Date.now() - startTime;
    logger.info('Contact form submitted successfully', {
      email: formData.email,
      company: formData.company,
      ip: clientIP,
      processingTime,
      emailSent: submissionResult.emailSent,
      recordCreated: submissionResult.recordCreated,
      emailMessageId: submissionResult.emailMessageId,
      airtableRecordId: submissionResult.airtableRecordId,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon.',
      messageId: submissionResult.emailMessageId,
      recordId: submissionResult.airtableRecordId,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error('Contact form submission failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: clientIP,
      processingTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
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
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');

    if (!validateAdminAccess(authHeader)) {
      logger.warn('Unauthorized access attempt to contact statistics');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/contact
 * 处理CORS预检请求
 * Handle CORS preflight requests
 */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
