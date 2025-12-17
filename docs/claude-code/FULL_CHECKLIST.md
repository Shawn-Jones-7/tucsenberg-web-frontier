# Claude Code 全量检查清单（可直接执行）

本清单默认你已在项目内 vendor 了 `wshobson/agents`（路径：`.claude/vendor/wshobson-agents`），并希望用 Claude Code 的 `/plugin …` 命令进行“工具级全量检查”，同时用本仓库 `pnpm` 门禁做最终裁决。

## 0) Marketplace 与插件安装（一次性）

```text
/plugin marketplace add .claude/vendor/wshobson-agents
# 如果 Claude Code 不支持本地路径作为 marketplace，请改用：
# /plugin marketplace add https://github.com/wshobson/agents

/plugin install security-scanning
/plugin install debugging-toolkit
/plugin install framework-migration
/plugin install codebase-cleanup
/plugin install application-performance
/plugin install performance-testing-review
/plugin install accessibility-compliance
/plugin install api-testing-observability
/plugin install cicd-automation
/plugin install observability-monitoring
/plugin install javascript-typescript
```

## 1) 本仓库硬门禁（先跑，快速阻断）

```text
!pnpm ci:local:quick
!pnpm security:check
!pnpm build
```

## 2) Security（wshobson/agents 工具）

```text
/security-scanning:security-sast
/security-scanning:security-dependencies
/security-scanning:security-hardening --level comprehensive
```

## 3) Threat Modeling（对所有“外部入口 + 副作用”做一轮）

```text
@threat-modeler-frontier
```

证据采集（可直接在 Claude Code 里执行）：

```text
!find src/app/api -name route.ts -type f
!rg -n "export async function (POST|PUT|PATCH|DELETE)" src/app/api -S
!rg -n "authorization|Bearer|x-hub-signature-256|verifyWebhookSignature" src/app/api -S
!rg -n "checkDistributedRateLimit|withRateLimit|429" src/app/api -S
```

## 4) Code Review（两层）

```text
@code-reviewer-frontier-v2
```

## 5) CI / 质量 / 架构守卫（本仓库门禁）

```text
!pnpm ci:quality
!pnpm quality:gate:full
!pnpm arch:check
!pnpm circular:check
!pnpm unused:check
!pnpm eslint:disable:check
!pnpm config:check
```

## 6) Testing（本仓库门禁）

```text
!pnpm test
!pnpm test:e2e
```

## 7) Performance（工具 + 量化）

```text
/application-performance:performance-optimization
/performance-testing-review:ai-review

!pnpm build:analyze
!pnpm analyze:size
!pnpm perf:lighthouse
```

## 8) Accessibility

```text
/accessibility-compliance:accessibility-audit
!pnpm test:e2e
```

## 9) i18n / Content（本仓库门禁）

```text
!pnpm i18n:full
```

## 10) Observability / API Testing / Workflow（按需）

```text
/observability-monitoring:monitor-setup
/api-testing-observability:api-mock
/cicd-automation:workflow-automate
```
