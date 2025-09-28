# AI Agent 开发指南

## 项目概述

**项目类型**: Next.js 15 + React 19 + TypeScript 企业级B2B网站模板
**核心特性**: 英中双语国际化、主题切换、MDX内容管理、企业级质量保障 **技术栈**:
Next.js 15.4.6 + React 19.1.1 + TypeScript 5.9.2 + Tailwind CSS 4.1.11

## 强制架构约束

### 技术栈限制

- **必须使用**: Next.js 15 App Router架构，禁止使用Pages Router
- **必须使用**: TypeScript严格模式，禁止any类型
- **必须使用**: Tailwind CSS进行样式开发，禁止内联样式
- **必须使用**: shadcn/ui组件库，禁止引入其他UI库
- **必须使用**: next-intl进行国际化，禁止其他i18n方案

### 目录结构规则

- **src/app/[locale]/** - 国际化路由，必须支持en和zh
- **src/components/** - 组件分层：ui/、theme/、i18n/
- **content/** - MDX内容，必须按语言分目录
- **messages/** - 国际化文件，必须同步更新
- **禁止修改**: next.config.ts、tsconfig.json、eslint.config.mjs核心配置

## 国际化强制同步规则

### 内容文件同步

- **修改content/posts/en/**时，必须同时修改**content/posts/zh/**
- **修改content/pages/en/**时，必须同时修改**content/pages/zh/**
- **修改messages/en.json**时，必须同时修改**messages/zh.json**
- **禁止**: 单独修改一种语言的内容文件

### 组件国际化

- **必须使用**: `useTranslations()`钩子获取翻译
- **必须导入**: `import { useTranslations } from 'next-intl'`
- **禁止**: 硬编码中英文文本
- **示例**:

  ```typescript
  // ✅ 正确
  const t = useTranslations('common');
  return <button>{t('submit')}</button>;

  // ❌ 错误
  return <button>Submit</button>;
  ```

### 路由国际化

- **必须使用**: `src/i18n/routing.ts`中的Link组件
- **禁止使用**: Next.js原生Link组件
- **示例**:

  ```typescript
  // ✅ 正确
  import { Link } from '@/i18n/routing';

  // ❌ 错误
  import Link from 'next/link';
  ```

## 组件开发标准

### shadcn/ui组件使用

- **必须使用**: 现有的src/components/ui/组件
- **添加新组件**: 使用`npx shadcn@latest add [component]`
- **禁止**: 直接修改ui/组件源码
- **自定义组件**: 放置在src/components/对应分类目录

### 主题系统

- **必须支持**: light、dark、system三种主题模式
- **必须使用**: `useTheme()`钩子
- **必须导入**: `import { useTheme } from 'next-themes'`
- **CSS变量**: 使用Tailwind CSS主题变量，禁止硬编码颜色

### React 19表单开发标准

- **必须使用**: useActionState Hook替代手动状态管理
- **必须使用**: Server Actions处理表单提交，禁止客户端API调用
- **必须使用**: useFormStatus Hook在表单子组件中获取状态
- **推荐使用**: useOptimistic Hook提供乐观更新体验
- **必须使用**: Zod进行表单数据验证和类型安全
- **禁止使用**: react-hook-form、formik等第三方表单库
- **示例**:

  ```typescript
  // ✅ 正确：React 19表单模式
  import { useActionState } from 'react';
  import { useFormStatus } from 'react-dom';
  import { contactFormAction } from '@/app/actions';

  function ContactForm() {
    const [state, formAction, isPending] = useActionState(contactFormAction, null);

    return (
      <form action={formAction}>
        <input name="email" type="email" required />
        <SubmitButton />
        {state?.error && <div className="error">{state.error}</div>}
      </form>
    );
  }

  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <button disabled={pending} type="submit">
        {pending ? 'Submitting...' : 'Submit'}
      </button>
    );
  }
  ```

### 组件命名规范

- **文件名**: kebab-case (例: theme-toggle.tsx)
- **组件名**: PascalCase (例: ThemeToggle)
- **Props接口**: ComponentNameProps (例: ThemeToggleProps)

## 代码质量要求

### TypeScript规则

- **严格模式**: 必须通过`pnpm type-check:strict`
- **禁止any**: 使用具体类型、unknown或泛型，100%类型覆盖
- **必须定义**: 所有Props接口和返回类型
- **React组件类型**: 必须显式定义组件Props接口
- **空值处理**: 必须检查null和undefined，使用可选链和空值合并
- **导入顺序**: React → Next.js → 第三方 → 内部类型 → 内部库 → 组件 → 相对导入
- **示例**:

  ```typescript
  // ✅ 正确：显式React组件类型
  import React from 'react';
  import type { ReactNode, FC } from 'react';

  interface ComponentProps {
    children: ReactNode;
    title: string;
    optional?: string;
  }

  const Component: FC<ComponentProps> = ({ children, title, optional }) => {
    return <div>{title}: {children}</div>;
  };

  // ✅ 正确：空值处理
  function getTitle(content: Content | null): string {
    if (!content) {
      return 'Untitled';
    }
    return content.title ?? 'No Title';
  }

  // ✅ 正确：泛型使用
  interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
  }
  ```

### ESLint规则

- **必须通过**: `pnpm lint:strict` (0警告标准)
- **复杂度限制**:
  - 循环复杂度 ≤ 15 (优化后，平衡质量与AI友好性)
  - 函数长度 ≤ 120行 (优化后，适应完整业务逻辑)
  - 嵌套深度 ≤ 4层
  - 参数数量 ≤ 5个
  - 文件长度 ≤ 500行
- **安全规则**: 必须通过双重安全插件检查（22条安全规则）
- **React规则**: 必须遵循react-hooks和react-you-might-not-need-an-effect规则

### 属性访问规则配置

项目采用**宽松的dot-notation配置**，遵循Next.js官方推荐：

```javascript
'dot-notation': ['error', {
  allowKeywords: true,
  allowPattern: '^[a-zA-Z_$][a-zA-Z0-9_$]*$'
}]
```

**配置原因**:

- **Next.js官方集成**: 使用next/core-web-vitals和next/typescript配置
- **TypeScript兼容性**: 关闭noPropertyAccessFromIndexSignature以支持点号访问
- **动态数据处理**: API响应、用户配置、国际化等场景
- **业界最佳实践**: Vercel、GitHub、VS Code等大型项目的选择
- **AI开发友好**: 减少配置冲突，提高开发效率
- **测试环境优化**: 测试文件中允许any类型和mock对象

### 代码复杂度控制

- **函数拆分**: 大函数必须拆分为单一职责的小函数
- **策略模式**: 使用策略模式和查找表替代复杂if-else链
- **早期返回**: 使用guard子句减少嵌套深度
- **示例**:

  ```typescript
  // ✅ 正确：使用策略模式
  const processors = {
    markdown: processMarkdown,
    mdx: processMdx,
    html: processHtml,
  } as const;

  // ✅ 正确：早期返回
  function processUser(user: User): ProcessResult {
    if (!user.isActive) {
      return { success: false, error: 'User inactive' };
    }
    return processValidUser(user);
  }
  ```

### 代码格式

- **必须使用**: Prettier格式化
- **必须通过**: `pnpm format:check`
- **字符串引号**: 必须使用单引号
- **尾随逗号**: 多行结构必须包含尾随逗号
- **行宽限制**: 最大80字符
- **缩进规则**: 2个空格，禁止使用Tab
- **导入排序**: React → Next.js → 第三方 → @/types → @/lib → @/components →
  @/app → @/ → 相对导入
- **Tailwind排序**: 使用prettier-plugin-tailwindcss自动排序类名

### 变量和属性访问

- **未使用变量**: 必须删除或使用下划线前缀标记
- **属性访问**: 优先使用点号表示法，动态属性和Record类型使用方括号
- **魔术数字**: 必须定义为常量（例外：0、1、-1、100、常见HTTP状态码、端口号）
- **示例**:

  ```typescript
  // ✅ 正确：常量定义
  const MAX_TITLE_LENGTH = 100;
  const DEFAULT_PAGE_SIZE = 20;

  // ✅ 正确：未使用参数标记
  function handleEvent(_event: Event, data: EventData): void {
    processEventData(data);
  }

  // ✅ 正确：属性访问
  const title = content.metadata.title;
  const nodeEnv = process.env['NODE_ENV']; // 环境变量

  // ✅ 正确：Record类型使用方括号（TypeScript严格模式要求）
  const apiData: Record<string, unknown> = await fetchData();
  if (apiData['status'] === 'success') {
    // 动态数据访问
  }
  ```

## 文件操作规范

### 创建新文件

- **页面文件**: 必须放在src/app/[locale]/目录下
- **组件文件**: 根据功能放在src/components/对应子目录
- **工具函数**: 放在src/lib/目录下
- **类型定义**: 放在src/types/目录下

### 修改现有文件

- **必须检查**: 文件是否有国际化依赖
- **必须同步**: 相关的多语言文件
- **必须验证**: 修改后通过所有质量检查

### MDX内容管理

- **内容结构**: 必须包含frontmatter元数据
- **图片资源**: 放在public/目录下
- **内部链接**: 使用相对路径
- **示例**:

  ```mdx
  ---
  title: '文章标题'
  description: '文章描述'
  date: '2024-01-01'
  ---

  # 文章内容
  ```

## MDX内容管理系统

### 依赖包配置

- **必须安装**: `@next/mdx@^15.4.6` - Next.js原生MDX支持
- **必须安装**: `@mdx-js/loader@^3.1.0` - MDX文件加载器
- **必须安装**: `@mdx-js/react@^3.1.0` - React组件嵌入支持
- **必须安装**: `gray-matter@^4.0.3` - Front Matter解析库
- **必须安装**: `@types/mdx@^2.0.13` - MDX TypeScript类型定义
- **禁止**: 修改核心MDX版本号，除非有明确的升级需求

### 配置文件结构

- **核心配置**: `next.config.ts` - Next.js MDX集成配置
- **内容配置**: `content/config/content.json` - 内容管理全局配置
- **类型定义**: `src/types/content.ts` - TypeScript接口定义
- **解析器**: `src/lib/content-parser.ts` - MDX文件解析函数
- **查询器**: `src/lib/content-query.ts` - 内容查询和获取函数
- **工具函数**: `src/lib/content-utils.ts` - 路径验证和配置工具

### 开发命令标准

- **启动开发环境**: `pnpm dev` - 启动Next.js开发服务器（Turbopack）
- **无扫描开发**: `pnpm dev:no-scan` - 禁用React Scan的开发模式
- **构建生产版本**: `pnpm build` - 构建静态站点
- **内容完整性检查**: `node scripts/content-integrity-check.js` - 多语言同步验证
- **类型检查**: `pnpm type-check` - 验证TypeScript类型
- **严格类型检查**: `pnpm type-check:strict` - 严格模式类型检查

### 质量检查命令

- **基础质量检查**: `pnpm quality:check` - 类型、lint、格式检查
- **严格质量检查**: `pnpm quality:check:strict` - 零警告标准检查
- **完整质量检查**: `pnpm quality:full` - 所有质量检查（包含安全、测试、构建）
- **快速质量检查**: `pnpm quality:quick` - 快速质量验证
- **暂存文件检查**: `pnpm quality:quick:staged` - 仅检查暂存文件

### 多语言内容管理配置

- **内容路径**: 必须按语言分目录存储
  - 英文内容: `content/posts/en/` 和 `content/pages/en/`
  - 中文内容: `content/posts/zh/` 和 `content/pages/zh/`
  - 文档文件: `content/documents/en/` 和 `content/documents/zh/`
- **语言字段**: 必须在Front Matter中定义locale字段
- **文件命名**: 使用相同slug，不同语言目录
- **同步要求**: 修改一种语言内容时，必须同时更新另一种语言

### MDX Front Matter配置标准

- **必需字段**: title, description, slug, locale, publishedAt
- **可选字段**: author, tags, categories, featured, draft, seo
- **类型安全**: 使用TypeScript接口验证元数据完整性
- **示例**:

  ```typescript
  // ✅ 正确：MDX Front Matter配置
  ---
  title: 'Article Title'
  description: 'Article description for SEO'
  slug: 'article-slug'
  locale: 'en'
  publishedAt: '2024-01-01'
  author: 'Author Name'
  tags: ['tag1', 'tag2']
  categories: ['category1']
  featured: false
  draft: false
  seo:
    title: 'Custom SEO Title'
    description: 'Custom SEO Description'
    keywords: ['keyword1', 'keyword2']
  ---

  # Article Content

  Your MDX content with React components...
  ```

### 内容管理规则

- **MDX文件编辑**: 直接编辑`content/`目录下的MDX文件
- **Front Matter验证**: 使用TypeScript接口验证元数据完整性
- **多语言同步**: 英中文内容必须保持结构一致性
- **文件命名规范**: 使用kebab-case命名，保持语言目录对应
- **Git工作流**: 内容变更通过Git版本控制，触发自动部署
- **无数据库架构**: 简化部署流程，所有内容存储在文件系统中

### 媒体文件管理

- **存储路径**: 必须使用`public/images/`目录
- **文件格式**: 支持JPG、PNG、WebP格式
- **大小限制**: 图片文件≤5MB，文档文件≤20MB
- **命名规范**: 使用kebab-case英文命名
- **组织结构**: 按功能分子目录（blog/、pages/、og/、documents/等）
- **引用方式**: 在MDX文件中使用相对路径引用图片

### 内容解析和查询API

- **解析函数**: `parseContentFile()` - 解析单个MDX文件
- **查询函数**: `getAllPosts()`, `getAllPages()` - 获取内容列表
- **单项查询**: `getPostBySlug()`, `getPageBySlug()` - 获取特定内容
- **统计信息**: `getContentStats()` - 获取内容统计数据
- **路径验证**: `validateFilePath()` - 安全路径验证
- **配置获取**: `getContentConfig()` - 获取全局配置

## 质量检查流程

### 开发前检查

- **运行**: `pnpm quality:check:strict`
- **确保**: 所有检查通过后再开始开发

### 开发中检查

- **实时检查**: 使用VS Code ESLint插件
- **定期运行**: `pnpm type-check`和`pnpm lint`

### 开发后验证

- **必须运行**: `pnpm quality:full`
- **必须通过**: 所有自动化检查
- **必须验证**: 功能在两种语言下正常工作

### 质量监控工具

- **AI质量引擎**: `pnpm ai:analyze` - AI驱动的代码质量分析
- **质量仪表板**: `pnpm quality:dashboard` - 生成质量报告仪表板
- **性能基准**: `pnpm performance:benchmark` - 性能基准测试
- **覆盖率趋势**: `pnpm coverage:trend` - 测试覆盖率趋势监控
- **质量门禁**: `pnpm quality:gate` - 质量门禁检查
- **自动化报告**: `pnpm report:automated` - 生成自动化质量报告
- **综合质量检查**: `pnpm quality:comprehensive` - 运行所有质量检查工具
- **零容忍检查**: `pnpm quality:zero-tolerance` - 最严格的质量标准检查

### 质量工作流程

- **启动监控**: `pnpm quality:start` - 启动质量监控系统
- **工作流控制**:
  - `pnpm quality:workflow:start` - 启动自动化质量工作流
  - `pnpm quality:workflow:stop` - 停止工作流
  - `pnpm quality:workflow:status` - 查看工作流状态
  - `pnpm quality:workflow:restart` - 重启工作流
- **质量触发器**: `pnpm quality:trigger` - 手动触发质量检查
- **状态监控**: `pnpm quality:watch` - 监控任务状态

## 修复验证流程（强制）

### 每次修改后的强制验证

- **立即验证**: 每次代码修改后必须立即运行 `pnpm lint && pnpm type-check`
- **零容忍原则**: 修复不能引入新的代码质量问题
- **复杂度监控**: 如果修复导致复杂度超限，必须先重构再修复
- **功能验证**: 确保修复不影响现有功能

### 修复质量门禁

- **TypeScript**: 必须零错误，无例外
- **ESLint**: 必须零警告，无例外
- **复杂度**: 函数复杂度≤15，无例外
- **测试**: 所有相关测试必须通过

### 渐进式修复策略

- **复杂函数**: 复杂度>10的函数，先拆分再修复
- **大型修复**: 分阶段进行，每阶段验证质量
- **重构优先**: 复杂代码先重构再修复类型问题

### 类型安全修复最佳实践

- **复杂函数**: 复杂度>10的函数，先拆分再修复
- **空值安全**: 优先使用辅助函数而非内联条件检查
- **渐进式修复**: 大型修复分阶段进行，每阶段验证质量
- **重构优先**: 如果修复会增加复杂度，必须先重构再修复

### 修复流程标准（六步法）

1. **分析问题** → 理解错误根因和影响范围
2. **评估复杂度** → 检查修复是否会增加代码复杂度
3. **必要时先重构** → 如果复杂度会超限，先重构再修复
4. **实施修复** → 应用最小化、精确的修复
5. **立即验证** → 运行 `pnpm lint && pnpm type-check`
6. **确认无新问题** → 确保没有引入新的质量问题

## 构建和部署规则

### 构建验证

- **必须通过**: `pnpm build`
- **必须检查**: 包大小限制`pnpm size:check`
- **必须验证**: 无循环依赖`pnpm arch:validate`

### 性能要求

- **包大小**: 主应用包≤50KB，框架包≤130KB
- **代码重复**: ≤3%重复率
- **类型覆盖**: 100%类型安全

## 禁止操作清单

### 绝对禁止

- **禁止**: 修改package.json依赖版本
- **禁止**: 绕过ESLint规则使用eslint-disable
- **禁止**: 使用console.log/console.error/console.warn在生产代码中
- **禁止**: 直接修改node_modules文件
- **禁止**: 提交未格式化的代码
- **禁止**: 使用any类型（使用unknown、具体类型或泛型）
- **禁止**: 使用dangerouslySetInnerHTML（除非使用DOMPurify清理）
- **禁止**: 创建循环依赖
- **禁止**: 生产代码导入测试文件或devDependencies
- **禁止**: 使用弱加密算法（MD5、SHA-1、Math.random()）
- **禁止**: 使用HTML img标签（必须使用next/image）
- **禁止**: 使用Tab缩进（必须使用2个空格）

### 条件禁止

- **禁止**: 单独修改一种语言的内容（除非同时修改另一种）
- **禁止**: 添加新的UI库（除非移除shadcn/ui）
- **禁止**: 修改核心配置文件（除非有明确需求）

## AI决策标准

### 优先级判断

1. **最高优先级**: 国际化同步和类型安全
2. **高优先级**: 代码质量和ESLint规则
3. **中优先级**: 性能优化和用户体验
4. **低优先级**: 代码风格和注释

### 冲突解决

- **类型安全 vs 功能实现**: 优先类型安全
- **国际化 vs 开发速度**: 优先国际化完整性
- **代码质量 vs 功能复杂度**: 优先代码质量

### 不确定情况处理

- **缺少翻译**: 使用英文作为fallback，标记TODO
- **组件选择**: 优先使用现有shadcn/ui组件
- **架构决策**: 遵循现有模式，避免引入新概念

## 关键文件交互标准

### 同步修改要求

- **修改README.md** → 必须同时修改docs/zh/README.md
- **修改src/app/[locale]/layout.tsx** → 检查两种语言的元数据
- **修改src/components/theme/** → 确保主题切换在所有语言下正常
- **修改messages/\*.json** → 必须保持键值对一致

### 依赖文件检查

- **修改组件** → 检查相关测试文件
- **修改类型定义** → 检查所有引用文件
- **修改配置文件** → 运行完整质量检查

## 错误处理标准

### 常见错误处理

- **国际化错误**: 提供英文fallback
- **主题切换错误**: 回退到系统主题
- **组件渲染错误**: 使用ErrorBoundary包装

### 调试信息

- **开发环境**: 可以使用console.warn
- **生产环境**: 必须使用结构化日志
- **错误上报**: 集成Sentry错误监控

## 常见问题解决方案

### TypeScript严格模式问题

- **exactOptionalPropertyTypes错误**: 使用条件展开`...(prop && { prop })`避免传递undefined
- **对象注入安全**: 使用switch语句替代对象属性访问，避免`obj[userInput]`模式
- **魔术数字**: 定义常量替代业务逻辑中的数字，允许0/1/-1/100/HTTP状态码

### React组件最佳实践

- **useEffect优化**: 避免在事件处理中使用useEffect，直接调用事件处理函数
- **组件Props**: 使用条件展开传递可选属性，确保类型安全
- **性能优化**: 使用React.memo、useCallback稳定函数引用

### React Hooks 使用规范

- **调用顺序**: Hooks 必须在组件顶层、相同顺序调用，禁止条件性调用
- **依赖完整**: useEffect/useMemo/useCallback 依赖数组必须包含所有使用的变量
- **修复策略**: 条件逻辑移入 Hook 内部；复杂场景拆分独立组件
- **ESLint规则**: `react-hooks/rules-of-hooks: error`, `react-hooks/exhaustive-deps: error`
- **示例**:
  ```typescript
  // ✅ 正确：Hooks 在组件顶层调用
  function Component({ condition }: { condition: boolean }) {
    const [state, setState] = useState(0);
    const [data, setData] = useState(null);

    useEffect(() => {
      if (condition) {
        // 条件逻辑在 Hook 内部
        fetchData().then(setData);
      }
    }, [condition]); // 完整依赖数组

    return <div>{data}</div>;
  }

  // ❌ 错误：条件性调用 Hooks
  function BadComponent({ condition }: { condition: boolean }) {
    const [state, setState] = useState(0);

    if (condition) {
      const [conditionalState, setConditionalState] = useState(''); // 错误
    }

    return <div>{state}</div>;
  }
  ```

### AI编码导入保护策略

- **React导入**: 始终显式导入React，使用`React.FC`类型确保不被误删
- **类型导入**: 使用`import type`语法，并在使用处明确标注类型
- **副作用导入**: 添加行内注释说明用途`import './globals.css'; // Global styles`
- **调试导入**: 临时调试导入使用`// @ts-ignore`或ESLint忽略注释
- **分步开发**: 先完成核心逻辑，再添加导入，避免中途保存导致误删

**AI编码最佳实践**：

```typescript
// ✅ 推荐：明确的React使用
import React from 'react';
export const Component: React.FC<Props> = () => <div />;

// ✅ 推荐：类型导入明确使用
import type { FC, ReactNode } from 'react';
const Component: FC<{ children: ReactNode }> = ({ children }) => <div>{children}</div>;

// ✅ 推荐：副作用导入添加注释
import './component.css'; // Component-specific styles

// ✅ 推荐：调试导入保护
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { debugLog } from './debug'; // Temporary debugging
```

## 测试要求

### 测试文件结构

- **组件测试**: src/components/\*\*/**tests**/
- **工具函数测试**: src/lib/\*\*/**tests**/
- **Hook测试**: src/hooks/\*\*/**tests**/
- **E2E测试**: tests/e2e/
- **必须使用**: Vitest + Testing Library（禁止Jest）

### 测试覆盖要求

- **组件测试**: 必须测试主要功能和边界情况
- **国际化测试**: 必须测试两种语言的渲染
- **主题测试**: 必须测试三种主题模式
- **类型测试**: 使用TypeScript类型定义，避免any
- **覆盖率标准**: 全局≥85%，关键业务逻辑≥95%

### 测试命名规范

- **测试文件**: component-name.test.tsx
- **测试描述**: 使用英文，描述具体行为
- **Mock配置**: 使用vi.hoisted模式，完整Mock实现
- **示例**:
  ```typescript
  import { describe, it, expect, vi, beforeEach } from 'vitest';

  describe('ThemeToggle', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should switch between light and dark themes', () => {
      // 测试逻辑
    });
  });
  ```

### E2E测试规范

- **测试框架**: 必须使用Playwright
- **测试文件**: tests/e2e/*.spec.ts
- **浏览器支持**: Chromium、Firefox、WebKit
- **测试命令**:
  - `pnpm test:e2e` - 运行所有E2E测试
  - `pnpm test:e2e:ui` - 使用UI模式运行
  - `pnpm test:e2e:debug` - 调试模式
  - `pnpm test:e2e:safe` - 安全导航测试
- **测试覆盖**: 关键用户流程、导航安全、响应式设计
- **示例**:
  ```typescript
  import { test, expect } from '@playwright/test';

  test('should navigate between pages safely', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Tucsenberg/);

    // 测试导航
    await page.click('[data-testid="nav-about"]');
    await expect(page).toHaveURL(/\/about/);
  });
  ```

### Web-Eval-Agent测试

- **测试工具**: web-eval-agent MCP服务器
- **测试命令**: `pnpm test:web-eval-agent`
- **测试范围**: UX/UI评估、用户体验流程
- **集成验证**: `pnpm test:verify-integration`
- **测试服务器**: `pnpm test:server:start`
- **并发测试**: `pnpm test:server:with-tests`
- **用途**: 自动化用户体验评估和界面质量检查

## 性能优化规则

### 包大小限制

- **主应用包**: ≤ 50 KB
- **框架包**: ≤ 130 KB
- **共享块**: ≤ 260 KB
- **CSS包**: ≤ 50 KB
- **代码重复**: ≤ 3%
- **监控工具**: 使用`pnpm size:check`和`pnpm analyze`

### 图片优化

- **必须使用**: next/image组件
- **禁止使用**: HTML img标签
- **格式要求**: WebP/AVIF优先，PNG/JPEG备选
- **尺寸要求**: 提供多种尺寸的响应式图片
- **懒加载**: 自动启用图片懒加载

### 代码分割和导入

- **动态导入**: 大型组件使用React.lazy
- **路由分割**: 页面级别自动分割
- **第三方库**: 按需导入，避免全量导入
- **代码重用**: 提取公共功能到可重用工具函数
- **示例**:

  ```typescript
  // ✅ 正确：按需导入
  // ❌ 错误：全量导入
  import * as Icons from 'lucide-react';

  import { Button } from '@/components/ui/button';

  // ✅ 正确：动态导入大型组件
  const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
  ```

### 缓存策略

- **静态资源**: 使用Next.js内置缓存
- **API响应**: 合理设置revalidate时间
- **国际化**: 使用next-intl缓存机制
- **构建缓存**: 利用增量静态再生(ISR)

### React性能优化

- **Server Components**: 默认使用React Server Components
- **Client Components**: 仅在需要交互时使用'use client'
- **Hook规则**: 遵循React Hooks规则，正确设置依赖数组
- **避免不必要Effect**: 遵循react-you-might-not-need-an-effect规则

## 安全规则

### 输入验证和清理

- **表单数据**: 必须使用Zod验证所有用户输入
- **React 19表单**: 必须使用useActionState Hook和Server Actions，禁止使用react-hook-form
- **URL参数**: 必须验证和清理
- **用户输入**: 防止XSS攻击，禁止直接使用dangerouslySetInnerHTML
- **对象注入**: 禁止将用户输入直接作为对象属性键，必须使用白名单验证
- **示例**:

  ```typescript
  // ✅ 正确：输入验证
  const schema = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1),
  });

  // ✅ 正确：属性白名单
  const allowedProperties = new Set(['title', 'author', 'date']);
  function getProperty(obj: Content, prop: string) {
    if (!allowedProperties.has(prop)) {
      throw new Error(`Property ${prop} not allowed`);
    }
    return obj[prop as keyof Content];
  }
  ```

### 文件系统安全

- **路径验证**: 必须验证和规范化所有文件路径
- **目录遍历**: 防止..路径遍历攻击
- **扩展名检查**: 限制允许的文件扩展名
- **目录限制**: 限制文件访问在允许的目录内
- **示例**:

  ```typescript
  // ✅ 正确：安全的文件读取
  function readContentFile(filename: string): string {
    const normalizedPath = path.normalize(filename);
    if (normalizedPath.includes('..')) {
      throw new Error('Path traversal detected');
    }

    const ext = path.extname(normalizedPath);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`Unsupported extension: ${ext}`);
    }

    const fullPath = path.join(CONTENT_DIR, normalizedPath);
    if (!fullPath.startsWith(CONTENT_DIR)) {
      throw new Error('File outside allowed directory');
    }

    return fs.readFileSync(fullPath, 'utf-8');
  }
  ```

### XSS防护

- **禁止dangerouslySetInnerHTML**: 除非使用DOMPurify清理
- **自动转义**: 优先使用React自动转义
- **内容清理**: 使用可信的清理库处理HTML内容

### 加密和随机数

- **加密算法**: 必须使用AES-256
- **哈希算法**: 必须使用SHA-256或更强
- **随机数生成**: 必须使用crypto.randomBytes()
- **禁止弱算法**: 禁止MD5、SHA-1、Math.random()

### 环境变量

- **敏感信息**: 使用.env.local
- **公开变量**: 使用NEXT*PUBLIC*前缀
- **类型安全**: 使用@t3-oss/env-nextjs验证

### 依赖安全

- **定期检查**: 运行pnpm audit
- **版本锁定**: 使用pnpm-lock.yaml
- **安全扫描**: 使用优化的双重安全插件+Semgrep保护（29条安全规则）
- **零容忍**: 注入漏洞、XSS漏洞零容忍

### ESLint安全插件配置

项目采用**优化的双重安全插件**架构，结合Semgrep静态分析，提供全面的安全保护：

#### 主力插件：eslint-plugin-security (14条规则)

- `detect-buffer-noassert` - Buffer安全检查
- `detect-child-process` - 子进程安全
- `detect-disable-mustache-escape` - 模板转义检查
- `detect-eval-with-expression` - eval安全检查
- `detect-new-buffer` - Buffer构造安全
- `detect-no-csrf-before-method-override` - CSRF防护
- `detect-non-literal-fs-filename` - 文件系统安全
- `detect-non-literal-regexp` - 正则表达式安全
- `detect-non-literal-require` - require安全
- `detect-object-injection` - 对象注入防护
- `detect-possible-timing-attacks` - 时序攻击防护
- `detect-pseudoRandomBytes` - 随机数安全
- `detect-unsafe-regex` - 不安全正则检测
- `detect-bidi-characters` - Unicode双向攻击检测

#### 补充插件：eslint-plugin-security-node (5条核心规则)

**启用的核心规则**：

- `detect-nosql-injection` - NoSQL注入防护
- `detect-improper-exception-handling` - 异常处理检测
- `detect-unhandled-event-errors` - 事件错误处理
- `detect-security-missconfiguration-cookie` - Cookie安全配置
- `disable-ssl-across-node-server` - SSL禁用检测

**已迁移到Semgrep的规则**：

- `detect-sql-injection` - 由Semgrep `sql-injection-risk`规则覆盖
- `detect-html-injection` - 由Semgrep `nextjs-unsafe-html-injection`规则覆盖
- `detect-dangerous-redirects` - 由Semgrep `nextjs-unsafe-redirect`规则覆盖

#### Semgrep静态分析 (10条规则)

- `nextjs-unsafe-dangerouslySetInnerHTML` - XSS防护
- `hardcoded-api-keys` - 硬编码密钥检测
- `unsafe-eval-usage` - eval安全检查
- `nextjs-unsafe-redirect` - 重定向安全
- `insecure-random-generation` - 随机数安全
- `nextjs-unsafe-html-injection` - HTML注入检测
- `weak-crypto-algorithm` - 弱加密算法检测
- `sql-injection-risk` - SQL注入防护
- `nextjs-unsafe-server-action` - Server Action安全
- `environment-variable-exposure` - 环境变量暴露检测

#### 配置优化说明

- **总规则数**: 19条ESLint规则 + 10条Semgrep规则 = 29条安全规则
- **优化策略**: 禁用重复规则，减少检查开销，保持安全保护水平
- **主力插件**: eslint-plugin-security作为核心安全检查
- **补充插件**: security-node提供无替代的Node.js特定检查
- **静态分析**: Semgrep提供灵活的安全模式检测
- **已禁用规则**: `detect-unhandled-async-errors` (插件bug)
- **迁移策略**: 渐进式优化，保持向后兼容

## 部署准备规则

### 部署前检查清单

- [ ] 运行`pnpm quality:full`通过
- [ ] 运行`pnpm build`成功
- [ ] 运行`pnpm test`全部通过
- [ ] 检查两种语言功能正常
- [ ] 检查三种主题模式正常
- [ ] 验证响应式设计
- [ ] 检查SEO元数据完整

### 环境配置

- **开发环境**: 使用.env.local
- **生产环境**: 配置Vercel环境变量
- **监控配置**: Sentry错误监控
- **分析配置**: Vercel Analytics

## 维护和更新规则

### 依赖更新

- **主要版本**: 需要全面测试
- **次要版本**: 运行质量检查
- **补丁版本**: 基本验证即可
- **安全更新**: 立即应用

### 代码重构

- **重构前**: 确保测试覆盖充分
- **重构中**: 保持功能不变
- **重构后**: 运行完整质量检查

### 文档更新

- **代码变更**: 同步更新相关文档
- **API变更**: 更新接口文档
- **配置变更**: 更新配置说明

## AI Agent 决策框架集成

### 规则文件层次结构

- **核心规则**: shrimp-rules.md（本文件）- AI Agent 主要操作指南
- **专项规则**: .augment/rules/ 目录 - 特定技术领域的详细规范
- **冲突解决**: 核心约束优先，专项规则补充
- **自动加载**: 根据任务类型自动应用相关专项规则

### 专项规则引用

- **测试相关**: 参考 .augment/rules/testing-standards.md
- **安全相关**: 参考 .augment/rules/security-implementation.md
- **TypeScript相关**: 参考 .augment/rules/typescript-safety-rules.md
- **质量复杂度**: 参考 .augment/rules/quality-and-complexity.md
- **Next.js/React**: 参考 .augment/rules/nextjs-architecture.md
- **UI设计**: 参考 .augment/rules/ui-design-system.md
- **国际化内容**: 参考 .augment/rules/i18n-content-management.md
- **服务集成**: 参考 .augment/rules/service-integration.md
- **CI/CD**: 参考 .augment/rules/eslint-cicd-integration.md

### AI决策优先级

1. **最高优先级**: 核心约束（零容忍规则）
2. **高优先级**: 专项规则（技术特定要求）
3. **中优先级**: 性能和用户体验
4. **低优先级**: 代码风格和注释

## 应急处理规则

### 生产问题

1. **立即回滚**: 如果影响用户体验
2. **错误监控**: 查看Sentry错误报告
3. **快速修复**: 最小化变更
4. **验证修复**: 完整测试流程

### 构建失败

1. **检查依赖**: 验证package.json
2. **检查配置**: 验证配置文件
3. **检查代码**: 运行本地质量检查
4. **逐步排查**: 二分法定位问题

### 国际化问题

1. **检查翻译**: 验证messages文件
2. **检查路由**: 验证国际化路由配置
3. **检查组件**: 验证useTranslations使用
4. **回退机制**: 确保英文fallback正常

## 架构和依赖规则

### 依赖方向控制

- **组件层**: 可以使用工具库，但工具库不能导入组件
- **循环依赖**: 绝对禁止，使用`pnpm arch:validate`检查
- **测试隔离**: 生产代码禁止导入测试文件
- **依赖层次**: 遵循清晰的依赖方向

### 日志和调试规范

- **生产环境**: 必须使用结构化日志，禁止console语句
- **开发环境**: 仅允许console.error和console.warn，禁止console.log
- **日志格式**: 使用@/lib/logger进行结构化日志记录
- **ESLint规则**: `no-console: ['error', { allow: ['error', 'warn'] }]`
- **脚本文件例外**: scripts/和config/目录允许console输出
- **示例**:

  ```typescript
  // ✅ 正确：结构化日志
  import { logger } from '@/lib/logger';

  logger.error('Payment processing failed', {
    userId: user.id,
    paymentId: payment.id,
    errorCode: error.code,
  });

  // ✅ 正确：开发环境警告
  if (process.env.NODE_ENV === 'development') {
    console.warn('User subscription expired', { userId: user.id });
  }

  // ❌ 错误：生产环境console.log
  console.log('Processing content'); // 违反no-console规则

  // ❌ 错误：缺少上下文信息
  logger.error('Something went wrong'); // 缺少上下文
  ```

### 质量标准总结

- **类型安全**: 100%类型覆盖，零any类型
- **代码质量**: 循环复杂度≤15，函数长度≤120行
- **安全标准**: 零注入漏洞，零XSS漏洞
- **性能标准**: 主包≤50KB，代码重复≤3%
- **测试覆盖**: 组件、国际化、主题、E2E全覆盖

## 新增工具和脚本规范

### 性能监控工具

- **性能分析器**: `pnpm analyze:performance` - 分析应用性能瓶颈
- **性能检查**: `pnpm perf:check` - 快速性能验证
- **国际化性能**: `pnpm i18n:perf:test` - 国际化性能测试
- **性能基准**: `pnpm i18n:perf:benchmark` - 国际化性能基准测试

### 架构验证工具

- **架构检查**: `pnpm arch:check` - 依赖关系验证
- **架构图生成**: `pnpm arch:graph` - 生成依赖关系图
- **循环依赖检查**: `pnpm circular:check` - 检测循环依赖
- **循环依赖报告**: `pnpm circular:report` - 生成循环依赖报告
- **架构验证**: `pnpm arch:validate` - 完整架构验证

### 代码重复检查

- **重复检查**: `pnpm duplication:check` - 检测代码重复
- **重复报告**: `pnpm duplication:report` - 生成重复代码报告
- **重复徽章**: `pnpm duplication:badge` - 生成重复率徽章
- **CI重复检查**: `pnpm duplication:ci` - CI环境重复检查

### 别名一致性检查

- **别名检查**: `pnpm alias:check` - 验证路径别名一致性
- **必须通过**: 确保@/别名在所有配置文件中一致
- **检查范围**: tsconfig.json、next.config.ts、ESLint配置

### React扫描工具

- **React扫描**: `pnpm test:react-scan` - React组件性能扫描
- **生产安全**: `pnpm test:production-safety` - 生产环境安全检查
- **禁用扫描**: 开发时使用`pnpm dev:no-scan`避免干扰

### 国际化增强工具

- **翻译验证**: `pnpm validate:translations:enhanced` - 增强翻译验证
- **翻译同步**: `pnpm sync:translations:enhanced` - 增强翻译同步
- **翻译扫描**: `pnpm scan:translations` - 扫描缺失翻译
- **完整i18n检查**: `pnpm i18n:full` - 运行所有国际化检查
## 开发工作流程规范

### 标准开发流程

1. **任务分析**: 使用codebase-retrieval了解相关代码
2. **规则检查**: 确认适用的专项规则文件
3. **质量预检**: 运行`pnpm quality:check:strict`
4. **开发实施**: 遵循所有编码标准
5. **即时验证**: 每次修改后运行`pnpm lint && pnpm type-check`
6. **功能测试**: 验证两种语言和三种主题
7. **完整验证**: 运行`pnpm quality:full`
8. **E2E测试**: 运行`pnpm test:e2e:safe`

### 多文件修改流程

- **国际化内容**: 修改content/*/en/时必须同时修改content/*/zh/
- **翻译文件**: 修改messages/en.json时必须同时修改messages/zh.json
- **组件修改**: 检查相关测试文件和类型定义
- **配置修改**: 运行`pnpm alias:check`验证一致性

### 错误修复流程

1. **问题分析**: 理解错误根因和影响范围
2. **复杂度评估**: 检查修复是否会增加代码复杂度
3. **重构优先**: 如果复杂度会超限，先重构再修复
4. **精确修复**: 应用最小化、精确的修复
5. **立即验证**: 运行`pnpm lint && pnpm type-check`
6. **无新问题**: 确保没有引入新的质量问题

## 专项规则应用指南

### 任务类型识别

- **包含测试**: 自动应用testing-standards.md规则
- **涉及安全**: 自动应用security-implementation.md规则
- **TypeScript修改**: 自动应用typescript-safety-rules.md规则
- **复杂度问题**: 自动应用quality-and-complexity.md规则
- **React/Next.js**: 自动应用nextjs-architecture.md规则
- **UI组件**: 自动应用ui-design-system.md规则
- **国际化**: 自动应用i18n-content-management.md规则
- **服务集成**: 自动应用service-integration.md规则
- **CI/CD配置**: 自动应用eslint-cicd-integration.md规则

### 规则冲突处理

- **优先级1**: 核心约束（本文件的零容忍规则）
- **优先级2**: 专项规则（技术特定要求）
- **优先级3**: 项目偏好（性能和用户体验）
- **优先级4**: 代码风格（格式和注释）

### 规则更新机制

- **定期检查**: 验证规则与实际代码库的一致性
- **版本同步**: 确保规则与依赖版本保持同步
- **工具集成**: 新工具添加时更新相应规则
- **反馈循环**: 根据开发过程中的问题调整规则
