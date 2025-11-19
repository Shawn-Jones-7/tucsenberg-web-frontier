/**
 * Idempotency Key Management
 *
 * 提供幂等键支持，防止重复请求导致的重复处理
 *
 * 使用方式：
 * 1. 客户端在请求头中添加 Idempotency-Key
 * 2. 服务端使用 withIdempotency 包装处理函数
 * 3. 重复请求会返回缓存的结果
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { HTTP_BAD_REQUEST, HTTP_OK } from '@/constants';

/**
 * 幂等键缓存接口
 */
interface IdempotencyCache {
  result: unknown;
  timestamp: number;
  statusCode: number;
}

/**
 * 幂等键缓存存储（内存实现）
 * 生产环境建议使用 Redis 或其他持久化存储
 */
const idempotencyCache = new Map<string, IdempotencyCache>();

/**
 * 缓存过期时间（24小时）
 */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * 清理过期缓存
 */
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of idempotencyCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      idempotencyCache.delete(key);
    }
  }
}

/**
 * 定期清理过期缓存（每小时）
 */
setInterval(cleanExpiredCache, 60 * 60 * 1000);

/**
 * 从请求中提取幂等键
 */
export function getIdempotencyKey(request: NextRequest): string | null {
  return request.headers.get('Idempotency-Key');
}

/**
 * 检查幂等键是否已存在
 */
export function checkIdempotencyKey(key: string): IdempotencyCache | undefined {
  const cached = idempotencyCache.get(key);
  if (cached) {
    // 检查是否过期
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      idempotencyCache.delete(key);
      return undefined;
    }
    return cached;
  }
  return undefined;
}

/**
 * 保存幂等键结果
 */
export function saveIdempotencyKey(
  key: string,
  result: unknown,
  statusCode: number = HTTP_OK,
): void {
  idempotencyCache.set(key, {
    result,
    timestamp: Date.now(),
    statusCode,
  });
}

/**
 * 处理有幂等键的请求
 */
async function handleWithIdempotencyKey<T>(
  idempotencyKey: string,
  handler: () => Promise<T>,
): Promise<NextResponse> {
  // 检查缓存
  const cached = checkIdempotencyKey(idempotencyKey);
  if (cached) {
    logger.info('Returning cached result for idempotency key', {
      key: idempotencyKey,
      age: Date.now() - cached.timestamp,
    });
    return NextResponse.json(cached.result, { status: cached.statusCode });
  }

  // 处理请求并缓存结果
  try {
    const result = await handler();
    saveIdempotencyKey(idempotencyKey, result, HTTP_OK);
    return NextResponse.json(result, { status: HTTP_OK });
  } catch (error) {
    logger.error('Request handler failed', {
      error: error as Error,
      idempotencyKey,
    });
    throw error;
  }
}

/**
 * 处理没有幂等键的请求
 */
async function handleWithoutIdempotencyKey<T>(
  handler: () => Promise<T>,
): Promise<NextResponse> {
  try {
    const result = await handler();
    return NextResponse.json(result, { status: HTTP_OK });
  } catch (error) {
    logger.error('Request handler failed', { error: error as Error });
    throw error;
  }
}

/**
 * 幂等键中间件
 *
 * 使用方式：
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   return withIdempotency(request, async () => {
 *     // 处理请求
 *     return { success: true };
 *   });
 * }
 * ```
 */
export function withIdempotency<T>(
  request: NextRequest,
  handler: () => Promise<T>,
  options: {
    required?: boolean; // 是否必须提供幂等键
    ttl?: number; // 自定义缓存过期时间（毫秒）
  } = {},
): Promise<NextResponse> {
  const { required = false } = options;
  const idempotencyKey = getIdempotencyKey(request);

  // 检查是否必须提供幂等键
  if (required && !idempotencyKey) {
    logger.warn('Missing required Idempotency-Key header');
    return Promise.resolve(
      NextResponse.json(
        {
          error: 'Missing Idempotency-Key header',
          message:
            'This endpoint requires an Idempotency-Key header to prevent duplicate requests',
        },
        { status: HTTP_BAD_REQUEST },
      ),
    );
  }

  // 根据是否有幂等键选择处理方式
  return idempotencyKey
    ? handleWithIdempotencyKey(idempotencyKey, handler)
    : handleWithoutIdempotencyKey(handler);
}

/**
 * 生成幂等键（客户端使用）
 *
 * 使用方式：
 * ```typescript
 * const idempotencyKey = generateIdempotencyKey();
 * fetch('/api/subscribe', {
 *   method: 'POST',
 *   headers: {
 *     'Idempotency-Key': idempotencyKey,
 *   },
 * });
 * ```
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now();

  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `${timestamp}-${crypto.randomUUID().replaceAll('-', '')}`;
  }

  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    const buf = new Uint32Array(3);
    crypto.getRandomValues(buf);
    const random = Array.from(buf, (value) =>
      value.toString(36).padStart(4, '0'),
    ).join('');
    return `${timestamp}-${random}`;
  }

  throw new Error('Secure random generator unavailable for idempotency key');
}

/**
 * 清除指定幂等键（用于测试或手动清理）
 */
export function clearIdempotencyKey(key: string): void {
  idempotencyCache.delete(key);
}

/**
 * 清除所有幂等键（用于测试）
 */
export function clearAllIdempotencyKeys(): void {
  idempotencyCache.clear();
}

/**
 * 获取缓存统计信息
 */
export function getIdempotencyCacheStats() {
  return {
    size: idempotencyCache.size,
    keys: Array.from(idempotencyCache.keys()),
  };
}
