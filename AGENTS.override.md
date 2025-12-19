# Cloud execution overrides (Codex Cloud)

## 目的
本文件用于 Codex 云端/CI 类环境的执行覆盖。若与 AGENTS.md 冲突，以本文件为准。

## 工具与能力边界
- MCP / Serena / ACE 等为本地开发工具链：云端通常不可用。云端任务中请忽略相关指令，不要尝试安装或配置。
- 云端允许的默认手段：读取仓库文件 + 标准 CLI（git/rg/find/node/pnpm）+ package.json scripts。
- 若需要外网/私有服务/凭据：默认不可用。必须显式说明，并在任务输出中记录缺失与替代方案。

## 变更范围约束
- 默认只允许改动：
  - docs/project-review/**
  - AGENTS.override.md
- 除非任务明确要求，否则不要改动业务代码、配置、依赖版本或锁文件。

## 验证策略（防卡死）
- 优先使用 package.json scripts 进行验证。
- 所有可能耗时的命令必须加超时（推荐 180s）：
  - 例如：`timeout 180s pnpm lint:check`、`timeout 180s pnpm test -- --run`
- 命令超时/失败不算“失败任务”，但必须记录：命令、退出码/超时、关键日志摘要、可能原因、建议下一步。

## 输出与持久化
- 所有结论必须写入仓库文件（优先写入 docs/project-review/**）。
- 每次任务结束要更新 docs/project-review/_memory.md（只写最重要的事实与约定，保持简短）。
