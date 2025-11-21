# Next16 升级系列任务执行手册（供 Claude code / shrimp 执行）

## 目的与范围
- 目的：按 `docs/data/tasks.json` 中的 Next16 升级链路逐项执行，升级到 Next.js 16 稳定线并完成 Turbopack、API 迁移、配置校验与回归验证。
- 适用范围：本仓库（App Router，TypeScript strict）。默认不改 CI/CD 配置，保持可回滚与最小变更。

## 前置约束
- Node `>=20 <21`，`pnpm@10.13.1`；包管理器使用 pnpm。
- 分支：默认 main（按需开工作分支）。
- 不修改 `.env`，不得硬编码敏感信息；禁止新增 `any`。
- 记录所有命令输出与变更点，建议写入任务注解或 evidence。

## 当前基线摘要（供检查）
- `package.json`：`next@15.5.4`，`react@19.1.1`，`@next/eslint-plugin-next@15.5.6`。
- 脚本：`dev` 使用 `next dev --turbopack`；无 `build:webpack` 兜底。
- overrides：`playwright@>=1.56.1`、`vite>=7.2.2`、`tmp=0.2.4`、`js-yaml=4.1.1`。

## 执行顺序概览（含依赖）
1. 依赖与脚本升级至 Next 16 稳定线（ID: 054e3ca6-15c0-4f5e-af1a-38ecb7f5bdc4）
2. Turbopack 配置迁移与 Webpack 退出方案（ID: b02fffb8-23f2-45f8-a3f8-80af47d524c4，依赖#1）
3. Async Request API 全量核对与 typegen（ID: 684ad596-a22e-438e-8120-c902565ab4fb，依赖#1）
4. middleware → proxy 迁移与 flags 更新（ID: b1ef051a-b11b-4c67-b733-5d4b49bab79d，依赖#1）
5. testProxy flag 行为复核（ID: d89ba5a5-3306-4fc6-9516-810e9992637a，依赖#1）
6. Tailwind 4 与 Next 16/Turbopack 兼容验证（ID: 2620d770-bc8c-42fb-8a02-c234086764e0，依赖#1、#2）
7. 图片配置与缓存行为对齐 Next16（ID: 35a1eb6d-74e5-4544-835d-aa9830d0ff94，依赖#1）
8. 验证与回归基线（Turbopack 下）（ID: d7f6ea74-3b23-47ac-b019-b98eb1af6e3d，依赖#2/#3/#4/#5/#6/#7）

## 任务详述与执行清单

### 1) 依赖与脚本升级至 Next 16 稳定线
- 目标：升级 next/react/react-dom/next-intl/@next/eslint-plugin-next/@types/react 等到最新 16/19 稳定版，更新脚本去掉 `--turbopack` 并添加 `build:webpack` 兜底，锁文件同步。
- 建议版本（执行前可再查官网）：`next@16.0.x`，`react@19.0.x/19.1.x`（保持配套），`next-intl@>=4`（与 16 兼容），`@types/react@19.x`，`@next/eslint-plugin-next@16.x`。
- 步骤：
  1. 备份：`cp package.json package.json.bak && cp pnpm-lock.yaml pnpm-lock.yaml.bak`。
  2. codemod（dry-run+正式）：  
     - `npx @next/codemod@canary upgrade latest --dry-run`  
     - 如无阻塞，`npx @next/codemod@canary upgrade latest`
  3. 安装核心依赖（如需指定版本，使用最新稳定 tag）：  
     `pnpm add next@latest react@latest react-dom@latest next-intl@latest @next/eslint-plugin-next@latest @types/react@latest @types/react-dom@latest`  
     更新 dev: `pnpm add -D typescript@latest eslint@latest eslint-config-next@latest`（如 codemod 已对齐可跳过）。
  4. 脚本调整（package.json）：  
     - `dev`: 去掉 `--turbopack`，如需 Turbo 则新增 `dev:turbopack`。  
     - 新增 `build:webpack`（示例：`"build:webpack": "NEXT_USE_TURBOPACK=0 next build"`）。  
     - 确认保留 `build` 为默认 Turbopack（Next16 默认启用）。
  5. 校验 overrides 是否仍需，若 Next16 已修复则记录后续可移除（短期保留）。
  6. `pnpm install` 同步锁文件。
  7. 快速验证：`pnpm type-check`、`pnpm lint:check`（可选，仅确认不爆炸）；`npx next --version` 确认 16.x。
- 交付物：更新后的 package.json、pnpm-lock.yaml，脚本无 `--turbopack`，新增 `build:webpack`。
- 验收：pnpm install 成功；`next --version` 输出 16.x；脚本符合要求。

### 2) Turbopack 配置迁移与 Webpack 退出方案
- 目标：将 `experimental.turbopack` 升为顶层 `turbopack` 配置；保留短期 webpack 兜底，评估 splitChunks。
- 步骤：
  1. 编辑 `next.config.ts`：将 `experimental.turbopack` 移到顶层 `turbopack: { ... }`；保留 webpack 配置块并加注释“待移除”。
  2. 如有自定义 splitChunks/plugin，评估 Turbopack 等效方案；短期保留 webpack 逻辑。
  3. 执行 `pnpm build`（Turbopack）和 `pnpm size:check` 记录体积。
  4. 若表现稳定，再准备移除 webpack 自定义并删 `build:webpack`；在本阶段先保留。
- 验收：`pnpm build` (Turbopack) 成功，size 未超预算；记录是否继续保留 webpack。

### 3) Async Request API 全量核对与 typegen
- 目标：确认 cookies/headers/draftMode/params/searchParams 等调用全部 async 化，运行 `next typegen` 生成 PageProps/LayoutProps。
- 步骤：
  1. 搜索同步调用：`rg "headers\\(\\)" src`、`rg "cookies\\(\\)" src` 等，检查是否缺少 await/async。
  2. 运行 `npx next typegen` 生成类型；补充导入类型引用。
  3. 将相关函数改为 async/await；调整调用方类型。
  4. 补充单测或类型检查（`pnpm type-check`）。
- 验收：无同步 API 调用；type-check 通过。

### 4) middleware → proxy 迁移与 flags 更新
- 目标：`middleware.ts` 重命名为 `proxy.ts`，导出函数名改为 `proxy`；配置项 `skipMiddleware*` 更名为 `skipProxy*`。
- 步骤：
  1. 文件重命名：`mv middleware.ts proxy.ts`（或对应路径）。导出 `export function proxy(...)`。
  2. 调整 `next.config.ts` 中的相关 flags（如 `skipMiddlewareUrlSegments` → `skipProxyUrlSegments`）。
  3. 检查 i18n/rewrites 行为未变；跑 `pnpm test` 或最小 e2e 触发关键路由。
- 验收：文件与导出均为 proxy；构建/测试通过。

### 5) testProxy flag 行为复核
- 目标：确认 `experimental.testProxy` 在 Next16 的行为，决定保留、限制或移除。
- 步骤：
  1. 查官方变更（可用 nextjs 文档/发布说明）；若已弃用则移除。
  2. 在升级后的分支跑 `pnpm build`/e2e，观察是否有警告。
  3. 根据结果：移除 flag 或加条件（仅 CI）。
- 验收：Next16 下无 testProxy 警告，构建/E2E 通过。

### 6) Tailwind 4 与 Next 16/Turbopack 兼容验证
- 目标：验证 `tailwindcss@4.1.17` 在 Turbopack 下构建与样式输出。
- 步骤：
  1. `pnpm build` (Turbopack) 观察样式/插件告警。
  2. 如异常，按 Tailwind 官方推荐配置或降级至已知稳定版本；同步更新 `tailwind.config.*`。
  3. 检查关键页面样式或快照（可用 Playwright 关键页面截图对比）。
- 验收：构建无 tailwind 报错；关键页面样式正常。

### 7) 图片配置与缓存行为对齐 Next16
- 目标：审核 `next.config.ts` 的 image 配置，补充 Next16 新字段。
- 步骤：
  1. 检查 `images.localPatterns` 是否需 `search` 支持 querystring 本地图；`minimumCacheTTL`、`imageSizes`、`qualities` 是否匹配业务。
  2. 评估 `dangerouslyAllowLocalIP`、`maximumRedirects` 需求。
  3. 调整后跑 `pnpm build` 并访问图片路由（如有）。
- 验收：构建通过，图片正常加载，无新增警告。

### 8) 验证与回归基线（Turbopack 下）
- 目标：确保升级后所有门禁在 Turbopack 下通过，并验证 webpack 兜底可用。
- 步骤：
  1. `pnpm type-check && pnpm lint:check`
  2. `pnpm test`（必要时加 `pnpm test:coverage`）
  3. `pnpm test:e2e`（或 `pnpm test:e2e:no-reuse`）
  4. `pnpm size:check && pnpm security:check && pnpm arch:check`
  5. 如 Turbopack 异常，运行 `pnpm build:webpack` 验证兜底。
- 验收：上述命令全部成功；Turbopack 构建稳定；webpack 兜底可用（若保留）。

## 风险与回滚提示
- codemod/依赖升级可能重写配置：务必保留备份并在 PR 中对比关键差异。
- Turbopack 可能与自定义 webpack 拆分冲突：先保留 webpack 兜底，记录差异后再移除。
- Tailwind 4 在 Turbopack 下若有兼容性问题，优先降级或按官方配置调整。
- 回滚策略：还原 package.json/pnpm-lock 备份，恢复 `next.config.ts` 调整，使用 `git restore` 或分支回退。

## 记录与输出要求
- 所有关键命令、问题与决策写入任务备注或追加到本文件/新增 evidence（如对比结果、告警截图）。
- 完成每个任务后更新 `docs/data/tasks.json` 的 `status` 与 `updatedAt`（如需）。
- 如需对外同步，提炼英文简版另存；内部文档保持中文。
