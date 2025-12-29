# 项目技术栈

## 1. 核心框架

### 前端框架
- **Next.js 16.1.1** - React 全栈框架，App Router 架构
- **React 19.2.3** - 用户界面库，支持服务器组件
- **TypeScript 5.9.3** - 类型安全的 JavaScript 超集
- **Tailwind CSS 4.1.18** - 原子化 CSS 框架

### 渲染策略
- **SSG + ISR** - 静态生成 + 增量静态再生
- **Server Actions** - 服务器端表单处理和数据变更
- **Edge Runtime** - 边缘计算支持（可选）

## 2. 内容管理系统

### MDX 内容管理
- **@next/mdx 16.1.1** - Next.js 原生 MDX 支持
- **@mdx-js/loader 3.1.1** - MDX 文件加载器
- **@mdx-js/react 3.1.1** - React 组件嵌入支持
- **gray-matter 4.0.3** - Front Matter 解析
- **@types/mdx 2.0.13** - MDX 类型定义

### 目录结构
```
content/
├── posts/          # 博客文章
│   ├── en/        # 英文内容
│   └── zh/        # 中文内容
├── pages/          # 静态页面
│   ├── en/        # 英文页面
│   └── zh/        # 中文页面
└── config/         # 配置文件
```

### 核心特性
- **直接文件编辑** - 无需额外界面
- **Git 工作流集成** - 版本控制和自动部署
- **多语言同步** - 强制双语内容一致性
- **类型安全验证** - TypeScript 接口保证
- **React 组件集成** - Markdown 中使用 React 组件

### 数据服务
- **Airtable 0.12.2** - 联系表单数据存储
- **Resend 6.4.2** - 邮件发送服务

## 3. UI 设计系统

### 组件库
- **shadcn/ui** - 现代化 UI 组件库（New York 风格）
- **@radix-ui/react-*** - 无障碍组件基础库
  - accordion 1.2.12 - 手风琴组件
  - dialog 1.1.15 - 模态对话框
  - dropdown-menu 2.1.16 - 下拉菜单
  - label 2.1.8 - 表单标签
  - navigation-menu 1.2.14 - 导航菜单
  - slot 1.2.4 - 组件插槽系统
  - tabs 1.1.13 - 标签页组件
- **class-variance-authority 0.7.1** - 样式变体管理
- **clsx 2.1.1 + tailwind-merge 3.4.0** - 条件类名合并
- **lucide-react 0.553.0** - SVG 图标库
- **sonner 2.0.7** - 通知系统
- **nextjs-toploader 3.9.17** - 页面加载进度条

### 字体与排版
- **@tailwindcss/typography 0.5.19** - 排版系统
- **next/font + geist 1.5.1** - Vercel 官方字体
- **PingFang SC** - 中文系统字体
- **智能字体回退** - 中英文混排优化

### 主题与动画
- **next-themes 0.4.6** - 主题切换（系统/明亮/暗黑）
- **Tailwind CSS 动画** - 主要动画方案（性能优先）
  - tailwindcss-animate 1.0.7 - 动画扩展
- **CSS 变量主题系统** - 动态主题切换

### 表单与验证
- **React 19 原生表单** - 使用 useActionState Hook 和 Server Actions
  - useActionState - 表单状态管理，替代手动 useTransition + useState
  - useFormStatus - 表单子组件中访问提交状态
  - Server Actions - 服务端表单处理，类型安全的数据提交
- **Zod 4.1.12** - TypeScript 模式验证和数据校验

#### React 19 表单架构
- **表单状态管理**：使用 useActionState Hook 替代传统表单库
- **服务端处理**：Server Actions 提供类型安全的表单提交
- **验证体系**：Zod 模式验证确保数据完整性和类型安全
- **用户体验**：useOptimistic Hook 提供乐观更新，提升交互体验

## 4. 开发工具链

### 代码质量
- **eslint 9.39.1** - 代码质量检查（Flat Config）
  - @eslint/eslintrc 3.3.1 - ESLint 配置工具
  - @eslint/js 9.39.1 - ESLint JavaScript 配置
- **typescript-eslint 8.46.4** - TypeScript 专用规则
- **eslint-plugin-react 7.37.5** - React 组件规则
- **eslint-plugin-react-hooks 5.2.0** - React Hooks 最佳实践
- **eslint-plugin-react-you-might-not-need-an-effect 0.8.1** - useEffect 优化
- **@next/eslint-plugin-next 16.1.1** - Next.js 专用规则
- **eslint-plugin-import 2.32.0** - 导入语句规则
- **eslint-plugin-promise 7.2.1** - Promise 最佳实践
- **eslint-config-prettier 10.1.8** - Prettier 冲突解决
- **eslint-plugin-security 3.0.1** - 安全规则检查
- **eslint-plugin-security-node 1.1.4** - Node.js 安全规则
- **eslint-config-next 16.1.1** - Next.js ESLint 配置预设

### 代码格式化
- **prettier 3.6.2** - 代码格式化核心
- **@ianvs/prettier-plugin-sort-imports 4.7.0** - 导入排序
- **prettier-plugin-tailwindcss 0.7.2** - Tailwind CSS 类名排序

### 构建工具
- **@next/bundle-analyzer 16.1.1** - 包大小分析
- **Turbopack** - 开发环境构建（`next dev --turbo`）
- **Webpack 5 + SWC** - 生产环境构建
- **pnpm 10.13.1** - 包管理器
- **Lighthouse CI** - 性能监控（替代 size-limit）
- **dependency-cruiser 17.2.0** - 依赖分析
- **madge 8.0.0** - 循环依赖检测
- **knip 5.69.1** - 未使用代码检测

### AST 处理工具
- **@babel/parser 7.28.5** - Babel AST 解析器
- **@babel/traverse 7.28.5** - Babel AST 遍历工具
- **@babel/generator 7.28.5** - Babel AST 生成器

### 开发工具链增强
- **concurrently 9.2.1** - 并行执行多个命令
- **dotenv 17.2.3** - 环境变量加载工具
- **glob 11.1.0** - 文件匹配模式工具
- **@tailwindcss/postcss 4.1.18** - Tailwind CSS PostCSS 插件
- **postcss 8.5.6** - CSS 处理工具
- **cssnano 7.1.2** - CSS 压缩工具
- **tsx 4.20.6** - TypeScript 执行工具

### 性能监控
- **react-scan 0.0.42** - React 组件性能监控
  - 开发环境自动启用
  - 实时检测不必要的重新渲染
  - 可视化性能瓶颈识别

### Git 工作流
- **lefthook 2.0.12** - Git hooks 管理
- **@commitlint/cli 19.8.1** - 提交信息规范
- **@commitlint/config-conventional 19.8.1** - 约定式提交
- **husky 9.1.7** - Git hooks 备用方案

### TypeScript 类型定义
- **@types/node 20.19.9** - Node.js 类型定义
- **@types/react 19.2.7** - React 19 类型定义
- **@types/react-dom 19.2.3** - React DOM 类型定义
- **@types/js-yaml 4.0.9** - JS-YAML 类型定义

### TypeScript 严格检查配置
- **noUnusedLocals: true** - 检测未使用的局部变量
- **noUnusedParameters: true** - 检测未使用的函数参数
- **exactOptionalPropertyTypes: true** - 严格可选属性类型检查
- **企业级质量标准** - 实现零TypeScript错误的代码质量

## 5. 测试框架

### 核心测试工具
- **vitest 4.0.8** - 现代化测试框架
  - @vitest/browser-playwright 4.0.8 - Playwright 浏览器测试
- **@vitest/coverage-v8 4.0.8** - V8 引擎覆盖率工具
- **@vitest/ui 4.0.8** - 可视化测试界面
- **jsdom 27.2.0** - 浏览器环境模拟
- **happy-dom 20.0.10** - 轻量级 DOM 环境（性能优化）
- **@testing-library/react 16.3.0** - React 组件测试
- **@testing-library/dom 10.4.1** - DOM 测试工具
- **@testing-library/jest-dom 6.9.1** - DOM 断言扩展
- **@testing-library/user-event 14.6.1** - 用户交互模拟

### 端到端测试
- **@playwright/test 1.56.1** - 端到端测试框架
- **playwright 1.56.1** - Playwright 核心库

### 无障碍性和性能测试
- **@axe-core/playwright 4.11.0** - 无障碍性测试
- **axe-core 4.11.0** - 无障碍性测试核心
- **@lhci/cli 0.15.1** - Lighthouse CI 性能监控
- **lighthouse 12.8.2** - 性能和质量审计

## 6. 性能优化与监控

### 缓存策略
- **Next.js 内置缓存** - 框架原生缓存机制
- **Git-based 静态生成** - 内容变更触发重新构建
- **ISR 配置** - 静态生成 + 增量更新
- **Vercel Edge Cache** - CDN 缓存

### 监控与分析
- **@vercel/analytics 1.5.0** - 性能分析和用户行为追踪
- **@vercel/speed-insights 1.2.0** - 性能指标监控
- **web-vitals 5.1.0** - 核心性能指标监控
- **Google Analytics 4** - 用户行为分析
- **React Error Boundaries** - 错误边界处理

## 7. 安全与部署

### 安全防护
- **@marsidev/react-turnstile 1.3.1** - Cloudflare Turnstile 机器人防护
- **Next.js 安全头配置** - CSP、X-Frame-Options 等
- **Next.js Middleware** - 中间件安全防护
- **@t3-oss/env-nextjs 0.13.8** - 类型安全环境变量

### 监控与日志
- **Vercel 函数日志** - 服务端监控
- **@vercel/analytics** - 性能分析
- **@vercel/speed-insights** - 性能指标监控
- **React Error Boundaries** - 客户端错误边界处理

## 8. 国际化与 SEO

### 国际化
- **next-intl 4.5.2** - Next.js 国际化框架
- **支持语言** - 英语(en) + 中文(zh)
- **翻译管理** - 基于Git工作流的手动翻译管理
- **类型安全** - strictMessageTypeSafety 确保翻译完整性

### SEO 优化
- **Next.js 16 Metadata API** - 原生 SEO 优化
- **next-sitemap 4.2.3** - 自动 sitemap 和 hreflang 生成
- **静态 OG 图片** - 社交媒体分享图片
- **结构化数据** - Schema.org JSON-LD 支持

### 企业通信
- **WhatsApp Business API 0.0.5-Alpha** - Meta 官方企业级 API（已集成）
  - Cloud API 集成，无需自建服务器
  - 自动消息处理和回复系统
  - Webhook 支持实时消息接收
  - 模板消息和文本消息发送
- **免费服务对话** - 客户主动发起的对话完全免费
- **企业级功能** - 多媒体支持、交互式消息、CRM 集成

## 9. 可选扩展

### 媒体处理
- **sharp 0.34.5** - 高性能图片处理库
- **@react-pdf/renderer 4.3.1** - PDF 文档生成
- **react-loading-skeleton** - 骨架屏加载状态（未安装，按需添加）

### 地图集成
- **react-leaflet 5.0.0** - 开源地图组件（未安装，按需添加）

### 动画扩展
- **lottie-react** - 复杂动画和品牌动画支持（**未安装**，按需添加）
- **intersection-observer** - 滚动监听（原生 API）

## 12. 组件扩展规划

### 基于业务需求的组件评估
基于项目的B2B企业级网站定位和当前技术架构，以下是未集成组件的评估结果：



#### 立即需要（高优先级）
**当前无立即需要的组件** - 现有技术栈已满足核心业务需求

#### 短期规划（中优先级）
- **react-loading-skeleton** - 骨架屏加载状态
  - **业务价值**: 提升数据加载时的用户体验，特别是联系表单和内容加载
  - **实施时机**: 当数据加载时间>1秒或收到用户体验反馈时
  - **包大小**: ~15KB (gzipped ~5KB)
  - **实施成本**: 1-2天开发时间
  - **替代方案**: 当前使用简单的loading状态，体验一般

#### 长期考虑（低优先级）
- **lottie-react** - 品牌动画和交互反馈
  - **业务价值**: 增强品牌形象，提升关键转化点的用户参与度
  - **实施时机**: 品牌升级需求或关键页面转化率优化时
  - **包大小**: ~25KB + 动画文件
  - **实施成本**: 需要设计师配合，3-5天开发时间
  - **注意事项**: 需要高质量动画设计，否则可能适得其反

#### 不推荐集成
- **framer-motion** - 复杂动画库
  - **不推荐原因**:
    * 对B2B网站业务价值有限
    * 包大小较大（~100KB），影响性能
    * 当前Tailwind CSS + CSS动画已满足需求
  - **替代方案**: 继续使用CSS动画和Web Animations API

- **react-leaflet** - 开源地图组件
  - **评估结果**: 完全按业务需求决定
  - **触发条件**: 需要展示地理位置、分支机构、服务区域等
  - **包大小**: ~200KB (含Leaflet)
  - **替代方案**: 静态地图图片、Google Maps嵌入
  - **当前状态**: 项目暂无地图展示需求



## 10. 项目架构

### 目录结构
```
src/
├── app/[locale]/       # Next.js 16 App Router + 国际化
├── components/         # 组件库分层
│   ├── ui/            # shadcn/ui 基础组件
│   ├── layout/        # 布局组件
│   ├── content/       # 内容组件
│   └── shared/        # 共享组件
├── lib/               # 工具库
├── types/             # TypeScript 类型定义
└── ...

content/               # MDX 内容存储
messages/              # next-intl 国际化文件
```

### 设计系统
- **主题系统** - Light/Dark/System 三模式切换
- **组件库** - shadcn/ui New York 风格
- **字体系统** - Geist Sans + Geist Mono + 中文字体回退
- **命名规范** - 组件：PascalCase，文件：kebab-case，变量：camelCase

## 11. 配置与最佳实践

### 核心配置文件
- **eslint.config.mjs** - ESLint 9 Flat Config
- **.prettierrc.json** - Prettier 代码格式化
- **components.json** - shadcn/ui 组件库配置
- **next.config.ts** - Next.js 配置（集成 next-intl）
- **tsconfig.json** - TypeScript 配置
- **app.css** - Tailwind CSS 4 配置（CSS-first）
- **vitest.config.ts** - Vitest 测试配置
- **lefthook.yml** - Git hooks 配置
- **.npmrc** - pnpm 包管理器配置

### 代码质量标准
- **复杂度限制** - 最大复杂度 15，嵌套深度 3
- **函数长度** - 最大 120 行，参数不超过 3 个
- **文件大小** - 最大 500 行
- **测试覆盖率** - 全局目标 85%，分模块要求：
  - 核心业务/安全模块：90-92%
  - 工具库：92-95%
  - 性能/i18n：85-88%
  - UI组件：70%

### 性能优化策略
- **开发模式** - Turbopack (`next dev --turbo`)
- **生产构建** - Webpack 5 + SWC 编译器
- **缓存策略** - SSG/ISR 混合渲染
- **图片优化** - sharp + WebP/AVIF 支持

### 安全最佳实践
- **CSP 头部** - 严格的内容安全策略
- **环境变量** - @t3-oss/env-nextjs 类型安全验证
- **依赖安全** - 定期 `pnpm audit` 检查
- **表单保护** - Cloudflare Turnstile 机器人检测（已替代 botid）

### 开发工作流
```bash
# 开发环境
pnpm dev                    # 启动开发服务器（Turbopack）
pnpm dev:turbopack          # 显式启用 Turbopack

# 代码质量检查
pnpm type-check            # TypeScript 类型检查
pnpm lint:check            # ESLint 代码检查
pnpm format:check          # Prettier 格式检查

# 测试
pnpm test                  # 运行单元测试
pnpm test:coverage         # 测试覆盖率报告
pnpm test:e2e              # 端到端测试

# 构建与分析
pnpm build                 # 生产环境构建
pnpm perf:lighthouse       # Lighthouse CI 性能审计
pnpm ci:local              # 完整本地 CI 检查
```
