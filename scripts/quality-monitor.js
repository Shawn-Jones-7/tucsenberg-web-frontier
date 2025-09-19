#!/usr/bin/env node

/**
 * 企业级代码质量监控工具
 *
 * 功能：
 * - 实时监控ESLint错误和警告数量
 * - 生成质量指标报告
 * - 设置质量门禁阈值
 * - 集成CI/CD质量检查
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 质量指标阈值配置
const QUALITY_THRESHOLDS = {
  // 错误数量阈值
  maxErrors: 0, // 企业级标准：零错误容忍
  maxWarnings: 500, // 当前目标：500个警告以下

  // 特定规则阈值
  maxAnyTypeUsage: 0, // 严格禁止any类型
  maxComplexityViolations: 10, // 复杂度违规最多10个
  maxFunctionLengthViolations: 20, // 函数长度违规最多20个
  maxSecurityWarnings: 30, // 安全警告最多30个

  // 质量趋势阈值
  maxQualityRegression: 50, // 质量回退最多50个问题
};

// 质量指标收集器
class QualityMonitor {
  constructor() {
    this.reportDir = path.join(process.cwd(), 'reports', 'quality');
    this.ensureReportDir();
  }

  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  /**
   * 运行ESLint并收集质量指标
   */
  async collectQualityMetrics() {
    console.log('🔍 收集代码质量指标...');

    try {
      // 直接运行ESLint命令，避免pnpm输出干扰
      // 复用项目脚本，确保与 lint:check 完全一致（并开启缓存），仅覆盖输出格式为 JSON
      const lintOutput = execSync('pnpm run -s lint:check -- --format json', {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        stdio: ['pipe', 'pipe', 'pipe'], // 确保只获取stdout
      });

      const lintResults = JSON.parse(lintOutput);
      return this.analyzeLintResults(lintResults);
    } catch (error) {
      // ESLint有错误时也会抛出异常，但我们仍需要解析结果
      if (error.stdout) {
        try {
          // 清理输出，移除非JSON内容
          const cleanOutput = error.stdout.trim();
          const jsonStart = cleanOutput.indexOf('[');
          const jsonEnd = cleanOutput.lastIndexOf(']') + 1;

          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const jsonOutput = cleanOutput.substring(jsonStart, jsonEnd);
            const lintResults = JSON.parse(jsonOutput);
            return this.analyzeLintResults(lintResults);
          }
          console.error('❌ 未找到有效的JSON输出');
          throw new Error('ESLint输出格式无效');
        } catch (parseError) {
          console.error('❌ 解析ESLint输出失败:', parseError.message);
          console.error('原始输出:', error.stdout.substring(0, 500));
          throw parseError;
        }
      }

      // 如果没有stdout，可能是严重错误
      console.error('❌ ESLint执行失败:', error.message);
      throw error;
    }
  }

  /**
   * 分析ESLint结果
   */
  analyzeLintResults(lintResults) {
    const metrics = {
      timestamp: new Date().toISOString(),
      totalFiles: lintResults.length,
      totalErrors: 0,
      totalWarnings: 0,
      ruleViolations: {},
      fileMetrics: [],
      qualityScore: 0,
    };

    // 分析每个文件的结果
    lintResults.forEach((fileResult) => {
      const fileMetric = {
        filePath: fileResult.filePath,
        errorCount: fileResult.errorCount,
        warningCount: fileResult.warningCount,
        messages: fileResult.messages,
      };

      metrics.totalErrors += fileResult.errorCount;
      metrics.totalWarnings += fileResult.warningCount;

      // 统计规则违规情况
      fileResult.messages.forEach((message) => {
        const ruleId = message.ruleId || 'unknown';
        if (!metrics.ruleViolations[ruleId]) {
          metrics.ruleViolations[ruleId] = {
            count: 0,
            severity: message.severity === 2 ? 'error' : 'warning',
          };
        }
        metrics.ruleViolations[ruleId].count++;
      });

      metrics.fileMetrics.push(fileMetric);
    });

    // 计算质量分数 (0-100)
    metrics.qualityScore = this.calculateQualityScore(metrics);

    return metrics;
  }

  /**
   * 计算质量分数
   */
  calculateQualityScore(metrics) {
    const baseScore = 100;

    // 错误扣分：每个错误扣5分
    const errorPenalty = metrics.totalErrors * 5;

    // 警告扣分：每个警告扣0.1分
    const warningPenalty = metrics.totalWarnings * 0.1;

    // 特定规则额外扣分
    const anyTypePenalty =
      (metrics.ruleViolations['@typescript-eslint/no-explicit-any']?.count ||
        0) * 2;
    const securityPenalty =
      Object.keys(metrics.ruleViolations)
        .filter((rule) => rule.startsWith('security/'))
        .reduce((sum, rule) => sum + metrics.ruleViolations[rule].count, 0) * 1;

    const totalPenalty =
      errorPenalty + warningPenalty + anyTypePenalty + securityPenalty;

    return Math.max(0, Math.round(baseScore - totalPenalty));
  }

  /**
   * 生成质量报告
   */
  generateQualityReport(metrics) {
    const reportPath = path.join(
      this.reportDir,
      `quality-report-${Date.now()}.json`,
    );

    // 保存详细报告
    fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));

    // 生成摘要报告
    const summary = {
      timestamp: metrics.timestamp,
      qualityScore: metrics.qualityScore,
      totalErrors: metrics.totalErrors,
      totalWarnings: metrics.totalWarnings,
      totalFiles: metrics.totalFiles,
      topViolations: Object.entries(metrics.ruleViolations)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(([rule, data]) => ({
          rule,
          count: data.count,
          severity: data.severity,
        })),
      thresholdStatus: this.checkThresholds(metrics),
    };

    const summaryPath = path.join(
      this.reportDir,
      'latest-quality-summary.json',
    );
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    return { reportPath, summaryPath, summary };
  }

  /**
   * 检查质量门禁阈值
   */
  checkThresholds(metrics) {
    const status = {
      passed: true,
      violations: [],
    };

    // 检查错误数量
    if (metrics.totalErrors > QUALITY_THRESHOLDS.maxErrors) {
      status.passed = false;
      status.violations.push({
        type: 'errors',
        current: metrics.totalErrors,
        threshold: QUALITY_THRESHOLDS.maxErrors,
        message: `错误数量超过阈值: ${metrics.totalErrors} > ${QUALITY_THRESHOLDS.maxErrors}`,
      });
    }

    // 检查警告数量
    if (metrics.totalWarnings > QUALITY_THRESHOLDS.maxWarnings) {
      status.passed = false;
      status.violations.push({
        type: 'warnings',
        current: metrics.totalWarnings,
        threshold: QUALITY_THRESHOLDS.maxWarnings,
        message: `警告数量超过阈值: ${metrics.totalWarnings} > ${QUALITY_THRESHOLDS.maxWarnings}`,
      });
    }

    // 检查any类型使用
    const anyTypeCount =
      metrics.ruleViolations['@typescript-eslint/no-explicit-any']?.count || 0;
    if (anyTypeCount > QUALITY_THRESHOLDS.maxAnyTypeUsage) {
      status.passed = false;
      status.violations.push({
        type: 'any-type',
        current: anyTypeCount,
        threshold: QUALITY_THRESHOLDS.maxAnyTypeUsage,
        message: `any类型使用超过阈值: ${anyTypeCount} > ${QUALITY_THRESHOLDS.maxAnyTypeUsage}`,
      });
    }

    return status;
  }

  /**
   * 打印质量报告摘要
   */
  printQualitySummary(summary) {
    console.log('\n📊 代码质量报告摘要');
    console.log('='.repeat(50));
    console.log(`🎯 质量分数: ${summary.qualityScore}/100`);
    console.log(`📁 检查文件: ${summary.totalFiles} 个`);
    console.log(`❌ 错误数量: ${summary.totalErrors} 个`);
    console.log(`⚠️  警告数量: ${summary.totalWarnings} 个`);

    console.log('\n🔝 主要问题类型:');
    summary.topViolations.slice(0, 5).forEach((violation, index) => {
      const icon = violation.severity === 'error' ? '❌' : '⚠️';
      console.log(
        `  ${index + 1}. ${icon} ${violation.rule}: ${violation.count} 个`,
      );
    });

    console.log('\n🚪 质量门禁状态:');
    if (summary.thresholdStatus.passed) {
      console.log('✅ 通过 - 所有质量指标符合企业级标准');
    } else {
      console.log('❌ 未通过 - 发现以下问题:');
      summary.thresholdStatus.violations.forEach((violation) => {
        console.log(`  • ${violation.message}`);
      });
    }

    console.log('='.repeat(50));
  }

  /**
   * 主执行函数
   */
  async run() {
    try {
      console.log('🚀 启动企业级代码质量监控...\n');

      const metrics = await this.collectQualityMetrics();
      const { summaryPath, summary } = this.generateQualityReport(metrics);

      this.printQualitySummary(summary);

      console.log(`\n📄 详细报告已保存至: ${summaryPath}`);

      // 如果质量门禁未通过，退出码为1
      if (!summary.thresholdStatus.passed) {
        console.log('\n💡 建议优先修复error级别问题，然后逐步减少warning数量');
        process.exit(1);
      }

      console.log('\n🎉 代码质量监控完成！');
    } catch (error) {
      console.error('❌ 质量监控执行失败:', error.message);
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const monitor = new QualityMonitor();
  monitor.run();
}

module.exports = QualityMonitor;
