#!/usr/bin/env node

/**
 * MDX Content Slug Sync CLI
 *
 * Validates that MDX content files across locales have:
 * 1. Matching file pairs (e.g., en/foo.mdx and zh/foo.mdx)
 * 2. Consistent frontmatter.slug values
 *
 * Usage:
 *   node scripts/content-slug-sync.js [options]
 *
 * Options:
 *   --json              Output JSON report to reports/content-slug-sync-report.json
 *   --collections=x,y   Specify collections to check (default: posts,pages,products)
 *   --locales=x,y       Specify locales to check (default: en,zh)
 *   --quiet             Only output errors, no success messages
 *   --help              Show help message
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation issues found
 *
 * @module scripts/content-slug-sync
 */

const fs = require('fs');
const path = require('path');
const { validateMdxSlugSync } = require('./mdx-slug-sync');

// Default configuration
const DEFAULT_COLLECTIONS = ['posts', 'pages', 'products'];
const DEFAULT_LOCALES = ['en', 'zh'];
const REPORT_DIR = 'reports';
const REPORT_FILENAME = 'content-slug-sync-report.json';

/**
 * Parse command line arguments
 * @param {string[]} args - Process arguments (process.argv.slice(2))
 * @returns {Object} Parsed options
 */
function parseArgs(args) {
  const options = {
    json: false,
    quiet: false,
    help: false,
    collections: DEFAULT_COLLECTIONS,
    locales: DEFAULT_LOCALES,
  };

  for (const arg of args) {
    if (arg === '--json') {
      options.json = true;
    } else if (arg === '--quiet') {
      options.quiet = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--collections=')) {
      const value = arg.split('=')[1];
      options.collections = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (arg.startsWith('--locales=')) {
      const value = arg.split('=')[1];
      options.locales = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
📖 MDX Content Slug Sync Validator

检查多语言 MDX 内容文件的 slug 一致性。

用法:
  node scripts/content-slug-sync.js [options]
  pnpm content:slug-check [options]

选项:
  --json              输出 JSON 报告到 reports/content-slug-sync-report.json
  --collections=x,y   指定要检查的内容集合 (默认: posts,pages,products)
  --locales=x,y       指定要检查的语言 (默认: en,zh)
  --quiet             静默模式，仅输出错误
  --help, -h          显示帮助信息

退出码:
  0 - 所有校验通过
  1 - 发现校验问题

示例:
  node scripts/content-slug-sync.js
  node scripts/content-slug-sync.js --json
  node scripts/content-slug-sync.js --collections=products --locales=en,zh,ja
`);
}

/**
 * Print human-readable summary
 * @param {Object} result - Validation result from validateMdxSlugSync
 * @param {Object} options - CLI options
 */
function printSummary(result, options) {
  const { quiet } = options;

  console.log('\n🔍 MDX Slug Sync Validation');
  console.log('==========================\n');

  // Print configuration
  if (!quiet) {
    console.log(`📁 Collections: ${result.checkedCollections.join(', ')}`);
    console.log(`🌍 Locales: ${result.checkedLocales.join(', ')}`);
    console.log(`📄 Total files: ${result.stats.totalFiles}`);
    console.log(`🔗 Total pairs: ${result.stats.totalPairs}\n`);
  }

  // If no issues, print success
  if (result.ok) {
    console.log('✅ All slug validations passed!\n');
    if (!quiet) {
      console.log(
        '💡 All MDX content files have consistent slugs across locales.\n',
      );
    }
    return;
  }

  // Print issues by type
  const { issues } = result;

  // Missing pairs
  const missingPairs = issues.filter((i) => i.type === 'missing_pair');
  if (missingPairs.length > 0) {
    console.log(`❌ Missing Pairs (${missingPairs.length}):`);
    for (const issue of missingPairs) {
      const existingFile = issue.basePath || issue.targetPath;
      const missingLocale = issue.basePath
        ? issue.targetLocale
        : issue.baseLocale;
      console.log(
        `   - [${issue.collection}] ${path.basename(existingFile)} (missing ${missingLocale})`,
      );
    }
    console.log('');
  }

  // Slug mismatches
  const slugMismatches = issues.filter((i) => i.type === 'slug_mismatch');
  if (slugMismatches.length > 0) {
    console.log(`❌ Slug Mismatches (${slugMismatches.length}):`);
    for (const issue of slugMismatches) {
      console.log(
        `   - [${issue.collection}] ${path.basename(issue.basePath)}`,
      );
      console.log(`     ${issue.baseLocale}: "${issue.baseSlug}"`);
      console.log(`     ${issue.targetLocale}: "${issue.targetSlug}"`);
    }
    console.log('');
  }

  // Parse errors
  const parseErrors = issues.filter((i) => i.type === 'parse_error');
  if (parseErrors.length > 0) {
    console.log(`❌ Parse Errors (${parseErrors.length}):`);
    for (const issue of parseErrors) {
      const file = issue.basePath || issue.targetPath;
      console.log(`   - [${issue.collection}] ${path.basename(file)}`);
      if (issue.error) {
        console.log(`     Error: ${issue.error}`);
      }
    }
    console.log('');
  }

  // Summary
  console.log('📊 Summary:');
  console.log(`   Missing pairs: ${result.stats.missingPairs}`);
  console.log(`   Slug mismatches: ${result.stats.slugMismatches}`);
  console.log(`   Parse errors: ${result.stats.parseErrors}`);
  console.log(`   Total issues: ${issues.length}\n`);

  console.log(
    '⚠️  Please fix the above issues to ensure i18n URL consistency.\n',
  );
}

/**
 * Write JSON report to file
 * @param {Object} result - Validation result
 * @param {string} rootDir - Project root directory
 */
function writeJsonReport(result, rootDir) {
  const reportDir = path.join(rootDir, REPORT_DIR);
  const reportPath = path.join(reportDir, REPORT_FILENAME);

  // Ensure reports directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Add metadata
  const report = {
    timestamp: new Date().toISOString(),
    tool: 'content-slug-sync',
    version: '1.0.0',
    ...result,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📝 JSON report saved to: ${reportPath}\n`);
}

/**
 * Main CLI entry point
 */
function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Handle help
  if (options.help) {
    printHelp();
    process.exitCode = 0;
    return;
  }

  // Validate options
  if (options.collections.length === 0) {
    console.error('❌ Error: No collections specified');
    process.exitCode = 1;
    return;
  }

  if (options.locales.length < 2) {
    console.error('❌ Error: At least 2 locales are required for comparison');
    process.exitCode = 1;
    return;
  }

  // Run validation
  const rootDir = path.join(__dirname, '..');
  const result = validateMdxSlugSync({
    rootDir,
    collections: options.collections,
    locales: options.locales,
  });

  // Output results
  printSummary(result, options);

  // Write JSON report if requested
  if (options.json) {
    writeJsonReport(result, rootDir);
  }

  // Set exit code
  process.exitCode = result.ok ? 0 : 1;
}

// Run if executed directly
main();
