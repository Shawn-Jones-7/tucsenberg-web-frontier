# 任务收尾清单
- 确认 TypeScript `pnpm type-check` 与 `pnpm type-check:tests` 均通过。
- 运行必要的 `pnpm lint:check`、`pnpm test` 或与改动相关的质量脚本。
- 若执行测试/分析，记录结论到 `evidence/` 或指定报告，保持可审计性。
- 更新受影响文档/中文注释，说明迁移或“无迁移，直接替换”。
- 提供验证步骤与残留风险，必要时建议后续行动或监控。