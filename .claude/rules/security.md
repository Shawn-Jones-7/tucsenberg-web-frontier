# Security Implementation

## Security Principles

- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimum necessary permissions
- **Secure by Default**: Security enabled out of the box
- **Zero Trust**: Verify everything, trust no input

## Threat Modeling（新增/变更入口必做）

当你在“加新门/改门锁”（新增 API route、webhook、cache invalidation、外部服务调用）时，光靠代码规范容易漏掉“攻击路径”。本项目要求在这些变更上先做轻量 threat model（STRIDE + 可验收安全要求 + 控制措施映射）：
- 规则与模板：`/.claude/rules/threat-modeling.md`
- 可用 agent：`/.claude/agents/threat-modeler-frontier.md`

## Server Code Protection

- Add `import "server-only"` at top of sensitive server files
- Build fails if client attempts to import server-only modules
- Server Actions must verify authentication in middleware

## XSS Prevention

- **Never** use unfiltered `dangerouslySetInnerHTML`
- Must use `DOMPurify.sanitize()` to filter user HTML
- URLs must validate protocol (only allow `https://`, `http://` or `/`)
- Prefer `innerText` over `innerHTML` for plain text content

## Input Validation

- **All user input** must use Zod schema validation
- API routes must call `schema.parse(body)` before processing

### Query Parameter Safety
- Query params may be parsed as `string`, `array`, or `object`
- Must explicitly validate and convert to expected type

### File Paths
- Never construct paths directly from user input
- Must use allowlist or `path.resolve()` + prefix check
- **Warning**: Symlinks may point outside allowed paths

## API Security

| Measure | Config |
|---------|--------|
| Rate Limiting | Default 10/min/IP, Contact API 5/min/IP |
| CSRF | Cloudflare Turnstile |
| Headers | Configured in `src/config/security.ts` |

Rate limit utility: `src/lib/security/security-rate-limit.ts`

**Note**: `csurf` package is deprecated due to vulnerabilities. Use Turnstile or modern alternatives.

### Security Headers
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Content Security Policy

- Config location: `src/config/security.ts`
- Mode: Enforced (with report endpoint)
- Report endpoint: `/api/csp-report`

### Core CSP Directives
- `default-src 'self'` — Only allow same-origin by default
- `script-src` — Control script sources, use nonce over `unsafe-inline`
- `frame-ancestors 'none'` — Prevent clickjacking

## Environment Variables

### Client Exposure Rule
- `NEXT_PUBLIC_` prefixed vars are exposed to client bundle
- Only use this prefix when absolutely necessary
- Sensitive data should use secrets manager (Vault, AWS Secrets Manager)

### Sensitive Keys (Never Commit)
- `AIRTABLE_API_KEY`
- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`

### Cookie Security Config
- `httpOnly: true` — Prevent XSS access
- `secure: true` — HTTPS only
- `sameSite: 'strict'` — Prevent CSRF

## Dependency Security

- Use Dependabot for automated updates
- Lock versions (`pnpm-lock.yaml`)
- Run security scans: `pnpm audit`, Socket, Trivy
- Watch for supply chain attacks

## Dangerous Functions (Forbidden)

- `eval()` — Arbitrary code execution
- `child_process.exec` — Shell command injection
- Direct SQL concatenation — Use parameterized queries

## Logging

- **Never log**: Passwords, API keys, PII
- Use `src/lib/logger.ts` for structured logging
- No `console.log` in production code

## Security Checklist

- [ ] All user input validated with Zod
- [ ] No unfiltered `dangerouslySetInnerHTML`
- [ ] API routes have Rate Limiting
- [ ] Sensitive cookies set httpOnly + secure
- [ ] Server-only code uses `import "server-only"`
- [ ] Logs are sanitized
- [ ] Dependencies regularly updated
- [ ] New/changed public API/webhook has a threat model (STRIDE + mitigations)
