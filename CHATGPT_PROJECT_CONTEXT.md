# 项目上下文（可直接投喂到对话框）

注意：请不要把 `.env.local` 或任何真实密钥粘贴到对话框；环境变量以 `.env.example` 为准。

---

## 1) Project Summary（TL;DR）

- 项目名：`tucsenberg-web-frontier`
- 类型：现代化 B2B 企业站模板（MDX 内容 + i18n + 主题切换 + 安全/质量门禁）
- 核心特性：
  - App Router（仅 App Router，不使用 Pages Router）
  - 英中双语：`next-intl`（路由前缀 locale：`src/app/[locale]/...`）
  - UI：Tailwind CSS v4 + `shadcn/ui`（`src/components/ui/*`，RSC 友好）
  - 内容：`content/**` 下的 MDX（blog/products/pages）
  - 企业级质量：`eslint` + `tsc` + `vitest` + `playwright` + 安全扫描（`semgrep`）+ “质量门禁”脚本

---

## 2) Tech Stack（版本以 `package.json` 为准）

- Framework：Next.js `16.0.10`（`next.config.ts` 启用 `cacheComponents: true`）
- React：`19.1.1`，TypeScript：`5.9.3`（`tsconfig.json` 严格模式）
- UI：
  - Tailwind CSS：`4.1.17`
  - `shadcn/ui`（基于 Radix + `class-variance-authority` + `tailwind-merge` + `lucide-react`）
  - Theme：`next-themes`（明亮/暗黑/系统）
- i18n：`next-intl`
- 测试：`vitest`（单测/组件），`playwright`（e2e），`@testing-library/*`
- 工程/质量：
  - ESLint（`eslint.config.mjs`，含 `eslint-plugin-security`、React Hooks 规则等）
  - Prettier（`prettierrc` + import sort）
  - 依赖/架构：`dependency-cruiser`、`madge`、`knip`
  - 安全：`pnpm audit` + `semgrep`

---

## 3) How to Run（本地命令速查）

环境：
- Node：`>=20 <21`（见 `.nvmrc` / `package.json engines`）
- pnpm：`>=10.13.1 <11`（`packageManager: pnpm@10.13.1`）

常用命令（见 `package.json scripts`）：
- 开发：
  - `pnpm dev`（会先执行 `npx --yes @react-grab/claude-code@latest` 再 `next dev`）
  - `pnpm dev:no-grab`（纯 `next dev`，排查 dev 注入问题优先用这个）
  - `pnpm dev:turbopack`（`next dev --turbopack`）
- 构建/运行：`pnpm build` / `pnpm start`
- 类型/格式/规范：
  - `pnpm type-check`
  - `pnpm lint:check` / `pnpm lint:fix`
  - `pnpm format:check` / `pnpm format:write`
- 测试：`pnpm test` / `pnpm test:coverage` / `pnpm test:e2e`
- 质量门禁（CI 常用）：`pnpm quality:gate`（或 `quality:gate:fast/full`）

---

## 4) Repo Layout（“哪里放什么”的地图）

**源代码只在 `src/` 下**：
- `src/app/`：App Router 路由/布局/route handlers
  - 国际化路由：`src/app/[locale]/...`
  - API：`src/app/api/**/route.ts`
- `src/components/`：组件分层（重点）
  - `src/components/ui/`：`shadcn/ui` 基础组件（Button、Card、Dialog 等）
  - `src/components/layout/`：布局/导航
  - `src/components/home/`：首页模块
  - `src/components/i18n/`：i18n 相关组件
  - `src/components/theme/`：主题切换相关
- `src/config/`：配置/开关/主题/安全/CORS 等
- `src/constants/`：常量（避免 magic numbers）
- `src/hooks/`：自定义 hooks（注意 React 19 hooks 规则）
- `src/i18n/`：i18n request/routing 相关
- `src/lib/`：通用工具/基础设施封装（例如 `cn()` 在 `src/lib/utils.ts`）
- `src/services/`：第三方/后端服务集成
- `src/test/`、`src/testing/`、`tests/`：测试基建与用例

内容与翻译（非 `src/`）：
- `content/**`：MDX 内容（blog/products/pages）
- `messages/**`：翻译（分层：`critical.json` + `deferred.json`）
- `public/`：静态资源

### 4.1 目录树（对话投喂版）

```text
tucsenberg-web-frontier/
  src/
    app/
      [locale]/
      api/
      layout.tsx
      page.tsx
      globals.css
      global-error.tsx
    components/
      ui/
      layout/
      home/
      i18n/
      theme/
    config/
    constants/
    hooks/
    i18n/
    lib/
    services/
    shared/
    styles/
    templates/
    test/
    testing/
    types/
  content/
    posts/{en,zh}/
    products/{en,zh}/
    pages/{en,zh}/
  messages/
    en/{critical,deferred}.json
    zh/{critical,deferred}.json
  public/
  scripts/
  tests/
  middleware.ts
  next.config.ts
  tsconfig.json
  eslint.config.mjs
  postcss.config.mjs
  components.json
  .env.example
  README.md
  DEVELOPMENT.md
```

---

## 5) Routing Map（高频页面/接口）

### 5.1 页面路由（App Router）

根入口：
- `src/app/layout.tsx`、`src/app/page.tsx`（通常是 root landing/重定向/壳）

i18n 页面（示例，不完整）：
- `src/app/[locale]/layout.tsx`：locale 级 Layout（Header/Footer/Providers 等）
- `src/app/[locale]/page.tsx`：locale 首页
- `src/app/[locale]/about/page.tsx`
- `src/app/[locale]/blog/page.tsx`、`src/app/[locale]/blog/[slug]/page.tsx`
- `src/app/[locale]/products/page.tsx`、`src/app/[locale]/products/[slug]/page.tsx`
- `src/app/[locale]/contact/page.tsx`
- `src/app/[locale]/faq/page.tsx`
- `src/app/[locale]/privacy/page.tsx`
- `src/app/[locale]/terms/page.tsx`

### 5.2 API Route Handlers

常见接口（示例）：
- 联系/询盘：`src/app/api/contact/route.ts`、`src/app/api/inquiry/route.ts`
- Turnstile：`src/app/api/verify-turnstile/route.ts`
- 订阅：`src/app/api/subscribe/route.ts`
- 健康检查：`src/app/api/health/route.ts`
- CSP 上报：`src/app/api/csp-report/route.ts`
- 缓存失效：`src/app/api/cache/invalidate/route.ts`
- Analytics：`src/app/api/analytics/*/route.ts`
- WhatsApp：`src/app/api/whatsapp/*/route.ts`

---

## 6) UI System（Tailwind + shadcn/ui + Theme）

心智模型：  
`shadcn/ui` 是“可拷贝的组件源码”，在项目里就是普通 React 组件文件；你改它就是改项目源码，不是改 node_modules。

### 6.1 shadcn/ui 约定

- 配置文件：`components.json`
  - `style: "new-york"`，`rsc: true`，`tsx: true`
  - alias：
    - `ui: "@/components/ui"`
    - `utils: "@/lib/utils"`
- 组件目录：`src/components/ui/*`
- 依赖策略：项目**不依赖 shadcn CLI** 来“运行时生成组件”，组件源码已在仓库内；需要新增组件时按现有风格手动引入/实现，避免再引入新 UI 库
- `cn()` 工具：`src/lib/utils.ts`（`clsx` + `tailwind-merge`）

### 6.2 Tailwind v4（本项目形态）

- Tailwind 通过 PostCSS 插件启用：`postcss.config.mjs`
- 全局样式入口：`src/app/globals.css`（shadcn 配置也指向这里：`components.json.tailwind.css`）
- 主题/品牌变量：
  - 主题切换：`next-themes`
  - 品牌/主题定制（见 README 提及）：`src/config/theme-customization.ts`（定义 tokens 并注入 CSS variables）

---

## 7) i18n（next-intl + 分层 messages）

心智模型：  
“翻译 key 就像页面里的内容插槽”，`messages/**` 负责填充插槽；路由前缀 `[locale]` 决定用哪套 messages。

关键点：
- Middleware：`middleware.ts` 使用 `next-intl/middleware`，并做了：
  - locale cookie（`NEXT_LOCALE`）写入
  - 安全头注入（调用 `getSecurityHeaders()`，带 nonce）
  - 处理非法 locale 前缀的安全重定向
- i18n request 配置：`src/i18n/request.ts`
  - 通过 `loadCompleteMessages()` 加载完整 messages
  - 启用缓存/性能监控（`I18nPerformanceMonitor`、`TranslationCache`）
- 翻译文件结构（见 `README.md`）：
  - `messages/{en,zh}/critical.json`
  - `messages/{en,zh}/deferred.json`
  - `messages/en.json`、`messages/zh.json` 主要用于 Vitest 形状校验（运行时不直接从这里加载）

---

## 8) Content System（MDX）

心智模型：  
`content/**` 是“内容数据库（文件版）”，代码负责把它解析成页面。

关键目录：
- `content/posts/{en,zh}/*.mdx`
- `content/products/{en,zh}/*.mdx`
- `content/pages/{en,zh}/*.mdx`

构建前置：
- `pnpm prebuild` 会执行：
  - `scripts/copy-translations.js`
  - `scripts/generate-content-manifest.ts`
  - `pnpm content:slug-check`（确保 slug 同步等）

---

## 9) Security（CSP / Headers / CORS）

关键文件：
- `src/config/security.ts`：
  - CSP（`generateCSP(nonce)`）
  - 安全头（`getSecurityHeaders(nonce)`）
  - nonce 生成（`generateNonce()`）
- `next.config.ts`：
  - `headers()` 应用安全头（刻意移除 CSP，优先由 middleware 带 nonce 下发，避免重复/冲突）
- `src/config/cors.ts`：CORS 策略（允许来源来自 `CORS_ALLOWED_ORIGINS`）

---

## 10) Environment Variables（只列“你可能需要关心的”）

真实来源：`.env.example`（请不要把 `.env.local` 贴进对话框）

高频变量（节选）：
- 站点：`NEXT_PUBLIC_BASE_URL`、`NEXT_PUBLIC_SITE_URL`
- i18n：`NEXT_PUBLIC_DEFAULT_LOCALE`、`NEXT_PUBLIC_SUPPORTED_LOCALES`
- 安全：`SECURITY_HEADERS_ENABLED`、`NEXT_PUBLIC_SECURITY_MODE`
- Turnstile：`NEXT_PUBLIC_TURNSTILE_SITE_KEY`、`TURNSTILE_SECRET_KEY`（以及 bypass/hosts/action）
- WhatsApp：`WHATSAPP_ACCESS_TOKEN`、`WHATSAPP_PHONE_NUMBER_ID`、`WHATSAPP_API_KEY` 等
- Email（Resend）：`RESEND_API_KEY`
- Analytics：`NEXT_PUBLIC_GA_MEASUREMENT_ID`、`NEXT_PUBLIC_ENABLE_ANALYTICS` 等
- 质量脚本：例如 `QUALITY_*`、`CI`、`GITHUB_ACTIONS` 等（多用于 scripts）

---

## 11) Quality Gates（为什么这个项目“改一点就可能过不了 CI”）

心智模型：  
它像“机场安检”，你写完代码还得过：类型检查、lint、测试、安全扫描、架构约束。

主要约束/工具：
- TypeScript strict：`tsconfig.json`（`strict: true`，`noImplicitAny: true`）
- ESLint：`eslint.config.mjs`
  - 禁止在应用代码里随意 `console.*`（生产构建也会 `removeConsole`）
  - React hooks 规则严格（尤其是避免不必要的 `useEffect`）
- 常见编码护栏（给 ChatGPT 的约束提示）：
  - 导入：优先用 `@/…` alias，避免深层相对路径
  - 模块边界：避免新增 `export *` barrel（架构检查可能拦截）
  - App Router：`page.tsx`/`layout.tsx` 里尽量只做组合与 Next.js 配置，把复杂逻辑下沉到 `src/components`/`src/lib`
- 架构/依赖：
  - `pnpm arch:check`（`dependency-cruiser`）
  - `pnpm circular:check`（`madge`）
  - `pnpm unused:check`（`knip`）
- 安全：
  - `pnpm security:check`（`pnpm audit` + `semgrep`）
- 质量门禁：
  - `pnpm quality:gate`（见 `scripts/quality-gate.js` 等）

---

## 12) Key Files Index（需要我补充片段时，优先从这里点名）

- `package.json`：依赖/脚本/版本基线
- `next.config.ts`：Next.js 配置、headers、alias、MDX、next-intl、bundle analyzer
- `tsconfig.json`：TS 严格规则、path alias（`@/* -> src/*`）
- `eslint.config.mjs`：lint 与安全规则
- `components.json`：shadcn/ui 配置与 alias
- `postcss.config.mjs`：Tailwind v4 PostCSS 插件
- `src/app/globals.css`：全局样式与 CSS variables
- `middleware.ts`：i18n + 安全头（Edge）
- `src/i18n/request.ts`：next-intl request config + messages 加载
- `src/config/security.ts`：CSP/nonce/headers
- `README.md`、`DEVELOPMENT.md`：二次开发指南与约束

---

## 13) 你可以这样问我（让回答更可执行）

- “我想在 `src/app/[locale]/products/[slug]/page.tsx` 增加一个 shadcn `Tabs`，并保持 RSC 优先，应该怎么拆分组件？”
- “我需要新增一个 API：`/api/xxx`，如何复用现有安全头/限流/验证模式？”
- “我遇到 `next-intl` 语言重定向/缓存问题，给你 `middleware.ts` 和报错日志，你帮我定位。”
- “我想改主题色/按钮默认样式，应该改 `src/config/theme-customization.ts` 的哪些字段，如何影响 `src/components/ui/button.tsx`？”
