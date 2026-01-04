---
type: "agent_requested"
description: "Security implementation for a B2B website: path traversal prevention, CSP & security headers, Semgrep + eslint-plugin-security, dependency scanning, secrets handling"
---

# Security Implementation

## Overview

This document provides comprehensive security implementation guidelines for the Next.js 16 + React 19 B2B website, covering common web security vulnerabilities and best practices.

**Security Principles**:
- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimal access rights for users and processes
- **Secure by Default**: Security built into the architecture
- **Zero Trust**: Verify everything, trust nothing

## 1. XSS (Cross-Site Scripting) Prevention

### Input Validation and Output Encoding

React 19 provides automatic XSS protection through JSX escaping, but additional measures are needed for dynamic content.

```typescript
// src/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for user-generated content that needs to be rendered as HTML
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize user input for safe display
 * Removes all HTML tags and special characters
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string): string {
  const urlPattern = /^(https?:\/\/|\/)/i;
  if (!urlPattern.test(url)) {
    return '#'; // Return safe fallback
  }
  return url;
}
```

### Content Security Policy (CSP)

Configure strict CSP headers in `next.config.ts`:

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://vercel.live https://*.vercel-insights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Safe Component Rendering

```typescript
// ❌ Dangerous - Never use dangerouslySetInnerHTML without sanitization
function UnsafeComponent({ userContent }: { userContent: string }) {
  return <div dangerouslySetInnerHTML={{ __html: userContent }} />;
}

// ✅ Safe - Sanitize before rendering
import { sanitizeHtml } from '@/lib/sanitize';

function SafeComponent({ userContent }: { userContent: string }) {
  const cleanHtml = sanitizeHtml(userContent);
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}

// ✅ Best - Use React's automatic escaping
function BestComponent({ userContent }: { userContent: string }) {
  return <div>{userContent}</div>; // React automatically escapes
}
```

## 2. CSRF (Cross-Site Request Forgery) Prevention

### CSRF Token Implementation

```typescript
// src/lib/csrf.ts
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

/**
 * Generate CSRF token for form protection
 */
export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const cookieStore = await cookies();

  cookieStore.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
  });

  return token;
}

/**
 * Verify CSRF token from request
 */
export async function verifyCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get('csrf-token')?.value;

  if (!storedToken || !token) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(
    Buffer.from(storedToken),
    Buffer.from(token)
  );
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}
```

### SameSite Cookie Configuration

```typescript
// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  // Set secure cookie with SameSite protection
  cookieStore.set('session', 'session-token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  return NextResponse.json({ success: true });
}
```

## 3. Input Validation with Zod

### Schema-Based Validation

```typescript
// src/lib/validation.ts
import { z } from 'zod';

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),

  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),

  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .refine(
      (msg) => !/<script|javascript:|on\w+=/i.test(msg),
      'Message contains potentially dangerous content'
    ),

  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * File upload validation schema
 */
export const fileUploadSchema = z.object({
  filename: z.string()
    .regex(/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|pdf)$/, 'Invalid filename or extension'),

  size: z.number()
    .max(5 * 1024 * 1024, 'File size must be less than 5MB'),

  mimetype: z.enum(['image/jpeg', 'image/png', 'application/pdf'], {
    errorMap: () => ({ message: 'Invalid file type' }),
  }),
});
```

### API Route Validation

```typescript
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validatedData = contactFormSchema.parse(body);

    // Process validated data
    // ...

    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 4. Path Traversal Prevention

### File System Safety

```typescript
// src/lib/file-system-security.ts
import path from 'path';
import fs from 'fs/promises';

/**
 * Normalize and validate file paths to prevent directory traversal
 */
export function sanitizePath(userPath: string, allowedRoot: string): string {
  // Normalize the path to resolve '..' and '.'
  const normalizedPath = path.normalize(userPath);

  // Resolve to absolute path
  const absolutePath = path.resolve(allowedRoot, normalizedPath);

  // Ensure the resolved path is within the allowed root
  if (!absolutePath.startsWith(path.resolve(allowedRoot))) {
    throw new Error('Path traversal detected');
  }

  return absolutePath;
}

/**
 * Safe file read with path validation
 */
export async function safeReadFile(
  userPath: string,
  allowedRoot: string
): Promise<string> {
  const safePath = sanitizePath(userPath, allowedRoot);

  try {
    const content = await fs.readFile(safePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error('File not found or access denied');
  }
}

/**
 * Validate filename to prevent malicious filenames
 */
export function validateFilename(filename: string): boolean {
  // Block path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Allow only alphanumeric, dash, underscore, and dot
  const filenamePattern = /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/;
  return filenamePattern.test(filename);
}
```

## 5. SQL Injection Prevention

### Parameterized Queries with Prisma

```typescript
// src/lib/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ✅ Safe - Using Prisma's parameterized queries
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }, // Prisma automatically parameterizes
  });
}

/**
 * ✅ Safe - Using Prisma's query builder
 */
export async function searchUsers(searchTerm: string) {
  return await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm } },
        { email: { contains: searchTerm } },
      ],
    },
  });
}

/**
 * ❌ Dangerous - Never use raw SQL with string concatenation
 */
// DON'T DO THIS:
// const query = `SELECT * FROM users WHERE email = '${email}'`;

/**
 * ✅ Safe - If raw SQL is necessary, use parameterized queries
 */
export async function rawQueryExample(userId: number) {
  return await prisma.$queryRaw`
    SELECT * FROM users WHERE id = ${userId}
  `;
}
```

## 6. Authentication and Authorization

### JWT Best Practices

```typescript
// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars'
);

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Create JWT token with secure settings
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Token expires in 7 days
    .setIssuer('b2b-web-template-app')
    .setAudience('b2b-web-template-users')
    .sign(JWT_SECRET);
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'b2b-web-template-app',
      audience: 'b2b-web-template-users',
    });

    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

/**
 * Middleware for protected routes
 */
export async function requireAuth(): Promise<JWTPayload> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Role-based access control
 */
export async function requireRole(allowedRoles: string[]): Promise<JWTPayload> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
}
```

### Session Management

```typescript
// src/lib/session.ts
import { cookies } from 'next/headers';
import { createToken } from './auth';

/**
 * Create secure session
 */
export async function createSession(userId: string, email: string, role: string) {
  const token = await createToken({ userId, email, role });
  const cookieStore = await cookies();

  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Destroy session
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
```

## 7. Sensitive Data Handling

### Environment Variables Security

```typescript
// src/lib/env.ts
import { z } from 'zod';

/**
 * Validate environment variables at startup
 */
const envSchema = z.object({
  // Public variables (exposed to client)
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  NEXT_PUBLIC_VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),

  // Private variables (server-only)
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  RESEND_API_KEY: z.string().min(1),

  // Optional variables
  SENTRY_DSN: z.string().url().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);

/**
 * Never log sensitive environment variables
 */
export function logEnvironmentInfo() {
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Base URL:', env.NEXT_PUBLIC_BASE_URL);
  // ❌ DON'T: console.log('JWT Secret:', env.JWT_SECRET);
  // ❌ DON'T: console.log('API Key:', env.RESEND_API_KEY);
}
```

### Data Encryption

```typescript
// src/lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key!!';
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### Log Sanitization

```typescript
// src/lib/logger.ts
interface LogContext {
  userId?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeLogData(data: LogContext): LogContext {
  const sanitized = { ...data };

  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.apiKey;
  delete sanitized.secret;

  // Mask email addresses
  if (sanitized.email) {
    const [local, domain] = sanitized.email.split('@');
    sanitized.email = `${local.substring(0, 2)}***@${domain}`;
  }

  // Mask user IDs (show only first 4 chars)
  if (sanitized.userId) {
    sanitized.userId = `${sanitized.userId.substring(0, 4)}***`;
  }

  return sanitized;
}

export const logger = {
  error: (message: string, context: LogContext = {}) => {
    const sanitizedContext = sanitizeLogData(context);
    console.error(message, sanitizedContext);
  },

  info: (message: string, context: LogContext = {}) => {
    const sanitizedContext = sanitizeLogData(context);
    console.info(message, sanitizedContext);
  },
};
```

## 8. Rate Limiting

### API Route Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter
 * For production, use Redis or a dedicated rate limiting service
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }
): { success: boolean; remaining: number } {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const windowStart = now - config.interval;

  const current = rateLimitMap.get(ip);

  // Clean up expired entries
  if (current && current.resetTime < windowStart) {
    rateLimitMap.delete(ip);
  }

  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetTime: now });
    return { success: true, remaining: config.uniqueTokenPerInterval - 1 };
  }

  if (entry.count >= config.uniqueTokenPerInterval) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return {
    success: true,
    remaining: config.uniqueTokenPerInterval - entry.count,
  };
}
```

### Usage in API Routes

```typescript
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const { success, remaining } = rateLimit(request, {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 5, // 5 requests per minute
  });

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
      }
    );
  }

  // Process request
  // ...

  return NextResponse.json(
    { success: true },
    {
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
      },
    }
  );
}
```

## 9. Dependency Security

### Automated Scanning

```bash
# package.json scripts
{
  "scripts": {
    "security:audit": "pnpm audit --audit-level moderate",
    "security:check": "pnpm audit && semgrep --config=auto src/",
    "security:fix": "pnpm audit --fix"
  }
}
```

### Semgrep 

This project uses a custom Semgrep ruleset (`semgrep.yml`) to detect common
object-injection and unsafe HTML patterns. To keep the signal high without
introducing blind spots, we maintain a lightweight governance log:

- **`object-injection-sink-dynamic-property`**
  - **Pattern tuning**: Added a `pattern-not-inside` clause to ignore canonical
    `for (let i = 0; i < arr.length; i += 1) { arr[i] ... }` index access
    loops. In these cases the key is a locally controlled numeric index
    bounded by `arr.length`, not user input.
  - **Code annotation**: For `renderPrivacyContent` in
    `src/app/[locale]/privacy/page.tsx`, we explicitly documented the
    reasoning with `// nosemgrep: object-injection-sink-dynamic-property` to
    clarify that `lines[index]` is derived from static privacy content and
    only used for safe JSX text rendering.

- **`object-injection-sink-spread-operator`**
  - **UI-only spreads (acceptable low risk, documented)**:
    - `src/app/[locale]/about/page.tsx` (`ValuesSection`): spreads
      `values.*` from controlled translation/config objects into display-only
      cards.
    - `src/app/[locale]/products/[slug]/page.tsx` (`buildTradeInfoProps`):
      builds a shallow map from `ProductDetail` for `ProductTradeInfo` UI,
      with fields sourced from internal content models.
    - `src/components/products/product-card.tsx` (`mergedLabels`): merges
      `DEFAULT_LABELS` and `labels` for card UI labels only.
    - `src/components/products/product-specs.tsx` (`mergedLabels`): merges
      trade info labels for display-only specs.

    These call sites are annotated with
    `// nosemgrep: object-injection-sink-spread-operator` and a short
    **Reason** comment to record that the data is controlled and used solely
    for rendering, never as input to DB/FS/exec sinks. To further reduce
    noise while keeping other security rules active, these files are also
    listed under `paths.exclude` for this rule in `semgrep.yml`.

  - **Configuration modules (clear false positives, rule-level exclusion)**:
    - `src/lib/performance-monitoring-config-history.ts`
    - `src/lib/performance-monitoring-config-modules.ts`

    Both files operate on internal `PerformanceConfig` objects, cloning and
    merging configuration for diagnostics only. They do not process
    user-controlled input and are now excluded from this rule via the
    `paths.exclude` list in `semgrep.yml`.

This governance section should be updated whenever we:

- Add new `// nosemgrep` suppressions for Semgrep rules, or
- Change Semgrep rule patterns / exclusions that affect what constitutes a
  security finding.

### GitHub Actions Security Workflow

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run pnpm audit
        run: pnpm audit --audit-level moderate

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: auto
```

## 10. Security Checklist

### Pre-Deployment Security Checklist

- [ ] **XSS Prevention**
  - [ ] All user input is sanitized before rendering
  - [ ] CSP headers are configured
  - [ ] No use of `dangerouslySetInnerHTML` without sanitization

- [ ] **CSRF Protection**
  - [ ] CSRF tokens implemented for state-changing operations
  - [ ] SameSite cookies configured
  - [ ] Origin validation for API requests

- [ ] **Input Validation**
  - [ ] All API routes use Zod schema validation
  - [ ] File uploads are validated (type, size, content)
  - [ ] SQL injection prevention with parameterized queries

- [ ] **Authentication & Authorization**
  - [ ] JWT tokens use secure algorithms (HS256 or RS256)
  - [ ] Session tokens are httpOnly and secure
  - [ ] Role-based access control implemented

- [ ] **Sensitive Data**
  - [ ] Environment variables validated at startup
  - [ ] Sensitive data encrypted at rest
  - [ ] Logs are sanitized (no passwords, tokens, or secrets)

- [ ] **Rate Limiting**
  - [ ] API routes have rate limiting
  - [ ] Authentication endpoints have stricter limits
  - [ ] 429 responses include Retry-After headers

- [ ] **Dependencies**
  - [ ] No high/critical vulnerabilities in dependencies
  - [ ] Automated security scanning in CI/CD
  - [ ] Dependabot enabled for automatic updates

- [ ] **Security Headers**
  - [ ] CSP configured and tested
  - [ ] X-Frame-Options set to DENY
  - [ ] X-Content-Type-Options set to nosniff
  - [ ] HSTS enabled in production

### Security Testing

```bash
# Run security checks before deployment
pnpm run security:check
pnpm run lint:security
pnpm run test:security
```

## 11. Incident Response

### Security Incident Handling

1. **Detection**: Monitor logs and error tracking (Sentry)
2. **Containment**: Immediately revoke compromised credentials
3. **Investigation**: Analyze logs to determine scope
4. **Remediation**: Apply fixes and deploy patches
5. **Post-Mortem**: Document incident and improve processes

### Emergency Contacts

- **Security Team**: security@your-company.com
- **On-Call Engineer**: Configured in PagerDuty/Opsgenie
- **Vercel Support**: For infrastructure issues
