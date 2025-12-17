# Dependency Upgrade（分阶段升级策略）

升级依赖像“换发动机”：最怕一次把所有零件都换了，结果不知道是哪一颗螺丝出的问题。本项目 Next.js/React/TypeScript 版本偏前沿，且有 webhook/安全头/测试门禁，建议采用**小步升级 + 强验证**。

## 什么时候需要这份流程
- 升级 `next` / `react` / `typescript` 等核心依赖
- 发现 `pnpm audit` / Semgrep 告警需要升级
- CI 出现依赖冲突、lockfile 漂移、或 bundle/性能回归

## 升级策略（推荐）

### A) 先定升级类型（影响评估）
- **Patch**：通常低风险，但仍要跑 `pnpm ci:local:quick`
- **Minor**：关注行为变化与 deprecations
- **Major**：必须分阶段，保留可回滚路径

### B) 分阶段升级（避免“全家桶一起升”）
1. 单次只升级 1 个“核心轴”（例如先 `typescript`，再 `next`，再其他）
2. 每步都通过门禁后再继续下一步

### C) 依赖树与冲突排查

```bash
pnpm why <pkg>
pnpm list <pkg>
pnpm outdated
```

## 升级后必须通过的验证（与本项目门禁对齐）

```bash
pnpm type-check
pnpm lint:check
pnpm test
pnpm build
pnpm quality:gate:fast
```

变更涉及路由/渲染/国际化/安全头时，建议额外跑：

```bash
pnpm test:e2e
pnpm perf:lighthouse
```

## 常见风险提示（本项目特有）
- **Next.js 16 / Cache Components**：缓存与 runtime API 的约束更严格，升级后要重点关注 `cookies()`/`headers()` 与 `"use cache"` 的组合（见 `/.claude/rules/architecture.md`）。
- **CSP/第三方脚本域名**：升级可能改变内联脚本/样式注入方式，需验证响应头是否仍包含预期 CSP（见 `src/config/security.ts` 与 `middleware.ts`）。

