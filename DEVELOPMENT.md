# 二次开发指南

本文档面向基于 Tucsenberg Web Frontier 模板进行二次开发的开发者，涵盖快速定制清单、已知问题、架构约束和部署检查清单。

---

## 目录

- [快速定制清单](#快速定制清单)
- [已知问题与遗留事项](#已知问题与遗留事项)
- [架构约束与最佳实践](#架构约束与最佳实践)
- [质量门禁说明](#质量门禁说明)
- [部署检查清单](#部署检查清单)
- [扩展指南](#扩展指南)

---

## 快速定制清单

### 1. 品牌与标识

| 配置项 | 文件位置 | 说明 |
|--------|----------|------|
| 站点名称 | `src/config/paths/site-config.ts` | 修改 `SITE_CONFIG.name` |
| 站点描述 | `src/config/paths/site-config.ts` | 修改 `SITE_CONFIG.description` |
| SEO 标题模板 | `src/config/paths/site-config.ts` | 修改 `SITE_CONFIG.seo.titleTemplate` |
| 联系方式 | `src/config/paths/site-config.ts` | 修改 `SITE_CONFIG.contact` |
| 社交媒体链接 | `src/config/paths/site-config.ts` | 修改 `SITE_CONFIG.social` |
| 首屏文案 | `messages/[locale]/critical.json` | 修改 `home.hero` 相关字段 |
| Logo | `public/` 或组件内 | 替换 Logo 图片或修改 SVG |
| 品牌色 | `src/config/theme-customization.ts` | 修改主题颜色变量 |

```typescript
// src/config/paths/site-config.ts 关键字段
export const SITE_CONFIG = {
  baseUrl: process.env['NEXT_PUBLIC_BASE_URL'] || 'https://your-domain.com',
  name: 'Your Company Name',
  description: 'Your company description',
  seo: {
    titleTemplate: '%s | Your Company',
    defaultTitle: 'Your Company',
    // ...
  },
  contact: {
    phone: '+86-xxx-xxxx-xxxx',
    email: 'contact@your-domain.com',
    whatsappNumber: process.env['NEXT_PUBLIC_WHATSAPP_NUMBER'] ?? '+86-xxx-xxxx-xxxx',
  },
};
```

### 2. SEO 与社交媒体

| 配置项 | 文件位置 | 说明 |
|--------|----------|------|
| 站点 URL | 环境变量 `NEXT_PUBLIC_BASE_URL` | 生产环境必须设置 |
| OG 图片 | `public/images/og-image.jpg` | 1200x630px JPG 格式 |
| Twitter 图片 | `public/images/twitter-image.jpg` | 可选，1200x600px |
| Favicon | `src/app/favicon.ico` | 替换为你的图标 |
| robots.txt | `src/app/robots.ts` | 动态生成，通常无需修改 |
| sitemap.xml | `src/app/sitemap.ts` | 动态生成，自动包含所有页面 |

**OG 图片规格要求**：
- 尺寸：1200x630px
- 格式：JPEG（非 SVG）
- 大小：< 200KB
- 内容：品牌 Logo + 核心价值主张

### 3. 功能模块开关

通过环境变量或 `src/config/app.ts` 中的 `FEATURE_FLAGS` 控制：

```bash
# .env.local
ENABLE_WHATSAPP_CHAT=true          # WhatsApp 浮动按钮
ENABLE_PERFORMANCE_MONITORING=true  # 性能监控
ENABLE_ERROR_TRACKING=true          # 错误追踪
ENABLE_AB_TESTING=false             # A/B 测试
```

### 4. 联系表单配置

编辑 `src/config/contact-form-config.ts` 自定义表单字段：

```typescript
// 字段顺序、启用状态、验证规则均可配置
export const CONTACT_FORM_CONFIG = {
  fields: {
    name: { enabled: true, required: true, order: 1 },
    email: { enabled: true, required: true, order: 2 },
    company: { enabled: true, required: false, order: 3 },
    // ...
  },
};
```

---

## 已知问题与遗留事项

### 生产就绪检查项

| 状态 | 问题 | 说明 | 优先级 |
|------|------|------|--------|
| ⚠️ | OG 图片需转换 | 当前为 SVG 占位符 `public/images/og-image.svg`，需转换为 JPG 格式 | **高** |
| ℹ️ | 未实现的页面 | `/services`、`/pricing`、`/support` 路由未实现，如需使用需自行开发 | 中 |
| ℹ️ | 示例内容 | `content/` 目录下为示例产品和文章，需替换为实际内容 | **高** |

### 测试覆盖率

当前组件覆盖率略低于阈值（实际 ~41.9% vs 目标 42%），不阻塞构建但会显示警告：

```
ERROR: Coverage for lines (41.91%) does not meet "src/components/**/*.{ts,tsx}" threshold (42%)
```

**建议**：
- 为新增组件编写测试
- 运行 `pnpm test:coverage` 查看详细报告
- 覆盖率配置见 `vitest.config.mts` 中的 `thresholds`

### 架构警告

```
warn no-orphans: src/app/layout.tsx
```

此警告表示 `src/app/layout.tsx` 在依赖图中显示为"孤立"节点，这是 Next.js App Router 的正常行为（root layout 由框架隐式引用），可安全忽略。

---

## 架构约束与最佳实践

### 1. 路由系统

**新页面必须在 `routing.ts` 中注册**：

```typescript
// src/i18n/routing.ts
export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/contact': '/contact',
    '/products': '/products',
    '/blog': '/blog',
    '/faq': '/faq',
    '/privacy': '/privacy',
    '/terms': '/terms',
    // 添加新页面时，必须在此注册
    '/your-new-page': '/your-new-page',
  },
});
```

**同时更新 sitemap**：

```typescript
// src/app/sitemap.ts
const STATIC_PAGES = [
  '', '/about', '/contact', '/products', '/blog', '/faq', '/privacy', '/terms',
  '/your-new-page', // 添加新页面
] as const;
```

### 2. 国际化要求

- **所有用户可见文本必须使用翻译 key**，禁止硬编码
- 翻译文件位于 `messages/[locale]/`，分为 `critical.json`（首屏）和 `deferred.json`（延迟加载）
- 新增翻译后运行 `pnpm validate:translations` 验证一致性

```tsx
// 正确
import { useTranslations } from 'next-intl';
const t = useTranslations('home');
<h1>{t('hero.title')}</h1>

// 错误
<h1>Welcome to Our Site</h1>
```

### 3. 配置中心化

- **站点配置**：`SITE_CONFIG`（`src/config/paths/site-config.ts`）
- **功能开关**：`FEATURE_FLAGS`（`src/config/app.ts`）
- **应用配置**：`NETWORK_CONFIG`、`CACHE_CONFIG` 等（`src/config/app.ts`）

**禁止**：
- 在组件中硬编码 URL、超时时间等配置值
- 创建新的分散配置文件

### 4. Server Components 原则

- **默认使用 Server Components**
- **仅在需要交互时添加 `"use client"`**
- Client Components 应尽量小，将逻辑保留在 Server Components

```tsx
// 正确：Server Component（默认）
export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  return <ProductDetail product={product} />;
}

// 仅交互部分使用 Client Component
'use client';
export function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false);
  // ...
}
```

### 5. 导入规范

- **必须使用 `@/` 路径别名**，禁止相对路径导入
- **禁止 `export *` 重新导出**，使用命名导出

```typescript
// 正确
import { Button } from '@/components/ui/button';
export { Button } from './button';

// 错误
import { Button } from '../../components/ui/button';
export * from './button';
```

---

## 质量门禁说明

项目使用 Lefthook 管理 Git hooks，确保代码质量。

### Pre-commit Hooks

| 检查项 | 命令 | 说明 |
|--------|------|------|
| 格式检查 | `pnpm format:check` | Prettier 格式验证 |
| 类型检查 | `pnpm type-check` | TypeScript 类型验证 |
| 代码质量 | `pnpm quality:quick:staged` | ESLint 增量检查 |
| 架构守卫 | 内置脚本 | 禁止 `export *` 和相对路径导入 |
| 配置一致性 | `pnpm config:check` | tsconfig/ESLint 别名一致性 |
| i18n 同步 | `pnpm i18n:full` | 翻译文件一致性（仅相关文件变更时） |

### Pre-push Hooks

| 检查项 | 命令 | 说明 |
|--------|------|------|
| 构建验证 | `pnpm build:check` | Next.js 构建成功验证 |
| 翻译验证 | `pnpm validate:translations` | 翻译文件完整性 |
| 质量门禁 | `pnpm quality:gate` | 完整质量检查 |
| 架构检查 | `dependency-cruiser` + `madge` | 循环依赖和架构违规检测 |
| 安全检查 | `pnpm security:audit` | npm audit + semgrep |

### 紧急推送

如需跳过耗时检查（**仅限紧急情况**）：

```bash
RUN_FAST_PUSH=1 git push
```

**注意**：CI 会执行完整检查，跳过本地检查不意味着绕过质量要求。

### Commit Message 规范

遵循 Conventional Commits 格式：

```
<type>(<scope>): <description>

# 示例
feat(products): add product comparison feature
fix(i18n): resolve locale detection on mobile
docs(readme): update deployment instructions
```

Type 类型：`feat`、`fix`、`docs`、`style`、`refactor`、`test`、`chore`

---

## 部署检查清单

### 环境变量配置

**必需**：
```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

**可选但推荐**：
```bash
# Turnstile（联系表单验证）
NEXT_PUBLIC_TURNSTILE_SITE_KEY=xxx
TURNSTILE_SECRET_KEY=xxx

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=+86-xxx-xxxx-xxxx

# Sentry（默认禁用）
# SENTRY_DSN=xxx
# SENTRY_ORG=xxx
# SENTRY_PROJECT=xxx
```

### SEO 资源准备

- [ ] 替换 `public/images/og-image.svg` 为 JPG 格式（1200x630px, <200KB）
- [ ] 替换 `src/app/favicon.ico`
- [ ] 更新 `SITE_CONFIG` 中的站点信息
- [ ] 更新 `messages/*/critical.json` 中的品牌文案
- [ ] 替换 `content/` 目录下的示例内容

### 构建验证

```bash
# 本地完整构建验证
pnpm build

# 验证 sitemap 和 robots.txt
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt
```

### 部署后验证

- [ ] 访问首页和所有主要页面
- [ ] 测试语言切换功能
- [ ] 测试联系表单提交
- [ ] 验证 OG 图片预览（使用 [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)）
- [ ] 运行 Lighthouse 性能测试

---

## 扩展指南

### 添加新页面

1. 创建页面组件：`src/app/[locale]/your-page/page.tsx`
2. 注册路由：在 `src/i18n/routing.ts` 的 `pathnames` 中添加
3. 更新 sitemap：在 `src/app/sitemap.ts` 的 `STATIC_PAGES` 中添加
4. 添加翻译：在 `messages/[locale]/deferred.json` 中添加页面文案

### 添加新产品

1. 创建产品文件：`content/products/en/product-slug.mdx` 和 `content/products/zh/product-slug.mdx`
2. **英中版本必须使用相同的 `slug`**
3. 填写 frontmatter（参考 README.md 中的产品字段说明）
4. 添加产品图片到 `public/images/products/`

### 添加新语言

1. 更新 `src/i18n/routing.ts` 中的 `locales` 数组
2. 创建翻译文件：`messages/[新语言]/critical.json` 和 `deferred.json`
3. 复制所有内容文件到 `content/*/[新语言]/`
4. 运行 `pnpm validate:translations` 验证

### 自定义主题

编辑 `src/config/theme-customization.ts`：

```typescript
export const THEME_CUSTOMIZATION = {
  colors: {
    primary: '#your-primary-color',
    secondary: '#your-secondary-color',
    // ...
  },
  // ...
};
```

---

## 常见问题

### Q: 为什么构建时出现 "No circular dependency found" 但仍有警告？

A: 这是正常的架构检查输出，表示没有循环依赖问题。`warn no-orphans` 警告可安全忽略。

### Q: 如何禁用 WhatsApp 浮动按钮？

A: 设置环境变量 `ENABLE_WHATSAPP_CHAT=false` 或修改 `src/config/app.ts` 中的 `FEATURE_FLAGS.ENABLE_WHATSAPP_CHAT`。

### Q: 翻译文件修改后不生效？

A: 确保：
1. JSON 格式正确（可用 `pnpm validate:translations` 验证）
2. 重启开发服务器
3. 清除浏览器缓存

### Q: 如何添加 Sentry 错误监控？

A: 参考 README.md 中的"错误监控策略"章节。默认禁用客户端 Sentry，推荐仅启用服务端监控。

---

## 参考文档

- [README.md](./README.md) - 项目概述和快速开始
- [.claude/rules/](./.claude/rules/) - AI Agent 开发规则文档（架构、编码规范、测试等）
- [Next.js 16 文档](https://nextjs.org/docs)
- [next-intl 文档](https://next-intl-docs.vercel.app/)
