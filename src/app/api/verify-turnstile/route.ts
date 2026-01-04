import { NextRequest, NextResponse } from 'next/server';
import { getApiMessages, type ApiMessages } from '@/lib/api/get-request-locale';
import { safeParseJson } from '@/lib/api/safe-parse-json';
import { env } from '@/lib/env';
import { logger, sanitizeIP } from '@/lib/logger';
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
function validateRequestBody(
  body: TurnstileVerificationRequest,
  messages: ApiMessages,
) {
  if (!body.token) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing token',
        message: messages.turnstile.missingToken,
      },
      { status: 400 },
    );
  }
  return null;
}

/**
 * Create verification error response
 */
function createVerificationErrorResponse(
  verificationResult: {
    success: boolean;
    errorCodes?: string[];
  },
  messages: ApiMessages,
) {
  return NextResponse.json(
    {
      success: false,
      error: 'Verification failed',
      message: messages.turnstile.verificationFailed,
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
function createNetworkErrorResponse(
  verifyError: Error,
  clientIP: string,
  messages: ApiMessages,
) {
  logger.error('Turnstile verification request failed', {
    error: verifyError,
    clientIP: sanitizeIP(clientIP),
  });
  return NextResponse.json(
    {
      success: false,
      error: 'Verification request failed',
      message: messages.turnstile.networkError,
    },
    { status: 500 },
  );
}

/**
 * Check if Turnstile is configured
 */
function checkTurnstileConfigured(messages: ApiMessages): NextResponse | null {
  if (!env.TURNSTILE_SECRET_KEY) {
    return NextResponse.json(
      {
        success: false,
        error: 'Turnstile not configured',
        message: messages.turnstile.notConfigured,
      },
      { status: 500 },
    );
  }
  return null;
}

/**
 * Verify Cloudflare Turnstile token
 *
 * This endpoint verifies the Turnstile token on the server side
 * to ensure the user has passed the bot protection challenge.
 * Uses the shared verifyTurnstile function for consistency.
 */
export async function POST(request: NextRequest) {
  const messages = getApiMessages(request);

  try {
    const configError = checkTurnstileConfigured(messages);
    if (configError) return configError;

    const parsedBody = await safeParseJson<TurnstileVerificationRequest>(
      request,
      { route: '/api/verify-turnstile' },
    );
    if (!parsedBody.ok) {
      return NextResponse.json(
        { success: false, error: parsedBody.error },
        { status: 400 },
      );
    }

    const validationError = validateRequestBody(parsedBody.data, messages);
    if (validationError) return validationError;

    // SECURITY: Always use server-derived IP - never trust client-provided IP
    const clientIP = getFullClientIPChain(request);

    let verificationResult: { success: boolean; errorCodes?: string[] };
    try {
      verificationResult = await verifyTurnstileDetailed(
        parsedBody.data.token,
        clientIP,
      );
    } catch (verifyError) {
      return createNetworkErrorResponse(
        verifyError as Error,
        clientIP,
        messages,
      );
    }

    if (!verificationResult.success) {
      return createVerificationErrorResponse(verificationResult, messages);
    }

    return NextResponse.json(
      { success: true, message: messages.turnstile.success },
      { status: 200 },
    );
  } catch (error) {
    logger.error('Error verifying Turnstile token', { error: error as Error });
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: messages.serverError,
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
