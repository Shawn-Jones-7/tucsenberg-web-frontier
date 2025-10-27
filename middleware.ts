import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { generateNonce, getSecurityHeaders } from '@/config/security';
import { routing } from '@/i18n/routing';

// 创建 next-intl 中间件
const intlMiddleware = createMiddleware(routing);

// 辅助函数：添加安全头到响应
function addSecurityHeaders(response: NextResponse, nonce: string): void {
  const securityHeaders = getSecurityHeaders(nonce);
  securityHeaders.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });
  response.headers.set('x-csp-nonce', nonce);
}

export default function middleware(request: NextRequest) {
  // Generate nonce for CSP
  const nonce = generateNonce();

  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const localeCandidate = segments[0];
  const supportedLocales = new Set(['en', 'zh']);

  // 如果是显式本地化路径且缺少 NEXT_LOCALE，则直接放行并设置 Cookie
  if (
    localeCandidate &&
    supportedLocales.has(localeCandidate) &&
    !request.cookies.get('NEXT_LOCALE')
  ) {
    const resp = NextResponse.next();
    try {
      resp.cookies.set('NEXT_LOCALE', localeCandidate, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      });
      resp.headers.append('set-cookie', `NEXT_LOCALE=${localeCandidate}; Path=/; SameSite=Lax`);
    } catch {
      // ignore
    }
    addSecurityHeaders(resp, nonce);
    return resp;
  }

  // 其他情况：调用 next-intl 中间件（完全依赖其内置语言检测）
  const response = intlMiddleware(request);

  // 如果是显式本地化路径且缺少 NEXT_LOCALE，则设置 Cookie，便于 E2E 与后续请求读取
  try {
    if (response && localeCandidate && supportedLocales.has(localeCandidate)) {
      const hasLocaleCookie = request.cookies.get('NEXT_LOCALE');
      if (!hasLocaleCookie) {
        // 设置 Cookie（NextResponse API）
        response.cookies.set('NEXT_LOCALE', localeCandidate, {
          path: '/',
          httpOnly: false,
          sameSite: 'lax',
        });

        // 保障性：直接追加 Set-Cookie 头（某些运行时对 cookies.set 支持不一致）
        const cookieHeader = `NEXT_LOCALE=${localeCandidate}; Path=/; SameSite=Lax`;
        response.headers.append('set-cookie', cookieHeader);
      }
    }
  } catch {
    // no-op: 保持中间件健壮性
  }

  // 添加安全headers到响应
  if (response) {
    addSecurityHeaders(response, nonce);
  }

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