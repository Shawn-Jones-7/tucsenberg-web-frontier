import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import {
  checkDistributedRateLimit,
  createRateLimitHeaders,
} from '@/lib/security/distributed-rate-limit';
import {
  handleIncomingMessage,
  verifyWebhook,
  verifyWebhookSignature,
} from '@/lib/whatsapp-service';

/**
 * WhatsApp Webhook Endpoint
 *
 * Handles Meta webhook verification (GET) and incoming messages (POST).
 * Uses unified whatsapp-service for all operations.
 */

// GET: Webhook verification
export function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (!mode || !token || !challenge) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      );
    }

    const verificationResult = verifyWebhook(mode, token, challenge);

    if (verificationResult) {
      return new NextResponse(verificationResult, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 403 },
    );
  } catch (error) {
    logger.error(
      'WhatsApp webhook verification error',
      {},
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST: Receive incoming messages
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // Verify webhook signature FIRST (before rate limiting)
    // Invalid signatures are rejected early without consuming rate limit quota
    if (!verifyWebhookSignature(rawBody, signature)) {
      logger.warn('[WhatsAppWebhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Rate limiting (only for valid signatures)
    const clientIP =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rateLimitResult = await checkDistributedRateLimit(
      clientIP,
      'whatsapp',
    );
    if (!rateLimitResult.allowed) {
      const headers = createRateLimitHeaders(rateLimitResult);
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers },
      );
    }

    // Parse JSON body
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Handle incoming message with auto-reply
    await handleIncomingMessage(body);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error(
      'WhatsApp webhook message handling error',
      {},
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 },
    );
  }
}
