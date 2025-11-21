import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { generateNonce, getSecurityHeaders } from '@/config/security';
import { routing } from '@/i18n/routing';

// 创建 next-intl 中间件
const intlMiddleware = createMiddleware(routing);

// 支持的本地化前缀
const SUPPORTED_LOCALES = new Set(['en', 'zh']);

// 辅助函数：添加安全头到响应
function addSecurityHeaders(response: NextResponse, nonce: string): void {
  const securityHeaders = getSecurityHeaders(nonce);
  securityHeaders.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });
  response.headers.set('x-csp-nonce', nonce);
}

function extractLocaleCandidate(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean);
  const candidate = segments[0];
  return candidate && SUPPORTED_LOCALES.has(candidate) ? candidate : undefined;
}

function setLocaleCookie(resp: NextResponse, locale: string): void {
  try {
    resp.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    });
    resp.headers.append(
      'set-cookie',
      `NEXT_LOCALE=${locale}; Path=/; SameSite=Lax`,
    );
  } catch {
    // ignore cookie errors to keep middleware resilient
  }
}

function tryHandleExplicitLocalizedRequest(
  request: NextRequest,
  nonce: string,
): NextResponse | null {
  const locale = extractLocaleCandidate(request.nextUrl.pathname);
  if (locale && !request.cookies.get('NEXT_LOCALE')) {
    const resp = NextResponse.next();
    setLocaleCookie(resp, locale);
    addSecurityHeaders(resp, nonce);
    return resp;
  }
  return null;
}

export default function proxy(request: NextRequest) {
  const nonce = generateNonce();
  const early = tryHandleExplicitLocalizedRequest(request, nonce);
  if (early) return early;

  const response = intlMiddleware(request);
  const locale = extractLocaleCandidate(request.nextUrl.pathname);
  if (response && locale && !request.cookies.get('NEXT_LOCALE')) {
    setLocaleCookie(response, locale);
  }
  if (response) addSecurityHeaders(response, nonce);
  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // - … the root path (handled by root page.tsx)
  // - … the `/admin` path (TinaCMS admin interface)
  matcher: '/((?!api|_next|_vercel|admin|^$|.*\\..*).*)',
};
