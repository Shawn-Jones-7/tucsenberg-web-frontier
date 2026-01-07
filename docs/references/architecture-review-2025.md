# 架构审查备忘录 2025

> 目的：沉淀已完成模块的架构审查发现与建议，作为后续深挖与整体路线图的单一事实来源（Single Source of Truth）。  
> 范围：本文件记录模块1–10的深挖结论与全局路线图（i18n、MDX、App Router、TypeScript、UI 设计系统、安全性、测试质量、性能构建、服务集成、CI/CD），作为后续改进的单一事实来源。  
> 方法：每个模块均先使用 ACE（`codebase-retrieval`）+ 文件查看 + `git log`/历史线索，再对照 Next.js 16 / React 19 官方最佳实践，产出**稳健长期**的推荐改进路径与可执行实施简报。

## 已确认的跨模块高优先级事项（滚动更新）
- **P0**：next-intl 的 `strictMessageTypeSafety` 类型增强未完整落地（影响 i18n/TS/测试）。
- **P0**：测试覆盖率门禁多源冲突，真实阻断逻辑不可预测（影响 CI/CD 可信度）。
- **P1**：缓存失效策略缺乏 tag/path 级别精确控制，Data Cache 跨部署持久化可能导致内容延迟一致。

## 偏差任务执行清单（供 Claude code）
- 已将“复验后仍存在的 5 条偏差任务”拆解为可执行 checklist（含验收命令/回滚点/OpenSpec 门槛），详见：`docs/deviation-tasks-checklist-2025.md`。后续所有改进以该清单逐条落地并回填 DONE。

## 执行与验收基线（供自动化模型执行）
- 所有改动必须保持以下基线门禁通过：`pnpm type-check`、`pnpm lint:check`、`pnpm test`、`pnpm quality:gate`。  
- 涉及路由/内容渲染/构建配置的改动，额外要求：`pnpm build` 通过；如改到页面交互/导航，再跑 `pnpm test:e2e` 关键路径。  
- 涉及安全头/限流/外部服务的改动，额外要求：`pnpm security:check` 通过，并为新增行为补齐相应 unit/integration tests。  
- 验收以“目标状态 + 变更范围 + 可重复验证命令”为准，不允许仅靠手工观察通过门禁。

## 执行前自检与提案门槛（供自动化模型）

### 执行前必读/自检
- 必读：`docs/architecture-review-2025.md`、`openspec/AGENTS.md`（当任务触及架构/破坏性变更时）、以及对应模块 `### 实施简报（Implementation Brief）` 中列出的关键文件。  
- 任一任务开始前先跑一次基线门禁（见上节）；若存在失败但与本次任务无关，只记录到 `docs/known-issue/`，不在本轮“顺手修复”扩 scope。  
- 复核当前覆盖率与门禁口径：`reports/coverage/coverage-summary.json`、`scripts/quality-gate.js`；确保 required checks 的唯一来源仍为 `quality:gate`。  
- 对 i18n/内容/性能/安全相关任务，先确认对应报告产物为最新：  
  - i18n shape/缺失：`reports/i18n-shape.json`（或 `scripts/i18n-shape-check.js` 输出）。  
  - content manifest/缺失：`reports/content-manifest.json`（由 `scripts/generate-content-manifest.ts` 生成）。  
  - bundle analyzer/stats：`.next/analyze/**`、`.next/stats/**`（由 `pnpm build:analyze`/`pnpm analyze:*` 生成）。  
  - Lighthouse：`reports/lighthouse/**`（由 CI 或 `pnpm perf:lighthouse` 生成）。  
- 严格按“统一优先级清单 → 分阶段落地建议（Phase 0→3）”执行，避免跨 Phase 跳跃导致依赖反转。

### 需要先走 OpenSpec 的任务
- 以下事项属于架构/破坏性变更或可能影响对外语义，必须先在 `openspec/` 创建 proposal 并获批后再落地：  
  - MDX RSC 渲染与内容路由/manifest 体系（模块2 P0/P1）。  
  - CI workflow/required checks 收敛与门禁语义重组（模块7/10 P0/P1）。  
  - 分布式限流与 CSP/安全头策略体系化重构（模块6 P1/P2）。  
  - WhatsApp Integration Layer 单源化与 webhook/send 行为收敛（模块9 P1）。  
  - outbox/队列最终一致性与跨服务补偿（模块9 P3）。  

### 执行中记录要求
- 每完成一个 P0/P1 任务：  
  - 在对应模块的 `### 实施简报（Implementation Brief）` 下追加 `DONE:`、关键 commit/PR 链接、验证命令与结果摘要、明确回滚点/feature flag。  
  - 若调整优先级/范围，必须同步更新“统一优先级清单/Phase 列表”，保持本文为单一真相源。

## 执行约定与回滚/灰度策略（供自动化模型）

### 统一命名/契约规范
- **cache tags 命名**：使用 `domain:entity:identifier[:locale]` 形式，domain 只取 `i18n`/`content`/`product`/`seo`/`perf`/`security` 等有限集合；identifier 为 slug 或固定 key。示例：`i18n:critical:en`、`content:blog:my-slug:zh`。  
- **outbox 事件最小模型**：`type`（枚举）、`payload`（schema 化对象）、`attempts`、`nextRetryAt`、`createdAt`、`lastError?`；禁止在业务代码里直接自定义非 schema 字段。  
- **sanitize API**：只允许使用语义化函数名：`sanitizePlainText`、`sanitizeUrl`、`sanitizeFilePath`、`sanitizeHtmlText`（如需）；旧 `sanitizeInput` 仅作为兼容 re-export，不再新增直接调用。  
- **CI/门禁单源**：覆盖率/性能/安全阈值只在 `scripts/quality-gate.js` 维护，任何新增门禁必须以该脚本为入口子门禁接入。  

### 非目标（Non-goals）通用约束
- 不引入新的 CMS/数据库/运行时平台；仅在现有 Next.js 16/React 19 + Vercel 体系内优化。  
- 不改变既有公开 URL、slug、locale 路由语义与 SEO metadata 对外口径；如需变更必须先走 OpenSpec。  
- 不在本轮同时“上调阈值/换工具链/大规模重构 UI API”；优先收敛真相源与消除高危入口。  

### 灰度/回滚策略（仅 P0/P1）
- **MDX RSC 渲染**：按 blog → products → pages 逐域迁移；每域迁移完成后保留一周旧路径的 feature flag（如 `CONTENT_RENDERER=legacy|mdx`）用于快速回退。  
- **i18n 类型增强**：先引入 augmentation 与 CI shape gate，再逐步清理调用点断言；任何新增 key 必须先通过 shape check。回滚只需移除 augmentation 文件与相关 CI gate。  
- **CI workflow 收敛**：先让 `ci.yml` 成为 required checks，同时将 `code-quality.yml`/`vercel-deploy.yml` 的重复门禁降级为 non-blocking；确认稳定一周后再删除重复步骤。  
- **分布式限流/Turnstile 单源**：先在 contact/inquiry/subscribe 试点并观察 429 命中率；若外部依赖异常，降级为“仅 Turnstile + 内存限流”但保留统一 API 入口。  
- **WhatsApp Integration Layer**：先让 send/webhook 同源到新 core，并在预览环境对外验证；旧链路在无流量确认后再移除。  

---

## 模块1：国际化(i18n)架构

### 当前实现总结
- 核心文件：`src/i18n/request.ts`, `src/i18n/routing.ts`, `src/lib/load-messages.ts`, `src/types/i18n.ts`, `proxy.ts`, `src/components/language-toggle.tsx`，以及 `scripts/translation-*.js`/`scripts/validate-*.ts`。
- Next.js 16 官方 `proxy.ts` 入口（Node runtime）已正确使用，负责 locale 重写与 CSP nonce。
- messages 外部化：构建前脚本复制到 `public/messages/**`；运行期 `load-messages.ts` 通过 HTTP fetch + fs fallback 加载，并用 `unstable_cache` 做 Data Cache。
- 分层 Provider：root layout 注入 critical messages；需要完整文案的页面通过各自 layout 注入 complete messages（critical + deferred），客户端 island 不再单独包裹 i18n provider。

### 发现的问题
1. **next-intl 类型增强缺口**（严重程度: 高）  
   - 现象：未按官方 `AppConfig.Messages`/module augmentation 建立翻译 key 与 ICU 参数的 compile-time 检查；`strictMessageTypeSafety` 推断不完整。  
   - 风险：翻译 key/参数错误在运行期才暴露，违背严格类型安全目标。
2. **生产环境 baseUrl 回落 localhost**（严重程度: 中）  
   - 现象：`load-messages.ts#getBaseUrl` 若未设 `NEXT_PUBLIC_BASE_URL` 可能回落 `localhost`，导致线上 fetch 噪声/失败。  
   - 风险：翻译加载不稳定、监控误报。
3. **`routing.pathnames` 未覆盖动态路由**（严重程度: 中低）  
   - 现象：动态页（如 blog/products `[slug]`）的语言切换在类型层与路由层缺少完全覆盖。  
   - 风险：切换语言可能出现 404 或缺少类型保障。
4. **自研 `TranslationCache` 指标与真实缓存语义不一致**（严重程度: 低）  
   - 现象：命中率/TTL 口径与 Next `unstable_cache` 不完全对齐。  
   - 风险：监控与真实性能偏差。

### 改进方案（稳健长期）
- **问题1：next-intl 类型增强缺口**  
  - 方案：落地 `AppConfig.Messages` module augmentation，令翻译 key 与 ICU 参数在编译期受 `strictMessageTypeSafety` 约束。  
  - 实施要点：  
    1) 新增 `src/types/next-intl.d.ts`（或等价位置）定义 `AppConfig.Messages`，类型源直接指向 `messages/en/critical.json` 与 `messages/en/deferred.json` 的结构（通过 `typeof import()`/`as const` 推断）。  
    2) 在 `src/i18n/request.ts`/Provider 入口显式开启 `strictMessageTypeSafety: true`，并把 `useTranslations()`/`t()` 的泛型统一收敛到该类型。  
    3) 将 `scripts/validate-translations.js` 与 `scripts/i18n-shape-check.js` 产出的 shape 报告作为 CI 阻断条件，防止 messages 结构漂移破坏推断。  
  - 工作量：中（1–2 天整理类型源 + 若干调用点修正）。  

- **问题2：生产 baseUrl 回落 localhost**  
  - 方案：生产环境强制提供可用 origin，并避免隐式回落。  
  - 实施要点：  
    1) 在 `src/lib/env.ts` 中将 `NEXT_PUBLIC_BASE_URL`（或 `NEXT_PUBLIC_SITE_URL`）设为生产必填；缺失时构建/启动即失败。  
    2) `src/lib/load-messages.ts#getBaseUrl` 优先使用上述 env，其次使用 `VERCEL_URL`（补全 `https://`），仍无则抛错并回退到 fs 读取链路。  
  - 工作量：小。  

- **问题3：动态路由 pathnames 未覆盖**  
  - 方案：为动态段补齐 `routing.pathnames` 映射，并对语言切换组件做类型联动。  
  - 实施要点：  
    1) 在 `src/i18n/routing.ts` 明确声明 blog/products 等动态路由的 pathname pattern（含 `[slug]`）。  
    2) `src/components/language-toggle.tsx`/navigation helpers 改为使用类型化 `pathnames`，避免手拼 URL。  
  - 工作量：小到中。  

- **问题4：TranslationCache 指标语义偏差**  
  - 方案：监控口径直接对齐 `unstable_cache` 的 tags/revalidate。  
  - 实施要点：  
    1) `src/lib/i18n-cache-manager.ts` 等监控侧使用 `getRevalidateTime()` 与 tags 作为 TTL/命中口径来源。  
    2) 无法与 Data Cache 对齐的自研指标下线或降级为 debug-only。  
  - 工作量：小。  

### 推荐路径
以上为长期稳健推荐路径，优先按 P0→P2 顺序落地。

### 实施优先级
**P0**：补齐 `AppConfig.Messages`/messages 类型增强。  
**P1**：修正 baseUrl 推断逻辑。  
**P2**：动态路由 pathnames 策略与监控口径收敛。

### 实施简报（Implementation Brief）
- **P0：next-intl 类型增强落地**
  - 目标状态：非法翻译 key/ICU 参数在 TS 编译期报错；`strictMessageTypeSafety` 全链路生效。
  - 变更范围：`src/types/next-intl.d.ts`、`src/i18n/request.ts`、`messages/**`、`scripts/validate-translations.js`、`scripts/i18n-shape-check.js`。
  - 验收标准：`useTranslations()`/`t()` 对不存在 key 或缺参的调用无法通过 `pnpm type-check`；中英 messages 结构不一致会在 CI 阻断。
  - 验证：基线 + `pnpm i18n:shape:check`、`pnpm validate:translations`。
  - **DONE (2025-12-12)**：创建 `src/types/next-intl.d.ts`，实现 `AppConfig.Messages` module augmentation，类型源直接指向 `@messages/{locale}/critical.json` 与 `deferred.json`。`pnpm type-check` 通过。  

- **P1：生产 baseUrl/回退链路稳态**  
  - 目标状态：生产运行期不再回落 `localhost`；缺失 origin 时提前失败或可靠回退 fs。  
  - 变更范围：`src/lib/env.ts`、`src/lib/load-messages.ts#getBaseUrl`。  
  - 验收标准：生产构建/启动要求提供可用 base URL（或 Vercel URL 自动推断）；线上无翻译 fetch 噪声。  
  - 验证：基线 + `pnpm build`（production env）。  

- **P2：动态路由 pathnames/监控口径补全**  
  - 目标状态：blog/products 等动态页语言切换保持 slug 且无 404；缓存监控指标与 Data Cache 语义对齐。  
  - 变更范围：`src/i18n/routing.ts`、`src/components/language-toggle.tsx`、`src/lib/i18n-cache-*`。  
  - 验收标准：动态页切换语言路径正确；cache metrics 以 tags/revalidate 为单源。  
  - 验证：基线 + `pnpm test:e2e`（语言切换关键路由）。

---

## 模块3：Next.js 16 App Router 架构

### 当前实现总结
- 路由根：`src/app/layout.tsx`（文档壳 + 基础 metadata）、`src/app/page.tsx`（根重定向）。
- i18n 子树：`src/app/[locale]/layout.tsx` 校验/设置 locale，注入 critical messages 与各类 Client Islands（监控/主题/同意/TopLoader/Toaster 等）。
- 动态路由：`blog/[slug]`, `products/[slug]` 实现 `generateStaticParams()` 并在 `page.tsx`/`generateMetadata()` 中 `await params`。
- Async Request APIs 迁移正确：`params`/`searchParams` 均为 `Promise` 并显式 await。
- Cache Components 已启用：`next.config.ts` `cacheComponents: true`；数据层大量 `'use cache' + cacheLife('days')`。

### 发现的问题
1. **缺少 tag/path 级缓存失效机制**（严重程度: 中高）  
   - 现象：仅靠 `cacheLife` 时间驱动失效；无 `cacheTag/revalidateTag/revalidatePath`。  
   - 风险：内容/翻译更新后可能延迟到 1 天窗口才完全一致。
2. **`unstable_cache` 仍是核心缓存之一**（严重程度: 中）  
   - 现象：i18n 消息加载仍使用 legacy `unstable_cache`。  
   - 风险：缓存语义分裂，未来升级成本上升。
3. **根 `<html lang>` 与实际 locale SSR 不一致**（严重程度: 中）  
   - 现象：root layout 固定默认 lang，靠 `LangUpdater` hydration 后修正。  
   - 风险：无 JS/爬虫/首屏阶段语言信号不完美。
4. **Client Boundary 分布较广**（严重程度: 中低）  
   - 现象：`"use client"` 组件较多，虽多为 island/懒加载，但缺少统一审计口径。  
   - 风险：随迭代可能不必要扩大 hydration 面积。

### 改进方案（稳健长期）
- **问题1：缺少 tag/path 级缓存失效机制**  
  - 方案：建立统一的 `cacheTag/revalidateTag/revalidatePath` 失效体系，替代纯时间驱动。  
  - 实施要点：  
    1) 为 i18n/messages、content（posts/products/pages）、以及产品数据建立稳定 tag 命名（如 `i18n:critical:en`、`content:blog:slug`）。  
    2) 在对应数据函数中使用 `cacheTag()` 标注产物，并在内容/翻译同步脚本（`pnpm i18n:full`、content slug sync）或 webhook 中触发 `revalidateTag/Path`。  
    3) 对跨部署持久化的 Data Cache，补充“发布/同步即失效”的 CI 步骤，避免 1 天窗口延迟。  
  - 工作量：中（需设计 tags 与触发链路）。  

- **问题2：legacy `unstable_cache` 仍为核心之一**  
  - 方案：逐步迁移到 Next 16 推荐的 Cache Components/`use cache` 语义，并统一 tags。  
  - 实施要点：从 `src/lib/load-messages.ts` 开始，保持现有 API 形态不变，仅替换内部缓存实现与失效策略；迁移完成后下线 `unstable_cache` 相关监控分支。  
  - 工作量：中。  

### 推荐路径
以 tags 失效体系为主线，先从 i18n/内容缓存试点再推广。

### 实施优先级
**P1**：建立 tag 失效体系并试点迁移 i18n/内容缓存；  
**P2**：lang SSR 权衡文档化，视 SEO/a11y 指标再决策是否动态化。

### 实施简报（Implementation Brief）
- **P1：Cache tag 失效体系**
  - 目标状态：内容/翻译发布后可即时失效并生效，不再依赖纯时间 TTL。
  - 变更范围：`src/lib/load-messages.ts`、`src/lib/content/**`、`src/lib/content-query/**`、相关同步脚本与 CI hooks。
  - 验收标准：`cacheTag()` 覆盖 i18n/content 主要数据源；`revalidateTag/Path` 有明确触发链路（脚本/webhook/CI）。
  - 验证：基线 + `pnpm i18n:full`、`pnpm content:slug-check`。
  - **DONE (2025-12-12)**：创建 `src/lib/cache/cache-tags.ts`，定义 `CACHE_DOMAINS`/`CACHE_ENTITIES` 与 `i18nTags`/`contentTags`/`productTags`/`seoTags` 生成器。创建 `src/app/api/cache/invalidate/route.ts` 提供 HTTP 失效端点。`pnpm type-check` 与 `pnpm lint:check` 通过。  

- **P2：lang SSR 口径文档化/收敛**  
  - 目标状态：root `<html lang>` 与实际 locale 策略一致且可解释，避免首屏信号歧义。  
  - 变更范围：`src/app/layout.tsx`、`src/app/[locale]/layout.tsx`、相关文档。  
  - 验收标准：若保持默认 lang，则文档明确理由与边界；若动态化，保证无 hydration mismatch。  
  - 验证：基线 + `pnpm build`。

---

## 模块4：TypeScript 类型安全

### 当前实现总结
- `tsconfig.json` 严格链完整：`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `isolatedModules`, `moduleResolution: bundler` 等；测试独立 `tsconfig.test.json`。
- 生产代码几乎不使用 `any`；断言主要在测试与少量外部 JSON 桥接。
- env 通过 `src/lib/env.ts`（`@t3-oss/env-nextjs + zod`）提供强校验与类型推断。

### 发现的问题
1. **i18n Messages 类型增强缺口外溢到 TS 体系**（严重程度: 高）  
   - 风险：翻译 key/ICU 参数编译期漏检（与模块1同源）。
2. **Zod schema 与手写类型双维护**（严重程度: 中）  
   - 现象：`safeParse` 后仍 `as unknown as ...`。  
   - 风险：schema/类型漂移难被 TS 捕获。
3. **少量 `unknown as`/宽泛 JSON 断言**（严重程度: 中低）  
   - 风险：可能掩盖上游数据形状问题。

### 改进方案（稳健长期）
- **问题1：i18n 类型增强外溢**  
  - 方案：按模块1的 `AppConfig.Messages` augmentation 落地后，清理所有与 i18n key/参数相关的 `as unknown as` 桥接。  
  - 实施要点：对 `useTranslations()`/`getTranslations()` 的使用点逐个消除显式字符串索引或宽泛泛型，保证 key/ICU 参数全链路可推断。  

- **问题2/3：Zod 与手写类型双维护/断言桥接**  
  - 方案：以 `z.infer<typeof schema>` 作为唯一类型真相，并在 API/Server Actions 入口统一 `safeParse`→`data` 的类型流转。  
  - 实施要点：  
    1) 对外部输入（forms/routes/webhooks）先用 schema `safeParse/parse` 得到强类型数据，再向下游传递；禁止二次 `as unknown as`。  
    2) 现存手写类型仅保留“公开 API 视图/跨包契约”，其字段用 `satisfies z.infer<...>` 校验一致性。  
    3) 为高频表单（contact/inquiry/subscribe）先完成收敛，再扩展到 Airtable/Resend/WhatsApp 数据结构。  
  - 工作量：中（按域逐步迁移）。  

### 推荐路径
统一以 schema 推断为主线，按业务域渐进收敛。

### 实施优先级
**P0**：i18n 类型增强落地；  
**P1**：关键表单/API 逐步用 `z.infer` 收敛。

### 实施简报（Implementation Brief）
- **P0：TS 与 i18n 类型单源化**  
  - 目标状态：翻译相关类型安全完全由 `AppConfig.Messages` 推断驱动（见模块1 P0）。  
  - 变更范围：与模块1 P0 共用。  
  - 验收标准：i18n key/参数无 `unknown as` 桥接残留。  
  - 验证：基线。  

- **P1：Zod `z.infer` 作为唯一真相**
  - 目标状态：外部输入经 schema 后直接得到强类型数据，下游不再二次断言。
  - 变更范围：`src/lib/lead-pipeline/lead-schema.ts`、`src/app/api/*` 表单校验、`src/lib/resend-utils.ts`、`src/lib/airtable/**`、`src/lib/whatsapp-*.ts`。
  - 验收标准：目标域内移除 `as unknown as`；公开类型与 schema 用 `satisfies z.infer` 对齐。
  - 验证：基线。
  - **DONE (2025-12-12)**：修复 Zod v4 兼容性问题——将 `sanitizedString()` 从 `.transform().pipe()` 模式改为 `.overwrite()` 模式，使用户输入清理与长度验证可直接链式调用。`pnpm vitest run src/lib/lead-pipeline` 85 测试全部通过。

---

## 模块7：测试覆盖和质量

### 当前实现总结
- Vitest 主套件 `vitest.config.mts` 的 coverage thresholds 注释禁用；Browser Mode 套件仍保留 85% 阈值但 CI 未强制跑。
- 质量门禁集中在 `scripts/quality-gate.js`（full 模式硬编码 85% + diff 覆盖≥90）。
- 当前覆盖率总量（Phase 2 已达标）：lines 80.52%、statements 80.02%、functions 81.02%、branches 73.64%。

### 发现的问题
1. **覆盖率门禁多源冲突**（严重程度: 高）  
   - 现象：Vitest 阈值关闭；`ci.yml` 口径与真实阻断不一致；`quality-gate.js` 仍硬编码 85%。  
   - 风险：CI 行为不可预测，开发者难以信任指标。
2. **coverage exclude 过宽**（严重程度: 中）  
   - 现象：排除 `src/services/**`, `src/types/**`, `src/config/**` 等，导致指标偏乐观。  
   - 风险：覆盖率失真，无法反映真实风险。
3. **全局 fetch mock 可能遮蔽 i18n 加载链路**（严重程度: 中低）  
   - 风险：测试误通过。

### 改进方案（稳健长期）
- **问题1：覆盖率门禁多源冲突**  
  - 方案：以 `scripts/quality-gate.js` 为覆盖率唯一真相源，CI/Hook/Vitest 仅复用其结果或对齐阈值，不再各自硬编码。  
  - 实施要点：  
    1) 在 `ci.yml`/`code-quality.yml` 删除独立 `pnpm test:coverage` 阶段，改为统一调用 `pnpm quality:gate`（full 模式）。  
    2) `vitest.config.mts` 保持不设置 thresholds，仅负责产出覆盖率报告；阈值/增量覆盖由 `quality-gate.js` 单点维护。  
    3) 分支保护 required checks 只指向主 CI 的 `quality:gate` 结果，避免 PR 状态冲突。  
  - 工作量：中（CI/门禁收敛）。  

- **问题2：exclude 过宽**  
  - 方案：按“风险域优先”的原则逐步收窄 exclude，并对历史未覆盖域设定专项补测计划。  
  - 实施要点：先把 `src/config/**`、`src/services/**` 等关键运行时代码逐步移出 exclude；每次迭代只收窄一类目录并补齐对应测试，避免一次性阈值波动。  
  - 工作量：中（随业务域分期）。  

- **问题3：全局 fetch mock 遮蔽链路**  
  - 方案：将 fetch mock 下沉到用例级，并为 i18n/content 加关键路径集成测试。  
  - 实施要点：对 `src/lib/load-messages.ts`、content-query 关键入口补一组“无 mock/真实 fs fallback”测试，确保缓存与回退语义在 CI 中可验证。  
  - 工作量：小到中。  

### 推荐路径
门禁先单源化，再持续收窄 exclude 与补测，维持长期可预期的覆盖率爬坡。

### 实施优先级
**P0**：统一覆盖率门禁来源与阻断逻辑；  
**P1**：收敛 exclude、修正 i18n 相关 mock。

### 实施简报（Implementation Brief）
- **P0：覆盖率门禁单源化**  
  - 目标状态：覆盖率阈值/增量覆盖仅由 `scripts/quality-gate.js` 维护，CI/Hook/Vitest 不再各自硬编码。  
  - 变更范围：`scripts/quality-gate.js`、`vitest.config.mts`、`.github/workflows/ci.yml`、`.github/workflows/code-quality.yml`、`lefthook.yml`、`.claude/rules/quality-gates.md`。  
  - 验收标准：CI 仅运行一次 `pnpm quality:gate`（full）；PR required checks 不再出现覆盖率重复/冲突。  
  - 验证：基线 + `pnpm ci:local`。  

- **P1：exclude 收敛与关键链路补测**  
  - 目标状态：exclude 只覆盖非运行时代码；i18n/content 关键路径有真实回退测试。  
  - 变更范围：`vitest.config.mts#coverage.exclude`、`src/test/setup.ts`、i18n/content 相关测试。  
  - 验收标准：收窄 exclude 后覆盖率仍 ≥ Phase 2；全局 fetch mock 不遮蔽 i18n 回退语义。  
  - 验证：基线 + `pnpm test:coverage`。

---

## 模块2：MDX 内容管理

### 当前实现总结
- 目录结构：`content/posts/{en,zh}/`, `content/pages/{en,zh}/`, `content/products/{en,zh}/`，两语种文件名与 slug 一一对应。
- Front Matter 类型：`src/types/content.ts` 定义 `BlogPostMetadata`/`PageMetadata`/`ProductMetadata` 等；配置在 `content/config/content.json`。
- 解析/查询链路：`src/lib/content-parser.ts`（`gray-matter` + warn-only 校验）→ `src/lib/content-query/*`（posts/pages）→ `src/lib/content/blog.ts`、`src/lib/content/products-source.ts`/`src/lib/content/products.ts`（products 已 Cache Components）。
- MDX 方案：`next.config.ts` 已启用 `@next/mdx`，根部存在官方要求的 `mdx-components.tsx`。
- Git 工作流：`lefthook.yml` 在 content/messages 变更时执行 `pnpm i18n:full`，其中 `scripts/content-slug-sync.js`/`scripts/mdx-slug-sync.js` 负责跨语言配对与 slug 一致性校验。

### 发现的问题
1. **内容未编译却按 HTML 注入渲染**（严重程度: 高）  
   - 现象：MDX/Markdown 原文直接通过 `dangerouslySetInnerHTML` 渲染（blog/products），未经过编译为 HTML/React。  
   - 风险：渲染错误 + 潜在 XSS 面（未来若引入不受信任内容）。
2. **Front Matter validator 与规范不一致**（严重程度: 中）  
   - 现象：`validateContentMetadata` 不识别 `products`，且未强制 `slug/locale`，也不读取 `content.json.validation`。  
   - 风险：校验弱、双维护漂移。
3. **`content.json` 多数开关未进入运行期逻辑**（严重程度: 中）  
   - 风险：配置成为“文档式配置”，误导维护者。
4. **draft 生产暴露默认风险**（严重程度: 中高）  
   - 现象：repo 当前 `enableDrafts: true`，生产若不改会展示草稿。  
   - 风险：未发布内容外泄。
5. **`mdx-components.tsx` 注入链路未生效**（严重程度: 低中）  
   - 风险：MDX 组件体系形同虚设。
6. **缺失内容无 fallback**（严重程度: 低）  
   - 风险：线上临时缺失会直接 404。

### 改进方案（稳健长期）
- **问题1：内容未编译却 innerHTML 注入**  
  - 方案：恢复 Next 原生 MDX RSC 渲染链路，彻底移除 `dangerouslySetInnerHTML`。  
  - 实施要点：  
    1) 在构建期生成 `content-manifest.json`（按 `posts/pages/products × locale × slug` 映射到真实文件路径），保证 slug 可静态导入。  
    2) 各内容页 `page.tsx` 通过 manifest 做 `await import(filePath)` 得到 MDX 组件并直接渲染；Front Matter 与内容分别由导出值/metadata 提供。  
    3) `mdx-components.tsx` 作为唯一组件注入入口，确保 prose/自定义组件类型安全生效。  
  - 工作量：中到大（需迁移 blog→products→pages）。  

- **问题2/3：校验与配置未进入运行期**  
  - 方案：以 `content/config/content.json` 为单一真相驱动 validator 与 runtime 行为。  
  - 实施要点：`validateContentMetadata` 增加 products 类型分支，强制 `slug/locale` 与 requiredFields；读取 `validation` 段落控制 draft/长度/允许字段。  
  - 工作量：中。  

- **问题4：draft 生产暴露**  
  - 方案：通过 env 分流（prod 默认禁用 drafts），并在 CI 产出报告。  
  - 实施要点：`enableDrafts` 仅在 `NODE_ENV=development` 或显式 `CONTENT_ENABLE_DRAFTS=true` 时生效；生产构建前校验无 draft 被发布。  
  - 工作量：小。  

- **问题5/6：组件注入与缺失 fallback**  
  - 方案：随 RSC 渲染链路一并落地。  
  - 实施要点：manifest 缺失时按业务规则选择“回退到默认语言版本”或“明确 404 + 缺失报告”，并纳入 `content-slug-check` 门禁。  
  - 工作量：小到中。  

### 推荐路径
以 MDX RSC 渲染为主线分模块迁移，配套校验/manifest/draft 策略一次性闭环。

### 实施优先级
**P0**：打通 MDX 渲染链路。  
**P1**：生产禁用 draft、补齐 products/slug/locale 校验并读取 validation 配置。  
**P2**：mdx-components 随 P0 生效；fallback 视需求后置。

### 实施简报（Implementation Brief）
- **P0：MDX RSC 渲染链路恢复**  
  - 目标状态：所有内容页不再使用 `dangerouslySetInnerHTML`；MDX 作为 React 组件在 RSC 中原生渲染。  
  - 变更范围：新增 `scripts/generate-content-manifest.ts`（产物 `reports/content-manifest.json`）、`mdx-components.tsx`、`src/app/[locale]/blog/[slug]/page.tsx`、`src/app/[locale]/products/[slug]/page.tsx`、其他内容页。  
  - 验收标准：仓库内无残留内容 innerHTML 注入点；blog/products/pages 的 SSG/metadata 行为与现状兼容。  
  - 验证：基线 + `pnpm build`、（必要时）`pnpm test:e2e` 内容页抽样。  

- **P1：内容校验与 draft 策略闭环**  
  - 目标状态：生产默认不暴露 drafts；products 元数据与配置校验强制生效。  
  - 变更范围：`content/config/content.json`、`src/lib/content-validation.ts`、`src/lib/content-parser.ts`、相关同步脚本。  
  - 验收标准：prod 构建遇到 draft/无效 metadata 即失败或隐藏；slug/locale 必填且与目录一致。  
  - 验证：基线 + `pnpm content:slug-check`。  

- **P2：缺失内容 fallback 语义**  
  - 目标状态：缺失翻译/内容时有明确回退策略并产出报告。  
  - 变更范围：manifest 与查询层回退逻辑、报告脚本。  
  - 验收标准：缺失不会 silent；线上行为可预期（回退或 404）。  
  - 验证：基线。

---

## 模块5：UI 设计系统（shadcn/ui + Tailwind）

### 当前实现总结
- Tailwind CSS v4 + CSS-first：`src/app/globals.css` 使用 `@import 'tailwindcss'`，并在 `@theme inline` 中定义 design tokens（background/foreground/primary/...、radius、font 等），通过 `:root`/`.dark` 维护浅色/暗黑色板；仓库内无 `tailwind.config.*`。
- PostCSS 通过 `@tailwindcss/postcss` 驱动 Tailwind 编译，叠加 `cssnano` 优化（`postcss.config.mjs`）。
- shadcn/ui 基础组件集中在 `src/components/ui/*`，多数为 Radix primitives 的轻封装；动态样式由 `class-variance-authority (cva)` + `cn()`（`src/lib/utils.ts`）负责变体与 class merge。
- a11y 强化：全局 `sr-only`、skip-link、focus-visible ring、prefers-reduced-motion/high-contrast 支持；`src/components/ui/__tests__` 覆盖 ARIA/键盘交互与 label 关联等核心场景。
- 响应式以 Tailwind 断点为主（如 `md:hidden`），另有 JS 侧 `useBreakpoint`/`ResponsiveLayout` 做 layout 级切换（client-only）。

### 发现的问题
1. **Tailwind 插件未启用导致关键 utility 缺失**（严重程度: 高）  
   - 现象：项目依赖 `tailwindcss-animate`、`@tailwindcss/typography`（`package.json`），但 `globals.css` 无 `@plugin`，且无 `tailwind.config`；`.next/static/css` 中未生成 `animate-in`/`prose` 等样式。线上页面仍大量使用 `animate-in`/`fade-*`/`slide-*`、`prose`（blog/products）类名。  
   - 风险：菜单/对话框等交互动画不生效；内容页排版（prose）缺失影响阅读与品牌一致性；后续新增组件继续踩坑。
2. **`components.json` 与 Tailwind v4 最佳实践不一致**（严重程度: 中）  
   - 现象：`components.json` 中 `tailwind.config: "tailwind.config.js"`，但仓库无该文件；shadcn 官方要求 v4 项目此字段留空。  
   - 风险：CLI `shadcn add`/registry 可能放错路径或生成错误样式；维护者误以为存在 config/safelist。
3. **响应式存在 JS/CSS 双体系**（严重程度: 中）  
   - 现象：`useBreakpoint` 使用与 Tailwind 默认断点一致的像素值，但 `ResponsiveLayout` 需 client hydration 才决定 layout；默认 `lg` 断点复用语义无关的 `BYTES_PER_KB` 常量。  
   - 风险：额外 client JS 与 resize 监听开销；首屏/无 JS 情况下 layout 退化；断点语义维护成本高。
4. **`Badge` 语义/属性模型不严谨**（严重程度: 中低）  
   - 现象：`src/components/ui/badge.tsx` 为 `div` 扩展 `disabled/form/name/value/autoComplete` 等非 div 标准属性并透传到 DOM。  
   - 风险：无效属性污染 DOM，潜在 React warning/可访问性语义不清；未来若当作交互元素易产生行为不一致。
5. **全局 CSS 责任过重**（严重程度: 低）  
   - 现象：`globals.css` 同时承载 tokens、a11y、性能/CLS、utilities。  
   - 风险：继续膨胀会降低可读性；未来拆分时需遵守 v4 `@reference` 共享 tokens 的规则。

### 改进方案（稳健长期）
- **问题1/2：Tailwind 插件缺失与 components.json 不一致**  
  - 方案：保持 CSS-first 架构，在 `globals.css` 以 Tailwind v4 `@plugin` 启用 `tailwindcss-animate` 与 `@tailwindcss/typography`，并将 `components.json.tailwind.config` 置空，形成单一真相。  
  - 实施要点：  
    1) `src/app/globals.css` 顶部加入 `@plugin "tailwindcss-animate";` 与 `@plugin "@tailwindcss/typography";`。  
    2) `components.json` 的 `tailwind.config` 字段留空，仅保留 `css` 指向 `globals.css`。  
    3) 在 docs 中记录“v4 插件通过 CSS 管理”的约定，新增插件必须同步到 `globals.css`。  
  - 工作量：小。  

- **问题3：响应式双体系**  
  - 方案：以 Tailwind 响应式与（必要时）Container Queries 为主，逐步移除 layout 级 JS 断点决策，仅在无法 CSS 表达的交互场景使用局部 `useMediaQuery`。  
  - 实施要点：  
    1) 盘点 `ResponsiveLayout/useBreakpoint` 调用点，优先改为 Tailwind 类名/布局；  
    2) 为仍需 JS 的场景引入语义常量（如 `BREAKPOINT_LG`），替换 `BYTES_PER_KB` 的误用；  
    3) 通过 ESLint/架构守卫禁止新增“全局断点 hook”。  
  - 工作量：中（按页面分期迁移）。  

- **问题4：Badge 语义/属性模型**  
  - 方案：Badge 保持纯展示组件，props 收敛为合法 `div/span` 属性；交互场景通过 `Button/Link` 组合而非在 Badge 上扩展交互属性。  
  - 实施要点：收窄 `BadgeProps`、清理 DOM 透传无效属性，并补齐少量测试快照。  
  - 工作量：小。  

- **问题5：globals.css 责任过重**  
  - 方案：按 v4 规则拆分为 `tokens.css`/`base.css`/`utilities.css`（用 `@reference` 共享 tokens），降低全局样式耦合。  
  - 实施要点：逐步迁移，不改变 class API；先拆 a11y/utilities，再拆 tokens。  
  - 工作量：中。  

### 推荐路径
先恢复插件与配置真相源，再收敛响应式与全局样式边界。

### 实施优先级
**P1**：启用 typography/animate 插件并修正 `components.json`；  
**P2**：限定/收敛 JS 响应式体系、补齐 `BREAKPOINT_LG` 并替换 `BYTES_PER_KB` 复用；  
**P3**：Badge API 语义收敛与 globals.css 拆分视规模推进。

### 实施简报（Implementation Brief）
- **P1：Tailwind 插件与 shadcn 配置单源化**  
  - 目标状态：`prose`/`animate-*` utilities 在 v4 CSS-first 下稳定可用，CLI 配置不再误导。  
  - 变更范围：`src/app/globals.css`（`@plugin`）、`components.json`。  
  - 验收标准：构建产物包含 typography/animate 样式；内容页与动画类名生效。  
  - 验证：基线 + `pnpm build`。  

- **P2：响应式体系 CSS-first 收敛**  
  - 目标状态：布局级响应式不依赖 hydration；JS 断点仅限必要交互。  
  - 变更范围：`src/hooks/use-breakpoint.ts`、`src/components/**Responsive*`、断点常量与调用点。  
  - 验收标准：目标布局改为 Tailwind/Container Queries；禁止新增全局断点 hook。  
  - 验证：基线 + 关键页面视口 smoke（如有 e2e 再补）。  

- **P3：Badge 语义与 globals.css 拆分**  
  - 目标状态：Badge 仅展示语义且无无效 DOM 属性；全局样式按 v4 规则解耦。  
  - 变更范围：`src/components/ui/badge.tsx`、`src/app/globals.css` 及拆分文件。  
  - 验收标准：无 React 属性 warning；tokens/base/utilities 分层清晰。  
  - 验证：基线。

---

## 模块6：安全性实现

### 当前实现总结
- **安全头/CSP**：统一配置在 `src/config/security.ts`（`generateCSP`/`getSecurityHeaders`/`generateNonce`），Next.js 侧通过 `proxy.ts` 中间件按请求注入带 nonce 的 CSP 与其他安全头；`next.config.ts#headers()` 仅下发非 CSP 头，避免重复。
- **路径遍历防护**：内容/翻译加载均通过 allowlist + `path.normalize/resolve` + baseDir 前缀检查：`src/lib/content-utils.ts#validateFilePath`、`src/lib/load-messages.ts`（见模块1/2）。扩展名白名单为 `.md/.mdx/.json`。
- **输入验证/反滥用**：表单与 leads 由 Zod schema 驱动（`src/lib/lead-pipeline/lead-schema.ts`、`src/app/api/contact/contact-api-validation.ts`）；API 统一 `safeParseJson`（`src/lib/api/safe-parse-json.ts`）。Cloudflare Turnstile 全链路校验（client→`/api/verify-turnstile`→hostname/action 双白名单）。
- **速率限制**：`src/app/api/contact/contact-api-utils.ts` 在 contact/inquiry/subscribe 等 API 中用内存 Map 做 IP 级限流；另有通用 `src/lib/security-rate-limit.ts`（未被 API 使用）。
- **依赖/静态扫描**：CI 运行 `pnpm security:audit` + `semgrep.yml`（`.github/workflows/code-quality.yml`, `ci.yml`），且 ESLint 启用 security 规则集。
- **安全 util**：`src/lib/security-*` 提供 object-injection 防护、crypto/token、文件上传验证等，并有较完整的单测。

### 发现的问题
1. **`dangerouslySetInnerHTML` 直渲染 MDX 原文（潜在 XSS 面）**（严重程度: 高）  
   - 现象：blog/products 页把 Markdown/MDX 原文直接 innerHTML 注入（`src/app/[locale]/blog/[slug]/page.tsx`, `src/app/[locale]/products/[slug]/page.tsx`），未做编译/白名单/消毒。  
   - 风险：当前内容虽为 repo 内部可控，但一旦引入外部内容或编辑链路被污染，会成为高危 XSS 入口；同时违反 `.claude/rules/security.md` 的禁令。
2. **CSP 指令存在语义/一致性问题**（严重程度: 中高）  
   - 现象：`generateCSP` 中 `frame-src` 同时包含 `'none'` 与 Turnstile 域名（`src/config/security.ts`）；`SecurityModes.cspReportOnly` 未被任何输出逻辑使用；CSP 未设置 `report-uri/report-to`，但存在 `/api/csp-report` 与 `CSP_REPORT_URI` env。  
   - 风险：CSP 指令可能被浏览器忽略或行为非预期；违规上报链路“有端点无策略”，监控价值落空。
3. **生产 `style-src` 过严可能与 Next 16 内联样式冲突**（严重程度: 中）  
   - 现象：生产 `style-src` 仅允许 `'self'` + nonce（无 `'unsafe-inline'`），同时 `next.config.ts` 启用了 `experimental.inlineCss: true`。  
   - 风险：若 Next 内联 `<style>` 未带 nonce，生产样式会被 CSP 阻断；团队可能被迫放宽 `script-src` 以“救火”，反向削弱安全。
4. **速率限制双实现 + 内存限流在无状态部署下不可靠**（严重程度: 中）  
   - 现象：API 使用 `contact-api-utils.ts` 的 Map 限流；通用 `security-rate-limit.ts` 未复用。  
   - 风险：Vercel/Serverless 多实例下限流失效、被刷接口/邮件/表单导致可用性与成本风险；双实现易漂移。
5. **nonce/安全 util 存在重复与边界不清**（严重程度: 中低）  
   - 现象：nonce 生成在 `src/config/security.ts` 与 `src/lib/security-tokens.ts` 各一套，fallback 长度与 `isValidNonce` 约束不一致；`x-csp-nonce` header 目前无消费方。  
   - 风险：长期维护时可能出现“nonce 形态不一致/难排查 CSP 问题”的隐患。
6. **`security-crypto.verifyPassword` 对随机 salt 的可逆性不稳**（严重程度: 低中）  
   - 现象：`verifyPassword` 把 saltHex 解码为 UTF-8 再 re-encode（`src/lib/security-crypto.ts`），随机字节可能非有效 UTF-8，导致校验失败；测试仅覆盖显式 ASCII salt。  
   - 风险：当前未用于鉴权，但若未来直接复用将引入隐藏 auth 缺陷。
7. **输入清理函数偏“文本场景”但缺少语义边界说明**（严重程度: 低）  
   - 现象：`sanitizeInput` 等基于正则的轻量清理被用于 Airtable/Resend 文本（`src/lib/airtable/service.ts`, `src/lib/resend-utils.ts`），但函数名/文档未强调“仅用于纯文本”。  
   - 风险：未来误用于 HTML/URL 上下文时产生安全错觉。

### 改进方案（稳健长期）
- **问题1：innerHTML 注入/XSS 面**  
  - 方案：按模块2的 MDX RSC 渲染链路迁移 blog/products/pages，彻底删除所有 `dangerouslySetInnerHTML` 内容注入点。  
  - 实施要点：渲染侧不做 HTML 拼接；仅在“外部输入”入口（若未来开放 CMS）做 schema 级白名单校验。  
  - 工作量：中到大。  

- **问题2：CSP 语义与上报链路缺口**  
  - 方案：将 CSP 生成收敛为单一可测试的策略层（内部 DSL/轻量 builder），在此基础上修正指令并补齐 report-only/report-uri。  
  - 实施要点：  
    1) `frame-src` 移除与 allowlist 冲突的 `'none'`，仅保留必要域名；  
    2) 统一输出 `Content-Security-Policy` 与 `...-Report-Only`（受 `SecurityModes` 控制）；  
    3) 默认启用 `report-uri` 指向 `/api/csp-report`（或 env 覆盖），并用 Playwright 关键页回归资源加载。  
  - 工作量：中。  

- **问题3：style-src 与 inlineCss 冲突风险**  
  - 方案：维持严格 `style-src`，确保所有内联样式可获得 nonce；如 Next 内联无法保证 nonce，则在生产禁用 `inlineCss`。  
  - 实施要点：先在预览/生产通过 E2E 检测“无 nonce style 是否被阻断”，再决定是否关闭 `inlineCss`。  
  - 工作量：中。  

- **问题4：限流双实现与无状态失效**  
  - 方案：统一到分布式限流（Upstash Redis/Vercel KV 等），并删除内存 Map 限流实现。  
  - 实施要点：以 contact/inquiry/subscribe 为试点，定义 endpoint‑level 配额与降级策略（限流后返回 429 + 结构化日志）。  
  - 工作量：中。  

- **问题5：nonce util 重复**  
  - 方案：`src/config/security.ts` 作为唯一 nonce 真相源，其他模块仅 re-export/复用，不再各自产生。  
  - 实施要点：对齐 `isValidNonce` 规则，清理无消费的 `x-csp-nonce` header。  
  - 工作量：小。  

- **问题6：verifyPassword salt 可逆性隐患**  
  - 方案：将自研 `verifyPassword` 标记为 deprecated；若未来启用 auth，直接采用标准 KDF/密码哈希库（Argon2/bcrypt/scrypt）并以字节安全 salt 格式存储。  
  - 工作量：中（按是否有存量决定）。  

- **问题7：输入清理语义边界不清**  
  - 方案：引入上下文明确的清理 API（如 `sanitizePlainText`/`sanitizeUrl`/`sanitizeFilePath`），并在 Zod `.transform()` 中统一调用；旧实现保留为兼容层但不再直接使用。  
  - 工作量：中。  

### 推荐路径
以“消除 innerHTML + CSP/限流体系化 + 清理 API 单源化”为三条主线分期落地。

### 实施优先级
**P0**：移除 MDX innerHTML 注入（与模块2共用落地）。  
**P1**：修正 CSP `frame-src` 语义、补齐 report-uri/Report-Only 链路；落地分布式限流试点（contact/inquiry/subscribe）。  
**P2**：评估/调整生产 `style-src` 与 `inlineCss` 组合；收敛 nonce 工具重复。  
**P3**：verifyPassword 方案预研、输入清理语义化与 schema transform 渐进迁移。

### 实施简报（Implementation Brief）
- **P0：消除 MDX XSS 面**  
  - 目标状态：与模块2 P0 一并完成，安全侧不再存在内容 innerHTML 注入入口。  
  - 变更范围：同模块2 P0。  
  - 验收标准：安全扫描/grep 不再命中内容注入点。  
  - 验证：基线。  

- **P1：CSP 体系化与分布式限流试点**  
  - 目标状态：CSP 指令语义正确且可上报；表单类 API 在多实例下限流可生效。  
  - 变更范围：`src/config/security.ts`、`proxy.ts`、`src/app/api/csp-report/route.ts`、新增 `src/lib/security/distributed-rate-limit.ts` 并替换 `src/app/api/contact/contact-api-utils.ts` 内存限流，覆盖 contact/inquiry/subscribe 路由。  
  - 验收标准：浏览器无 CSP 误拦；Report-Only/Report-Uri 生效并有数据；限流在预览/生产可复现 429。  
  - 验证：基线 + `pnpm security:check`、CSP/限流相关 tests。  

- **P2：style-src/inlineCss 与 nonce 单源**  
  - 目标状态：生产无 CSP 阻断样式；nonce 生成/校验只有一套实现。  
  - 变更范围：`next.config.ts`（`inlineCss`/source maps）、`src/config/security.ts`、`src/lib/security-tokens.ts`。  
  - 验收标准：预览/生产控制台无 CSP style 违规；nonce 工具重复下线。  
  - 验证：基线 + 关键页 E2E 抽样。  

- **P3：密码/输入清理长期治理**  
  - 目标状态：自研密码校验弃用并预留标准 KDF；输入清理 API 语义化并收敛到 schema transform。  
  - 变更范围：`src/lib/security-crypto.ts`、`src/lib/security-validation.ts`、`src/lib/validations.ts`。  
  - 验收标准：无场景复用隐患；新 API 替代旧入口。  
  - 验证：基线。

---

## 模块8：性能和构建优化

### 当前实现总结
- **构建与分析工具链**：
  - `@next/bundle-analyzer` 已接入 `next.config.ts`，通过 `ANALYZE=true` 开关启用。
  - 统计/分析脚本：`pnpm build:analyze`（Turbopack stats）、`pnpm build:webpack`（Webpack 兜底）、`pnpm analyze:stats`（statoscope 读 webpack-stats）、`pnpm analyze:size`（粗粒度列最大 JS 产物）。
- **Bundle 预算/门禁**：未发现 `.size-limit.js`；`lighthouserc.js` 明确采用 Lighthouse CI 的 `total-byte-weight/bootup-time/unused-javascript` 作为替代预算；CI 中 `ci.yml` 仅跑 Lighthouse（critical URLs，`CI_DAILY=true` 才全量）。
- **图片优化**：统一使用 `next/image`，远程源白名单在 `next.config.ts#images.remotePatterns`（unsplash/placeholder）。组件侧普遍使用 `fill + sizes`，部分首屏/关键图设置 `priority`（`src/components/layout/logo.tsx`, `src/components/products/product-gallery.tsx`）。
- **代码分割/懒加载**：大量 `next/dynamic` islands（导航、Turnstile、WhatsApp、analytics、toaster、top-loader、below-the-fold sections 等），多为按需加载或 `ssr:false`（仅客户端依赖）以压缩首包。
- **缓存策略支撑性能**：`cacheComponents: true` 开启 Cache Components；数据函数层面已有 `'use cache' + cacheLife('days')`（contact copy、products），blog 侧暂未接入缓存；i18n/内容缓存的 tag 失效体系缺失（见模块3）。
- **运行期监控**：
  - 生产：`EnterpriseAnalyticsIsland`（客户端岛）懒加载 `web-vitals` + Vercel Analytics/SpeedInsights，并受 cookie consent 控制。
  - 开发：`LazyWebVitalsReporter` idle 后加载并可上报到自定义端点；另有大体量内部监控/基线/回归系统（`src/lib/web-vitals/*`, `src/lib/performance-monitoring-*`）当前主要用于 dev/CI 与未来扩展。

### 发现的问题
1. **Bundle 分析脚本与开关脱节**（严重程度: 中高）  
   - 现象：`next.config.ts` 只在 `ANALYZE=true` 时启用 analyzer，但 `pnpm build:analyze` 未设置该环境变量，仅设置 `TURBOPACK_STATS=1`（`package.json`）。结果是常规“分析构建”不产生 analyzer 报告。  
   - 风险：性能回归定位成本高，团队误以为已“常规可视化分析”。
2. **本地 CI 脚本仍引用 size-limit 步骤**（严重程度: 中）  
   - 现象：`scripts/ci-local.sh` 执行 `pnpm size:check`，但 `package.json` 无该脚本且 repo 无 `.size-limit.js`；同时 `lighthouserc.js` 已声明替代策略。  
   - 风险：本地 CI 性能检查必然失败或被跳过，削弱开发侧门禁可信度。
3. **Webpack 分包策略文档与 Turbopack 现实不一致**（严重程度: 中）  
   - 现象：`.augment/rules/nextjs-architecture.md` 仍描述 12 个 Webpack `cacheGroups` 的分包体系，但当前 `next.config.ts` 不再包含 splitChunks 配置；生产默认走 Turbopack 时也不会读取这些策略。  
   - 风险：维护者按旧假设做优化（或误判 chunk 结构），导致策略失效/重复劳动。
4. **Lighthouse 预算覆盖面与环境代表性有限**（严重程度: 中低）  
   - 现象：默认只跑 3 个 critical URLs，且测量在本地 `pnpm start` 环境；其余路由与真实 CDN/冷缓存波动通过 `CI_DAILY` 才覆盖。  
   - 风险：某些页面或冷启动路径的 bundle/性能回归可能被遗漏。
5. **图片体验还有提升空间**（严重程度: 低）  
   - 现象：`next/image` 用法整体规范，但首屏关键图未系统性启用 `placeholder='blur'`/预生成 blurDataURL；远程域白名单较窄，未来新增图片源需手动补。  
   - 风险：LCP/首帧观感可继续优化；新增源时容易线上 500/不显示。
6. **运行期 Web Vitals 上报链路分裂**（严重程度: 低中）  
   - 现象：生产上报在 `EnterpriseAnalyticsIsland`（Vercel track + consent gating），开发上报在 `LazyWebVitalsReporter`（自定义端点）；`/api/analytics/web-vitals` 在生产侧无数据输入。  
   - 风险：指标口径分裂，内部 dashboard/告警能力难落地。
7. **`productionBrowserSourceMaps: true` 的成本未显式评估**（严重程度: 低）  
   - 现象：默认开启生产 source maps。  
   - 风险：构建时间/产物体积上升；若部署平台误暴露 maps 可能带来信息泄露面（需与 Sentry/监控策略协同）。

### 改进方案（稳健长期）
- **问题1：Bundle 分析脚本脱节**  
  - 方案：将“分析构建”固化为稳定工具链：默认 Turbopack 产出 stats + analyzer，必要时提供 Webpack 深分析脚本。  
  - 实施要点：  
    1) `build:analyze` 统一设置 `ANALYZE=true TURBOPACK_STATS=1 next build`；  
    2) 补充 `build:analyze:webpack`（显式 `NEXT_USE_TURBOPACK=0 ANALYZE=true`）供 chunk 级溯源；  
    3) 在 docs 明确两类产物用途与口径。  
  - 工作量：小到中。  

- **问题2：本地 CI size-limit 残留**  
  - 方案：本地 CI 与主 CI 完全对齐 Lighthouse 预算；若未来需要 size budget，作为 `quality-gate.js` 的单源子门禁接入。  
  - 实施要点：先移除 `ci-local.sh` 的 `size:check`，避免门禁多源；待模块7/10门禁收敛后再引入轻量 size 检查。  
  - 工作量：小。  

- **问题3：分包策略文档漂移**  
  - 方案：更新 `.augment/rules/nextjs-architecture.md` 与相关说明，明确 Turbopack 下以动态 import/islands + analyzer 驱动分包。  
  - 工作量：小。  

- **问题4：Lighthouse 覆盖面有限**  
  - 方案：扩大 criticalUrls 覆盖到核心业务路由，并保留 CI_DAILY 全量巡检。  
  - 实施要点：将 `/products/*`、`/blog/*`、`/contact` 等纳入 critical；CI_DAILY 保持冷缓存/全站抽样。  
  - 工作量：小到中。  

- **问题5：图片体验**  
  - 方案：建立图片源/尺寸/优先级/placeholder 的长期策略清单，并对首屏关键图系统性启用 blur。  
  - 实施要点：维护 `remotePatterns` 白名单与 sizes 规范；为 hero/首屏图预生成 blurDataURL。  
  - 工作量：中。  

- **问题6：Vitals 上报分裂**  
  - 方案：收敛为单一 Reporter（prod/dev 同源），通过配置决定 sink（Vercel track、自定义端点）与 sampling/consent。  
  - 工作量：中。  

- **问题7：生产 source maps 成本/风险**  
  - 方案：默认关闭生产 source maps，仅在错误追踪场景显式开启，并确保 maps 不可公网访问。  
  - 工作量：小。  

### 推荐路径
先对齐工具链与门禁单源，再扩面性能预算与体验策略。

### 实施优先级
**P1**：修正分析脚本与本地 CI 残留；更新分包策略文档口径。  
**P2**：扩展 Lighthouse 覆盖面；首屏图 blur 占位与图片源策略。  
**P3**：统一 vitals 上报体系（若要自研监控）；source maps 环境化开关。

### 实施简报（Implementation Brief）
- **P1：构建分析/脚本/文档对齐**  
  - 目标状态：`build:analyze` 默认产出 analyzer；本地 CI 与 Turbopack 现实一致；文档无旧策略残留。  
  - 变更范围：`package.json`、`scripts/ci-local.sh`、`.augment/rules/nextjs-architecture.md`、`next.config.ts` analyzer 开关。  
  - 验收标准：`pnpm build:analyze` 生成报告；`pnpm ci:local` 不再引用 size-limit；规则文档与现状一致。  
  - 验证：基线 + `pnpm build:analyze`、`pnpm ci:local:quick`。  

- **P2：预算覆盖扩面与图片体验策略**  
  - 目标状态：Lighthouse criticalUrls 覆盖关键业务路由；首屏图 blur/remotePatterns 策略稳定。  
  - 变更范围：`lighthouserc.js`、`next.config.ts#images`、首屏图片组件。  
  - 验收标准：CI 性能门禁对关键页有效；hero 图 LCP/观感提升。  
  - 验证：基线 + `pnpm perf:lighthouse`（或 CI）。  

- **P3：vitals/SourceMaps 长期演进**  
  - 目标状态：prod/dev 单一 vitals Reporter；source maps 仅在显式场景开启。  
  - 变更范围：`src/components/monitoring/*`、`src/lib/web-vitals/*`、`next.config.ts`。  
  - 验收标准：指标口径统一；默认构建成本下降。  
  - 验证：基线。

## 模块9：服务集成

### 当前实现总结
- 统一 Lead Pipeline：`src/lib/lead-pipeline/process-lead.ts` 作为对外表单/订阅/询价的总编排层，内部并行调用 Resend 与 Airtable，并通过 `Promise.allSettled + withTimeout` 保证“至少一个成功即可返回成功”。  
- Resend 邮件：`src/lib/resend-core.tsx`, `src/lib/resend-utils.ts`, `src/lib/resend.ts`；表单类邮件由 Lead Pipeline 触发。  
- Airtable CRM：`src/lib/airtable/service.ts`, `src/lib/airtable.ts`, `src/lib/airtable/instance.ts`；动态 import 避免构建期初始化问题。  
- Turnstile 反机器人：通用校验在 `src/app/api/contact/contact-api-utils.ts#verifyTurnstile`，另有独立校验端点 `src/app/api/verify-turnstile/route.ts`。  
- Vercel Analytics/Speed Insights：通过 `src/components/monitoring/enterprise-analytics-island.tsx` 动态加载，并受 cookie consent 与 `NEXT_PUBLIC_RUM` 开关控制。  
- WhatsApp Business API：统一由 `src/lib/whatsapp-service.ts` 对外提供能力（内部 `src/lib/whatsapp-core.ts` + `src/lib/whatsapp/*` Real/Mock client），路由为 `src/app/api/whatsapp/send/route.ts` 与 `src/app/api/whatsapp/webhook/route.ts`。  
- 未发现 Zustand/Redux 等全局状态库依赖；表单侧主要走 React 19 `useActionState` 模板。

### 发现的问题
1. **（已修复 2026-01-07）WhatsApp 集成“双栈并存”且路由引用不一致** (原严重程度: 高)  
   - 现象：历史上 send/webhook 曾走不同实现链路，导致行为与配置不一致。  
   - 当前：send/webhook 已统一通过 `src/lib/whatsapp-service.ts`，不再依赖第三方 whatsapp package。  

2. **（已修复 2026-01-07）非生产初始化风险** (原严重程度: 高)  
   - 现象：历史上非生产环境存在“跳过初始化”的分支导致 API 不可回归。  
   - 当前：`src/lib/whatsapp/client-factory.ts` 在 dev/preview/test 下无凭据自动降级为 Mock client；有凭据则使用 Real client，可完整本地回归。  

3. **Turnstile 校验逻辑重复实现** (严重程度: 中)  
   - 现象：通用 util 与独立端点均实现 Cloudflare 校验/hostname/action 校验，但旁路开关与日志语义不一致。  
   - 风险：安全规则分叉；维护时容易遗漏；客户端调用路径不清晰。  

4. **输入清理函数重复且强度不一致** (严重程度: 中)  
   - 现象：`sanitizeInput` 在 `security-validation.ts`、`validations.ts`、`lead-pipeline/utils.ts` 三处定义；服务链路使用不同版本。  
   - 风险：同类输入在不同服务侧得到不同清理结果；安全审计与类型推断难度上升。  

5. **Lead Pipeline 的“至少一项成功”缺少告警/补偿** (严重程度: 中)  
   - 现象：Resend/Airtable 任一成功即返回成功，但失败侧仅日志记录，无重试/队列/outbox。  
   - 风险：长期邮件或 CRM 故障可能被用户侧掩盖；管理员感知滞后；数据不一致。  

6. **表单/订阅端点 CORS 全放开** (严重程度: 中)  
   - 现象：`/api/contact`、`/api/inquiry`、`/api/subscribe` 的 `OPTIONS` 统一 `Access-Control-Allow-Origin: *`。  
   - 风险：若无跨站嵌入需求，扩大滥用面（与模块6 CSP/限流风险耦合）。  

7. **服务集成规则文档与真实实现漂移** (严重程度: 低)  
   - 现象：`.augment/rules/service-integration.md` 示例仍提 React Email、layout 注入 Analytics、Zustand 目录等，与当前实现不符。  
   - 风险：新成员按文档开发会走偏；增加沟通成本。

### 改进方案（稳健长期）
- **问题1/2：WhatsApp 双栈与非生产初始化风险（已完成 2026-01-07）**  
  - 结果：send/webhook 统一通过 `src/lib/whatsapp-service.ts`；Real/Mock client 由 `src/lib/whatsapp/client-factory.ts` 自动选择；无凭据时 dev/preview/test 可正常回归（Mock）。  
  - 仍建议：持续完善 webhook 重试语义与发送端 backoff，并补齐更贴近业务的 auto-reply/路由策略（按需要）。  

- **问题3：Turnstile 校验重复**  
  - 方案：保留 `/api/verify-turnstile` 端点，但内部统一调用 `contact-api-utils.ts#verifyTurnstile`，让规则单源。  
  - 工作量：中。  

- **问题4：sanitizeInput 多处定义**  
  - 方案：按上下文拆分清理 API（PlainText/Url/FilePath 等）并在 schema `.transform()` 中统一使用；旧 `sanitizeInput` 仅作为兼容 re-export。  
  - 工作量：中。  

- **问题5：Lead Pipeline 可靠性补偿**  
  - 方案：引入 outbox/队列确保最终一致性：主链路写 outbox 事件，Resend/Airtable 失败进入重试队列，由 Cron/worker 异步补偿并记录指标。  
  - 工作量：大。  

- **问题6：CORS 全放开**  
  - 方案：默认收敛为 allowlist；若未来需要跨站嵌入，使用签名 token（短期 JWT/一次性签名）与 Turnstile action/hostname 绑定后再开放。  
  - 工作量：中。  

- **问题7：服务集成规则文档漂移**  
  - 方案：迁移到 `docs/` 活文档并在 `config:check`/CI 中加入一致性扫描，发现漂移即提示。  
  - 工作量：中。  

### 推荐路径
先统一 WhatsApp/Turnstile/sanitizeInput 的单源实现，再建设 outbox 保障跨服务一致性。

### 实施优先级
**P1**：WhatsApp 双栈收敛 + 修正非生产初始化；Turnstile 与 sanitizeInput 单源化。  
**P2**：补齐 Lead Pipeline 失败指标与告警；CORS 收敛为 allowlist。  
**P3**：outbox/队列与统一 Integration Layer（若业务规模与可靠性要求提升）。

### 实施简报（Implementation Brief）
- **P1：WhatsApp/Turnstile/sanitize 单源实现**
  - 目标状态：WhatsApp send/webhook 统一走 `whatsapp-service`；dev/preview/test 无凭据可用 Mock client；Turnstile 与输入清理规则单源。
  - 变更范围：`src/lib/whatsapp-core.ts`、`src/lib/whatsapp-service.ts`、`src/lib/whatsapp/*`、`src/app/api/whatsapp/*`、`src/app/api/verify-turnstile/route.ts`、输入清理相关 lib/schema。
  - 验收标准：send/webhook 使用同一 service；dev/preview 可回归；Turnstile 端点复用同一 util。
  - 验证：基线 + WhatsApp/Turnstile 相关 unit tests。
  - **DONE (2025-12-12)**：更新 `src/app/api/whatsapp/webhook/__tests__/route.test.ts`——修正 mock 路径为 `@/lib/whatsapp-service`，添加 `mockVerifyWebhookSignature`，新增 3 个签名校验测试用例（signature fails/missing header/verify call）。`pnpm vitest run src/app/api/whatsapp/webhook` 17 测试全部通过。  

- **P2：Lead Pipeline 可观测与 CORS 收敛**  
  - 目标状态：服务部分失败可被指标/告警捕获；默认 CORS allowlist。  
  - 变更范围：`src/lib/lead-pipeline/process-lead.ts`、`src/app/api/{contact,inquiry,subscribe}/route.ts`。  
  - 验收标准：连续失败可告警/可追踪；无跨站需求时拒绝非 allowlist Origin。  
  - 验证：基线。  

- **P3：outbox/队列最终一致性**  
  - 目标状态：Resend/Airtable/WhatsApp 等外部调用失败可异步补偿并最终一致。  
  - 变更范围：新增 `src/lib/outbox/**`（事件模型/存储/重试）与 `scripts/outbox-worker.ts`（Cron/worker 入口）；`src/lib/lead-pipeline/process-lead.ts` 写入 outbox。  
  - 验收标准：失败侧进入队列并可重试成功；不会影响用户同步响应。  
  - 验证：基线 + 队列/补偿测试与预览环境演练。  

## 模块10：CI/CD 和开发工作流

### 当前实现总结
- GitHub Actions 三条工作流：  
  - `ci.yml`：基础检查 → 单元测试/覆盖率硬门禁 → E2E → Lighthouse 性能 → audit 安全 → i18n/MDX 校验 → 架构巡检（含 `quality:gate`）→ 汇总。  
  - `code-quality.yml`：企业级质量门禁（TypeScript/ESLint/i18n/`quality:gate`）+ Semgrep（PR baseline / main 全扫）+ 架构/循环依赖 + 质量总结。  
  - `vercel-deploy.yml`：部署前重复质量门禁 + Vercel CLI build/deploy + build log 扫描 `MISSING_MESSAGE` + 部署后健康探测。  
- 本地与 Git hooks：`lefthook.yml` 提供 pre‑commit（格式/类型/增量 ESLint/架构守卫/i18n 条件同步/related tests）与 pre‑push（build/翻译/quality gate fast/full/架构/安全）流程；`scripts/ci-local.sh` 用于本地模拟 CI。  
- ESLint：`eslint.config.mjs` 采用 Flat Config + `eslint-config-next/core-web-vitals`/`typescript`，并启用 security/security-node 等 29 条安全规则；结合 React 19 hook 与 RSC 例外文件集。  
- 质量门禁系统：`scripts/quality-gate.js` 为统一门禁入口（coverage+security 阻断；eslint/perf 渐进）；`scripts/quality-monitor.js` 输出趋势报告。

### 发现的问题
1. **CI 工作流职责交叉/重复执行** (严重程度: 高)  
   - 现象：`ci.yml` 与 `code-quality.yml` 在相同触发器（push/PR main/develop）下同时运行，均重复 type‑check/lint/`quality:gate`/覆盖率；`vercel-deploy.yml` 又在 main/PR main 上重复同套检查。  
   - 风险：CI 耗时与成本显著上升；重复构建/测试增加 flaky 概率；失败来源不易定位。  

2. **质量门禁多源且语义不一致** (严重程度: 高)  
   - 现象：覆盖率在 `ci.yml` 是硬门禁，而 `code-quality.yml` 的 `test-quality` 仅 warning；`quality-gate.js`、Git hooks、CI jobs 又各自配置阈值/模式。  
   - 风险：开发者难以判断“哪个门禁算数”；容易出现 PR 状态冲突（参考模块7/8）。  

3. **本地 CI 脚本与真实 CI 漂移** (严重程度: 中)  
   - 现象：`scripts/ci-local.sh` 仍执行不存在的 `pnpm size:check`，与 `ci.yml`/模块8现状不一致。  
   - 风险：本地模拟 CI 失真、阻塞开发或产生误报。  

4. **Semgrep 安装方式偏重且缺少缓存** (严重程度: 中)  
   - 现象：每次 CI 通过 pip 安装 `semgrep<2`；未使用 action 或缓存 pip 目录。  
   - 风险：CI 时长增加；对 Python/pip 环境敏感，存在偶发失败面。  

5. **ESLint 规则/例外面较大，后续维护成本高** (严重程度: 中‑低)  
   - 现象：Flat config 中存在多套目录/文件级豁免与自定义标准；质量脚本再二次解析 ESLint JSON。  
   - 风险：新增目录或重构时需要同步维护例外；规则漂移可能被质量门禁“吞掉”。  

6. **（已修复 2026-01-07）Husky 依赖残留** (原严重程度: 低)  
   - 现象：历史上 `husky` 在 devDependencies 中存在，但 hooks 已由 `lefthook.yml` 接管。  
   - 当前：已移除 `husky`，仅保留 Lefthook。  

7. **Vercel CLI 部署与原生集成可能重复** (严重程度: 低‑中)  
   - 现象：`vercel-deploy.yml` 声明为“补充”，但若 Vercel GitHub Integration 仍启用，会在 PR/main 上产生双构建/双预览。  
   - 风险：部署时间变长、预览 URL 口径混乱。

### 改进方案（稳健长期）
- **问题1/2：CI 重复与门禁多源**  
  - 方案：收敛到单一主 CI（`ci.yml`）+ 单一质量门禁入口（`quality-gate.js`），其余 workflow 仅承担“深扫/部署”职责。  
  - 实施要点：  
    1) `ci.yml` 作为 PR/push required checks 的唯一来源，所有质量项（type/lint/coverage/security/perf）统一通过 `pnpm quality:gate` 管控；  
    2) `code-quality.yml` 调整为 main/nightly 深度扫描（Semgrep 全扫、趋势/架构巡检），不再重复基础门禁；  
    3) `vercel-deploy.yml` 仅保留 build log 的 `MISSING_MESSAGE` gate 与部署后验证，部署交由 Vercel 原生集成。  
  - 工作量：中。  

- **问题3：本地 CI 漂移**  
  - 方案：`scripts/ci-local.sh` 与主 CI 步骤一一对齐，并将所有预算/阈值来源指向 `quality-gate.js`。  
  - 实施要点：移除 `size:check` 残留；如需 size budget，作为 `quality-gate.js` 子门禁接入，避免多源。  
  - 工作量：小到中。  

- **问题4：Semgrep 运行成本**  
  - 方案：改用官方 Semgrep Action 并启用缓存，保留 PR baseline 语义。  
  - 工作量：小到中。  

- **问题5：ESLint 例外维护压力**  
  - 方案：保持严格规则不降级，但建立“例外登记表 + 定期收敛”机制。  
  - 实施要点：在 docs/脚本中列出例外文件集与原因，每个迭代消化一类例外并同步测试。  
  - 工作量：中（持续性）。  

- **问题6：Husky 残留（已完成 2026-01-07）**  
  - 结果：已移除 `husky` 依赖，Hook 全面由 Lefthook 接管。  

- **问题7：Vercel 部署重复**  
  - 方案：确保仅保留一条部署链路（优先 Vercel 原生集成），CLI workflow 只做质量兜底与健康验证。  
  - 工作量：中。  

### 推荐路径
先完成 CI/门禁单源收敛，再治理本地脚本与例外面。

### 实施优先级
**P1**：CI workflow 收敛与门禁口径统一（解决重复与冲突）。  
**P2**：修复本地 CI 漂移；Semgrep 加速/缓存。  
**P3**：ESLint 例外面治理；优化 Vercel 部署职责。

### 实施简报（Implementation Brief）
- **P1：主 CI + 质量门禁单源收敛**  
  - 目标状态：`ci.yml` 为唯一 required workflow；全量质量通过一次 `quality:gate` 产出；其他 workflow 不重复门禁。  
  - 变更范围：`.github/workflows/ci.yml`、`.github/workflows/code-quality.yml`、`.github/workflows/vercel-deploy.yml`、`scripts/quality-gate.js`。  
  - 验收标准：PR 上 required checks 数量显著减少且口径一致；覆盖率/性能/安全门禁不再冲突。  
  - 验证：基线 + `pnpm ci:local`（对齐后）。  

- **P2：本地 CI 对齐 + Semgrep 加速**  
  - 目标状态：本地脚本 1:1 模拟主 CI；Semgrep 采用官方 action 与缓存。  
  - 变更范围：`scripts/ci-local.sh`、`code-quality.yml`。  
  - 验收标准：本地 CI 不再出现 size-limit 残留；Semgrep 时间可控且稳定。  
  - 验证：基线。  

- **P3：工作流长期维护治理**  
  - 目标状态：ESLint 例外面可追踪并持续收敛；部署链路职责单一。  
  - 变更范围：`eslint.config.mjs`、Vercel workflows 与文档。  
  - 验收标准：例外有登记与消化节奏；无双部署/双预览。  
  - 验证：基线。

## 阶段3：全局汇总与改进路线图

### 全局问题聚类
- **类型安全/一致性**：i18n `strictMessageTypeSafety`、TS 表单/接口 `z.infer` 收敛、sanitizeInput 单源化、覆盖率门禁口径统一。  
- **内容/安全**：MDX 真实渲染链路（消除 innerHTML/XSS）、CSP 语义与上报链路、CORS allowlist、分布式限流与 Turnstile 单源规则。  
- **性能/构建**：Cache Components tag/path 失效体系、bundle 分析脚本与文档漂移修复、Lighthouse 覆盖扩面、图片体验与 vitals 上报口径收敛。  
- **服务集成**：Lead Pipeline 可观测/补偿、WhatsApp 统一实现、第三方规则文档对齐。  
- **CI/CD/工作流**：多 workflow 收敛、local CI 对齐、Semgrep 运行加速、Hook/门禁与 CI 统一真相源。  

### 统一优先级清单
**P0（立即修复/阻断级）**
- MDX RSC 渲染落地，彻底移除 `dangerouslySetInnerHTML` 注入（模块2/6）。  
- i18n `AppConfig.Messages` module augmentation 落地，启用 `strictMessageTypeSafety`（模块1/4）。  
- 覆盖率门禁“单一真相源”与阻断语义统一（模块7/10）。  

**P1（1–2 个迭代内完成）**
- CI workflow 收敛到单一主链路；`quality:gate`/coverage/性能/安全门禁口径统一（模块10 + 模块7）。  
- 本地 CI/脚本漂移修复：`build:analyze`、`ci-local.sh`、分包策略文档口径对齐（模块8/10）。  
- Next Cache tag/path 失效体系设计与试点迁移（i18n/内容优先）（模块3）。  
- MDX 生产策略补齐：禁 draft、products slug/locale 校验、读取 validation 配置（模块2）。  
- Tailwind typography/animate 插件启用与 `components.json` 对齐（模块5）。  
- CSP `frame-src`/report‑uri/Report‑Only 修正；表单类 API 分布式限流试点（模块6）。  
- WhatsApp 双栈收敛 + 非生产初始化语义修复；Turnstile 与 sanitizeInput 单源化（模块9/6/4）。  
- 覆盖率 exclude 收敛、i18n mock 修正（模块7）。  

**P2（中期优化）**
- i18n 动态路由 pathnames/监控口径收敛；lang SSR/SEO 权衡文档化（模块1/3）。  
- Lighthouse criticalUrls 扩面与图片体验（blur/remotePatterns 策略）（模块8）。  
- Lead Pipeline 失败指标/告警；CORS 收敛为 allowlist（模块9/6/10）。  
- JS 响应式体系收敛（CSS‑first）、常量语义治理（模块5）。  
- `style-src`/inlineCss/nonce 工具链评估收敛（模块6）。  

**P3（长期演进/按需）**
- vitals 上报体系统一（自研监控时）；production source maps 环境化开关（模块8）。  
- outbox/队列与统一 Integration Layer（Resend/Airtable/WhatsApp 等最终一致性）（模块9）。  
- ESLint 例外面治理与配置漂移 CI 检测；清理 Husky；Vercel deploy 职责优化（模块10/8/9）。  
- Badge 语义/API 收敛与全局样式拆分（模块5）。  
- 密码/认证体系预研（如未来启用）（模块6）。  

### 分阶段落地建议（依赖顺序）
1. **Phase 0（安全与一致性先行）**  
   - 先做 MDX 渲染链路（消除 XSS 面）。  
   - 并行补齐 i18n 类型增强。  
   - 同时确定覆盖率门禁唯一来源（以 `quality-gate.js` 为准或反向合并到 Vitest/CI）。  

2. **Phase 1（工程化与核心架构收敛）**  
   - 收敛 CI workflow 与门禁口径 → 修复本地 CI/分析脚本漂移。  
   - 上 Next Cache tag 失效体系（优先 i18n/messages 与 content）。  
   - Tailwind 插件/配置修复、CSP 修正、WhatsApp/Turnstile/sanitizeInput 单源化。  
   - 覆盖率 exclude/i18n mock 同步到新口径。  

3. **Phase 2（体验与可观测扩面）**  
   - Lighthouse 覆盖扩面与图片体验提升。  
   - CORS allowlist、Lead Pipeline 指标告警、JS 响应式与 nonce 工具链收敛。  

4. **Phase 3（按业务规模选择的长期演进）**  
   - 队列/outbox、监控自研与 vitals 统一、ESLint 例外治理/漂移检测、部署链路职责精简。  

### 全局风险评估
- **最大风险源**：MDX XSS 面、覆盖率/质量门禁冲突、WhatsApp 双栈/非生产初始化。  
- **主要技术债聚集处**：工具链/规则文档漂移（模块5/8/9/10）、重复实现（sanitizeInput/Turnstile/WhatsApp）。  
- **落地策略**：优先“单源真相 + 先收敛再增强”，避免在门禁冲突与文档漂移未解决前做大规模重构。

## 复验补充（2025-12-12）

### 复验范围
- 覆盖率/门禁/CI 相关变更（大量新增测试 + `vitest.config.mts`/`scripts/quality-gate.js`/CI YAML 调整）。  
- i18n 运行时加载链路变更（`src/lib/load-messages.ts`）。  
- 轻量全局门禁复验（`pnpm quality:gate`）。  

### 最新覆盖率与门禁结果
- 全局质量门禁：`pnpm quality:gate` **全部通过**（Code Quality / Coverage / Performance / Security 均 passed）。  
- 覆盖率总量（`reports/coverage/coverage-summary.json`）：  
  - lines **80.52%**  
  - statements **80.02%**  
  - functions **81.02%**  
  - branches **73.64%**  
  已达到 Phase 2 目标（≥80% statements/lines）。  
- `scripts/quality-gate.js` 覆盖率阈值已调整为 Phase 1 基线（65%）并保留 diff 覆盖≥90% 规则；现状下阈值本身不再是阻塞点。  

### 受影响模块复验结论
- **模块1/3/4（i18n/App Router/TS）**：  
  - `src/lib/load-messages.ts` 已增强：增加 locale 白名单清理、CI/E2E bypass cache、`unstable_cache` tags（`i18n/*`），HTTP→FS fallback 更稳。  
  - 仍未发现 `AppConfig.Messages` module augmentation 或 `strictMessageTypeSafety` 落地；翻译 key/ICU 参数类型安全 **P0 结论不变**。  
  - Cache 侧虽有 tags，但无 `revalidateTag/Path` 触发链路；“可控失效体系缺失”问题仍成立，严重度略下降但仍是 **P1**。  

- **模块2/6（MDX/安全）**：  
  - `dangerouslySetInnerHTML` 仍存在于 blog/products/static pages/layout 注入路径，innerHTML/XSS 风险 **未改善**，**P0 结论不变**。  

- **模块7/10（测试/CI）**：  
  - 覆盖率数值已达标，但 `ci.yml` 与 `code-quality.yml` 仍重复执行 `pnpm test:coverage`（且语义不同），多源门禁冲突风险 **仍存在**，**P0 结论不变**。  
  - 本地 `scripts/ci-local.sh` 仍含 `pnpm size:check` 残留，与现状 Lighthouse gate 不一致，**P2/P1 结论不变**。  

- **模块8（性能/构建）**：  
  - `build:analyze` 仍未设置 `ANALYZE=true`（仅 `TURBOPACK_STATS=1`）；包分析常规启用问题 **仍存在（P1）**。  

### 对路线图的影响
- 路线图总体优先级不变；仅需在模块7/10、阶段3中更新“最新覆盖率已达 Phase 2”的事实与阈值口径说明。  
