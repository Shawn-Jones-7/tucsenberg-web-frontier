// Sentry instrumentation client placeholder
// ----------------------------------------
//
// 当前阶段项目未启用 Sentry，为了保持接口兼容性并避免不必要的
// 动态依赖与构建警告，这里仅保留最小的占位导出。
//
// 如果后续需要接入 Sentry，可以在此文件中重新添加初始化逻辑，
// 并根据需要启用性能监控等功能。

/**
 * 路由切换钩子占位实现。
 * 未来如需启用 Sentry 的路由性能监控，可以在此处接入。
 */
export const onRouterTransitionStart = function noOpRouterTransition() {
  // intentionally left blank
};
