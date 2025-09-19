import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { env } from '@/../env.mjs';
import type { CSPReport } from '@/config/security';

/**
 * CSP Report endpoint
 *
 * This endpoint receives Content Security Policy violation reports
 * and logs them for security monitoring and debugging.
 */
const isDevIgnored = () =>
  env.NODE_ENV === 'development' && !env.CSP_REPORT_URI;
const isContentTypeValid = (ct: string | null) =>
  Boolean(ct && ct.includes('application/csp-report'));
const getClientIp = (request: NextRequest) =>
  request.headers.get('x-forwarded-for') ||
  request.headers.get('x-real-ip') ||
  'unknown';
const buildViolationData = (
  request: NextRequest,
  cspReport: CSPReport['csp-report'],
) => ({
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
  ip: getClientIp(request),
});
const isSuspiciousReport = (csp: CSPReport['csp-report']) => {
  const patterns = [
    'eval',
    'data:text/html',
    'vbscript:',
    'onload',
    'onerror',
    'onclick',
  ];
  const blocked = csp['blocked-uri']?.toLowerCase() || '';
  const sample = csp['script-sample']?.toLowerCase() || '';
  return patterns.some((p) => blocked.includes(p) || sample.includes(p));
};

async function handleCspRequest(request: NextRequest) {
  try {
    if (isDevIgnored())
      return NextResponse.json({ status: 'ignored' }, { status: 200 });

    const contentType = request.headers.get('content-type');
    if (!isContentTypeValid(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 },
      );
    }

    const report: CSPReport = await request.json();
    const cspReport = report['csp-report'];
    if (!cspReport)
      return NextResponse.json(
        { error: 'Invalid CSP report format' },
        { status: 400 },
      );

    const violationData = buildViolationData(request, cspReport);
    logger.warn(
      'CSP Violation Report:',
      JSON.stringify(violationData, null, 2),
    );

    if (env.NODE_ENV === 'production') {
      logger.error('Production CSP Violation:', violationData);
    }

    if (isSuspiciousReport(cspReport)) {
      logger.error('SUSPICIOUS CSP VIOLATION DETECTED:', violationData);
    }

    return NextResponse.json(
      { status: 'received', timestamp: violationData.timestamp },
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

export function POST(request: NextRequest) {
  return handleCspRequest(request);
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
