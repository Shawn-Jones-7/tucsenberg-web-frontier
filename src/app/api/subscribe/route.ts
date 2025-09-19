import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import {
  COUNT_FIVE,
  HTTP_BAD_REQUEST_CONST,
  HTTP_OK_CONST,
  PERCENTAGE_FULL,
} from '@/constants';

export const dynamic = 'force-dynamic';

// 邮件订阅请求验证模式
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  pageType: z.enum(['products', 'blog', 'about', 'contact']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, pageType } = subscribeSchema.parse(body);

    // TODO: 集成实际的邮件服务 (Resend)
    // 这里可以添加以下功能：
    // 1. 将邮箱地址保存到数据库
    // 2. 发送确认邮件
    // 3. 添加到邮件列表

    // 记录订阅信息
    logger.info('新的邮件订阅', {
      email,
      pageType,
      timestamp: new Date().toISOString(),
    });

    // 模拟处理延迟
    const SIMULATED_DELAY_MS = PERCENTAGE_FULL * COUNT_FIVE; // 500ms
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to notifications',
        email,
      },
      { status: HTTP_OK_CONST },
    );
  } catch (_error) {
    // 忽略错误变量
    logger.error(
      '邮件订阅错误',
      {},
      _error instanceof Error ? _error : new Error(String(_error)),
    );

    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email address',
          errors: _error.issues,
        },
        { status: HTTP_BAD_REQUEST_CONST },
      );
    }

    const HTTP_INTERNAL_SERVER_ERROR = PERCENTAGE_FULL * COUNT_FIVE; // 500
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server _error',
      },
      { status: HTTP_INTERNAL_SERVER_ERROR },
    );
  }
}

// 处理 OPTIONS 请求 (CORS)
export function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
