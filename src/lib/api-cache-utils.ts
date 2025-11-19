import { NextResponse } from 'next/server';

type JsonResponseInit = Parameters<typeof NextResponse.json>[1];

export interface CacheControlOptions {
  /**
   * 缓存最大有效期（秒）
   */
  maxAge: number;
  /**
   * stale-while-revalidate 时间（秒），默认为 maxAge 的 2 倍
   */
  staleWhileRevalidate?: number;
  /**
   * 是否设置为私有缓存
   */
  isPrivate?: boolean;
}

/**
 * 生成统一的缓存响应头
 */
export function createCacheHeaders({
  maxAge,
  staleWhileRevalidate = maxAge * 2,
  isPrivate = false,
}: CacheControlOptions): Record<string, string> {
  const visibility = isPrivate ? 'private' : 'public';

  const cacheControl = [
    visibility,
    `max-age=${maxAge}`,
    `s-maxage=${maxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`,
  ].join(', ');

  return {
    'Cache-Control': cacheControl,
    'CDN-Cache-Control': `${visibility}, s-maxage=${maxAge}`,
    'Vercel-CDN-Cache-Control': `${visibility}, s-maxage=${maxAge}`,
  };
}

/**
 * 生成带缓存响应头的 JSON 响应
 */
export function createCachedResponse<T>(
  data: T,
  cacheOptions: CacheControlOptions,
  init?: JsonResponseInit,
) {
  const headers = new Headers(init?.headers ?? {});
  const cacheHeaders = createCacheHeaders(cacheOptions);

  Object.entries(cacheHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const responseInit: JsonResponseInit = { headers };

  if (init?.status !== undefined) {
    responseInit.status = init.status;
  }

  if (init?.statusText !== undefined) {
    responseInit.statusText = init.statusText;
  }

  return NextResponse.json(data, responseInit);
}
