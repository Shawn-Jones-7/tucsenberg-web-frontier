# i18n 工具链配置重构记录（translation.config.js 清理）

## 背景

项目早期引入了 `translation.config.js` 作为通用翻译管理配置，但实际运行中的 i18n 工具链（next-intl + 本地 JSON + Node 脚本）并未真正使用该文件，大量配置处于“预留但未实现”状态，同时脚本内部存在多处 `['en', 'zh']` 硬编码。

本次重构目标：

- 消除脚本中的 locales 硬编码，统一从单一配置源读取
- 保留必要的回滚能力（依赖 Git 与单独备份文件）
- 不改变现有 next-intl 运行时行为和 messages/*.json 文件结构

## 变更概览

1. 复用现有 `i18n-locales.config.js` 作为脚本级语言配置
2. 修改 5 个 Node 工具脚本以使用统一配置
3. 备份并删除未使用的 `translation.config.js`
4. 尝试执行 i18n 相关脚本以验证行为（受环境限制，pnpm 未安装）

## 具体变更

### 1. i18n-locales.config.js

文件：`i18n-locales.config.js`

- 保持现有结构不变，仅确认其满足需求：
  - `locales: ['en', 'zh']`
  - `defaultLocale: 'en'`
- 用途：
  - 为 scripts/* 下的 Node 工具脚本提供统一的语言列表
  - 后续新增语言时，只需在此处修改 locales，再维护 messages/[locale].json

### 2. 工具脚本修改

统一使用 `require('../i18n-locales.config').locales` 作为语言列表来源：

- `scripts/translation-scanner.js`
  - 修改 `CONFIG.LOCALES`：
    - 从 `['en', 'zh']` 改为 `require('../i18n-locales.config').locales`

- `scripts/translation-sync.js`
  - 修改 `CONFIG.LOCALES`：
    - 从 `['en', 'zh']` 改为 `require('../i18n-locales.config').locales`

- `scripts/copy-translations.js`
  - 修改 `CONFIG.locales`：
    - 从 `['en', 'zh']` 改为 `require('../i18n-locales.config').locales`

- `scripts/validate-translations.js`
  - 修改本地变量 `locales`：
    - 从 `['en', 'zh']` 改为 `require('../i18n-locales.config').locales`

- `scripts/i18n-shape-check.js`
  - 修改本地变量 `locales`：
    - 从 `['en', 'zh']` 改为 `require('../i18n-locales.config').locales`

以上改动均为等价替换，不改变脚本逻辑，仅消除重复配置与硬编码。

### 3. translation.config.js 归档与删除

- 归档：
  - 使用 shell 命令将原文件复制到：
    - `docs/archive/translation.config.js.backup`
  - 保留完整内容，便于日后参考或对比
- 删除：
  - 通过工具删除项目根目录下的 `translation.config.js`
- 影响评估：
  - 当前代码和脚本均未引用该文件，删除后不影响运行时行为
  - 真正生效的配置仅来自：
    - `i18n-locales.config.js`
    - `messages/*.json`
    - 相关 i18n 校验脚本

## 测试与验证

### 脚本执行验证

尝试执行以下命令（用于验证脚本行为）：

- `pnpm i18n:full`
- `pnpm prebuild`
- `pnpm build:check`

实际结果：

- 当前执行环境中 `pnpm` 命令不存在（`bash: pnpm: command not found`）
- 因此无法在本环境内直接运行上述脚本

建议：

- 在本地或 CI 环境（已经安装 pnpm 且配置完整）中执行：
  - `pnpm i18n:full`
  - `pnpm prebuild`
  - `pnpm build:check`
- 以确认：
  - 翻译键扫描 / 同步脚本仍然正常工作
  - public/messages/* 生成逻辑未受影响

## 代码变更统计

- 新增文件：
  - 无（`i18n-locales.config.js` 已存在，仅复用）
- 修改文件：5 个
  - `scripts/translation-scanner.js`
  - `scripts/translation-sync.js`
  - `scripts/copy-translations.js`
  - `scripts/validate-translations.js`
  - `scripts/i18n-shape-check.js`
- 删除文件：1 个
  - `translation.config.js`（已完整备份到 docs/archive/translation.config.js.backup）

## 后续注意事项

- 若未来新增语言：
  - 更新 `i18n-locales.config.js` 中的 `locales` 数组
  - 补充 `messages/[locale].json` 及拆分后的 critical/deferred 文件
  - 确保 i18n 校验脚本在本地/CI 中重新运行并通过
- 如果需要重新启用更复杂的质量规则，可以基于备份文件重新设计简化版配置，而不是直接恢复整份 translation.config.js。

