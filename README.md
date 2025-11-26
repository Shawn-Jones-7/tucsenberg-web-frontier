# 🚀 Tucsenberg Web Frontier

现代化B2B企业网站模板，采用Next.js 16 + React 19 + TypeScript 5.9 + Tailwind CSS
4技术栈，实现英中双语国际化、主题切换、响应式设计，确保企业级质量标准。

## ✨ 特性

- 🎯 **现代技术栈**: Next.js 16.0.4 + React 19.1.1 + TypeScript 5.9.3
- 🎨 **现代化UI**: Tailwind CSS 4.1.17 + 响应式设计
- 📝 **内容管理**: MDX + Git-based 工作流
- 🌍 **国际化支持**: 英中双语切换 + next-intl
- 🎭 **主题系统**: 明亮/暗黑/系统主题
- 📊 **错误监控（可选）**: 默认不启用客户端 Sentry；支持“服务端/边缘优先”的可选接入，兼顾性能与可观测性
- 🔒 **企业级安全**: ESLint 9生态 + 安全扫描
- ⚡ **性能优化**: 包大小控制 + 性能预算
- 🏗️ **架构检查**: 循环依赖检测 + 架构一致性

## 🌐 翻译定制

本项目使用**分层翻译架构**，将翻译文件拆分为首屏必需（critical）和延迟加载（deferred）两部分，既优化了性能，又便于企业快速定制。

### 文件结构

```
messages/
├── en/
│   ├── critical.json    # 首屏必需翻译（Header、Footer、Hero）
│   └── deferred.json    # 延迟加载翻译（其他所有内容）
└── zh/
    ├── critical.json
    └── deferred.json
```
> 注: `messages/en.json` 和 `messages/zh.json` 仅用于 Vitest 测试与翻译形状校验, 运行时代码不会直接从这些文件加载翻译。



### 快速定制

**修改品牌信息**：编辑 `messages/[locale]/critical.json`
```json
{
  "home": {
    "hero": {
      "title": {
        "line1": "Your Company Name",    // ← 修改公司名称
        "line2": "Professional Slogan"   // ← 修改 Slogan
      }
    }
  },
  "seo": {
    "siteName": "Your Company"  // ← 修改站点名称
  }
}
```

**验证翻译完整性**：
```bash
pnpm validate:translations
```

## 🛠️ 环境要求

- **Node.js**: 20.x（与 CI/Vercel 一致，已在 `.nvmrc` 固定为 20）
- **包管理器**: pnpm 10.13.1（已在 `.npmrc` 与 CI 固定）
- **操作系统**: macOS, Linux, Windows

> 提示：使用 nvm/fnm/asdf 进入仓库目录后自动切到 Node 20；若不生效，请执行 `nvm use`。

### 🔐 Turnstile 配置

本地或部署环境需要在 `.env.local`（或对应的环境变量管理服务）中提供 Cloudflare Turnstile 凭证：

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=你的站点公钥
TURNSTILE_SECRET_KEY=你的服务端私钥
```

> ⚠️ 请勿将真实密钥提交到版本库。若需要示例值，可在本地 `.env.example` 中添加占位符，实际密钥通过环境变量注入。

针对额外安全策略（如限制域名、Action 值）可使用：`TURNSTILE_ALLOWED_HOSTS`、`TURNSTILE_EXPECTED_ACTION`、`NEXT_PUBLIC_TURNSTILE_ACTION`。

## ⚙️ 配置驱动特性

- **联系表单配置**：`src/config/contact-form-config.ts` 提供字段顺序、启用状态以及校验配置，并通过 `buildFormFieldsFromConfig` 与 `createContactFormSchemaFromConfig` 同步前后端字段定义。
- **WhatsApp 支持**：`FEATURE_FLAGS.ENABLE_WHATSAPP_CHAT`（可通过 `ENABLE_WHATSAPP_CHAT` 环境变量关闭）配合 `SITE_CONFIG.contact.whatsappNumber`（可通过 `NEXT_PUBLIC_WHATSAPP_NUMBER` 覆盖）自动在右下角注入 `WhatsAppFloatingButton`。
- **主题与变量**：`src/config/theme-customization.ts` 定义品牌色、布局与组件默认样式，`getThemeCssVariables()` 注入 CSS 变量，并将 `THEME_CUSTOMIZATION.components.button` 应用于所有 `Button` 默认变体。

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd tucsenberg-web-frontier
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev          # 开发服务器（默认 Turbopack）
# 或显式使用 Turbopack
pnpm dev:turbopack
```

### 4. 访问应用

- **主站**: [http://localhost:3000](http://localhost:3000)

### 5. 构建生产版本

```bash
pnpm build
pnpm start
```

## 📁 项目结构

```
src/
├── app/          # Next.js App Router 入口、布局、路由
├── components/   # 共享 UI 组件
├── config/       # 配置与常量（feature flags、主题等）
├── constants/    # 常量定义
├── hooks/        # 自定义 hooks
├── i18n/         # 国际化辅助
├── lib/          # 工具函数与通用逻辑
├── services/     # 后端/第三方集成
├── shared/       # 共享类型与工具
├── templates/    # 模板片段
├── test/         # 测试辅助
├── testing/      # 测试基建
└── types/        # TypeScript 类型
```

## 🔧 可用脚本

### 开发相关

```bash
pnpm dev               # 启动开发服务器（默认 Turbopack）
pnpm dev:turbopack     # 显式使用 Turbopack
pnpm build             # 构建生产版本（默认 Turbopack）
pnpm build:webpack     # 使用 Webpack 构建（回退/对比）
pnpm build:analyze     # 生成 Turbopack 构建分析
pnpm start             # 启动生产服务器
```

### 代码质量

```bash
pnpm lint:check        # ESLint 检查
pnpm lint:fix          # 自动修复 ESLint 问题
pnpm format:check      # Prettier 格式检查
pnpm format:write      # 自动格式化
pnpm type-check        # TypeScript 类型检查
pnpm type-check:tests   # 测试相关类型检查
pnpm validate:translations # 翻译完整性校验
```

### 质量与安全

```bash
pnpm quality:monitor        # 本地质量监控
pnpm quality:report:local   # 生成质量报告
pnpm quality:gate           # 类型+lint+质量关卡
pnpm quality:quick:staged   # 暂存区快速质量检查
pnpm arch:check             # 依赖与架构检查
pnpm circular:check         # 循环依赖检测
pnpm security:check         # 安全扫描（npm audit + semgrep）
pnpm config:check           # 配置一致性检查
pnpm unused:check           # 未使用代码检查（knip）
```

### 测试相关

```bash
pnpm test             # 运行测试
pnpm test:coverage    # 测试覆盖率报告
pnpm test:e2e         # Playwright E2E 测试
pnpm test:e2e:no-reuse # Playwright E2E（隔离上下文）
pnpm perf:lighthouse  # Lighthouse CI（性能）
```

> 覆盖率、关键组件清单请以最新 `pnpm test:coverage` 输出为准。

## 🏗️ 技术栈详情

### 核心框架

- **Next.js 16.0.4** - React全栈框架，App Router架构
- **React 19.1.1** - 用户界面库，支持服务器组件
- **TypeScript 5.9.3** - 类型安全的JavaScript超集

### 样式和UI

- **Tailwind CSS 4.1.17** - 原子化CSS框架，CSS-first配置
- **Geist字体** - Vercel设计的现代字体系列

### 内容管理

- **MDX** - Markdown + React 组件支持，基于文件系统的内容管理
- **next-intl** - 多语言国际化解决方案
- **Gray Matter** - Front Matter 解析和元数据处理

### 开发工具

- **ESLint 9** - 代码质量检查 (9个插件)
- **Prettier** - 代码格式化
- **TypeScript严格模式** - 最严格的类型检查
- **React Scan** - React 组件性能监控和渲染分析

### 质量保障

- **dependency-cruiser** - 架构一致性检查
- **eslint-plugin-security / semgrep** - 安全扫描
- **npm audit** - 依赖安全基线
- **Sentry（可选）** - 默认禁用客户端；服务端/边缘可按需启用

## ✅ 架构重构成果

项目已完成系统性架构重构，显著提升了代码质量、构建性能和开发体验：

### 重构成果
- **Export * 数量**: 97个 → 7个 ✅（减少 93%）
- **TypeScript错误**: 3093个 → 0个 ✅（100% 解决）
- **ESLint 问题**: 2075个 → 2个 ✅（减少 99.9%）
- **文件总数**: 786个 → 719个（减少 8.5%，持续优化中）

## 📚 学习资源

- [Next.js 16 文档](https://nextjs.org/docs) - 了解最新特性
- [React 19 文档](https://react.dev) - React最新功能
- [TypeScript 手册](https://www.typescriptlang.org/docs/) - TypeScript指南
- [Tailwind CSS 文档](https://tailwindcss.com/docs) - 样式框架指南

## 🚀 部署

推荐使用 [Vercel平台](https://vercel.com) 部署，由Next.js创建者提供：

```bash
# 使用Vercel CLI部署
npx vercel

# 或连接GitHub自动部署
# 1. 推送代码到GitHub
# 2. 在Vercel导入项目
# 3. 自动部署和CI/CD
```

查看
[Next.js部署文档](https://nextjs.org/docs/app/building-your-application/deploying)
了解更多部署选项。

## 🧭 错误监控策略（Sentry）

本模板以“内容/营销站点”为默认定位，强调性能与首屏体验：

- 默认不启用客户端 Sentry，避免增加 vendors 包与 CWV 风险。
- 支持“服务端/边缘优先”的可选接入，用于 API/Server Actions/Edge 的异常上报与发布健康。
- 通过环境变量门控可快速开启/关闭：

```bash
# 关闭 Sentry 打包与客户端使用（默认建议）
DISABLE_SENTRY_BUNDLE=1
NEXT_PUBLIC_DISABLE_SENTRY=1

# 如需启用（建议仅在生产且有清晰告警流程时）
unset DISABLE_SENTRY_BUNDLE
unset NEXT_PUBLIC_DISABLE_SENTRY

# 并配置必要的凭据
SENTRY_DSN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
```

启用时建议采用“最小化”策略：仅服务端/边缘，客户端按需动态加载、低采样、禁用 Replay/Feedback/Tracing 等重功能，并受同意（Consent）管理控制。

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

<!-- auto-deploy test:  -->
<!-- auto-deploy test: 2025-10-31T05:58:07Z -->
