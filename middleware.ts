import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { generateNonce, getSecurityHeaders } from '@/config/security';
// Use routing-config instead of routing to avoid importing React Server Component code
// which is not compatible with Edge Runtime
import { routing } from '@/i18n/routing-config';

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
}

function extractLocaleCandidate(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean);
  const candidate = segments[0];
  return candidate && SUPPORTED_LOCALES.has(candidate) ? candidate : undefined;
}

function setLocaleCookie(resp: NextResponse, locale: string): void {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    resp.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
    });
    resp.headers.append(
      'set-cookie',
      `NEXT_LOCALE=${locale}; Path=/; SameSite=Lax; HttpOnly${isProduction ? '; Secure' : ''}`,
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
  const existingLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (locale && existingLocale !== locale) {
    const resp = NextResponse.next();
    setLocaleCookie(resp, locale);
    addSecurityHeaders(resp, nonce);
    return resp;
  }
  return null;
}

function tryHandleInvalidLocalePrefix(
  request: NextRequest,
  nonce: string,
): NextResponse | null {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length < 2) {
    return null;
  }

  const [first, ...rest] = segments;

  // 已知 locale 前缀交由默认逻辑处理
  if (first && SUPPORTED_LOCALES.has(first)) {
    return null;
  }

  // 尝试将余下路径解析为已知业务路径，例如 /invalid-lang/about -> /about
  const candidatePath = `/${rest.join('/')}`;
  const pathnames = routing.pathnames as Record<string, unknown> | undefined;
  const isKnownPath = Boolean(
    pathnames && Object.prototype.hasOwnProperty.call(pathnames, candidatePath),
  );

  if (!isKnownPath) {
    return null;
  }

  // 对于形如 /invalid-lang/about 但 about 为已知路径的情况，
  // 将请求安全重定向到默认语言版本，例如 /en/about
  const targetUrl = request.nextUrl.clone();
  targetUrl.pathname = `/${routing.defaultLocale}${candidatePath}`;

  const resp = NextResponse.redirect(targetUrl);
  setLocaleCookie(resp, routing.defaultLocale);
  addSecurityHeaders(resp, nonce);

  return resp;
}

export default function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const invalidLocaleHandled = tryHandleInvalidLocalePrefix(request, nonce);
  if (invalidLocaleHandled) return invalidLocaleHandled;

  const early = tryHandleExplicitLocalizedRequest(request, nonce);
  if (early) return early;

  const response = intlMiddleware(request);
  const locale = extractLocaleCandidate(request.nextUrl.pathname);
  const existingLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (response && locale && existingLocale !== locale)
    setLocaleCookie(response, locale);
  if (response) addSecurityHeaders(response, nonce);
  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // - … the `/admin` path (TinaCMS admin interface)
  // Root path `/` is now handled by middleware for proper locale detection
  matcher: ['/', '/((?!api|_next|_vercel|admin|.*\\..*).*)', '/(en|zh)/:path*'],
};
