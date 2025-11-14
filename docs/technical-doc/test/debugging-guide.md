# E2E 测试调试指南

## 📋 概述

本文档记录了项目中 E2E 测试调试的经验和最佳实践，帮助开发者快速定位和解决测试问题。

---

## 🔍 调试工具和方法

### 1. **Playwright 调试模式**

#### 有头模式运行测试
```bash
# 运行所有测试（有头模式）
pnpm test:e2e:headed

# 运行特定测试文件
pnpm exec playwright test tests/e2e/homepage.spec.ts --headed

# 运行特定浏览器
pnpm exec playwright test --project=chromium --headed
```

#### 调试模式（逐步执行）
```bash
# 启动调试模式
pnpm exec playwright test --debug

# 调试特定测试
pnpm exec playwright test tests/e2e/homepage.spec.ts --debug
```

#### 查看测试报告
```bash
# 生成并打开 HTML 报告
pnpm test:e2e:report

# 报告位置
open reports/playwright-report/index.html
```

---

## 🐛 常见问题和解决方案

### 1. **DOM 结构问题**

#### 问题：找不到语言切换器或其他元素

**调试方法**：
```typescript
// 1. 打印当前 URL
console.log('📍 Current URL:', page.url());

// 2. 检查页面标题
const title = await page.title();
console.log('📄 Page title:', title);

// 3. 检查 HTML lang 属性
const htmlLang = await page.locator('html').getAttribute('lang');
console.log('🌐 HTML lang attribute:', htmlLang);

// 4. 检查元素是否存在
const headerExists = (await page.locator('header').count()) > 0;
console.log('🏠 Header exists:', headerExists);

// 5. 打印完整的 body HTML（用于分析结构）
const bodyHTML = await page.locator('body').innerHTML();
console.log('📦 Body HTML:', bodyHTML.substring(0, 2000));
```

**解决方案**：
- 使用 `data-testid` 属性标记关键元素
- 等待页面完全加载：`await page.waitForLoadState('networkidle')`
- 增加等待时间：`await page.waitForTimeout(3000)`

---

### 2. **Firefox 浏览器行为差异**

#### 问题：Firefox 中语言切换后 `<html lang>` 属性未更新

**诊断方法**：
```typescript
// 1. 记录初始状态
const initialLang = await page.locator('html').getAttribute('lang');
console.log(`📌 Initial <html lang>: ${initialLang}`);

// 2. 执行语言切换
await languageToggleButton.click();
await chineseLink.click();

// 3. 等待 URL 变化
await page.waitForURL('**/zh');

// 4. 立即检查 lang 属性
const langImmediately = await page.locator('html').getAttribute('lang');
console.log(`⏱️  Immediately after URL change: lang="${langImmediately}"`);

// 5. 等待一段时间后再检查
await page.waitForTimeout(500);
const langAfterDelay = await page.locator('html').getAttribute('lang');
console.log(`⏱️  After 500ms delay: lang="${langAfterDelay}"`);
```

**解决方案**：
- 使用 `router.refresh()` 强制刷新页面
- 添加适当的等待时间（Firefox 需要更多时间）
- 使用 `page.waitForFunction()` 等待属性更新

**参考文件**：`tests/e2e/firefox-diagnosis.spec.ts`（已保留用于未来诊断）

---

### 3. **Hydration 不匹配问题**

#### 问题：React 19 + Radix UI Tabs 的 `aria-controls` ID 不一致

**现象**：
```
Warning: Prop `aria-controls` did not match.
Server: "radix-:r0:-trigger-overview"
Client: "radix-:r1:-trigger-overview"
```

**原因**：
- Radix UI 使用随机 ID 生成器
- SSR 和客户端生成的 ID 不一致

**解决方案**：
- ✅ 已知问题，不影响功能
- ⏳ 等待 Radix UI 发布 React 19 完全兼容版本后升级
- 📝 记录在 `AGENTS.md` 的 Memories 部分

---

## 📊 CI 配置优化

### 排除调试测试

```typescript
// playwright.config.ts
export default defineConfig({
  // 非每日任务时，排除调试/诊断类用例
  ...(isCI && !isDaily ? { grepInvert: /debug|diagnosis/i } : {}),
});
```

**说明**：
- CI 环境自动排除 `debug-*.spec.ts` 和 `*-diagnosis.spec.ts`
- 本地开发可以运行这些调试测试
- 每日任务会运行完整测试套件

---

## 🛠️ 调试测试文件管理

### 调试文件命名规范

```
tests/e2e/
├── debug-*.spec.ts          # 本地调试用测试（CI 排除）
├── *-diagnosis.spec.ts      # 问题诊断测试（CI 排除）
└── *.spec.ts                # 正式测试（CI 运行）
```

### 已删除的调试文件（2025-11-13）

| 文件名 | 大小 | 用途 | 删除原因 |
|--------|------|------|----------|
| `debug-dom.spec.ts` | 11KB | DOM 结构调试 | 问题已解决，已有正式测试覆盖 |
| `debug-dropdown.spec.ts` | 2.8KB | 下拉菜单调试 | 问题已解决 |
| `debug-language-dropdown.spec.ts` | 2.1KB | 语言下拉菜单调试 | 问题已解决 |

### 保留的诊断文件

| 文件名 | 大小 | 用途 | 保留原因 |
|--------|------|------|----------|
| `firefox-diagnosis.spec.ts` | 11KB | Firefox 行为差异诊断 | 用于未来 Firefox 问题诊断 |

---

## 📚 参考资源

### 官方文档
- [Playwright 调试指南](https://playwright.dev/docs/debug)
- [Playwright 测试报告](https://playwright.dev/docs/test-reporters)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)

### 项目文档
- [E2E 测试集成指南](./e2e-integration-guide.md)
- [无障碍性测试指南](./accessibility-testing-guide.md)
- [测试标准](../../../.augment/rules/testing-standards.md)

---

## 🔄 持续改进

### 调试经验记录流程

1. **遇到问题** → 创建 `debug-*.spec.ts` 文件进行调试
2. **问题解决** → 将解决方案记录到本文档
3. **清理文件** → 删除调试文件，保留正式测试
4. **更新文档** → 更新本指南和相关文档

### 下次调试建议

- 优先使用 Playwright 内置调试工具（`--debug`、`--headed`）
- 记录关键调试步骤和发现
- 问题解决后及时更新文档
- 定期审查和清理调试文件

