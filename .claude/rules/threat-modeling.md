# Threat Modeling（STRIDE / Attack Tree）

把“安全”当成一张安全网：你们现在的网眼（Zod 校验、rate limit、CSP、webhook signature、API key）已经不少，但**什么时候需要加密网眼、哪里最容易漏**，需要一个稳定的“画图→找洞→落到验收标准”的流程。本文就是这套流程在本项目（Next.js 16 / App Router / 多个 API route + 第三方集成）里的最小落地版。

## 什么时候必须做（触发条件）

满足任意一条就做 threat model（轻量版也行）：
- 新增/修改 `src/app/api/**/route.ts` 的 `POST/PUT/PATCH/DELETE`
- 新增 webhook（例如 WhatsApp/支付/回调）或改签名/鉴权逻辑
- 新增/修改外部服务调用（`resend` / `airtable` / `whatsapp` / Turnstile / Sentry / Analytics）
- 新增/修改缓存失效能力（例如 `/api/cache/invalidate`）或任何可导致“批量失效/成本放大”的接口
- 引入新第三方脚本域名、调整 CSP、或新增 `next/script`

## 产出物（建议在 PR 描述里附上）

用下面的结构输出一页纸即可，必须包含**仓库内证据**（文件路径 + 行号）：
- **Scope**：这次改动涉及哪些 route/页面/第三方
- **Assets**：要保护什么（secrets、PII、配额/成本、缓存一致性、监控数据）
- **Entry Points**：外部入口（HTTP endpoint、webhook、client beacon）
- **Trust Boundaries**：浏览器↔服务端、第三方↔服务端、内部脚本↔外部输入
- **Data Flows**：关键数据怎么走（可用 3–6 行 ASCII 图）
- **STRIDE 表**：每个 entry point 至少列 1–2 个威胁
- **Security Requirements**：把威胁翻译成可验收的要求（“必须/不得/应当”）
- **Mitigation Mapping**：每条要求对应到控制措施（代码位置/配置）+ 验证命令

## 快速流程（10–20 分钟）

### Step 0：先把“入口清单”列出来（证据驱动）

```bash
find src/app/api -name route.ts -type f
rg -n \"export async function (POST|PUT|PATCH|DELETE)\" src/app/api -S
```

### Step 1：给每个入口贴上 3 个标签

- **Side Effect**：是否会发邮件/写表/发消息/改缓存/写日志到外部（成本与风险放大器）
- **Auth**：有没有鉴权（Bearer secret、webhook signature、Turnstile、session）
- **Abuse Surface**：是否公开可调用、是否可被刷（rate limit / body size / replay）

### Step 2：对每个入口跑一遍 STRIDE（最小集合）

以单个 endpoint 为单位，回答这些问题：
- **Spoofing**：能伪造身份/签名/Token 吗？（例如 webhook signature、Bearer key）
- **Tampering**：能改请求体绕过校验吗？（Zod、JSON parsing、raw body）
- **Repudiation**：事后能否否认？我们有足够审计字段吗？（request id、ip、关键参数）
- **Information Disclosure**：会回显敏感信息吗？日志会泄露吗？
- **DoS/Cost**：能刷爆配额/触发昂贵外部调用吗？（发邮件/WhatsApp/数据库写）
- **Elevation**：能从普通入口升级到管理员/内部能力吗？（缓存失效/监控面板）

### Step 3：把威胁翻译成“可测试”的安全要求

示例（写成验收标准）：
- “所有 public `POST` 必须：Zod 校验 + rate limit；否则拒绝合并”
- “webhook `POST` 必须：raw body signature 校验失败返回 `401`，且不得尝试解析 JSON”
- “任何带 side effect 的 endpoint：必须有 abuse 控制（rate limit / Turnstile / API key 三选一或组合）”
- “缓存失效 endpoint：生产环境必须要求 secret，开发环境允许放行仅限 `NODE_ENV=development`”

### Step 4：把要求映射到本项目已有控制措施（不要重复造轮子）

常用控制点（示例，按需引用到你的产出里）：
- 输入边界：`zod`、`safeParseJson`、严格 JSON error handling
- Abuse 控制：`checkDistributedRateLimit` / `withRateLimit` / `createRateLimitHeaders`
- Bot/CSRF：Turnstile
- Webhook：raw body + `x-hub-signature-256` 校验
- CSP/脚本治理：`src/config/security.ts`（nonce + report）
- 结构化日志：`src/lib/logger.ts`（避免 PII/secret）

## Mitigation 验证命令（写进 PR 里更好）

```bash
# 1) API 入口与写操作
find src/app/api -name route.ts -type f
rg -n \"export async function (POST|PUT|PATCH|DELETE)\" src/app/api -S

# 2) rate limit 覆盖
rg -n \"checkDistributedRateLimit|withRateLimit|429\" src/app/api -S

# 3) 鉴权/签名模式
rg -n \"authorization|Bearer|x-hub-signature-256|verifyWebhookSignature\" src/app/api -S
```

