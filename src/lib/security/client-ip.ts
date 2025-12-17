/**
 * Trusted Proxy Model - Client IP Extraction
 *
 * Extracts client IP from request headers with platform-specific trust rules.
 * Only parses proxy headers when request comes from a trusted platform entry.
 *
 * Security: X-Forwarded-For can be spoofed by clients. This module only
 * trusts proxy headers when DEPLOYMENT_PLATFORM is configured, preventing
 * direct connection spoofing.
 */

import { isIP } from 'net';
import { NextRequest } from 'next/server';

/**
 * Trusted proxy configuration per platform
 */
interface TrustedProxyConfig {
  /** Headers to trust in order of preference */
  trustedHeaders: string[];
  /** Optional: Validate that request comes from CDN IP ranges */
  cdnIpRanges?: string[];
}

/**
 * Platform-specific proxy configurations
 *
 * Vercel: Automatically strips client-provided X-Forwarded-For
 * Cloudflare: Use cf-connecting-ip (set by Cloudflare edge)
 * Development: Accept headers for local testing
 *
 * NOTE on cdnIpRanges: These IP ranges are defined but not currently validated.
 * To implement source IP validation (defense against origin bypass):
 * 1. Check if request.ip is within cdnIpRanges before trusting headers
 * 2. If not from CDN IP, fall back to request.ip or reject
 *
 * This provides defense-in-depth if origin is accidentally exposed.
 */
const PROXY_CONFIGS: Record<string, TrustedProxyConfig> = {
  vercel: {
    // Vercel strips client-provided X-Forwarded-For, safe to trust
    trustedHeaders: ['x-real-ip', 'x-forwarded-for'],
  },
  cloudflare: {
    // cf-connecting-ip is set by Cloudflare edge, most reliable
    trustedHeaders: ['cf-connecting-ip', 'x-forwarded-for'],
    // TODO: Implement source IP validation using these ranges
    // Common Cloudflare IP ranges (not exhaustive, for reference)
    // Latest ranges: https://www.cloudflare.com/ips/
    cdnIpRanges: [
      '173.245.48.0/20',
      '103.21.244.0/22',
      '103.22.200.0/22',
      '103.31.4.0/22',
      '141.101.64.0/18',
      '108.162.192.0/18',
      '190.93.240.0/20',
      '188.114.96.0/20',
      '197.234.240.0/22',
      '198.41.128.0/17',
      '162.158.0.0/15',
      '104.16.0.0/13',
      '104.24.0.0/14',
      '172.64.0.0/13',
      '131.0.72.0/22',
    ],
  },
  development: {
    // Accept headers for local testing (less secure)
    trustedHeaders: ['x-forwarded-for', 'x-real-ip'],
  },
};

/** Default fallback IP when none can be determined */
const FALLBACK_IP = '0.0.0.0';

/** Development localhost IP */
const LOCALHOST_IP = '127.0.0.1';

/**
 * Get deployment platform from environment
 *
 * @returns Platform name or null if not configured
 */
function getDeploymentPlatform(): string | null {
  const platform = process.env.DEPLOYMENT_PLATFORM;

  if (!platform) {
    // Auto-detect common platforms
    if (process.env.VERCEL) {
      return 'vercel';
    }
    if (process.env.CF_PAGES) {
      return 'cloudflare';
    }
    if (process.env.NODE_ENV === 'development') {
      return 'development';
    }
    return null;
  }

  return platform.toLowerCase();
}

/**
 * Parse first IP from X-Forwarded-For header
 *
 * X-Forwarded-For format: "client, proxy1, proxy2"
 * We only want the first (leftmost) IP which is the original client.
 * Port suffix is stripped if present to ensure consistent rate limiting.
 *
 * @param headerValue - Raw header value
 * @returns First IP address, trimmed and normalized (port stripped)
 */
function parseFirstIP(headerValue: string): string {
  const firstIP = headerValue.split(',')[0];
  if (!firstIP) return '';
  return stripPort(firstIP.trim());
}

/**
 * Strip port from IP address if present
 *
 * Handles formats: "192.168.1.1:8080", "[::1]:8080"
 *
 * @param ip - IP string possibly containing port
 * @returns IP without port suffix
 */
function stripPort(ip: string): string {
  // IPv6 with port: [::1]:8080
  if (ip.startsWith('[')) {
    const bracketEnd = ip.indexOf(']');
    if (bracketEnd !== -1) {
      return ip.slice(1, bracketEnd);
    }
  }

  // IPv4 with port: 192.168.1.1:8080
  // Only strip if there's exactly one colon (IPv6 has multiple)
  const colonCount = (ip.match(/:/g) ?? []).length;
  if (colonCount === 1) {
    return ip.split(':')[0] ?? ip;
  }

  return ip;
}

/**
 * Validate IP address using Node.js net.isIP()
 *
 * Uses the built-in Node.js IP validation which correctly handles:
 * - IPv4 octet range (0-255)
 * - IPv6 format variations
 * - Edge cases that regex patterns miss
 *
 * @param ip - IP string to validate
 * @returns true if valid IPv4 or IPv6 address
 */
function isValidIP(ip: string): boolean {
  if (!ip || ip === 'unknown') {
    return false;
  }

  // Strip port if present
  const cleanIP = stripPort(ip.trim());

  // net.isIP returns 4 for IPv4, 6 for IPv6, 0 for invalid
  return isIP(cleanIP) !== 0;
}

/**
 * Get IP from Next.js request object (handles optional ip property)
 * Returns normalized IP with port stripped for consistent rate limiting.
 */
function getNextJsIP(request: NextRequest): string | null {
  const requestIP = (request as NextRequest & { ip?: string }).ip;
  if (!requestIP) return null;

  const cleanIP = stripPort(requestIP.trim());
  return isValidIP(cleanIP) ? cleanIP : null;
}

/**
 * Get platform-specific proxy config
 */
function getPlatformConfig(platform: string): TrustedProxyConfig | undefined {
  if (platform === 'vercel') return PROXY_CONFIGS.vercel;
  if (platform === 'cloudflare') return PROXY_CONFIGS.cloudflare;
  if (platform === 'development') return PROXY_CONFIGS.development;
  return undefined;
}

/**
 * Try to extract IP from trusted headers
 */
function getIPFromTrustedHeaders(
  request: NextRequest,
  config: TrustedProxyConfig,
): string | null {
  for (const headerName of config.trustedHeaders) {
    const headerValue = request.headers.get(headerName);
    if (headerValue) {
      const ip = parseFirstIP(headerValue);
      if (isValidIP(ip)) return ip;
    }
  }
  return null;
}

/**
 * Extract client IP from request using trusted proxy model
 *
 * Only trusts proxy headers when request comes from a known platform.
 * For direct connections without trusted proxy, ignores all proxy headers.
 *
 * @param request - Next.js request object
 * @returns Client IP address
 *
 * @example
 * ```typescript
 * const clientIP = getClientIP(request);
 * // On Vercel: extracts from x-real-ip or x-forwarded-for
 * // On Cloudflare: extracts from cf-connecting-ip
 * // Direct connection: returns framework IP or fallback
 * ```
 */
export function getClientIP(request: NextRequest): string {
  const platform = getDeploymentPlatform();

  // If no platform configured, don't trust proxy headers (security)
  if (!platform) {
    return getNextJsIP(request) ?? FALLBACK_IP;
  }

  const config = getPlatformConfig(platform);
  if (!config) {
    return getNextJsIP(request) ?? FALLBACK_IP;
  }

  // Try trusted headers first
  const headerIP = getIPFromTrustedHeaders(request, config);
  if (headerIP) return headerIP;

  // Fallback to Next.js IP
  const nextIP = getNextJsIP(request);
  if (nextIP) return nextIP;

  // Development localhost fallback
  if (platform === 'development') return LOCALHOST_IP;

  return FALLBACK_IP;
}

/**
 * Get all IPs in the proxy chain (for debugging/logging)
 *
 * @param request - Next.js request object
 * @returns Array of IP addresses in the chain
 */
export function getIPChain(request: NextRequest): string[] {
  const chain: string[] = [];

  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const ips = xff.split(',').map((ip) => ip.trim());
    chain.push(...ips.filter(isValidIP));
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP && isValidIP(realIP) && !chain.includes(realIP)) {
    chain.push(realIP);
  }

  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP && isValidIP(cfIP) && !chain.includes(cfIP)) {
    chain.unshift(cfIP); // Cloudflare IP is authoritative
  }

  // Add request.ip if not already present
  const nextIP = getNextJsIP(request);
  if (nextIP && !chain.includes(nextIP)) {
    chain.push(nextIP);
  }

  return chain;
}
