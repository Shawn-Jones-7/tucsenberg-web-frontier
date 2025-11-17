# 架构跨域基线（2025-11-17）

## 范围与方法
- 试点域：`src/lib/web-vitals`（同域命中最多，后续灰度最具收益）。
- 使用命令 `pnpm exec dependency-cruiser src --config .dependency-cruiser.js -T json` 获取当前域边界命中。（执行时间：2025-11-17）
- 仅做基线记录，不修改现有 CI / hook 配置。

## 依赖基线（dependency-cruiser）
- 当前规则主要来自 `.dependency-cruiser.js` 中的 `enforce-domain-boundaries`（severity: info），累计命中 **70** 条。
- 同域命中占主导，原因是规则未限制“from/to 域一致”而全量统计 lib 目录依赖；真实跨域仅 1 条（见下）。

| 域（from） | 命中数 | 说明 |
| --- | --- | --- |
| web-vitals | 45 | 主要为同域内部文件互引；规则缺少反向引用过滤导致统计偏高 |
| colors | 6 | 同域聚合导出 |
| locale-storage-types-config | 6 | 同域类型与配置互引 |
| locale-storage-preference-events | 4 | 事件定义互引 |
| content-query | 3 | 同域工具互引 |
| airtable | 2 | 同域 service/type 引用 |
| locale-storage-history-maintenance | 2 | 同域维护脚本互引 |
| form-schema | 1 | 同域 schema 互引 |
| locale-storage-types-utils | 1 | **唯一跨域**：`src/lib/locale-storage-types-utils/object-utils.ts → src/lib/security/object-guards.ts` |

结论：当前 70 条命中中，跨域仅 1 条（locale-storage-types-utils → security）；其余为规则模式匹配过宽导致的同域统计。若后续希望专注跨域，应在规则中加入域名反向引用回填（如 `to.path: '^src/lib/\1/'`）。

## 覆盖率基线
- 全局覆盖率：42.92%（AGENTS 基线，当前未新增实测）。
- 核心/试点域侧信息：`vitest.config.mts` 针对 `src/lib/enhanced-web-vitals.ts` 标注当前覆盖率约 71.42% 并设置阈值 70/80/80/80，表明 web-vitals 相关逻辑已有中等覆盖率基础。
- 现有质量门禁 `scripts/quality-gate.js` 的覆盖率检查为非阻塞（blocking=false），可作为后续灰度收紧时的降级口径。

## 开关与降级路径
- **Lefthook pre-push**：`arch-check` 可通过 `RUN_FAST_PUSH=1` 跳过；默认执行 `pnpm exec dependency-cruiser ... -T err` 与 `pnpm circular:check`。（CI 不需修改）
- **规则级别**：`.dependency-cruiser.js` 中跨域规则当前多为 info/warn，可按试点先升至 warn，稳定后再调至 error。
- **质量门禁**：`scripts/quality-gate.js` 覆盖率/代码质量 gate 均为软门禁（非阻塞），可先记录告警再决定是否升级阻塞级别。

## 下一步建议（供后续任务使用）
1. 优先聚焦试点域 `src/lib/web-vitals`：梳理内部依赖，确认哪些属于真实跨域，再清理或收缩暴露面，使 warning < 5。
2. 在 `.dependency-cruiser.js` 为试点域补充域内匹配（使用反向引用），减少同域噪音，突出真实跨域。
3. 补充一次覆盖率实测（`pnpm test:coverage --coverage.reporter=json-summary` 可将输出定向到 `reports/coverage`），形成“当前值”与阈值对比，尤其关注 web-vitals 模块。
4. 保留 RUN_FAST_PUSH 作为降级开关，后续将规则提升为 warning/error 时，先在 pre-push 观察 1–2 周噪音再考虑 CI 收紧。
