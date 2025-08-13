import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../env.mjs';

interface TurnstileVerificationRequest {
  token: string;
  remoteip?: string;
}

interface TurnstileVerificationResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
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
    const secretKey = env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Turnstile not configured',
          message: 'Bot protection is not properly configured on the server'
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body: TurnstileVerificationRequest = await request.json();

    if (!body.token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing token',
          message: 'Turnstile token is required'
        },
        { status: 400 }
      );
    }

    // Get client IP
    const clientIP = request.ip ||
                    request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    // Prepare verification request
    const verificationData = new URLSearchParams({
      secret: secretKey,
      response: body.token,
      remoteip: body.remoteip || clientIP,
    });

    // Verify with Cloudflare
    const verificationResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: verificationData,
      }
    );

    if (!verificationResponse.ok) {
      console.error('Turnstile verification request failed:', verificationResponse.status);
      return NextResponse.json(
        {
          success: false,
          error: 'Verification request failed',
          message: 'Failed to verify with Turnstile service'
        },
        { status: 500 }
      );
    }

    const result: TurnstileVerificationResponse = await verificationResponse.json();

    // Log verification attempt (for monitoring)
    console.warn('Turnstile verification:', {
      success: result.success,
      hostname: result.hostname,
      challenge_ts: result.challenge_ts,
      action: result.action,
      clientIP,
      timestamp: new Date().toISOString(),
    });

    if (!result.success) {
      console.warn('Turnstile verification failed:', {
        errorCodes: result['error-codes'],
        clientIP,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Verification failed',
          message: 'Bot protection challenge failed',
          errorCodes: result['error-codes']
        },
        { status: 400 }
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
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verifying Turnstile token:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while verifying the token'
      },
      { status: 500 }
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
    { status: 200 }
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
