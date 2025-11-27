# CLAUDE.md 测试规范补充建议

## 建议在 Section 4 (Code & Architecture Standards) 之后添加

---

## 4.8 测试工具与 Mock 管理规范 (MANDATORY)

本项目强制执行**集中化测试 mock 管理**,以避免重复定义、维护困难和不一致性问题。

### 4.8.1 强制规则

#### ❌ 禁止行为

1. **禁止创建新的测试工具文件**:
   - 不得在组件目录下创建 `test-utils.ts` 或类似文件
   - 不得在测试文件中定义局部的 `renderWithProviders` 函数
   - 违例: `src/components/**/__tests__/test-utils.ts` ❌

2. **禁止内联定义 mock 消息**:
   ```typescript
   // ❌ 禁止 - 内联定义翻译 mock
   vi.mock('next-intl', () => ({
     useTranslations: vi.fn(() => (key: string) => {
       const translations = {
         'navigation.home': 'Home',
         'navigation.about': 'About',
         // ...
       };
       return translations[key] || key;
     }),
   }));
   ```

3. **禁止重复定义消息常量**:
   ```typescript
   // ❌ 禁止 - 在测试文件中定义消息对象
   const mockMessages = {
     navigation: { home: 'Home', about: 'About' },
     common: { loading: 'Loading...' }
   };
   ```

---

#### ✅ 强制要求

1. **必须使用集中测试工具**:
   ```typescript
   // ✅ 正确 - 从统一入口导入
   import { renderWithIntl, createMockTranslations } from '@/test/utils';
   ```

2. **必须使用集中 mock 消息**:
   ```typescript
   // ✅ 正确 - 使用集中 mock
   import { combinedMessages, navigationMessages } from '@/test/constants/mock-messages';

   // 或使用工具函数(自动包含集中 mock)
   vi.mock('next-intl', () => ({
     useTranslations: vi.fn(() => createMockTranslations()),
   }));
   ```

3. **局部覆写必须注释原因**:
   ```typescript
   // ✅ 正确 - 覆写时必须注释原因
   renderWithIntl(<Component />, 'en', {
     // 覆写原因: 测试错误状态下的空消息处理
     navigation: {}
   });
   ```

---

### 4.8.2 标准测试文件结构

#### 基础结构

```typescript
// 1. 导入测试工具(来自统一入口)
import { renderWithIntl, createMockTranslations } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// 2. 导入被测组件
import { MyComponent } from './my-component';

// 3. Mock 外部依赖(非消息类)
vi.mock('@/lib/some-utility', () => ({
  someFunction: vi.fn(),
}));

// 4. Mock 翻译(使用集中工具)
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => createMockTranslations()),
}));

// 5. 测试套件
describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    // 使用默认集中 mock
    renderWithIntl(<MyComponent />);

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('handles custom messages', () => {
    // 局部覆写(必须注释原因)
    renderWithIntl(<MyComponent />, 'en', {
      // 测试长文本截断场景
      navigation: {
        home: 'Very Long Home Title That Should Be Truncated'
      }
    });

    // 验证截断逻辑
  });
});
```

---

### 4.8.3 允许的例外情况

某些特殊 mock 允许在测试文件中定义,但必须注释原因:

#### 1. 组件 Mock

```typescript
// ✅ 允许 - UI 组件库的特定行为 mock
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: any) => (
    <div data-testid="sheet" data-open={open}>{children}</div>
  ),
}));
```

**原因**: 组件行为是测试特定的,无法集中管理

---

#### 2. 路由 Mock

```typescript
// ✅ 允许 - 路由特定状态 mock
vi.mock('@/i18n/routing', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    pathname: '/test-path', // 测试特定路径
  })),
}));
```

**原因**: 路由状态与具体测试场景绑定

---

#### 3. 数据 Mock

```typescript
// ✅ 允许 - 业务数据 mock
const mockUserData = {
  id: '123',
  name: 'Test User',
  role: 'admin',
};
```

**原因**: 业务数据结构多变,测试特定

---

### 4.8.4 代码审查检查清单

审查测试 PR 时,必须检查:

- [ ] 是否使用 `@/test/utils` 作为测试工具入口?
- [ ] 是否使用 `createMockTranslations()` 或 `renderWithIntl()` 的集中 mock?
- [ ] 是否有内联定义的翻译 mock?
- [ ] 是否有新的 `test-utils.ts` 文件?
- [ ] 局部覆写是否有清晰的注释原因?
- [ ] 特殊 mock (组件/路由/数据) 是否有注释说明?

**若发现违规,必须要求修改后才能合并。**

---

### 4.8.5 AI 助手指令

当你(AI 助手)编写或修改测试文件时:

1. **强制检查现有工具**:
   - 在编写测试前,必须先检查 `src/test/utils.tsx` 是否有可用工具
   - 必须检查 `src/test/constants/mock-messages.ts` 是否包含所需消息

2. **禁止创建新工具**:
   - 不得创建新的 `test-utils.ts` 文件
   - 不得在测试文件中定义新的 render 函数
   - 如需新工具,必须添加到 `src/test/utils.tsx`

3. **主动建议集中化**:
   - 如发现测试文件中有重复 mock 定义,必须主动建议迁移到集中 mock
   - 如发现缺少的消息 key,必须建议添加到 `mock-messages.ts`

4. **文档引用**:
   - 在测试相关建议中,必须引用 `src/test/utils.tsx` 的顶部文档
   - 向用户说明集中 mock 的优势

---

### 4.8.6 集中 Mock 扩展指南

当需要添加新的 mock 消息时:

#### 步骤 1: 检查是否已存在

```bash
# 搜索现有 mock
grep -r "myNewKey" src/test/constants/
```

#### 步骤 2: 添加到集中文件

```typescript
// src/test/constants/mock-messages.ts

export const myNewNamespaceMessages = {
  key1: 'Value 1',
  key2: 'Value 2',
} as const;

// 添加到 combinedMessages
export const combinedMessages = {
  // ... existing namespaces
  myNewNamespace: myNewNamespaceMessages,
} as const;
```

#### 步骤 3: 更新类型导出

```typescript
export type MyNewNamespaceMessages = typeof myNewNamespaceMessages;
```

#### 步骤 4: 运行验证

```bash
pnpm lint
pnpm type-check
```

---

### 4.8.7 常见问题

#### Q: 什么时候可以在测试中定义 mock?

**A**: 只有以下情况:
1. 组件行为 mock (UI 库组件)
2. 路由状态 mock (特定测试路径)
3. 业务数据 mock (测试数据结构)
4. 特殊边缘情况(必须注释原因)

**永远不允许**: 翻译消息、通用 UI 文本、导航标签

---

#### Q: 如何测试多语言?

**A**: 使用对应语言的集中 mock:

```typescript
import { combinedMessages as zhMessages } from '@/test/constants/mock-messages-zh';

renderWithIntl(<Component />, 'zh', zhMessages);
```

---

#### Q: 我的测试需要特殊消息,怎么办?

**A**: 使用深度合并覆写:

```typescript
renderWithIntl(<Component />, 'en', {
  // 只覆写需要的 key,其他保持默认
  navigation: {
    home: 'Special Home for Edge Case',
  }
});
```

---

### 4.8.8 工具位置快速参考

| 用途 | 导入路径 |
|------|---------|
| 渲染工具 | `import { renderWithIntl } from '@/test/utils'` |
| Mock 翻译 | `import { createMockTranslations } from '@/test/utils'` |
| 英文消息 | `import { combinedMessages } from '@/test/constants/mock-messages'` |
| 中文消息 | `import { combinedMessages } from '@/test/constants/mock-messages-zh'` |
| 特���命名空间 | `import { navigationMessages, themeMessages } from '@/test/constants/mock-messages'` |
| 完整文档 | 查看 `src/test/utils.tsx` 顶部 JSDoc |

---

### 4.8.9 违规处理

**发现违规时**:

1. **开发阶段**: AI 助手必须立即指出并建议修改
2. **代码审查**: 审查者必须要求修改
3. **CI 检查**: (未来) 添加 ESLint 规则强制检查

**严重违规示例**:
- 创建新的 `components/**/__tests__/test-utils.ts` ❌
- 复制粘贴 200+ 行翻译 mock ❌
- 三个不同测试文件定义相同的 `mockMessages` ❌

---

## 参考文档

- 完整盘点报告: `docs/test-mock-inventory.md`
- 改造总结: `docs/test-mock-migration-summary.md`
- 使用文档: `src/test/utils.tsx` (顶部 JSDoc)

---

**最后更新**: 2025-11-26
**责任人**: 项目架构团队
**强制等级**: MANDATORY (所有新测试必须遵守)

