#!/usr/bin/env node

/**
 * PII (Personally Identifiable Information) Detection in Logs
 *
 * Scans source code for potential PII leakage in logging statements.
 * Detects unsanitized email, IP, phone, name, and address fields.
 *
 * Usage: node scripts/check-pii-in-logs.js
 * Exit codes: 0 = pass, 1 = violations found
 */

const { execSync } = require('child_process');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

const PII_FIELDS = [
  'email',
  'clientIP',
  'clientIp',
  'ip',
  'ipAddress',
  'phone',
  'phoneNumber',
  'firstName',
  'lastName',
  'fullName',
  'name',
  'address',
  'streetAddress',
];

const SANITIZER_PATTERN = 'sanitize';

const LOGGER_PATTERN = 'logger\\.(info|warn|error|debug)';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildGrepPattern() {
  const fieldsPattern = PII_FIELDS.map(escapeRegex).join('|');
  return `${LOGGER_PATTERN}.*\\{[^}]*(${fieldsPattern})\\s*[,:]`;
}

function findPiiViolations() {
  const pattern = buildGrepPattern();

  try {
    const grepCmd = `grep -rn --include='*.ts' --include='*.tsx' -E '${pattern}' "${SRC_DIR}" 2>/dev/null || true`;
    const result = execSync(grepCmd, { encoding: 'utf8' });

    if (!result.trim()) {
      return [];
    }

    const lines = result.trim().split('\n').filter(Boolean);

    const violations = lines.filter((line) => {
      const lowerLine = line.toLowerCase();
      return !lowerLine.includes(SANITIZER_PATTERN);
    });

    return violations;
  } catch {
    return [];
  }
}

function formatViolation(violation) {
  const match = violation.match(/^(.+):(\d+):(.+)$/);
  if (!match) return violation;

  const [, filePath, lineNum, content] = match;
  const relPath = path.relative(process.cwd(), filePath);
  return `  ${relPath}:${lineNum}\n    ${content.trim()}`;
}

function main() {
  console.log('Checking for PII in log statements...\n');

  const violations = findPiiViolations();

  if (violations.length === 0) {
    console.log('PII check passed - no unsanitized PII found in logs');
    process.exit(0);
  }

  console.error(`Found ${violations.length} potential PII violation(s):\n`);
  violations.forEach((v) => {
    console.error(formatViolation(v));
    console.error('');
  });

  console.error(
    'Fix: Use sanitizeEmail(), sanitizeIP(), or sanitizeCompany() from @/lib/logger',
  );
  console.error(
    'Example: logger.info("msg", { email: sanitizeEmail(email) });\n',
  );

  process.exit(1);
}

main();
