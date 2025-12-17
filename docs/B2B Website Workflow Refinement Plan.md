# Step 1：完善 tucsenberg 模板 — 任务规划

> **目标**：将 `tucsenberg-web-frontier` 从"单一站点"改造为"可复用的 B2B 外贸建站模板"  
> **预计工时**：4-6 小时  
> **前置条件**：可访问仓库 https://github.com/Shawn-Jones-7/tucsenberg-web-frontier

---

## 1. 改造目标与成功标准

### 1.1 改造目标

将现有项目结构调整为"模板态"，使其具备：

1. **可复用的区块库**：页面搭建从"写代码"变成"拼区块"
2. **统一的版式系统**：所有页面共享一致的间距、版心、字级
3. **清晰的数据分离**：事实数据与翻译文案分开管理
4. **单一的样式真源**：tokens 只从 `globals.css` 生效，无冲突入口

### 1.2 成功标准（可验证）

| 标准 | 验证方式 |
|------|----------|
| `src/components/blocks/` 目录存在且有 5+ 个区块 | `ls src/components/blocks/` |
| `src/components/primitives/` 目录存在且有 Container/Section | `ls src/components/primitives/` |
| 所有区块都基于 primitives 构建 | 代码审查 |
| tokens 只在 `globals.css :root/.dark` 中定义 | `grep` 检查无其他 CSS 变量定义 |
| `pnpm type-check` 通过 | 运行命令 |
| `pnpm lint:check` 通过 | 运行命令 |

---

## 2. 当前状态核查清单

> ⚠️ 执行任务前，先核查以下项目，根据实际情况调整任务内容

### 2.1 目录结构核查

```bash
# 运行以下命令，记录当前状态
ls -la src/components/
ls -la src/components/ui/
ls -la src/components/home/
ls -la src/components/layout/
```

**需要确认**：
- [ ] `src/components/home/` 下有哪些组件？（这些可能需要迁移到 blocks）
- [ ] `src/components/layout/` 下有哪些组件？（可能已有 Container 类似物）
- [ ] 是否已存在 `src/components/blocks/` 或 `src/components/primitives/`？

### 2.2 样式系统核查

```bash
# 检查 tokens 定义位置
grep -r "var(--" src/app/globals.css | head -20
grep -r ":root" src/ --include="*.css" --include="*.tsx"

# 检查是否存在 theme-customization.ts
ls src/config/theme-customization.ts 2>/dev/null || echo "文件不存在"
```

**需要确认**：
- [ ] `globals.css` 中 `:root` 和 `.dark` 的变量结构
- [ ] 是否有其他文件定义 CSS 变量？
- [ ] `theme-customization.ts` 是否存在？如存在，与 `globals.css` 的关系是什么？

### 2.3 现有组件复用情况核查

```bash
# 检查现有首页组件的依赖关系
grep -r "import.*from.*home" src/app/
grep -r "import.*from.*layout" src/app/
```

**需要确认**：
- [ ] 首页（`src/app/[locale]/page.tsx`）如何组织内容？
- [ ] 现有组件是否已支持 i18n？
- [ ] 现有组件是否已支持 dark/light 主题？

---

## 3. 任务分解

### 3.1 任务总览

| ID | 任务 | 优先级 | 依赖 | 预计时间 |
|----|------|--------|------|----------|
| T1 | 创建 primitives 目录与组件 | P0 | 无 | 1.5h |
| T2 | 创建 blocks 目录结构 | P0 | T1 | 0.5h |
| T3 | 迁移/重构现有首页组件到 blocks | P0 | T2 | 2h |
| T4 | 确认并清理 tokens 入口 | P0 | 无 | 0.5h |
| T5 | 创建 site-facts.ts 数据结构 | P1 | 无 | 1h |
| T6 | 更新文档说明 | P1 | T1-T4 | 0.5h |

---

### 3.2 T1：创建 primitives 目录与组件

**目标**：建立版式系统的基础组件

**产出物**：
```
src/components/primitives/
├── index.ts           # 统一导出
├── Container.tsx      # 版心容器
├── Section.tsx        # 区块容器
└── types.ts           # 共享类型
```

**Container.tsx 规格**：

```typescript
// 功能需求
- 统一最大宽度（默认 1280px，可配置）
- 统一左右 padding（响应式：mobile 16px, tablet 24px, desktop 32px）
- 支持 as prop（可渲染为 div/section/main/article）
- 支持 className 扩展

// Props 接口
interface ContainerProps {
  children: React.ReactNode;
  as?: 'div' | 'section' | 'main' | 'article';
  size?: 'sm' | 'md' | 'lg' | 'full';  // sm=768, md=1024, lg=1280, full=100%
  className?: string;
}
```

**Section.tsx 规格**：

```typescript
// 功能需求
- 统一纵向间距（默认 py-16 md:py-24 lg:py-32）
- 可选标题区域（支持 title + subtitle）
- 支持背景色变体（default/muted/primary）
- 内置 Container 包裹

// Props 接口
interface SectionProps {
  children: React.ReactNode;
  id?: string;                          // 用于锚点导航
  title?: string;                       // 区块标题（走 i18n）
  subtitle?: string;                    // 区块副标题
  variant?: 'default' | 'muted' | 'primary';
  spacing?: 'sm' | 'md' | 'lg';         // 控制纵向间距
  className?: string;
  'data-testid'?: string;               // 测试标识
}
```

**验证标准**：
- [ ] 组件文件存在且导出正确
- [ ] TypeScript 类型无错误
- [ ] 在 Storybook 或测试页面中渲染正常（如有）

---

### 3.3 T2：创建 blocks 目录结构

**目标**：建立区块库的目录骨架

**产出物**：
```
src/components/blocks/
├── index.ts                    # 统一导出
├── _templates/
│   └── BLOCK_TEMPLATE.tsx      # 新建区块的起点模板
├── hero/
│   ├── index.ts
│   ├── HeroSplit.tsx           # 左右分栏式
│   ├── HeroCentered.tsx        # 居中式
│   └── types.ts
├── social-proof/
│   ├── index.ts
│   ├── LogoWall.tsx            # 客户/认证 logo 墙
│   ├── CertificationsGrid.tsx  # 认证展示网格
│   └── types.ts
├── features/
│   ├── index.ts
│   ├── FeatureGrid.tsx         # 特性网格（3-4列）
│   ├── WhyUs.tsx               # 为什么选择我们
│   └── types.ts
├── products/
│   ├── index.ts
│   ├── ProductCategories.tsx   # 产品分类入口
│   ├── ProductGrid.tsx         # 产品列表网格
│   └── types.ts
├── cta/
│   ├── index.ts
│   ├── CTABanner.tsx           # 横幅式 CTA
│   ├── ContactForm.tsx         # 联系表单
│   └── types.ts
└── shared/
    ├── index.ts
    └── SectionHeader.tsx       # 区块通用标题组件
```

**区块通用约定**：

```typescript
// 所有区块必须遵循的约定
interface BlockConventions {
  // 1. 命名：PascalCase，文件名与组件名一致
  // 2. Props：必须有 className 和 data-testid
  // 3. i18n：所有可见文本通过 props 传入或使用 useTranslations
  // 4. 响应式：必须支持 mobile/tablet/desktop
  // 5. 主题：必须支持 dark/light（使用 tokens，不硬编码颜色）
  // 6. 基于 primitives：必须使用 Section/Container 包裹
}

// 区块 Props 基础接口
interface BaseBlockProps {
  className?: string;
  'data-testid'?: string;
}
```

**验证标准**：
- [ ] 目录结构创建完成
- [ ] `_templates/BLOCK_TEMPLATE.tsx` 包含完整的约定示例
- [ ] `index.ts` 正确导出所有区块

---

### 3.4 T3：迁移/重构现有首页组件到 blocks

**目标**：将 `src/components/home/` 中的组件迁移到 blocks，并基于 primitives 重构

**执行步骤**：

1. **分析现有组件**
   ```bash
   # 列出所有 home 组件
   ls src/components/home/
   ```

2. **制定迁移映射**（根据实际情况填写）

   | 现有组件 | 目标位置 | 迁移策略 |
   |----------|----------|----------|
   | `HeroSection.tsx` | `blocks/hero/HeroSplit.tsx` | 重构：基于 Section 包裹 |
   | `Features.tsx` | `blocks/features/FeatureGrid.tsx` | 重构：抽取 Props |
   | `...` | `...` | `...` |

3. **逐个迁移**
   - 复制到新位置
   - 用 Section/Container 包裹
   - 抽取硬编码文案为 Props
   - 确保 i18n 支持
   - 更新导入路径

4. **更新首页引用**
   ```typescript
   // src/app/[locale]/page.tsx
   // 从
   import { HeroSection } from '@/components/home/HeroSection';
   // 改为
   import { HeroSplit } from '@/components/blocks/hero';
   ```

5. **保留 home 目录作为"装配层"**
   ```
   src/components/home/
   └── HomePage.tsx    # 只负责组装 blocks，不包含实现逻辑
   ```

**验证标准**：
- [ ] 所有迁移的组件在 blocks 目录下有对应文件
- [ ] 首页渲染正常（`pnpm dev` 检查）
- [ ] i18n 切换正常
- [ ] dark/light 主题切换正常

---

### 3.5 T4：确认并清理 tokens 入口

**目标**：确保主题 tokens 只有一个真源（`globals.css`）

**执行步骤**：

1. **检查 globals.css 结构**
   ```bash
   cat src/app/globals.css
   ```
   确认 `:root` 和 `.dark` 中定义了完整的 shadcn/ui tokens

2. **搜索其他 CSS 变量定义**
   ```bash
   grep -r "var(--" src/ --include="*.tsx" --include="*.ts" | grep -v "globals.css"
   grep -r ":root" src/ --include="*.css"
   ```

3. **检查 theme-customization.ts**
   - 如果存在：确认它是否生成/修改 globals.css，还是独立的第二套系统
   - 如果不存在：确认文档中的引用并更新（避免误导）

4. **清理冲突**（如有）
   - 删除重复的 CSS 变量定义
   - 统一到 globals.css

5. **记录 tokens 清单**
   ```markdown
   ## 当前 tokens 清单（globals.css）
   
   ### 颜色
   - --background / --foreground
   - --primary / --primary-foreground
   - --secondary / --secondary-foreground
   - --muted / --muted-foreground
   - --accent / --accent-foreground
   - --destructive / --destructive-foreground
   - --card / --card-foreground
   - --popover / --popover-foreground
   - --border / --input / --ring
   
   ### 圆角
   - --radius
   
   ### 项目扩展（如有）
   - --success / --warning / --info
   - ...
   ```

**验证标准**：
- [ ] `globals.css` 是 tokens 唯一定义位置
- [ ] 无其他文件定义 CSS 变量（或已清理）
- [ ] tokens 清单已记录

---

### 3.6 T5：创建 site-facts.ts 数据结构（P1）

**目标**：分离"事实数据"与"翻译文案"，为后续客户项目提供数据模板

**产出物**：
```
src/config/
└── site-facts.ts       # 事实数据（不可翻译）
```

**数据结构设计**：

```typescript
// src/config/site-facts.ts

export interface SiteFacts {
  company: {
    name: string;
    established: number;
    employees?: number;
    location: {
      country: string;
      city: string;
      address?: string;
      coordinates?: { lat: number; lng: number };
    };
  };
  
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
    wechat?: string;
  };
  
  certifications: Array<{
    name: string;       // "ISO 9001"
    file?: string;      // "/certs/iso9001.pdf"
    validUntil?: string;
  }>;
  
  stats: {
    exportCountries?: number;
    annualCapacity?: string;
    clientsServed?: number;
    onTimeDeliveryRate?: number;  // 0-100
  };
  
  social: {
    linkedin?: string;
    facebook?: string;
    youtube?: string;
  };
}

// 默认值（模板占位）
export const siteFacts: SiteFacts = {
  company: {
    name: "Your Company Name",
    established: 2010,
    location: {
      country: "China",
      city: "Shenzhen",
    },
  },
  contact: {
    phone: "+86-xxx-xxxx-xxxx",
    email: "sales@example.com",
  },
  certifications: [],
  stats: {},
  social: {},
};
```

**与 i18n 的配合**：

```typescript
// 组件中的使用方式
import { siteFacts } from '@/config/site-facts';
import { useTranslations } from 'next-intl';

function HeroSection() {
  const t = useTranslations('home.hero');
  
  return (
    <Section>
      {/* 翻译文案：从 messages 获取 */}
      <h1>{t('title')}</h1>
      
      {/* 事实数据：从 siteFacts 获取，用翻译模板插值 */}
      <p>{t('subtitle', { 
        year: siteFacts.company.established,
        countries: siteFacts.stats.exportCountries 
      })}</p>
    </Section>
  );
}
```

**验证标准**：
- [ ] `site-facts.ts` 文件存在且类型正确
- [ ] 至少有一个组件演示了 siteFacts + i18n 的配合使用

---

### 3.7 T6：更新文档说明（P1）

**目标**：记录改造结果，方便后续使用

**产出物**：
```
docs/
└── template-usage.md   # 模板使用指南
```

**文档内容大纲**：

```markdown
# Tucsenberg 模板使用指南

## 快速开始
1. Clone 仓库
2. 安装依赖
3. 填写 site-facts.ts
4. 修改 messages

## 目录结构说明
- src/components/primitives/ — 版式基础组件
- src/components/blocks/ — 可复用区块
- src/components/home/ — 首页装配层
- src/config/site-facts.ts — 企业事实数据

## 如何添加新区块
1. 复制 _templates/BLOCK_TEMPLATE.tsx
2. 遵循区块约定
3. 在 index.ts 中导出

## 如何修改主题
1. 使用 tweakcn 生成 tokens
2. 合并到 globals.css
3. 不要覆盖语义色扩展

## 质量检查
- pnpm type-check
- pnpm lint:check
- pnpm quality:gate
```

**验证标准**：
- [ ] 文档存在且内容完整
- [ ] 按文档步骤可以完成一次完整的模板使用

---

## 4. 执行顺序与检查点

```
┌─────────────────────────────────────────────────────────────┐
│  检查点 0：项目状态核查                                       │
│  • 运行 2.1/2.2/2.3 的核查命令                               │
│  • 记录当前状态                                              │
│  • 根据实际情况调整任务细节                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  T4：确认并清理 tokens 入口（先做，避免后续冲突）              │
│  验证：globals.css 是唯一 tokens 入口                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  T1：创建 primitives                                         │
│  验证：Container/Section 组件可用                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  T2：创建 blocks 目录结构                                    │
│  验证：目录骨架 + 模板文件存在                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  T3：迁移现有组件到 blocks                                   │
│  验证：首页渲染正常 + i18n 正常 + 主题切换正常                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  检查点 1：核心改造完成                                       │
│  • pnpm type-check 通过                                      │
│  • pnpm lint:check 通过                                      │
│  • pnpm dev 首页正常                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  T5：创建 site-facts.ts（P1）                                │
│  T6：更新文档（P1）                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  检查点 2：Step 1 完成                                       │
│  • 所有成功标准（1.2）满足                                   │
│  • pnpm quality:gate 通过                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 风险与应对

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| 现有组件与 primitives 冲突 | 中 | 中 | 渐进式迁移，保留旧组件直到新组件验证完成 |
| tokens 存在多入口 | 低 | 高 | 先执行 T4，清理后再继续 |
| 迁移后 i18n 失效 | 中 | 高 | 每迁移一个组件就测试 i18n |
| 迁移后布局错乱 | 中 | 中 | 保留原组件的样式逻辑，只改结构包裹 |

---

## 6. 后续步骤预览

Step 1 完成后，进入 Step 2-5：

```
Step 2：收集企业信息
        ↓
        使用 company-info-brief-template.md
        填写具体客户的企业信息
        ↓
Step 3：定页面架构
        ↓
        基于 IA Pattern Catalog 选择架构模式
        确定每个页面的区块组成
        ↓
Step 4：定统一元素
        ↓
        使用 tweakcn 生成 tokens
        合并到 globals.css
        ↓
Step 5：逐页面实现
        ↓
        用 skill 辅助实现具体页面
        跑质量门禁
```

---

## 附录 A：命令速查

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm dev:no-grab      # 纯 next dev

# 检查
pnpm type-check       # TypeScript 类型检查
pnpm lint:check       # ESLint 检查
pnpm lint:fix         # ESLint 自动修复

# 构建
pnpm build            # 生产构建
pnpm start            # 运行生产构建

# 质量门禁
pnpm quality:gate     # 完整质量检查
```

---

## 附录 B：参考资源

- 项目仓库：https://github.com/Shawn-Jones-7/tucsenberg-web-frontier
- shadcn/ui 文档：https://ui.shadcn.com/
- Tailwind CSS v4：https://tailwindcss.com/
- next-intl 文档：https://next-intl-docs.vercel.app/
