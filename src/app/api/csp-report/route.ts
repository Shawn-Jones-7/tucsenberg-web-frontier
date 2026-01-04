import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import {
  checkDistributedRateLimit,
  createRateLimitHeaders,
} from '@/lib/security/distributed-rate-limit';
import type { CSPReport } from '@/config/security';

/** Zod schema for CSP report validation (all fields optional per browser behavior) */
const cspReportInnerSchema = z.object({
  'document-uri': z.string().optional(),
  'referrer': z.string().optional(),
  'violated-directive': z.string().optional(),
  'effective-directive': z.string().optional(),
  'original-policy': z.string().optional(),
  'disposition': z.string().optional(),
  'blocked-uri': z.string().optional(),
  'line-number': z.number().optional(),
  'column-number': z.number().optional(),
  'source-file': z.string().optional(),
  'status-code': z.number().optional(),
  'script-sample': z.string().optional(),
});

const cspReportSchema = z.object({
  'csp-report': cspReportInnerSchema,
});

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

async function parseAndValidateCSPReport(
  request: NextRequest,
): Promise<CSPReport | NextResponse> {
  const body = await request.text();
  if (!body.trim()) {
    return NextResponse.json(
      { error: 'Invalid CSP report format' },
      { status: 400 },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
  }

  const result = cspReportSchema.safeParse(parsed);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid CSP report format' },
      { status: 400 },
    );
  }

  // Check for empty csp-report (browser quirk)
  if (Object.keys(result.data['csp-report']).length === 0) {
    return NextResponse.json(
      { error: 'Invalid CSP report format' },
      { status: 200 },
    );
  }

  return result.data as CSPReport;
}

function logCSPViolation(
  request: NextRequest,
  cspReport: CSPReport['csp-report'],
): void {
  const violationData = buildViolationData(request, cspReport);
  logger.warn('CSP Violation Report:', JSON.stringify(violationData, null, 2));

  if (env.NODE_ENV === 'production') {
    logger.error('Production CSP Violation:', violationData);
  }

  if (isSuspiciousReport(cspReport)) {
    logger.error('SUSPICIOUS CSP VIOLATION DETECTED:', violationData);
  }
}

async function checkRateLimit(
  request: NextRequest,
): Promise<NextResponse | null> {
  const clientIP = getClientIp(request);
  const rateLimitResult = await checkDistributedRateLimit(clientIP, 'csp');
  if (!rateLimitResult.allowed) {
    const headers = createRateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers },
    );
  }
  return null;
}

async function processReport(request: NextRequest): Promise<NextResponse> {
  const contentType = request.headers.get('content-type');
  if (!isContentTypeValid(contentType)) {
    return NextResponse.json(
      { error: 'Unsupported Media Type' },
      { status: 400 },
    );
  }

  const report = await parseAndValidateCSPReport(request);
  if (report instanceof NextResponse) {
    return report;
  }

  const cspReport = report['csp-report'];
  logCSPViolation(request, cspReport);

  const violationData = buildViolationData(request, cspReport);
  return NextResponse.json(
    { status: 'received', timestamp: violationData.timestamp },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  try {
    if (isDevIgnored()) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return await processReport(request);
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
