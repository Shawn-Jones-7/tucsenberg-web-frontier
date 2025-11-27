# 测试 Mock 盘点报告

## 1. 现状概览

### 1.1 测试工具文件分布

| 文件路径 | 用途 | 主要功能 |
|---------|------|---------|
| `src/test/utils.tsx` | 完整测试工具库 | `renderWithIntl`, `createMockTranslations`, 多种 mock 工厂函数 |
| `src/components/layout/__tests__/test-utils.ts` | 简易布局测试工具 | `renderWithProviders`, 基础 `mockMessages` |
| `messages/en.json` | Vitest mock 消息源 | 完整的应用消息结构(仅用于 mock) |
| `messages/en/critical.json` | Vitest mock 消息源 | 完整的应用消息结构(仅用于 mock) |

### 1.2 Mock 消息结构对比

#### src/test/utils.tsx 的 defaultMessages

```typescript
{
  common: { loading, error, success, cancel, confirm, save, edit, delete, search, filter, sort, next, previous, close, open },
  navigation: { home, about, contact, services, products, solutions, resources, enterprise, docs, pricing, blog, menu, close },
  accessibility: { skipToContent, openMenu, closeMenu, loading, error, languageSelector, themeSelector },
  errorBoundary: { title, description, tryAgain }
}
```

**覆盖范围**: 4 个命名空间, 约 35 个 key

#### src/components/layout/__tests__/test-utils.ts 的 mockMessages

```typescript
{
  navigation: { home, about, services, products, blog, contact, contactSales },
  language: { switch, english, chinese, current },
  theme: { toggle, light, dark, system },
  common: { loading, error, success }
}
```

**覆盖范围**: 4 个命名空间, 约 18 个 key

#### 测试文件内联 mock (mobile-navigation.test.tsx 示例)

```typescript
{
  'navigation.home': 'Home',
  'navigation.about': 'About',
  'navigation.services': 'Services',
  'navigation.products': 'Products',
  'navigation.blog': 'Blog',
  'navigation.contact': 'Contact',
  'navigation.menu': 'Menu',
  'navigation.close': 'Close menu',
  'seo.siteName': 'Tucsenberg',
  'seo.description': 'Professional B2B Solutions',
  'accessibility.openMenu': 'Open navigation menu',
  'accessibility.closeMenu': 'Close navigation menu'
}
```

**覆盖范围**: 3 个命名空间(扁平 key), 约 12 个 key

#### messages/en.json (官方 mock 源)

```typescript
{
  common: { 包含 toast 子对象, 约 20+ keys },
  errorBoundary: { title, description, tryAgain },
  navigation: { 约 30+ keys, 包含描述字段 },
  theme: { 约 10 keys },
  language: { 约 15 keys, 包含 detector 子对象 },
  home: { 大量内容 keys },
  footer: { 多级嵌套结构 },
  accessibility: { 8 keys },
  seo: { 包含 pages 子对象 },
  underConstruction: { 大量内容 },
  "structured-data": { 元数据 }
}
```

**覆盖范围**: 11+ 个命名空间, 数百个 key

---

## 2. 差异与重叠分析

### 2.1 命名空间覆盖对比

| 命名空间 | src/test/utils.tsx | test-utils.ts | 测试内联 mock | messages/en.json |
|---------|-------------------|---------------|--------------|-----------------|
| common | ✅ (13 keys) | ✅ (3 keys) | ❌ | ✅ (20+ keys) |
| navigation | ✅ (12 keys) | ✅ (7 keys) | ✅ (8 keys) | ✅ (30+ keys) |
| accessibility | ✅ (7 keys) | ❌ | ✅ (2 keys) | ✅ (8 keys) |
| errorBoundary | ✅ (3 keys) | ❌ | ❌ | ✅ (3 keys) |
| theme | ❌ | ✅ (4 keys) | ❌ | ✅ (10 keys) |
| language | ❌ | ✅ (4 keys) | ❌ | ✅ (15 keys) |
| seo | ❌ | ❌ | ✅ (2 keys) | ✅ (大量) |
| home | ❌ | ❌ | ❌ | ✅ (大量) |
| footer | ❌ | ❌ | ❌ | ✅ (大量) |

### 2.2 关键发现

#### 重复定义 (Duplication)

1. **navigation 命名空间**: 在 3 个地方都有定义,但 key 集不完全一致
   - `src/test/utils.tsx` 缺少: `contactSales`, `frameworks`, `infrastructure` 等
   - `test-utils.ts` 缺少: `solutions`, `resources`, `enterprise` 等
   - 测试内联 mock 缺少: `solutions`, `resources`, `pricing` 等

2. **common 命名空间**: 各处定义的粒度不同
   - `src/test/utils.tsx` 有 13 个基础 key
   - `test-utils.ts` 只有 3 个最基础 key
   - `messages/en.json` 有完整集合(包括 toast 子对象)

3. **accessibility 命名空间**:
   - `src/test/utils.tsx` 有 7 个 key
   - 测试内联 mock 只有 2 个特定 key (`openMenu`, `closeMenu`)
   - `messages/en.json` 是完整权威源(8 keys)

#### 缺失/不一致 (Gaps & Inconsistencies)

1. **theme & language**:
   - `src/test/utils.tsx` **完全缺失** theme 和 language 命名空间
   - `test-utils.ts` 有基础定义,但远不如 `messages/en.json` 完整

2. **seo, home, footer, underConstruction**:
   - 只在 `messages/en.json` 中存在
   - 测试工具中**完全缺失**,可能导致某些组件测试无法运行

3. **key 命名不一致**:
   - 测试内联 mock 使用扁平 key (如 `navigation.home`)
   - 其他地方使用嵌套对象 (如 `navigation: { home }`)

---

## 3. 可集中化 vs 必须保留局部覆写

### 3.1 可集中化的内容

#### 高优先级 (High Priority)

| 命名空间 | 理由 |
|---------|------|
| `common` | 所有测试都需要,可从 `messages/en.json` 提取核心子集 |
| `navigation` | 布局/导航测试的核心,需要完整集合 |
| `accessibility` | 可访问性测试必需,应统一从官方源提取 |
| `errorBoundary` | 错误边界测试常用 |

#### 中优先级 (Medium Priority)

| 命名空间 | 理由 |
|---------|------|
| `theme` | 主题切换测试需要,可从官方源提取 |
| `language` | 语言切换测试需要,可从官方源提取 |
| `seo` | SEO 组件测试需要基础 key |

#### 低优先级 (Low Priority)

| 命名空间 | 理由 |
|---------|------|
| `home`, `footer`, `underConstruction` | 特定页面内容,按需引入 |

### 3.2 必须保留局部覆写的场景

#### 场景 1: 特定测试需要不同的翻译值

```typescript
// 测试多语言切换时,需要覆写不同语言的值
renderWithIntl(component, 'zh', {
  navigation: { home: '首页' }
});
```

**建议**: 保留 `partialMessages` 参数支持局部覆写

#### 场景 2: 测试错误/边缘情况

```typescript
// 测试空消息或缺失 key 的容错处理
renderWithIntl(component, 'en', {
  navigation: {} // 故意留空测试 fallback
});
```

**建议**: 在测试文件内保留少量特殊场景 mock,但标注原因

#### 场景 3: 复杂消息插值测试

```typescript
// 测试包含变量插值的消息
const mockMessages = {
  language: {
    current: 'Current language: {locale}'
  }
};
```

**建议**: 集中 mock 提供基础插值模板,特殊格式仍可局部覆写

---

## 4. 缺失 Key 清单

### 4.1 src/test/utils.tsx 缺失但常用的 key

```typescript
// theme 命名空间 - 完全缺失
theme: {
  toggle, toggleLabel, light, dark, system,
  selectTheme, selectDisplayTheme,
  switchToLight, switchToDark, switchToSystem
}

// language 命名空间 - 完全缺失
language: {
  toggle, selectLanguage, english, chinese,
  switching, switchSuccess, switchError,
  fallbackWarning, detectionInfo, source, confidence,
  userPreference, detector: { ... }
}

// navigation 补充
navigation: {
  contactSales, frameworks, infrastructure, security,
  aiApps, webApps, ecommerce, guides,
  frameworksDescription, infrastructureDescription, // 等描述字段
}

// seo 命名空间 - 完全缺失
seo: {
  title, description, siteName, keywords,
  pages: { home, about, contact, products, blog }
}
```

### 4.2 test-utils.ts 缺失但常用的 key

```typescript
// navigation 补充
navigation: {
  solutions, resources, enterprise, docs, pricing,
  frameworks, infrastructure, security,
  // 以及所有描述字段
}

// accessibility 命名空间 - 完全缺失
accessibility: {
  skipToContent, openMenu, closeMenu,
  loading, error, languageSelector, themeSelector
}

// errorBoundary 命名空间 - 完全缺失
errorBoundary: {
  title, description, tryAgain
}
```

---

## 5. 推荐改造方案

### 5.1 集中 Mock 文件结构

```
src/test/constants/
├── mock-messages.ts          # 主导出文件
├── namespaces/
│   ├── common.ts             # common 命名空间
│   ├── navigation.ts         # navigation 命名空间
│   ├── accessibility.ts      # accessibility 命名空间
│   ├── theme.ts              # theme 命名空间
│   ├── language.ts           # language 命名空间
│   ├── seo.ts                # seo 命名空间
│   └── error-boundary.ts     # errorBoundary 命名空间
└── index.ts                  # 汇总导出
```

**优点**:
- 按命名空间拆分,避免单文件过大
- 可按需导入特定命名空间
- 便于维护和扩展

### 5.2 导出策略

```typescript
// src/test/constants/mock-messages.ts

export const navigationMessages = { /* ... */ };
export const commonMessages = { /* ... */ };
export const accessibilityMessages = { /* ... */ };
export const themeMessages = { /* ... */ };
export const languageMessages = { /* ... */ };
export const seoMessages = { /* ... */ };
export const errorBoundaryMessages = { /* ... */ };

// 默认导出: 合并所有命名空间
export const combinedMessages = {
  navigation: navigationMessages,
  common: commonMessages,
  accessibility: accessibilityMessages,
  theme: themeMessages,
  language: languageMessages,
  seo: seoMessages,
  errorBoundary: errorBoundaryMessages,
};

export default combinedMessages;
```

### 5.3 工具整合策略

#### src/test/utils.tsx 改造

```typescript
import { combinedMessages } from '@/test/constants/mock-messages';

export const renderWithIntl = (
  ui: React.ReactElement,
  locale: string = 'en',
  partialMessages?: Record<string, unknown>, // 支持局部覆写
) => {
  // 深度合并: combinedMessages + partialMessages
  const messages = partialMessages
    ? deepMerge(combinedMessages, partialMessages)
    : combinedMessages;

  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
};
```

#### test-utils.ts 处理

**选项 1: 标记为 deprecated 并重导出**

```typescript
/**
 * @deprecated Use @/test/utils instead
 * This file is kept for backward compatibility
 */
export { renderWithIntl, mockMessages } from '@/test/utils';
export { combinedMessages as mockMessages } from '@/test/constants/mock-messages';
```

**选项 2: 删除并全局替换导入**

在所有测试文件中:
```typescript
// 替换前
import { renderWithProviders } from '@/components/layout/__tests__/test-utils';

// 替换后
import { renderWithIntl } from '@/test/utils';
```

### 5.4 测试文件迁移示例

#### 迁移前 (mobile-navigation.test.tsx)

```typescript
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'navigation.home': 'Home',
      'navigation.about': 'About',
      // ... 重复定义
    };
    return translations[key] || key;
  }),
}));
```

#### 迁移后

```typescript
import { renderWithIntl } from '@/test/utils';
import { navigationMessages } from '@/test/constants/mock-messages';

// 使用集中 mock
renderWithIntl(<MobileNavigation />);

// 或需要覆写时
renderWithIntl(<MobileNavigation />, 'en', {
  navigation: {
    ...navigationMessages,
    home: 'Custom Home' // 局部覆写
  }
});
```

---

## 6. 实施优先级

### 阶段 1: 建立集中 Mock (Week 1)

- [ ] 创建 `src/test/constants/mock-messages.ts`
- [ ] 从 `messages/en.json` 提取核心命名空间
- [ ] 补全 `src/test/utils.tsx` 缺失的 theme, language 等命名空间

### 阶段 2: 整合工具入口 (Week 1)

- [ ] 更新 `src/test/utils.tsx` 使用集中 mock
- [ ] 添加深度合并逻辑支持 `partialMessages`
- [ ] 标记 `test-utils.ts` 为 deprecated 或重导出

### 阶段 3: 迁移测试文件 (Week 2)

- [ ] 全局搜索替换 `from '@/components/layout/__tests__/test-utils'`
- [ ] 清理测试文件内联 mock (保留必要的特殊场景)
- [ ] 抽样运行关键测试验证

### 阶段 4: 文档与验证 (Week 2)

- [ ] 添加使用说明和示例
- [ ] 运行完整测试套件
- [ ] 更新测试编写指南

---

## 7. 风险评估

### 高风险

| 风险 | 缓解措施 |
|------|---------|
| 破坏现有测试 | 分阶段迁移,每步都运行测试验证 |
| 类型不匹配 | 严格���循 `messages/en.json` 类型结构 |
| 深度合并逻辑错误 | 使用成熟库(如 lodash.merge)或经过充分测试的工具函数 |

### 中风险

| 风险 | 缓解措施 |
|------|---------|
| 集中文件过大拖慢测试 | 按命名空间拆分导出,支持按需导入 |
| 某些测试需要特殊 mock | 保留 `partialMessages` 覆写能力 |
| 导入路径变更导致混乱 | 使用 deprecated 标注和 linter 规则强制新路径 |

### 低风险

| 风险 | 缓解措施 |
|------|---------|
| 团队适应新工具 | 提供清晰文档和迁移示例 |

---

## 8. 附录

### 8.1 深度合并工具函数参考

```typescript
/**
 * 深度合并两个对象,右侧优先
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const output = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = output[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        output[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else {
        output[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return output;
}
```

### 8.2 相关文件路径清单

**测试工具**:
- `src/test/utils.tsx` (主工具库)
- `src/components/layout/__tests__/test-utils.ts` (待整合/弃用)

**消息源**:
- `messages/en.json` (Vitest mock 权威源)
- `messages/en/critical.json` (运行时源,包含部分 mock key)
- `messages/zh.json` (中文版本)
- `messages/zh/critical.json` (中文运行时源)

**测试文件** (部分示例):
- `src/components/layout/__tests__/header.test.tsx`
- `src/components/layout/__tests__/mobile-navigation.test.tsx`
- `src/components/layout/__tests__/mobile-navigation-items-accessibility-core.test.tsx`

---

**盘点完成日期**: 2025-11-26
**盘点人**: Claude (AI Assistant)
**文档版本**: 1.0

