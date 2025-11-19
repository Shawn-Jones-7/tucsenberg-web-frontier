# 架构跨域基线（2025-11-18）

## 范围与方法
- 试点域：`src/lib/web-vitals`（延续前一日基线，风险最高且已有收紧历史）。
- 依赖采集：`pnpm exec dependency-cruiser src --config .dependency-cruiser.js -T json`，原始输出存档于 `docs/analysis-report/dc-report-20251118.json`。
- 覆盖率采集：`pnpm test:coverage -- --coverage.reporter=json-summary --coverage.reporter=text-summary`，报告位于 `reports/coverage/coverage-summary.json`（HTML 在同目录）。
- 保持 CI/钩子不变，仅做基线记录，所有调整需通过后续任务灰度。

## 依赖基线（dependency-cruiser）
- 本次违规总计 **69** 条，全部来自 `enforce-domain-boundaries`（severity=info），error/warn 为 0，主要为同域提醒噪音。
- 域分布（from 域）：
  - web-vitals 45
  - colors 6
  - locale-storage-types-config 6
  - locale-storage-preference-events 4
  - content-query 3
  - airtable 2
  - locale-storage-history-maintenance 2
  - form-schema 1
- 跨域命中：0（现有 web-vitals 反向依赖与 UI 依赖均已为 error，未触发）。规则仍需在任务 2 中按域收敛、过滤同域噪音，目标 warning < 5。

## 覆盖率基线
- 全局覆盖率：Statements **34.1%**（4058/11898），Lines 34.9%，Functions 40.26%，Branches 29.68%。
- 试点域 `src/lib/web-vitals`（19 文件）：Statements **56.70%**（368/649），Lines 58.07%，Functions 65.56%，Branches 51.03%。
- 相比历史参考 42.92% 基线，全局覆盖率偏低；后续质量门禁需关注新增代码的 diff 覆盖率下降噪音。

## 开关与降级路径
- **Lefthook pre-push**：`arch-check` 可通过 `RUN_FAST_PUSH=1` 跳过，CI 未改动。
- **规则级别**：`.dependency-cruiser.js` 中试点跨域规则已为 error，域边界提示仍为 info，可按任务 2 先升至 warn 观察噪音，再决定是否 error。
- **质量门禁**：`scripts/quality-gate.js` 覆盖率/质量检查为软门禁（blocking=false），可用作警告而不阻塞；`reports/coverage` 可作为对比基线。

## 后续建议
1. 在任务 2 灰度收紧时，为试点域调整 `enforce-domain-boundaries` 的匹配与严重级别，过滤同域噪音并保持 warning < 5。
2. 若需更精确跨域统计，可在规则中对 `to.path` 使用反向引用（限定同域优先）后再评估真实跨域命中。
3. 利用 web-vitals 现有 >50% 覆盖率优势，新增功能保持不下降；针对全局覆盖率低位，考虑增量测试或 diff 覆盖率提醒。

## 灰度收紧执行记录（任务 2）
- 规则调整：`.dependency-cruiser.js` 将 `enforce-domain-boundaries` 收敛到试点域 `src/lib/web-vitals/`、severity 调整为 warn，并仅对跨域依赖生效；重新运行后 warning=0（<5，`docs/analysis-report/dc-report-20251118-gray.json`）。
- 质量门禁：`scripts/quality-gate.js` 调整 diff 覆盖率警戒线为 1.5%（原 2%），新增试点域文件缺少测试的 warning 已启用（当前工作区无新增试点文件，未触发）。
- 验证/开关：仍可用 `RUN_FAST_PUSH=1` 跳过 `arch-check`；质量门禁仍为软阻塞，可在后续阶段按噪音情况升级。

## 试点升级与扩面（任务 3）
- 规则升级：web-vitals 跨域规则提升为 error（`docs/analysis-report/dc-report-20251118-step3.json`，当前违规 0）；i18n 域新增同款跨域规则为 warn 进行灰度扩面（违规 0，目标 <5）。
- 覆盖率阈值评估：当前全局 Statements 34.1% 未达到 60% 条件，保持现有阈值与软门禁，待后续连续 4 周>60% 时再提全局下限至 60%。

## 机会式重构与规则分层（任务 4）
- 依赖状态：现有 DC 规则（web-vitals error、i18n warn）均无跨域违规，暂无需要立即清理的反向依赖。
- 测试目录守卫：`eslint.config.mjs` 在测试/示例目录禁止 `jest` / `@jest/globals` / `@jest/*` 引入，保证 Vitest 唯一化、复杂度规则保持放宽。
- 安全/解析模块：既有加强规则（禁 any、要求错误处理）保持生效，后续按迭代 Boy Scout 方式处理发现的机会点。

## 度量与阶段总结（任务 5）
- 架构违规：web-vitals（error）=0、i18n（warn）=0（`docs/analysis-report/dc-report-20251118-step3.json`）。
- 循环依赖：未新增检查报错（依赖规则执行过程中未见 circular 命中；如需可复用 `pnpm circular:check` 验证）。
- 覆盖率：全局 Statements 34.1%（Lines 34.9%），试点 web-vitals Statements 56.7%；未达到提升阈值，保持软门禁与 1.5% diff 警戒线。
- 安全告警：本次未跑 audit/semgrep，安全规则保持阻断级别；后续发布前需补一次 `pnpm security:check`。
- 计划对比：试点已升级为 error 并扩面 i18n warn；覆盖率阈值因未达 60% 未上调，后续按季度复核。
