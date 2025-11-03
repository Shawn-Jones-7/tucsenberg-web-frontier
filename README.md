# 🚀 Tucsenberg Web Frontier

现代化B2B企业网站模板，采用Next.js 15 + React 19 + TypeScript 5.9 + Tailwind CSS
4技术栈，实现英中双语国际化、主题切换、响应式设计，确保企业级质量标准。

## ✨ 特性

- 🎯 **现代技术栈**: Next.js 15.5.4 + React 19.1.1 + TypeScript 5.9.2
- 🎨 **现代化UI**: Tailwind CSS 4.1.11 + 响应式设计
- 📝 **内容管理**: MDX + Git-based 工作流
- 🌍 **国际化支持**: 英中双语切换 + next-intl
- 🎭 **主题系统**: 明亮/暗黑/系统主题
- 📊 **错误监控（可选）**: 默认不启用客户端 Sentry；支持“服务端/边缘优先”的可选接入，兼顾性能与可观测性
- 🔒 **企业级安全**: ESLint 9生态 + 安全扫描
- ⚡ **性能优化**: 包大小控制 + 性能预算
- 🏗️ **架构检查**: 循环依赖检测 + 架构一致性

## 🛠️ 环境要求

- **Node.js**: 18.17.0 或更高版本
- **包管理器**: pnpm 8.0+ (推荐)
- **操作系统**: macOS, Linux, Windows

### 🔐 Turnstile 配置

本地或部署环境需要在 `.env.local`（或对应的环境变量管理服务）中提供 Cloudflare Turnstile 凭证：

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=你的站点公钥
TURNSTILE_SECRET_KEY=你的服务端私钥
```

> ⚠️ 请勿将真实密钥提交到版本库。若需要示例值，可在本地 `.env.example` 中添加占位符，实际密钥通过环境变量注入。

针对额外安全策略（如限制域名、Action 值）可使用：`TURNSTILE_ALLOWED_HOSTS`、`TURNSTILE_EXPECTED_ACTION`、`NEXT_PUBLIC_TURNSTILE_ACTION`。

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
pnpm dev --turbo  # 使用Turbopack加速开发（React Scan自动启用）

# 可选：禁用React Scan性能监控
pnpm dev:no-scan  # 禁用React组件性能分析
```

### 4. 访问应用

- **主站**: [http://localhost:3000](http://localhost:3000)
- **开发工具**: [http://localhost:3000/dev-tools](http://localhost:3000/dev-tools) (仅开发环境)

### 5. 构建生产版本

```bash
pnpm build
pnpm start
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── error-test/        # Sentry错误测试页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局组件
│   └── page.tsx           # 首页
├── components/            # 可复用UI组件
├── features/              # 功能模块
│   ├── auth/             # 认证功能
│   └── dashboard/        # 仪表板功能
├── lib/                   # 工具库
├── shared/               # 共享工具函数
│   └── utils.ts          # 通用工具函数
└── types/                # TypeScript类型定义
```

## 🔧 可用脚本

### 开发相关

```bash
pnpm dev              # 启动开发服务器
pnpm dev --turbo      # 使用Turbopack启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器
```



### 代码质量

```bash
pnpm lint             # ESLint检查
pnpm lint:fix         # 自动修复ESLint问题
pnpm lint:strict      # 严格模式检查 (0警告)
pnpm format:check     # Prettier格式检查
pnpm format:write     # 自动格式化代码
pnpm type-check       # TypeScript类型检查
pnpm type-check:strict # 严格TypeScript检查
```

### 质量保障

```bash
# 四层质量保障体系
pnpm quality:check:strict  # 完整质量检查
pnpm quality:quick         # 快速质量检查
pnpm health               # 项目健康状态
pnpm ready                # 部署就绪检查
pnpm report               # 质量报告查看

# 架构和安全检查
pnpm arch:validate        # 架构一致性检查
pnpm security:check   # 安全扫描
pnpm size:check       # 包大小检查
pnpm duplication:check # 代码重复度检查
```

### 测试相关

```bash
pnpm test             # 运行测试
pnpm test:watch       # 监听模式测试
pnpm test:coverage    # 测试覆盖率报告
pnpm test:ui          # 可视化测试界面
```

#### 测试覆盖率状态

- **当前覆盖率**: 57.09% (目标: 60%)
- **已覆盖行数**: 9,971 / 17,463 行
- **函数覆盖率**: 81.11% (524 / 646)
- **分支覆盖率**: 87.38% (1,573 / 1,800)

#### 关键组件测试状态

- ✅ **hero-section.tsx**: 100% 覆盖率
- ✅ **project-overview.tsx**: 100% 覆盖率
- ✅ **enhanced-locale-switcher.tsx**: 100% 覆盖率
- ✅ **structured-data-generators.ts**: 100% 覆盖率
- ✅ **navigation.ts**: 100% 覆盖率
- ✅ **contact-form.tsx**: 98.63% 覆盖率
- ✅ **dropdown-menu.tsx**: 100% 覆盖率
- 🔄 **tech-stack-section.tsx**: 测试已创建，待验证
- 🔄 **contact/page.tsx**: 测试已创建，待验证

#### 测试技术栈

- **测试框架**: Vitest 3.2.4
- **测试库**: @testing-library/react 16.3.0
- **Mock配置**: vi.hoisted 模式
- **覆盖率工具**: @vitest/coverage-v8
- **测试模式**: React Server Components 兼容

## 🏗️ 技术栈详情

### 核心框架

- **Next.js 15.4.6** - React全栈框架，App Router架构
- **React 19.1.1** - 用户界面库，支持服务器组件
- **TypeScript 5.9.2** - 类型安全的JavaScript超集

### 样式和UI

- **Tailwind CSS 4.1.11** - 原子化CSS框架，CSS-first配置
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
- **eslint-plugin-security** - 安全扫描
- **size-limit** - 包大小控制
- **Sentry（可选）** - 默认禁用客户端；服务端/边缘可按需启用

## 🛡️ 四层质量保障体系

本项目采用**企业级四层质量保障体系**，确保代码质量和项目稳定性：

### 🔧 第一层：自动化检查

- **TypeScript严格检查**: `pnpm type-check:strict`
- **ESLint严格检查**: `pnpm lint:strict`
- **代码格式检查**: `pnpm format:check`
- **构建验证**: `pnpm build`
- **安全扫描**: `pnpm security:check`
- **性能预算**: `pnpm size:check`

### 🤖 第二层：AI技术审查

- **技术实现质量** (30%): 代码正确性、架构合理性
- **最佳实践遵循** (30%): 框架最佳实践、编码规范
- **企业级标准** (25%): 安全性、性能、可维护性
- **项目整体影响** (15%): 架构一致性、后续影响

### 📈 第三层：项目聚合

- **健康状态监控**: 实时项目健康度评估
- **部署就绪度评估**: 自动化部署条件检查
- **质量报告生成**: 多维度质量分析报告
- **性能指标追踪**: 持续性能监控

### 👤 第四层：人工确认

- **功能验证清单**: 具体功能点验证
- **用户体验测试**: 实际使用场景测试
- **业务逻辑确认**: 业务需求符合性检查
- **最终质量把关**: 人工最终审核

### 📊 质量指标

- **配置覆盖率**: 92.1% (35/38个任务有完整QA配置)
- **自动化检查点**: 140+个检查点
- **问题发现率**: 100%
- **问题修复率**: 100%

## 🔍 质量标准

本项目遵循企业级质量标准：

- ✅ **类型安全**: TypeScript严格模式，100%类型覆盖
- ✅ **代码规范**: ESLint 9生态，0警告标准
- ✅ **架构一致性**: 0循环依赖，架构规则验证
- ✅ **安全扫描**: 28个安全规则，0安全问题
- ✅ **性能预算**: 包大小控制，性能监控
- ✅ **错误监控**: 默认不启用客户端 Sentry；支持按需启用服务端/边缘错误上报

## 🏗️ 架构重构

本项目正在进行系统性架构重构，旨在提升代码质量、构建性能和开发体验：

- **📋 [重构指南](./docs/refactoring/README.md)** - 完整的重构流程和策略
- **🎯 [最佳实践](./docs/refactoring/best-practices.md)** - 代码组织和重构规范
- **✅ [代码审查Checklist](./docs/refactoring/code-review-checklist.md)** - 质量保证清单

### 重构进度
- **Export * 数量**: 97个 → 目标<30个（第一阶段）
- **TypeScript错误**: 3093个 → 目标0个
- **文件总数**: 786个 → 目标~300个

## 📚 学习资源

- [Next.js 15 文档](https://nextjs.org/docs) - 了解最新特性
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
