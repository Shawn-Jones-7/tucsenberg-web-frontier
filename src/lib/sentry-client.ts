/*
 * Sentry client wrapper (no-op placeholder).
 *
 * 当前阶段项目未启用 Sentry。为了避免引入不必要的动态依赖和构建警告，
 * 这里保留与原先相同的函数签名，但内部全部实现为 no-op。
 *
 * 未来如果需要启用 Sentry，可以在本文件中补充真实实现（例如动态导入
 * @sentry/nextjs 并在这些函数中调用对应 API）。
 */

export function captureException(_error: unknown) {
  // no-op
}

export function captureMessage(_message: string, _level?: unknown) {
  // no-op
}

export function addBreadcrumb(_breadcrumb: unknown) {
  // no-op
}

export function setTag(_key: string, _value: string) {
  // no-op
}

export function setUser(_user: unknown) {
  // no-op
}

export function setContext(_name: string, _context: Record<string, unknown>) {
  // no-op
}
