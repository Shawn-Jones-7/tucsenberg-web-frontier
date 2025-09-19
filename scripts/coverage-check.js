#!/usr/bin/env node

/**
 * 覆盖率检查脚本
 * 用于CI/CD流程中的覆盖率验证
 */

const fs = require('fs');
const path = require('path');

// 覆盖率阈值配置
const COVERAGE_THRESHOLDS = {
  global: {
    branches: 80,
    functions: 85,
    lines: 85,
    statements: 85,
  },
  critical: {
    branches: 90,
    functions: 95,
    lines: 95,
    statements: 95,
  },
  security: {
    branches: 95,
    functions: 98,
    lines: 98,
    statements: 98,
  },
};

// 关键文件分类
const CRITICAL_FILES = [
  'src/lib/content-parser.ts',
  'src/lib/content-validation.ts',
  'src/lib/seo-metadata.ts',
  'src/lib/structured-data.ts',
];

const SECURITY_FILES = [
  'src/lib/accessibility.ts',
  'src/services/url-generator.ts',
];

/**
 * 读取覆盖率报告
 */
function readCoverageReport() {
  const coveragePath = path.join(
    process.cwd(),
    'coverage',
    'coverage-summary.json',
  );

  if (!fs.existsSync(coveragePath)) {
    console.error('❌ 覆盖率报告不存在，请先运行: pnpm test:coverage');
    process.exit(1);
  }

  try {
    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    return coverageData;
  } catch (error) {
    console.error('❌ 读取覆盖率报告失败:', error.message);
    process.exit(1);
  }
}

/**
 * 检查覆盖率是否达标
 */
function checkCoverage(coverage, thresholds, name = 'Global') {
  const results = {
    passed: true,
    details: [],
  };

  for (const [metric, threshold] of Object.entries(thresholds)) {
    const actual = coverage[metric]?.pct || 0;
    const passed = actual >= threshold;

    results.details.push({
      metric,
      actual,
      threshold,
      passed,
    });

    if (!passed) {
      results.passed = false;
    }
  }

  return results;
}

/**
 * 生成覆盖率报告
 */
function generateReport(coverageData) {
  console.log('\n📊 测试覆盖率分析报告');
  console.log('='.repeat(50));

  // 全局覆盖率检查
  const globalCoverage = coverageData.total;
  const globalResults = checkCoverage(
    globalCoverage,
    COVERAGE_THRESHOLDS.global,
    'Global',
  );

  console.log('\n🌍 全局覆盖率:');
  globalResults.details.forEach(({ metric, actual, threshold, passed }) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(
      `  ${status} ${metric.padEnd(12)}: ${color}${actual.toFixed(1)}%${reset} (目标: ${threshold}%)`,
    );
  });

  // 关键文件检查
  console.log('\n🔥 关键业务逻辑文件:');
  let criticalPassed = true;

  CRITICAL_FILES.forEach((filePath) => {
    const fileData = coverageData[filePath];
    if (fileData) {
      const results = checkCoverage(
        fileData,
        COVERAGE_THRESHOLDS.critical,
        filePath,
      );
      const status = results.passed ? '✅' : '❌';
      const avgCoverage =
        results.details.reduce((sum, d) => sum + d.actual, 0) /
        results.details.length;

      console.log(
        `  ${status} ${path.basename(filePath).padEnd(25)}: ${avgCoverage.toFixed(1)}%`,
      );

      if (!results.passed) {
        criticalPassed = false;
        results.details.forEach(({ metric, actual, threshold, passed }) => {
          if (!passed) {
            console.log(
              `    ⚠️  ${metric}: ${actual.toFixed(1)}% < ${threshold}%`,
            );
          }
        });
      }
    } else {
      console.log(`  ❌ ${path.basename(filePath).padEnd(25)}: 未测试`);
      criticalPassed = false;
    }
  });

  // 安全文件检查
  console.log('\n🔒 安全相关文件:');
  let securityPassed = true;

  SECURITY_FILES.forEach((filePath) => {
    const fileData = coverageData[filePath];
    if (fileData) {
      const results = checkCoverage(
        fileData,
        COVERAGE_THRESHOLDS.security,
        filePath,
      );
      const status = results.passed ? '✅' : '❌';
      const avgCoverage =
        results.details.reduce((sum, d) => sum + d.actual, 0) /
        results.details.length;

      console.log(
        `  ${status} ${path.basename(filePath).padEnd(25)}: ${avgCoverage.toFixed(1)}%`,
      );

      if (!results.passed) {
        securityPassed = false;
        results.details.forEach(({ metric, actual, threshold, passed }) => {
          if (!passed) {
            console.log(
              `    ⚠️  ${metric}: ${actual.toFixed(1)}% < ${threshold}%`,
            );
          }
        });
      }
    } else {
      console.log(`  ❌ ${path.basename(filePath).padEnd(25)}: 未测试`);
      securityPassed = false;
    }
  });

  // 总结
  console.log('\n📋 检查结果:');
  console.log(
    `  全局覆盖率: ${globalResults.passed ? '✅ 通过' : '❌ 未达标'}`,
  );
  console.log(`  关键文件: ${criticalPassed ? '✅ 通过' : '❌ 未达标'}`);
  console.log(`  安全文件: ${securityPassed ? '✅ 通过' : '❌ 未达标'}`);

  const allPassed = globalResults.passed && criticalPassed && securityPassed;

  if (allPassed) {
    console.log('\n🎉 所有覆盖率检查通过！');
    return 0;
  }
  console.log('\n❌ 覆盖率检查失败，请提高测试覆盖率');
  console.log('\n💡 建议:');
  console.log('  1. 运行 pnpm test:coverage 查看详细报告');
  console.log('  2. 重点关注未达标的关键文件');
  console.log('  3. 补充边缘情况和错误处理测试');
  return 1;
}

/**
 * 主函数
 */
function main() {
  try {
    const coverageData = readCoverageReport();
    const exitCode = generateReport(coverageData);
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ 覆盖率检查失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkCoverage,
  generateReport,
  COVERAGE_THRESHOLDS,
};
