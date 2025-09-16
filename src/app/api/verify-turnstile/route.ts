import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { env } from '@/../env.mjs';

interface TurnstileVerificationRequest {
  token: string;
  remoteip?: string;
}

interface TurnstileVerificationResponse {
  'success': boolean;
  'error-codes'?: string[];
  'challenge_ts'?: string;
  'hostname'?: string;
  'action'?: string;
  'cdata'?: string;
}

/**
 * 验证 Turnstile 配置
 */
function validateTurnstileConfig() {
  const secretKey = env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Turnstile not configured',
        message: 'Bot protection is not properly configured on the server',
      },
      { status: 500 },
    );
  }
  return secretKey;
}

/**
 * 验证请求体
 */
function validateRequestBody(body: TurnstileVerificationRequest) {
  if (!body.token) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing token',
        message: 'Turnstile token is required',
      },
      { status: 400 },
    );
  }
  return null;
}

/**
 * 获取客户端 IP
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * 调用 Cloudflare Turnstile 验证 API
 */
async function verifyWithCloudflare(
  secretKey: string,
  token: string,
  clientIP: string,
  remoteip?: string,
) {
  const verificationData = new URLSearchParams({
    secret: secretKey,
    response: token,
    remoteip: remoteip || clientIP,
  });

  const verificationResponse = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verificationData,
    },
  );

  if (!verificationResponse.ok) {
    logger.error('Turnstile verification request failed', {
      status: verificationResponse.status,
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Verification request failed',
        message: 'Failed to verify with Turnstile service',
      },
      { status: 500 },
    );
  }

  return verificationResponse.json();
}

/**
 * 处理验证结果
 */
function handleVerificationResult(
  result: TurnstileVerificationResponse,
  clientIP: string,
) {
  // Log verification attempt (for monitoring)
  logger.warn('Turnstile verification', {
    success: result.success,
    hostname: result.hostname,
    challenge_ts: result.challenge_ts,
    action: result.action,
    clientIP,
    timestamp: new Date().toISOString(),
  });

  if (!result.success) {
    logger.warn('Turnstile verification failed', {
      errorCodes: result['error-codes'],
      clientIP,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Verification failed',
        message: 'Bot protection challenge failed',
        errorCodes: result['error-codes'],
      },
      { status: 400 },
    );
  }

  // Verification successful
  return NextResponse.json(
    {
      success: true,
      message: 'Verification successful',
      challenge_ts: result.challenge_ts,
      hostname: result.hostname,
    },
    { status: 200 },
  );
}

/**
 * Verify Cloudflare Turnstile token
 *
 * This endpoint verifies the Turnstile token on the server side
 * to ensure the user has passed the bot protection challenge.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Turnstile is configured
    const secretKey = validateTurnstileConfig();
    if (secretKey instanceof NextResponse) {
      return secretKey;
    }

    // Parse request body
    const body: TurnstileVerificationRequest = await request.json();

    // Validate request body
    const validationError = validateRequestBody(body);
    if (validationError) {
      return validationError;
    }

    // Get client IP
    const clientIP = getClientIP(request);

    // Verify with Cloudflare
    const result = await verifyWithCloudflare(
      secretKey,
      body.token,
      clientIP,
      body.remoteip,
    );

    if (result instanceof NextResponse) {
      return result;
    }

    // Handle verification result
    return handleVerificationResult(result, clientIP);
  } catch (error) {
    logger.error('Error verifying Turnstile token', { error: error as Error });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while verifying the token',
      },
      { status: 500 },
    );
  }
}

/**
 * Handle GET requests (for health checks)
 */
export function GET() {
  const isConfigured = Boolean(env.TURNSTILE_SECRET_KEY);

  return NextResponse.json(
    {
      status: 'Turnstile verification endpoint active',
      configured: isConfigured,
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}

/**
 * Only allow POST and GET methods
 */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
