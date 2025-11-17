# 架构治理阶段总结（2025-11-17）

## 指标快照
- 架构违规（dependency-cruiser `enforce-domain-boundaries`）：70（info 级，主要为同域统计，跨域真实命中仍为 1 条：locale-storage-types-utils → security）。
- 新增试点规则：
  - `web-vitals-no-ui-deps`: error（当前 0 命中）。
  - `no-cross-domain-direct-access:web-vitals`: error（当前 0 命中）。
  - `i18n-no-ui-deps`: warn（当前 0 命中）。
- 循环依赖（madge）：0。
- 覆盖率（全量，软门禁）：lines 34.83%, funcs 40.15%, branches 29.68%, statements 34.03%。核心 web-vitals 单文件阈值未检查，content-parser 函数覆盖率低于 90% 触发 warning（质量门禁覆盖率为软警告）。
- 安全门禁：通过（quality:gate）。

## 近期决策
1. 试点升级：web-vitals 相关跨域/UI 依赖规则由 warn 升级为 error；对 i18n 域复制 UI 依赖 warn 规则，作为扩面灰度。
2. 质量门禁增强：新增试点新增文件缺测提示、diff 覆盖率下降 >2% 的软警告；保留 RUN_FAST_PUSH（未改）。
3. 覆盖率提升暂缓：全局覆盖率远低于 60%，不提升阈值；content-parser 阈值告警暂不处理。

## 后续计划
- 降噪与实质跨域治理：
  - 优先清理唯一跨域（locale-storage-types-utils → security）。
  - 调整 `enforce-domain-boundaries` 的同域噪音（加入反向引用）后再统计 warning<5 目标。
- 覆盖率：先聚焦 web-vitals/i18n 核心文件补测，再考虑提升阈值；短期保持软警告。
- 扩面灰度：观察 i18n warn 噪音 1-2 周后，决定是否升级为 error 或扩展至 content-query 域。

## 依据
- 基线报告：`docs/analysis-report/arch-violations-20251117.md`
- 质量门禁报告：`reports/quality-gate-1763356652350.json`（2025-11-17）
- 覆盖率摘要：`reports/coverage/coverage-summary.json`
