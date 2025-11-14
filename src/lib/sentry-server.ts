/**
 * Server-side Sentry wrapper (no-op placeholder).
 *
 * 当前阶段项目未启用 Sentry。为了避免在服务端引入不必要的依赖与
 * 构建警告，仅保留 captureException 的函数签名，内部实现为 no-op。
 *
 * 未来如果需要启用 Sentry，可以在本文件中补充真实实现，例如按需
 * 动态导入 @sentry/nextjs 并调用其 captureException。
 */

export function captureException(_error: unknown) {
  // no-op
}
