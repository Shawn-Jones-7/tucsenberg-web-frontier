import { NextRequest, NextResponse } from 'next/server';
import { safeParseJson } from '@/lib/api/safe-parse-json';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import {
  getFullClientIPChain,
  verifyTurnstileDetailed,
} from '@/app/api/contact/contact-api-utils';

/**
 * Request body interface for Turnstile verification.
 *
 * SECURITY NOTE: Client IP is intentionally NOT accepted from request body.
 * The server MUST derive the client IP from trusted request headers
 * (X-Forwarded-For, X-Real-IP) to prevent IP spoofing attacks that could
 * bypass Turnstile's risk analysis.
 */
interface TurnstileVerificationRequest {
  token: string;
}

/**
 * Validate request body
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
 * Create verification error response
 */
function createVerificationErrorResponse(verificationResult: {
  success: boolean;
  errorCodes?: string[];
}) {
  return NextResponse.json(
    {
      success: false,
      error: 'Verification failed',
      message: 'Bot protection challenge failed',
      ...(verificationResult.errorCodes
        ? { errorCodes: verificationResult.errorCodes }
        : {}),
    },
    { status: 400 },
  );
}

/**
 * Create network error response
 */
function createNetworkErrorResponse(verifyError: Error, clientIP: string) {
  logger.error('Turnstile verification request failed', {
    error: verifyError,
    clientIP,
  });
  return NextResponse.json(
    {
      success: false,
      error: 'Verification request failed',
      message: 'Failed to communicate with bot protection service',
    },
    { status: 500 },
  );
}

/**
 * Verify Cloudflare Turnstile token
 *
 * This endpoint verifies the Turnstile token on the server side
 * to ensure the user has passed the bot protection challenge.
 * Uses the shared verifyTurnstile function for consistency.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Turnstile is configured
    if (!env.TURNSTILE_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Turnstile not configured',
          message: 'Bot protection is not properly configured on the server',
        },
        { status: 500 },
      );
    }

    // Parse request body (safe JSON parse)
    const parsedBody = await safeParseJson<TurnstileVerificationRequest>(
      request,
      {
        route: '/api/verify-turnstile',
      },
    );
    if (!parsedBody.ok) {
      return NextResponse.json(
        {
          success: false,
          error: parsedBody.error,
        },
        { status: 400 },
      );
    }
    const body = parsedBody.data;

    // Validate request body
    const validationError = validateRequestBody(body);
    if (validationError) {
      return validationError;
    }

    // SECURITY: Always use server-derived IP - never trust client-provided IP
    // This prevents attackers from spoofing their IP to bypass Turnstile risk analysis
    const clientIP = getFullClientIPChain(request);

    // Use shared verifyTurnstile function with detailed result
    let verificationResult: { success: boolean; errorCodes?: string[] };
    try {
      verificationResult = await verifyTurnstileDetailed(body.token, clientIP);
    } catch (verifyError) {
      return createNetworkErrorResponse(verifyError as Error, clientIP);
    }

    if (!verificationResult.success) {
      return createVerificationErrorResponse(verificationResult);
    }

    // Verification successful
    return NextResponse.json(
      {
        success: true,
        message: 'Verification successful',
      },
      { status: 200 },
    );
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
