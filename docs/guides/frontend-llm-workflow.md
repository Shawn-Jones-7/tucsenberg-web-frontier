# LLM 驱动的前端高质工作流与工具链（适配本项目）

本文档把“从 SkillsMP 选型 → 落地 8 个 skill → 结合 tweakcn / shadcn/ui/create → 隐性工作法”串成一条可复制的前端工作流，目标是：**在不牺牲性能与工程质量门禁的前提下**，快速搭建整体前端，并做到“视觉一致、动效克制但高级、上线指标稳定”。

> 心智模型（样板房装修）  
> - `shadcn/ui`（本项目已集成）更像“结构件与标准家具”：保证可访问性、交互状态、组件组合能力。  
> - `tweakcn` 更像“可视化软装与材质调参台”：统一色彩/圆角/阴影/字体等 **tokens**，做到“换皮不换骨”。  
> - Skills（LLM skill）更像“不同工种的施工队”：设计总监（审美与版式）、软装师（主题 tokens）、木工（组件组合）、灯光师（动效）、监理（性能门禁）。

---

## 1. 推荐 Workflow（先工作流，再工具细节）

把一次“前端整体搭建”分成 **7 个主要阶段**（另附 1 个可选的“参考站采样”阶段）；每一阶段都有明确输入/输出与对应 skill。

### Phase -2：企业信息文档定稿（强烈建议先做，否则 LLM 只能“凭感觉编”）

如果你的目标是“基于企业真实业务信息做生产级页面”，那么在进入设计/实现之前，必须先把企业信息整理成一份**可被 LLM 消费的真源文档**。否则 LLM 的输出不可避免会出现：
- 业务表述不一致（不同页面说法打架）
- 夸大承诺/不合规（外贸站尤其容易踩雷）
- “看起来像模板”但不贴合你的实际优势与证据链

**推荐交付物**：
- `docs/templates/company-info-brief.md`（由你定稿）

**这一阶段的输出要回答**：
- 我们是谁、卖什么、卖给谁、凭什么可信、客户为什么选我们（证据是什么）
- 网站要让访客在 30 秒内理解什么，并做什么动作（转化目标）

### Phase -1：参考站采样（可选，但能显著提升“像设计师做的”）

当你有明确参考站/竞品页面时，先做一次“采样”，把感性的“像这种感觉”变成可执行的规格（tokens/间距/字体/动效节奏/关键组件结构）。

**输入**：
- 参考 URL 列表（2–5 个即可）
- 想借鉴的部分：布局、排版、颜色、动效、组件形态（不要泛泛地说“好看”）

**输出**（建议形成一份短 spec）：
- 颜色与对比度：主色/中性色/强调色比例；暗色策略
- 排版：H1/H2/正文的字级、行高、字重、最大行宽
- 间距：section 间距、卡片 padding、grid gap
- 动效：duration/easing、入场/hover/滚动触发的模式与节奏
- 组件：Hero、Feature、CTA、表单等的结构拆分

**推荐外部工具**：
- `chrome-devtools-mcp`：让 LLM 直接在真实页面里读取布局与样式（见第 7 节）

### Phase 0：输入对齐（需求与约束）

**输入**（让 LLM 先拿到“施工图”而不是一句口号）：
- 目标页面：首页/产品页/解决方案页/联系我们等
- 目标受众：B2B 外贸（专业、可信、克制但有质感）
- 内容结构：真实文案/占位文案、是否需要 i18n
- 约束：不新增大型动画库；遵守现有 Tailwind v4 + shadcn/ui 约定；性能不回归
- “必须像什么 / 不能像什么”：竞品参考、避免模板感

**输出**：
- 页面信息架构（IA）+ 组件拆分
- 视觉方向（风格关键词 + 配色/字体倾向 + 动效节奏）

**强烈建议额外输入**（来自 Phase -2 的企业信息真源）：
- 企业快照（One-liner）、ICP、产品线结构、证书/案例、可公开承诺边界
- 每个区块要表达的“证据”（例如 MOQ/交期/认证/质检流程/物流支持）

对应 skill（建议顺序）：
- `ui-ux-pro-max` → 帮你快速定风格、色板、字体配对、布局调性
- `frontend-aesthetics` → 明确“如何避免 AI 模板感/廉价感”的审美约束

### Phase 1：视觉方向锁定（统一“审美裁决权”）

**做法**：先定 1 个强方向（例如“工业极简 / 高端咨询风 / 编辑部风格 / 技术蓝图风”），并约束：
- 版心宽度与留白策略
- 标题字级与行高曲线（H1/H2/H3/正文）
- 颜色使用比例（主色/中性色/强调色）
- 动效主旋律（入场、hover、滚动触发是否使用）

对应 skill：
- `frontend-design`（主）→ 给出成体系、可落地的 UI/页面实现

### Phase 2：主题 tokens 统一（tweakcn 介入点）

**目标**：把“全站风格”从“每个组件手调 class”升级为“全站 tokens 统一驱动”。

**落点**：本项目是 Tailwind v4 CSS-first；主题核心变量以 `:root/.dark` 的 CSS variables 为主（例如 `--background/--foreground/--primary/...`）。

**做法**：
- 用 `tweakcn` 调好主题 tokens（颜色、radius、shadow、字体栈等）
- 将输出合并到 `src/app/globals.css` 的 `:root/.dark` 中
- **不要覆盖**你们已有的“语义色扩展”（如 `--success/--warning/...`）以及中文字体回退栈（否则多语言内容站会退化）

对应 skill：
- `ui-styling` → 以 shadcn/ui 的变量命名与组件状态为基准做“换皮”

### Phase 3：版式系统（让页面不再像“模板拼装”）

仅统一 tokens 还不够；“高级感”更多来自 **版式一致性**。建议最小化创建 2–3 个 primitives：
- `Container`：统一最大宽度与左右 padding
- `Section`：统一纵向间距与 section 标题样式
- `Typography`（可选）：统一 heading scale、正文行高、链接/列表/引用样式

> 你们已经启用 `@tailwindcss/typography`，非常适合承接“富文本/博客/产品详情”的排版一致性。

对应 skill：
- `frontend-design`（主）→ 用“系统化版式”组织页面，而不是堆组件
- `shadcn-ui`（辅）→ 组件组合时保持可访问性与交互状态一致

### Phase 4：页面/区块实现（组件组合 + 内容替换）

把页面拆成可复用区块（Hero、Feature Grid、Case Studies、Logo Wall、CTA、FAQ、Footer 等），并约束：
- 每个区块只解决一个叙事任务
- 组件组合尽量用 `src/components/ui/*` primitives（Button/Card/Accordion/NavigationMenu…）
- 文案与 i18n：用户可见文本必须可被国际化（本项目使用 `next-intl`）

对应 skill：
- `landing-page-guide-v2` → 对“首页/落地页”的转化结构尤其有帮助
- `ui-styling` → 细节打磨（states、dark、focus、对比度）

### Phase 5：动效编排（克制但高级）

推荐路线（优先级从高到低）：
1) `tailwindcss-animate` + CSS transitions（优先 `opacity/transform`，避免触发 reflow）
2) 少量自定义 `@keyframes`（用于 hero 入场、列表 stagger）
3) 如需复杂动效：先评估是否真的需要引入新库（默认不建议）

必须约束：
- 支持 `prefers-reduced-motion`（降低动画或禁用）
- 动效节奏统一（duration/easing/delay 有一套常量或约定）

对应 skill：
- `frontend-ui-animator` → 负责“动效编排与微交互”方案
- `frontend-design` → 把动效融入叙事（而不是到处动）

### Phase 6：性能门禁（视觉升级后最容易翻车的地方）

你们已经有 Lighthouse CI 门禁与 Web Vitals 监控组件，建议把“视觉升级”纳入固定回路：
- 每次迭代后跑一轮关键页面 Lighthouse（LCP/CLS/TBT/total-byte-weight）
- 重点避免：大图未优化、首屏引入大组件、无意义动画导致 TBT 上升、布局抖动导致 CLS 上升

对应 skill：
- `providing-performance-optimization-advice` → 给出按优先级排序的性能优化清单（先保指标，再做更华丽）

---

## 2. 工具链总览（你在用什么、各自负责什么）

### A) 基础工程底座（项目内已具备）
- Next.js 16 + React 19 + TypeScript 5
- Tailwind CSS v4（CSS-first）+ `tailwindcss-animate`
- shadcn/ui（`src/components/ui/*`）+ Radix UI
- 质量门禁：ESLint / TypeScript strict / Lighthouse CI /（测试覆盖率已较高）

### B) 外部工具（可选但强烈推荐）
- `tweakcn`：可视化生成/迭代主题 tokens，输出 CSS variables 片段，适配 Tailwind v4 + shadcn/ui
- `shadcn/ui/create`：**仅作为参考对照**（新项目脚手架），用于对齐约定与组件组合范式，不建议在已有项目里“重建一套”
- `animate-ui`：基于 shadcn registry 的“动画组件分发”（Tailwind + `motion`），通过 `shadcn add @animate-ui/...` 把源码复制进项目（见第 6 节）
- `react-bits`：动画组件/背景/文字效果集合（含 `TS-TW` 变体与 CLI 安装）；但 license 为 `MIT + Commons Clause`，以及可能引入重依赖（见第 6 节）
- `chrome-devtools-mcp`：让 LLM 控制并读取真实 Chrome DevTools（布局、computed styles、网络、截图、trace），用于“参考站采样”（见第 7 节）

### C) LLM + Skills（把“隐性经验”显性化）
- 从 SkillsMP 选型并落地的 8 个 skills：覆盖审美决策、落地实现、动效、性能监理等角色

---

## 3. 企业信息 → 战略 → 网站呈现：把“业务输入链路”接到工作流里（查漏补缺）

你设想的链路可以稳定落地，但要补齐 3 个关键“闸门”，否则会在中后期反复返工：

1) **事实闸门（Fact vs Suggestion）**  
   - 企业信息文档里必须标注：哪些是事实（可证），哪些是建议（策略/叙事），哪些是待确认。  
   - 网站对外文案只能使用“事实 + 已确认建议”。  

2) **证据闸门（B2B 外贸站的核心）**  
   - 每个关键卖点都要绑定证据：认证、产能、交期、质检流程、可追溯、案例数据。  
   - 没证据的卖点不要放首页 Hero（否则看起来“像模板口号”）。  

3) **一致性闸门（多语言与多页面一致）**  
   - 先在企业信息文档里统一术语与说法，再进入页面实现。  
   - 否则会出现：About/Products/FAQ/Blog 的叙事口径不一致，越做越乱。

**推荐最小闭环**：
- 你提供资料 → LLM 生成 `docs/templates/company-info-brief.md` 草稿 → 你审核定稿 → 再进入 Phase -1/0/1/… 输出页面

---

## 3. 从 SkillsMP 到最终 8 个 skill：选型逻辑与结果

### 3.1 选型逻辑（为什么不是随便装一堆）

从 SkillsMP 获取候选后，筛选标准是：
- **适配项目栈**：Next.js / React / Tailwind / shadcn/ui /（动效与性能）
- **适配阶段目标**：短期“视觉设计/动效优先”，其次性能
- **可落地**：能指导到具体组件/页面实现，而不是泛泛而谈
- **避免误匹配**：Stars 很高但偏后端/基础设施/语言无关的 skill 不纳入

### 3.2 最终采用的 8 个 skill（建议在 Workflow 中按阶段触发）

> 安装方式：本次安装在本机 Claude 全局目录 `~/.claude/skills/` 下（每个目录一个 `SKILL.md`）。  
> 如果团队要共享，建议后续把同结构同步到仓库的 `./.claude/skills/`（需要统一启用方式）。

1) `frontend-design`（设计总监 + 前端落地）  
   - 适用：需要“整体风格强、细节到位”的页面/组件实现  
   - SkillsMP：https://skillsmp.com/skills/anthropics-claude-code-plugins-frontend-design-skills-frontend-design-skill-md
2) `ui-ux-pro-max`（快速定风格/色板/字体/布局调性）  
   - 适用：开工前的审美方向与版式决策  
   - SkillsMP：https://skillsmp.com/skills/nextlevelbuilder-ui-ux-pro-max-skill-claude-skills-ui-ux-pro-max-skill-md
3) `ui-styling`（shadcn/ui + Tailwind 的 UI 精修工）  
   - 适用：组件状态、暗色、对比度、细节一致性  
   - SkillsMP：https://skillsmp.com/skills/mrgoonie-claudekit-skills-claude-skills-ui-styling-skill-md
4) `landing-page-guide-v2`（落地页结构与转化叙事）  
   - 适用：首页/产品页/营销页区块搭建与叙事顺序  
   - SkillsMP：https://skillsmp.com/skills/bear2u-my-skills-claude-skills-landing-page-guide-v2-skill-md
5) `frontend-aesthetics`（避免“AI 模板感”的审美约束）  
   - 适用：任何“看起来太像模板/太像 AI”的场景  
   - SkillsMP：https://skillsmp.com/skills/incomestreamsurfer-claude-code-agents-wizard-v2-claude-skills-frontend-aesthetics-skill-md
6) `frontend-ui-animator`（动效编排与微交互）  
   - 适用：入场、hover、滚动触发、stagger、加载态动效  
   - SkillsMP：https://skillsmp.com/skills/julianromli-ai-skills-skills-frontend-ui-animator-skill-md
7) `shadcn-ui`（shadcn/ui 使用手册与最佳实践）  
   - 适用：新增组件、扩展变体、组合组件、处理 a11y/交互状态  
   - SkillsMP：https://skillsmp.com/skills/einverne-dotfiles-claude-skills-shadcn-ui-skill-md
8) `providing-performance-optimization-advice`（性能监理）  
   - 适用：视觉/动效升级后，确保 Lighthouse 与 Web Vitals 不回归  
   - SkillsMP：https://skillsmp.com/skills/jeremylongshore-claude-code-plugins-plus-plugins-performance-performance-optimization-advisor-skills-performance-optimization-advisor-skill-md

---

## 4. tweakcn：如何在本项目里“换皮不换骨”

### 4.1 tweakcn 的定位

`tweakcn` 是 Tailwind + shadcn/ui 的主题编辑器/生成器。它输出的是 **tokens（CSS variables）**，而不是帮你改每个组件的 class。

### 4.2 推荐落地方式（安全合并策略）

只迁移/覆盖与 shadcn 标准变量同名的部分，例如：
- `--background/--foreground`
- `--card/--popover` 及其 `*-foreground`
- `--primary/--secondary/--muted/--accent/--destructive` 及其 `*-foreground`
- `--border/--input/--ring`
- `--radius`

手工保留你们的项目资产：
- 语义色扩展（如 `--success/--warning/--info/...`）
- 中文字体回退与中英文混排策略
- 任何与可访问性/企业风格强相关的定制（例如对比度、特定阴影规则）

### 4.3 主题源头

本项目使用 **`src/app/globals.css` 的 `:root/.dark`** 作为主题 tokens 的唯一真实入口。通过 Tailwind CSS 4 的 `@theme inline` 将 CSS 变量映射到 Tailwind 工具类。

---

## 5. shadcn/ui/create：怎么用在“已有项目”

`shadcn/ui/create` 主要用于新项目脚手架生成。对本项目更合适的用法是：
- 当你不确定某个组件应如何组织/命名/组合时，把 create 生成的结构当“参考答案”
- 需要对齐字体/色板/图标选择时，用它做“对照表”，再回到本项目的 `globals.css` 与 `src/components/ui/*` 落地
- 避免：直接用 create 重新生成项目（会覆盖你们已有的多语言、语义色、质量门禁与目录组织）

---

## 6. animate-ui / react-bits：如何安全地“借力做动效”

这两者都属于“组件分发/组件集合”路线：你不是把它们当传统 NPM UI library 依赖，而是把**源码复制**进项目，然后按你的 design tokens 与工程约束修改。

### 6.1 animate-ui（Tailwind + Motion 的动画组件分发）

**它是什么**：  
Animate UI 是基于 shadcn registry 的“动画组件分发”，文档明确强调：**Not a library — open component distribution**，并通过 `shadcn@latest add @animate-ui/...` 把组件源码拷贝进你的项目目录（示例导入路径为 `@/components/animate-ui/...`）。

**适配本项目的点**：
- 你们已有 shadcn/ui primitives（`src/components/ui/*`）与 Tailwind v4 CSS-first 主题变量，Animate UI 的“copy-first”模型能沿用同样的维护方式
- 动效基于 `motion`（Motion.dev），适合做“少量高价值”的动效编排

**成本与风险（生产必读）**：
- 引入 `motion` 会增加 JS 体积与 Client Component 边界：建议只在 Hero/CTA/关键数字等少量区块使用
- License 需要单独确认：仓库 README 显示 MIT，但其 `LICENSE.md` 当前为 `MIT + Commons Clause`。在**不对外分发/不售卖模板**的前提下，作为你站点/产品的一部分使用通常没问题；但如果未来要把仓库公开或把组件打包再分发，需要重新评估合规边界。

**建议用法（面向生产）**：
- 只挑 1–3 个“高收益组件”落地，不要把页面变成“动画大杂烩”
- 默认优先 CSS 动画（你们已有 `tailwindcss-animate`）；只有在需要复杂编排时才用 `motion`
- 强制支持 `prefers-reduced-motion`（减少或禁用关键动效）

**落地步骤（参考）**：
- 用 `shadcn` 把组件源码拉进项目（示例来自其官方文档）：`pnpm dlx shadcn@latest add @animate-ui/primitives-texts-sliding-number`
- 组件会以“源码形式”进入你的仓库，可按项目规范重命名/重构；导入示例通常类似：`@/components/animate-ui/primitives/texts/sliding-number`
- 注意依赖：部分组件会用到 `motion/react`、`react-use-measure` 等（以组件源码为准），应在引入前评估首屏与 Client Component 边界

### 6.2 react-bits（灵感库很强，但要过两道“闸门”）

**它是什么**：  
React Bits 提供 110+ 动画组件与背景效果，并提供多种变体（`JS/TS` + `CSS/Tailwind`），还支持通过 shadcn/jsrepo CLI 安装组件源码。

**两道闸门**：
1) **License 闸门**：`LICENSE.md` 为 `MIT + Commons Clause`，允许你在应用/网站/产品中使用，但限制“组件本身（单独或打包）被再分发/售卖/再授权”。你们当前目标是**不对外分发/不售卖**，因此可把它当作“内部工程组件源码”使用；但若未来仓库公开，需要提前做 license 复核与替代方案。
2) **性能/依赖闸门**：其仓库本身依赖非常多（例如 `three`、`gsap`、`@react-three/*` 等）。虽然单个组件未必用到全部依赖，但“随手拿一个背景特效”很容易引入重依赖并拖垮 Lighthouse。

**建议用法（面向生产）**：
- 优先作为“灵感库/原型库”：先用它确定动效方向，再在本项目用 CSS/`motion` 重新实现关键效果（避免携带重依赖）
- 若确实要复制源码：优先选 `TS-TW` 变体；并在合入前列出该组件的额外依赖与首屏影响；必要时用 `next/dynamic` 延迟加载

---

## 7. chrome-devtools-mcp：让 LLM 读懂参考站并“采样成规格”

**它是什么**：  
`chrome-devtools-mcp` 是一个 MCP server，让你的 coding agent 控制并检查一个真实 Chrome：截图、读控制台、分析网络请求、录制性能 trace、读取 DOM/样式等。

**它在工作流里的价值**：
- 把“感觉像某个参考站”变成“可执行的版式与 tokens 规格”，极大减少 LLM 反复猜
- 可以验证：某个动效是否导致 CLS、某个首屏资源是否过大、关键图是否触发 LCP

**如何接入（示例）**：
- Claude Code：`claude mcp add chrome-devtools npx chrome-devtools-mcp@latest`
- Codex：`codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest`

**安全提示**：
- 该工具能暴露浏览器内容给 MCP client：避免在同一浏览器 session 打开敏感账号/隐私数据
- 借鉴参考站请注意版权与 ToS：建议“抽象成规则/结构/节奏”，不要直接复制专有视觉资产

---

## 8. 隐性知识：让 LLM 输出更稳定、更像“团队资深前端”

### 8.1 给 LLM 的输入模板（建议复制粘贴）

**页面/区块需求模板**：
- 目标页面：  
- 受众与语气（B2B 外贸、可信、克制高级）：  
- 内容结构（真实文案/占位）：  
- 视觉方向（从 `ui-ux-pro-max` 里选一个风格关键词 + 颜色倾向）：  
- 动效策略（只允许 CSS + `tailwindcss-animate`，并遵守 `prefers-reduced-motion`）：  
- 性能约束（Lighthouse 不回归，避免大库，首屏不塞重组件）：  
- 工程约束（不新增 UI 库；优先复用 `src/components/ui/*`）：  

### 8.2 “好看但不翻车”的动效规则（简单可执行）
- 只用 `opacity/transform` 做主要动效；避免 `top/left/width/height` 动画
- 把“动的地方”集中到 1–2 个高价值场景：Hero 入场 + CTA hover
- 默认给出 `prefers-reduced-motion` 的降级方案

### 8.3 交付检查清单（Definition of Done）
- 视觉：版心/间距/字级统一；dark/light 均可读；对比度合理
- 动效：节奏一致；无“到处在动”；降低动画偏好可用
- 性能：关键页面 Lighthouse 指标不过线不合并
- 工程：不引入新 UI 框架；组件复用与目录组织符合约定

### 8.4 Claude Code + Codex 的“双模型流水线”（减少返工的关键）

把 Claude Code 与 Codex（本助手）当作两个角色用，会比“一个模型从需求一路写到上线”更稳：
- Claude Code（更适合做“设计+规格”）：用已安装的 skills 先产出 IA、视觉方向、tokens 与组件拆分，并把约束写清楚（尤其是 i18n、a11y、性能门禁）。
- Codex（更适合做“实现+验证”）：按规格把页面/组件落进仓库结构，跑 `pnpm type-check`、`pnpm lint:check`、必要时跑 Lighthouse/关键测试，确保是可合入的生产代码。
- 最后再用 Claude Code 的 code-review（例如你们的 `.claude/agents/code-reviewer-frontier-v2.md`）复审一次：聚焦“风格一致性/可访问性/性能风险/过度 client 化”。

### 8.5 外部工具引入前的两项硬检查（别等翻车才补课）

1) **License 检查**：你们当前明确“不分发/不售卖”，风险显著降低；但仍建议在引入时记录来源与 license（`animate-ui`/`react-bits` 当前为 `MIT + Commons Clause`），并避免把这些组件单独打包成可再分发的“组件库”。若未来计划公开仓库，再做一次合规复核。  
2) **依赖与首屏检查**：任何动效组件都要问两个问题：它是否强制 `use client`？它是否引入重依赖（如 `three`/`gsap`）？对 LCP/TBT/CLS 的风险是多少？

---

## 9. 附：本次安装路径（本机）

> 仅供排查用：这些文件不在仓库内。

- `~/.claude/skills/frontend-design/SKILL.md`
- `~/.claude/skills/ui-ux-pro-max/SKILL.md`
- `~/.claude/skills/ui-styling/SKILL.md`
- `~/.claude/skills/landing-page-guide-v2/SKILL.md`
- `~/.claude/skills/frontend-aesthetics/SKILL.md`
- `~/.claude/skills/frontend-ui-animator/SKILL.md`
- `~/.claude/skills/shadcn-ui/SKILL.md`
- `~/.claude/skills/providing-performance-optimization-advice/SKILL.md`
