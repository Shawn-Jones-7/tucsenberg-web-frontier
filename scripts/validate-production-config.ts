#!/usr/bin/env tsx
/**
 * Production Configuration Validation Script
 *
 * Validates site configuration for production readiness.
 * Run this script in CI before production builds to catch
 * unconfigured placeholders and invalid settings.
 *
 * Usage: pnpm validate:config
 */
import { validateSiteConfig } from '../src/config/paths/site-config';

async function main(): Promise<void> {
  console.log('Validating production configuration...\n');

  const result = validateSiteConfig();

  if (result.warnings.length > 0) {
    console.warn('Warnings:');
    result.warnings.forEach((w) => console.warn(`  - ${w}`));
    console.log();
  }

  if (result.errors.length > 0) {
    console.error('Production config validation failed:');
    result.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log('Production config validation passed');
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error('Validation script failed:', error);
  process.exit(1);
});
