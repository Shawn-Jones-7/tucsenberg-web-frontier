import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import type { CSPReport } from '@/config/security';
import { env } from '@/../env.mjs';

/**
 * CSP Report endpoint
 *
 * This endpoint receives Content Security Policy violation reports
 * and logs them for security monitoring and debugging.
 */
export async function POST(request: NextRequest) {
  try {
    // Only process CSP reports in production or when explicitly enabled
    if (env.NODE_ENV === 'development' && !env.CSP_REPORT_URI) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const contentType = request.headers.get('content-type');

    // Validate content type
    if (!contentType || !contentType.includes('application/csp-report')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 },
      );
    }

    // Parse the CSP report
    const report: CSPReport = await request.json();

    // Validate report structure
    if (!report['csp-report']) {
      return NextResponse.json(
        { error: 'Invalid CSP report format' },
        { status: 400 },
      );
    }

    const cspReport = report['csp-report'];

    // Extract relevant information
    const violationData = {
      timestamp: new Date().toISOString(),
      documentUri: cspReport['document-uri'],
      referrer: cspReport.referrer,
      violatedDirective: cspReport['violated-directive'],
      effectiveDirective: cspReport['effective-directive'],
      originalPolicy: cspReport['original-policy'],
      blockedUri: cspReport['blocked-uri'],
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
      sourceFile: cspReport['source-file'],
      statusCode: cspReport['status-code'],
      scriptSample: cspReport['script-sample'],
      disposition: cspReport.disposition,
      userAgent: request.headers.get('user-agent'),
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
    };

    // Log the violation
    const JSON_INDENT = 2;
    logger.warn(
      'CSP Violation Report:',
      JSON.stringify(violationData, null, JSON_INDENT),
    );

    // In production, you might want to send this to a monitoring service
    if (env.NODE_ENV === 'production') {
      // Example: Send to Sentry, DataDog, or other monitoring service
      // await sendToMonitoringService(violationData);

      // For now, log through our logger (silent in production)
      logger.error('Production CSP Violation:', violationData);
    }

    // Check for common violation patterns that might indicate attacks
    const suspiciousPatterns = [
      'eval',
      'data:text/html',
      'vbscript:',
      'onload',
      'onerror',
      'onclick',
    ];

    const isSuspicious = suspiciousPatterns.some(
      (pattern) =>
        cspReport['blocked-uri']?.toLowerCase().includes(pattern) ||
        cspReport['script-sample']?.toLowerCase().includes(pattern),
    );

    if (isSuspicious) {
      logger.error('SUSPICIOUS CSP VIOLATION DETECTED:', violationData);

      // In production, you might want to trigger additional security measures
      // such as rate limiting, IP blocking, or alerting
    }

    // Return success response
    return NextResponse.json(
      {
        status: 'received',
        timestamp: violationData.timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error('Error processing CSP report:', error as unknown);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * Handle GET requests (for health checks)
 */
export function GET() {
  return NextResponse.json(
    {
      status: 'CSP report endpoint active',
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
