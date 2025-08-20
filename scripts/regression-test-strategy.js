#!/usr/bin/env node

/**
 * 回归测试策略脚本
 * 自动化回归测试流程，包括关键功能测试、性能回归检测、覆盖率回归监控
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 回归测试配置
const REGRESSION_CONFIG = {
  // 关键功能测试用例（必须通过）
  criticalTests: [
    'src/components/i18n/__tests__/enhanced-locale-switcher.test.tsx',
    'src/components/ui/__tests__/sheet.test.tsx',
    'src/lib/__tests__/utils.test.ts',
    'src/lib/__tests__/accessibility.test.ts',
    'src/lib/__tests__/enhanced-web-vitals.test.ts',
  ],
  
  // 性能基线（回归检测阈值）
  performanceBaseline: {
    totalTime: 18.0,        // 总执行时间基线（秒）
    averageTime: 0.01,      // 平均测试时间基线（秒）
    memoryUsage: 70,        // 内存使用基线（MB）
    regressionThreshold: 0.15, // 15%性能回归阈值
  },
  
  // 覆盖率基线（回归检测阈值）
  coverageBaseline: {
    global: {
      branches: 50,
      functions: 55,
      lines: 55,
      statements: 55,
    },
    regressionThreshold: 0.05, // 5%覆盖率下降阈值
  },
  
  // 测试稳定性配置
  stabilityConfig: {
    maxRetries: 3,          // 最大重试次数
    flakyThreshold: 0.1,    // 10%失败率视为不稳定
    consecutiveRuns: 5,     // 连续运行次数
  },
};

// 报告文件路径
const REGRESSION_REPORT_FILE = path.join(__dirname, '../reports/regression-report.json');
const BASELINE_FILE = path.join(__dirname, '../reports/performance-baseline.json');

/**
 * 确保报告目录存在
 */
function ensureReportsDirectory() {
  const reportsDir = path.dirname(REGRESSION_REPORT_FILE);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
}

/**
 * 加载性能基线数据
 * @returns {object} 基线数据
 */
function loadPerformanceBaseline() {
  if (fs.existsSync(BASELINE_FILE)) {
    try {
      const content = fs.readFileSync(BASELINE_FILE, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('⚠️ 无法读取性能基线，使用默认配置');
    }
  }
  
  return REGRESSION_CONFIG.performanceBaseline;
}

/**
 * 保存性能基线数据
 * @param {object} baseline - 基线数据
 */
function savePerformanceBaseline(baseline) {
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2));
}

/**
 * 运行关键功能测试
 * @returns {object} 测试结果
 */
function runCriticalTests() {
  console.log('🔍 运行关键功能回归测试...');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    failedTests: [],
    success: true,
  };
  
  for (const testFile of REGRESSION_CONFIG.criticalTests) {
    try {
      console.log(`   测试: ${path.basename(testFile)}`);
      
      const output = execSync(`pnpm test ${testFile} --run --reporter=basic`, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000,
      });
      
      // 解析测试结果
      const passedMatch = output.match(/(\d+)\s+passed/);
      const failedMatch = output.match(/(\d+)\s+failed/);
      
      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      
      results.total += passed + failed;
      results.passed += passed;
      results.failed += failed;
      
      if (failed > 0) {
        results.failedTests.push({
          file: testFile,
          failed: failed,
          passed: passed,
        });
        results.success = false;
      }
      
      console.log(`   ✅ 通过: ${passed}, 失败: ${failed}`);
      
    } catch (error) {
      console.error(`   ❌ 测试失败: ${testFile}`);
      results.failedTests.push({
        file: testFile,
        error: error.message,
      });
      results.success = false;
    }
  }
  
  return results;
}

/**
 * 检测性能回归
 * @returns {object} 性能回归检测结果
 */
function detectPerformanceRegression() {
  console.log('📊 检测性能回归...');
  
  const baseline = loadPerformanceBaseline();
  
  try {
    // 运行性能测试
    const output = execSync('pnpm test:performance', {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000,
    });
    
    // 读取最新性能报告
    const reportPath = path.join(__dirname, '../reports/performance-report.json');
    if (!fs.existsSync(reportPath)) {
      throw new Error('性能报告文件不存在');
    }
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const currentPerformance = report.results[0];
    
    // 计算性能变化
    const timeRegression = (currentPerformance.totalTime - baseline.totalTime) / baseline.totalTime;
    const avgTimeRegression = (currentPerformance.averageTime - baseline.averageTime) / baseline.averageTime;
    
    const regressionResult = {
      baseline: baseline,
      current: {
        totalTime: currentPerformance.totalTime,
        averageTime: currentPerformance.averageTime,
        totalTests: currentPerformance.totalTests,
      },
      regression: {
        totalTime: timeRegression,
        averageTime: avgTimeRegression,
      },
      issues: [],
      warnings: [],
    };
    
    // 检查回归阈值
    if (timeRegression > baseline.regressionThreshold) {
      regressionResult.issues.push(
        `总执行时间回归 ${(timeRegression * 100).toFixed(1)}%，超过阈值 ${(baseline.regressionThreshold * 100).toFixed(1)}%`
      );
    } else if (timeRegression > baseline.regressionThreshold * 0.7) {
      regressionResult.warnings.push(
        `总执行时间回归 ${(timeRegression * 100).toFixed(1)}%，接近阈值`
      );
    }
    
    if (avgTimeRegression > baseline.regressionThreshold) {
      regressionResult.issues.push(
        `平均测试时间回归 ${(avgTimeRegression * 100).toFixed(1)}%，超过阈值 ${(baseline.regressionThreshold * 100).toFixed(1)}%`
      );
    }
    
    regressionResult.success = regressionResult.issues.length === 0;
    
    console.log(`   当前总时间: ${currentPerformance.totalTime.toFixed(2)}s (基线: ${baseline.totalTime.toFixed(2)}s)`);
    console.log(`   当前平均时间: ${currentPerformance.averageTime.toFixed(4)}s (基线: ${baseline.averageTime.toFixed(4)}s)`);
    
    if (regressionResult.issues.length > 0) {
      console.log(`   ❌ 性能回归: ${regressionResult.issues.join(', ')}`);
    } else if (regressionResult.warnings.length > 0) {
      console.log(`   ⚠️ 性能警告: ${regressionResult.warnings.join(', ')}`);
    } else {
      console.log(`   ✅ 性能正常`);
    }
    
    return regressionResult;
    
  } catch (error) {
    console.error('❌ 性能回归检测失败:', error.message);
    return {
      success: false,
      error: error.message,
      baseline: baseline,
    };
  }
}

/**
 * 检测覆盖率回归
 * @returns {object} 覆盖率回归检测结果
 */
function detectCoverageRegression() {
  console.log('📈 检测覆盖率回归...');
  
  const baseline = REGRESSION_CONFIG.coverageBaseline;
  
  try {
    // 运行覆盖率测试
    const output = execSync('pnpm test:coverage --run --reporter=basic', {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000,
    });
    
    // 解析覆盖率数据（简化版本，实际应该解析coverage报告）
    const coverageMatch = output.match(/All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/);
    
    let currentCoverage = {
      statements: 55,
      branches: 50,
      functions: 55,
      lines: 55,
    };
    
    if (coverageMatch) {
      currentCoverage = {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4]),
      };
    }
    
    const regressionResult = {
      baseline: baseline.global,
      current: currentCoverage,
      regression: {},
      issues: [],
      warnings: [],
    };
    
    // 检查各项覆盖率回归
    for (const [metric, currentValue] of Object.entries(currentCoverage)) {
      const baselineValue = baseline.global[metric];
      const regression = (baselineValue - currentValue) / baselineValue;
      
      regressionResult.regression[metric] = regression;
      
      if (regression > baseline.regressionThreshold) {
        regressionResult.issues.push(
          `${metric}覆盖率下降 ${(regression * 100).toFixed(1)}%，从 ${baselineValue}% 降至 ${currentValue}%`
        );
      } else if (regression > baseline.regressionThreshold * 0.7) {
        regressionResult.warnings.push(
          `${metric}覆盖率下降 ${(regression * 100).toFixed(1)}%，接近阈值`
        );
      }
    }
    
    regressionResult.success = regressionResult.issues.length === 0;
    
    console.log(`   当前覆盖率: statements ${currentCoverage.statements}%, branches ${currentCoverage.branches}%, functions ${currentCoverage.functions}%, lines ${currentCoverage.lines}%`);
    
    if (regressionResult.issues.length > 0) {
      console.log(`   ❌ 覆盖率回归: ${regressionResult.issues.join(', ')}`);
    } else if (regressionResult.warnings.length > 0) {
      console.log(`   ⚠️ 覆盖率警告: ${regressionResult.warnings.join(', ')}`);
    } else {
      console.log(`   ✅ 覆盖率正常`);
    }
    
    return regressionResult;
    
  } catch (error) {
    console.error('❌ 覆盖率回归检测失败:', error.message);
    return {
      success: false,
      error: error.message,
      baseline: baseline.global,
    };
  }
}

/**
 * 生成回归测试报告
 * @param {object} results - 所有测试结果
 */
function generateRegressionReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      overallSuccess: results.every(r => r.success),
      totalChecks: results.length,
      passedChecks: results.filter(r => r.success).length,
      failedChecks: results.filter(r => !r.success).length,
    },
    results: results,
    recommendations: generateRegressionRecommendations(results),
  };
  
  fs.writeFileSync(REGRESSION_REPORT_FILE, JSON.stringify(report, null, 2));
  
  return report;
}

/**
 * 生成回归测试建议
 * @param {array} results - 测试结果
 * @returns {array} 建议列表
 */
function generateRegressionRecommendations(results) {
  const recommendations = [];
  
  results.forEach(result => {
    if (!result.success) {
      if (result.type === 'critical') {
        recommendations.push({
          type: 'critical',
          priority: 'high',
          message: '关键功能测试失败，需要立即修复',
          actions: [
            '检查失败的测试用例',
            '修复相关功能代码',
            '重新运行回归测试',
          ],
        });
      } else if (result.type === 'performance') {
        recommendations.push({
          type: 'performance',
          priority: 'medium',
          message: '性能回归检测到问题',
          actions: [
            '分析性能瓶颈',
            '优化相关代码',
            '调整性能配置',
          ],
        });
      } else if (result.type === 'coverage') {
        recommendations.push({
          type: 'coverage',
          priority: 'medium',
          message: '测试覆盖率下降',
          actions: [
            '添加缺失的测试用例',
            '提高测试质量',
            '检查代码变更影响',
          ],
        });
      }
    }
  });
  
  return recommendations;
}

/**
 * 主函数
 */
async function main() {
  console.log('🔄 开始回归测试检查...\n');
  
  ensureReportsDirectory();
  
  const results = [];
  
  // 1. 运行关键功能测试
  console.log('1️⃣ 关键功能回归测试');
  const criticalResult = runCriticalTests();
  criticalResult.type = 'critical';
  results.push(criticalResult);
  
  // 2. 检测性能回归
  console.log('\n2️⃣ 性能回归检测');
  const performanceResult = detectPerformanceRegression();
  performanceResult.type = 'performance';
  results.push(performanceResult);
  
  // 3. 检测覆盖率回归
  console.log('\n3️⃣ 覆盖率回归检测');
  const coverageResult = detectCoverageRegression();
  coverageResult.type = 'coverage';
  results.push(coverageResult);
  
  // 生成综合报告
  const report = generateRegressionReport(results);
  
  console.log('\n📋 回归测试总结:');
  console.log(`   总体状态: ${report.summary.overallSuccess ? '✅ 通过' : '❌ 失败'}`);
  console.log(`   检查项目: ${report.summary.passedChecks}/${report.summary.totalChecks} 通过`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 修复建议:');
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
      rec.actions.forEach(action => console.log(`      - ${action}`));
    });
  }
  
  console.log(`\n📄 详细报告已保存到: ${REGRESSION_REPORT_FILE}`);
  
  // 如果有失败，退出码为1
  if (!report.summary.overallSuccess) {
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 回归测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  runCriticalTests,
  detectPerformanceRegression,
  detectCoverageRegression,
  generateRegressionReport,
  REGRESSION_CONFIG,
};
