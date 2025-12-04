## P1-3 多语言 MDX slug 对齐校验脚本：技术方案与执行计划

### 1. 任务总览

**业务目标**

- 确保 `content/{posts,pages,products}/{en,zh}` 目录下的 MDX 内容：
  - 每个内容在 en 与 zh 目录中**文件成对存在**；
  - 对应的 `frontmatter.slug` **一致**，保证 URL 语义一致。
- 将该检查接入本地开发、pre-commit（Lefthook）与 CI，作为多语言内容的一道硬质量门。

**技术目标**

- 新增一个**纯逻辑校验模块** + 一个 **Node CLI 入口脚本**：
  - 逻辑层：只负责扫描 MDX 文件、解析 frontmatter、构造错误列表；
  - CLI 层：负责命令行参数、stdout 输出、JSON 报告与 exit code。
- 将 CLI 通过脚本与配置集成到：
  - `pnpm content:slug-check`（独立可运行）；
  - `pnpm i18n:full`（统一 i18n 质量门禁入口）；
  - Lefthook `i18n-sync` + CI workflow（自动运行）。

**预期收益**

- **内容质量**：防止漏建 zh/en 文件或 slug 不一致导致的 URL 混乱与 404。
- **SEO & 体验**：保证中英文 URL 结构对齐，有利于搜索引擎与用户理解站点结构。
- **编辑体验**：在提交阶段给出清晰报错（collection、文件路径、slug 差异）。

**工作量估算**

- Task 1：核心逻辑模块实现 —— 0.5–1 工日
- Task 2：CLI 封装与报告输出 —— 0.5 工日
- Task 3：脚本集成到 i18n / CI / Lefthook —— 0.5 工日
- Task 4：单元测试与回归用例 —— 0.5–1 工日

> 总计约 2–3 工日，适合 1 人一个小 iteration 完成。

---

### 2. Shrimp 任务树（规划结果）

> 以下任务 ID 由 Shrimp Task Manager 生成，用于后续 Agent 自动执行与追踪。

| ID | 名称 | 描述（摘要） | 依赖 | 验收标准（摘要） |
| --- | --- | --- | --- | --- |
| `febb0fb6-b7e2-43a5-8260-e0272379d025` | 设计与实现 MDX 多语言 slug 对齐校验核心逻辑模块 | 在 `scripts/` 下新增纯逻辑模块，扫描 `content/{posts,pages,products}/{en,zh}`，构建 en/zh 文件配对，解析 `frontmatter.slug`，产出结构化 issues。 | 无 | 存在可导出的 `validateMdxSlugSync` 函数；可在构造的测试目录上正确识别 `missing_pair` / `slug_mismatch` / `parse_error`；不直接访问 `process.exit` 或 `console`。 |
| `85cf129c-0609-4297-a3b0-e0dc90553178` | 实现 MDX slug 对齐校验 CLI 封装与报告输出 | 基于核心模块实现 CLI 入口（如 `scripts/content-slug-sync.js`），解析参数、调用校验函数，打印人类友好摘要，并可选输出 JSON 报告。 | Task 1 | `node scripts/content-slug-sync.js` 可运行；在有/无问题时 exit code 分别为 1/0；启用 `--json` 时在 `reports/` 生成结构正确的 JSON 报告。 |
| `9a578525-e3ff-4b99-8a23-4e3ba82be263` | 将 MDX slug 对齐校验集成到 i18n:full / CI / Lefthook 流程 | 在 `package.json` 中新增脚本并串联到 `i18n:full`，通过 Lefthook `i18n-sync` 与 CI workflow 间接运行 slug 校验。 | Task 2 | 本地 `pnpm content:slug-check` / `pnpm i18n:full` 能触发 slug 校验；pre-commit 在有问题时阻止提交；CI 在校验失败时对应 job 标记失败。 |
| `6b8009b5-d016-4e2c-a78d-966074e433ff` | 为 MDX slug 对齐校验实现单元测试与回归用例 | 为核心逻辑与必要 CLI 行为编写 Vitest 测试，覆盖缺失配对、slug 不一致、解析失败与正常通过等场景。 | Task 1, Task 2 | 新增测试在本地与 CI 中稳定通过；覆盖四类关键场景；测试不依赖真实 `content/` 目录，而使用临时测试目录。 |

---

### 3. 执行顺序与里程碑

**推荐执行顺序**

1. **Task 1**：实现 `validateMdxSlugSync` 核心逻辑（扫描 + 配对 + 解析）。
2. **Task 2**：实现 `scripts/content-slug-sync.js` CLI（参数解析 + stdout + JSON 报告 + exit code）。
3. **Task 4**：为核心逻辑与 CLI 增补 Vitest 测试（可与 Task 2 部分并行）。
4. **Task 3**：将 `content:slug-check` 串联进 `i18n:full`，接入 Lefthook `i18n-sync` 与 CI。

**关键里程碑**

- **里程碑 1：核心模块可在临时目录跑通**  
  `validateMdxSlugSync` 可在简单的虚拟 `content/` 结构上输出正确 issues。

- **里程碑 2：CLI 可用，开发者可一键查看问题**  
  `node scripts/content-slug-sync.js` 在当前仓库上可运行，输出人类友好摘要；`--json` 会生成报告文件。

- **里程碑 3：测试与 CI / pre-commit 全面接入**  
  Vitest 测试通过；pre-commit 与 CI 在 slug 校验失败时会阻止提交 / 标红失败。

---

### 4. 技术实施细节

#### 4.1 文件级改动清单

**新增文件**

- `scripts/mdx-slug-sync.js`（或 `.ts`）：
  - 导出 `validateMdxSlugSync(options)` 纯函数；
  - 只做文件扫描、frontmatter 解析与结果聚合，不触碰 `process.exit`/`console`。

- `scripts/content-slug-sync.js`：
  - Node CLI 入口脚本（可使用 shebang）；
  - 解析 `--json`、`--collections` 等参数；
  - 调用 `validateMdxSlugSync`；
  - 输出摘要、设置 exit code、可写 JSON 报告。

- `tests/unit/scripts/mdx-slug-sync.test.ts`：
  - 使用 Vitest，基于临时目录模拟 `content/{posts,pages,products}/{en,zh}` 结构进行测试；
  - 已实现核心逻辑的单元测试（20 个测试用例），不依赖真实 `content/` 目录。

- `tests/unit/scripts/content-slug-sync.test.ts`（可选增强）：
  - CLI 层的轻量集成测试，验证 exit code 与 JSON 报告；
  - 使用 `child_process.spawn` 调用 CLI 脚本进行端到端验证。

- `reports/content-slug-sync-report.json`（运行时生成）：
  - 存放最近一次 slug 校验的结构化 JSON 报告。

**修改文件**

- `package.json`：
  - 新增脚本：`"content:slug-check": "node scripts/content-slug-sync.js"`；
  - 在 `i18n:full`（或等价脚本）中追加：`pnpm content:slug-check`。

- `lefthook.yml`：
  - 确认 `i18n-sync` 钩子仍然只调用 `pnpm i18n:full`；
  - 确保 `git diff --cached` 的路径匹配规则覆盖 `content/`，使 slug 校验在内容变更时被触发。

- `.github/workflows/*.yml`（CI 主流程文件）：
  - 确保至少一个 job 执行 `pnpm i18n:full`，间接运行 slug 校验。

#### 4.2 接口与数据结构设计

**Issue 类型定义（TypeScript 草图）**

```ts
type SlugSyncIssueType = 'missing_pair' | 'slug_mismatch' | 'parse_error';

interface SlugSyncIssue {
  type: SlugSyncIssueType;
  collection: string;           // 常用值: 'posts' | 'pages' | 'products'
  baseLocale: string;           // 基准语言代码
  targetLocale: string;         // 比对语言代码
  basePath?: string;            // 基准语言文件路径（如存在）
  targetPath?: string;          // 比对语言文件路径（如存在）
  baseSlug?: string;            // 基准语言 slug
  targetSlug?: string;          // 比对语言 slug
  message: string;              // 人类可读的问题描述
  error?: string;               // 仅 parse_error 时出现，错误详情
}
```

> **设计说明**：实现中使用 `baseLocale/targetLocale` 命名，是为了支持未来多语言扩展（如 en ↔ zh, en ↔ ja），而不是硬编码 en/zh。

**函数入参与返回值**

```ts
interface SlugSyncOptions {
  rootDir: string;              // 项目根目录
  collections?: string[];       // 默认 ['posts', 'pages', 'products']
  locales?: string[];           // 默认 ['en', 'zh']，第一个为基准语言
  baseLocale?: string;          // 可显式指定基准语言，否则默认 locales[0]
}

interface SlugSyncResult {
  ok: boolean;                  // 是否通过校验
  checkedCollections: string[]; // 实际校验的 collections
  checkedLocales: string[];     // 实际校验的 locales
  issues: SlugSyncIssue[];      // 问题列表
  stats: {                      // 统计信息
    totalFiles: number;
    totalPairs: number;
    missingPairs: number;
    slugMismatches: number;
    parseErrors: number;
  };
}

export function validateMdxSlugSync(
  options: SlugSyncOptions,
): SlugSyncResult;
```

> **多语言扩展说明**：当 `locales = ['en', 'zh', 'ja']` 时，若不传 `baseLocale`，则默认 `baseLocale = 'en'`，会依次对 `en ↔ zh`、`en ↔ ja` 做配对校验。

> 可用 JS + JSDoc 或 TS 实现，关键是保持该签名并避免在逻辑模块中引入 CLI 相关副作用。

#### 4.3 核心实现伪代码

**4.3.1 构建 en/zh 文件配对**

```ts
function collectPairs(rootDir, collection, primary, secondary) {
  const enFiles = glob(`${rootDir}/content/${collection}/${primary}/*.mdx`);
  const zhFiles = glob(`${rootDir}/content/${collection}/${secondary}/*.mdx`);

  const map = new Map(); // key -> { enPath?: string; zhPath?: string }

  for (const p of enFiles) {
    const key = buildKey(p, primary);
    const entry = map.get(key) ?? {};
    entry.enPath = p;
    map.set(key, entry);
  }

  for (const p of zhFiles) {
    const key = buildKey(p, secondary);
    const entry = map.get(key) ?? {};
    entry.zhPath = p;
    map.set(key, entry);
  }

  return map;
}
```

`buildKey`：去掉路径中的 `/en/` 或 `/zh/` 段，仅使用 `collection + 相对路径（不含 locale）` 作为 key，保证同一逻辑内容生成同一 key。

**4.3.2 校验配对与 slug 一致性**

```ts
function validateCollection(options, collection): SlugSyncIssue[] {
  const map = collectPairs(...);
  const issues: SlugSyncIssue[] = [];

  for (const [key, { enPath, zhPath }] of map) {
    if (!enPath || !zhPath) {
      issues.push({
        type: 'missing_pair',
        collection,
        pathEn: enPath,
        pathZh: zhPath,
        message: 'en/zh 文件未成对存在',
      });
      continue;
    }

    const { slug: slugEn } = parseFrontmatter(enPath);
    const { slug: slugZh } = parseFrontmatter(zhPath);

    if (!slugEn || !slugZh) {
      issues.push({
        type: 'parse_error',
        collection,
        pathEn: enPath,
        pathZh: zhPath,
        message: 'frontmatter.slug 缺失或解析失败',
      });
    } else if (slugEn !== slugZh) {
      issues.push({
        type: 'slug_mismatch',
        collection,
        pathEn: enPath,
        pathZh: zhPath,
        slugEn,
        slugZh,
        message: 'en/zh slug 不一致',
      });
    }
  }

  return issues;
}
```

**4.3.3 CLI 入口关键流程**

```ts
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rootDir = path.join(__dirname, '..');

  const result = validateMdxSlugSync({
    rootDir,
    collections: args.collections ?? ['posts', 'pages', 'products'],
    primaryLocale: 'en',
    secondaryLocales: ['zh'],
  });

  printHumanSummary(result);

  if (args.json) {
    writeJsonReport(result, path.join(rootDir, 'reports', 'content-slug-sync-report.json'));
  }

  process.exitCode = result.ok ? 0 : 1;
}
```

#### 4.4 测试要求

**单元测试（核心逻辑）最小场景：**

1. **缺失配对（missing_pair）**：只存在 `en/foo.mdx` 或 `zh/foo.mdx`。
2. **slug 不一致（slug_mismatch）**：`slugEn !== slugZh`。
3. **frontmatter 解析失败（parse_error）**：frontmatter 缺失或格式错误。
4. **完全正常**：en/zh 文件存在且 slug 相同。

> 测试中使用临时目录 + 最小 MDX 内容，避免依赖真实 `content/`。

**CLI 轻量集成测试：**

- 通过子进程执行 `node scripts/content-slug-sync.js --json --collections=posts`：
  - 校验 exit code；
  - 校验 stdout 是否包含问题统计摘要；
  - 校验 `reports/content-slug-sync-report.json` 是否生成且结构正确。

**手动验证清单：**

1. 在真实仓库上运行 `pnpm content:slug-check` 与 `pnpm i18n:full`；
2. 刻意删除一个 zh 文件或修改其中一个 slug：
   - 预期：命令失败，日志中能看到对应 collection + 文件路径；
3. 修复问题后再次运行，预期命令成功通过。

#### 4.5 与现有代码的集成点

**复用与对齐**

- 规则来源：
  - `agent_docs/content.md` 已声明：每个内容文件必须在 `en/` 与 `zh/` 都存在并且 `slug` 一致，本脚本是该规则的自动化实现。
- 流程复用：
  - `lefthook.yml` 的 `i18n-sync` 已在内容相关变更时执行 `pnpm i18n:full`，仅需在 `i18n:full` 中追加 slug 校验命令；
  - CI 中只需保证某 job 执行 `pnpm i18n:full`，即可自动包含 slug 校验。

**向后兼容性**

- 不修改现有 i18n 脚本的对外接口（脚本名保持不变），仅在内部串联新增命令；
- 新增脚本只读 `content/` 内容，不写入业务数据，不影响运行时代码。

**潜在冲突与解决方案**

- **性能**：
  - 仅解析 frontmatter，不解析正文；
  - 遍历复杂度 O(N)（N 为 MDX 文件数），必要时可引入简单并发限制。
- **多语言扩展**：
  - 当前仅强制 `en` 与 `zh` 对齐，后续可从 `i18n-locales.config` 读取 locales，并通过参数控制“强约束对”的组合。

