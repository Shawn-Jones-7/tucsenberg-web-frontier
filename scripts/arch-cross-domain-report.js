#!/usr/bin/env node

/**
 * 生成跨域依赖精简报告（降噪版）
 *
 * - 只统计 src/lib 下的真实跨域依赖（from/to 域不同）
 * - 依赖数据来源：dependency-cruiser JSON 输出
 * - 输出：reports/architecture/cross-domain.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORT_DIR = path.join(process.cwd(), 'reports', 'architecture');
const REPORT_PATH = path.join(REPORT_DIR, 'cross-domain.json');
const DC_COMMAND =
  'pnpm exec dependency-cruiser src --config .dependency-cruiser.js -T json';

function ensureReportDir() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
}

function runDependencyCruiser() {
  const output = execSync(DC_COMMAND, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 20 * 1024 * 1024,
  });
  return JSON.parse(output);
}

function getDomain(filePath) {
  const match = /^src\/lib\/([^/]+)/.exec(filePath || '');
  return match ? match[1] : null;
}

function buildCrossDomainReport(violations) {
  const cross = [];
  const pairCounts = {};
  const ruleCounts = {};

  for (const v of violations) {
    const fromDomain = getDomain(v.from);
    const toDomain = getDomain(v.to);
    if (!fromDomain || !toDomain) continue;
    if (fromDomain === toDomain) continue; // 同域不计入

    const pairKey = `${fromDomain} -> ${toDomain}`;
    pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
    ruleCounts[v.rule.name] = (ruleCounts[v.rule.name] || 0) + 1;

    if (cross.length < 20) {
      cross.push({
        from: v.from,
        to: v.to,
        rule: v.rule.name,
        severity: v.rule.severity,
      });
    }
  }

  const total = Object.values(pairCounts).reduce((a, b) => a + b, 0);
  return { total, pairCounts, ruleCounts, samples: cross };
}

function main() {
  ensureReportDir();

  const data = runDependencyCruiser();
  const violations = data?.summary?.violations || [];
  const report = buildCrossDomainReport(violations);

  const payload = {
    generatedAt: new Date().toISOString(),
    command: DC_COMMAND,
    totalCrossDomain: report.total,
    byPair: report.pairCounts,
    byRule: report.ruleCounts,
    samples: report.samples,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`跨域报告已生成: ${REPORT_PATH}`);
  console.log(JSON.stringify(payload, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('生成跨域报告失败:', error.message);
    process.exit(1);
  }
}

module.exports = { runDependencyCruiser, buildCrossDomainReport };
