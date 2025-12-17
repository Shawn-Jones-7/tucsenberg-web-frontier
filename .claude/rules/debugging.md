# Debugging（系统化排障）

把 Debug 当成“做实验”：先复现，再提出假设，再用最小成本的实验去证伪。比起“改一把试试”，这套流程更适合你们这种有 `quality:gate`、E2E、CSP、外部服务集成的工程。

## 触发场景（什么时候用这套流程）
- CI 失败但本地偶现/难复现
- 只在 production build（`next build` / `next start`）出问题
- API route / webhook 行为异常（401/403/429/500）
- CSP / 第三方脚本导致的前端报错、资源被拦截
- 性能回归（Lighthouse / Web Vitals 指标变差）

## 三步法（最小可执行）

### 1) 复现（先稳定复现，再谈修）
- 记录：触发步骤、期望 vs 实际、环境（Node/pnpm）、报错原文
- 优先在 production 模式复现：`pnpm build && pnpm start`（很多 hydration/CSP/缓存问题只在这里出现）

### 2) 定位层级（选对工具层）
- **Type/ESLint**：先跑 `pnpm type-check`、`pnpm lint:check`
- **Unit/Integration**：`pnpm test`
- **E2E/SSR 行为**：`pnpm test:e2e`（你们 E2E 已按生产模式运行）
- **综合门禁**：`pnpm ci:local:quick` 或 `pnpm ci:local`

### 3) 用“最小实验”证伪假设
- 每次只改一个变量：输入/环境变量/依赖版本/一段逻辑
- 缩小范围：从最相关的 1–2 个文件/路由开始，不要全局改

## 推荐命令顺序（高性价比）

```bash
pnpm ci:local:quick
pnpm test
pnpm build
pnpm test:e2e
```

## 证据要求（避免“感觉修好了”）
- 结论必须附：**命令** + **关键输出片段** 或明确标记 “未验证（需要运行：…）”

