#!/usr/bin/env node

/**
 * 项目健康检查器 - 超简单的用户界面
 * Project Health Checker - Ultra-simple user interface
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProjectHealthChecker {
  constructor() {
    this.healthStatus = {
      overall: 'unknown',
      score: 0,
      issues: [],
      recommendations: [],
      canDeploy: false,
    };
  }

  /**
   * 显示加载动画
   */
  showLoading(message) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;

    const interval = setInterval(() => {
      process.stdout.write(`\r${frames[i]} ${message}`);
      i = (i + 1) % frames.length;
    }, 100);

    return interval;
  }

  /**
   * 停止加载动画
   */
  stopLoading(interval, finalMessage) {
    clearInterval(interval);
    process.stdout.write(`\r${finalMessage}\n`);
  }

  /**
   * 运行后台复杂检查
   */
  async runComplexChecks() {
    const loader = this.showLoading('🔍 AI正在进行全面健康检查...');

    try {
      // 运行完整的质量检查（AI层的复杂逻辑）
      const output = execSync('pnpm quality:report', {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 120000, // 2分钟超时
      });

      this.stopLoading(loader, '✅ 健康检查完成');

      // 读取详细报告
      await this.parseDetailedReport();

      return true;
    } catch (error) {
      this.stopLoading(loader, '❌ 健康检查遇到问题');

      // 即使出错也尝试解析已有报告
      await this.parseDetailedReport();

      return false;
    }
  }

  /**
   * 解析详细报告，提取关键信息
   */
  async parseDetailedReport() {
    try {
      const reportPath = path.join(
        process.cwd(),
        'reports',
        'simple-quality-report.json',
      );

      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

        // 提取关键信息
        this.healthStatus.score = report.summary.overallScore || 0;
        this.healthStatus.issues = this.extractCriticalIssues(report);
        this.healthStatus.recommendations =
          this.extractTopRecommendations(report);
        this.healthStatus.canDeploy = this.assessDeploymentReadiness(report);
        this.healthStatus.overall = this.determineOverallHealth(report);
      }
    } catch (error) {
      console.warn('⚠️  无法读取详细报告，使用基础检查结果');
      this.healthStatus.overall = 'unknown';
    }
  }

  /**
   * 提取关键问题
   */
  extractCriticalIssues(report) {
    const issues = [];

    // 从检查结果中提取失败项
    if (report.checks) {
      report.checks.forEach((check) => {
        if (check.status === 'FAIL') {
          issues.push({
            type: 'quality',
            message: `${check.name  }失败`,
            severity: 'high',
          });
        }
      });
    }

    // 从安全报告中提取漏洞
    if (report.security && report.security.vulnerabilities > 0) {
      issues.push({
        type: 'security',
        message: `发现 ${report.security.vulnerabilities} 个安全漏洞`,
        severity: 'critical',
      });
    }

    // 从性能报告中提取问题
    if (report.performance && report.performance.issues > 0) {
      issues.push({
        type: 'performance',
        message: `发现 ${report.performance.issues} 个性能问题`,
        severity: 'medium',
      });
    }

    return issues.slice(0, 3); // 只显示前3个最重要的问题
  }

  /**
   * 提取顶级建议
   */
  extractTopRecommendations(report) {
    if (!report.recommendations) return [];

    return report.recommendations
      .filter((rec) => rec.priority === 'HIGH')
      .slice(0, 2)
      .map((rec) => rec.title);
  }

  /**
   * 评估部署就绪性
   */
  assessDeploymentReadiness(report) {
    // 基于分数和关键问题判断
    const score = report.summary.overallScore || 0;
    const criticalIssues = this.healthStatus.issues.filter(
      (issue) => issue.severity === 'critical',
    ).length;

    return score >= 70 && criticalIssues === 0;
  }

  /**
   * 确定整体健康状况
   */
  determineOverallHealth(report) {
    const score = report.summary.overallScore || 0;
    const failedChecks = report.summary.failedChecks || 0;

    if (score >= 90 && failedChecks === 0) return 'excellent';
    if (score >= 80 && failedChecks <= 1) return 'good';
    if (score >= 70 && failedChecks <= 2) return 'fair';
    if (score >= 50) return 'poor';
    return 'critical';
  }

  /**
   * 显示简单的健康状态
   */
  displaySimpleHealth() {
    console.log('\n🏥 项目健康状况');
    console.log('='.repeat(30));

    // 显示整体状态
    const statusIcons = {
      excellent: '🟢 优秀',
      good: '🟢 良好',
      fair: '🟡 一般',
      poor: '🟠 较差',
      critical: '🔴 危险',
      unknown: '⚪ 未知',
    };

    console.log(`状态: ${statusIcons[this.healthStatus.overall]}`);
    console.log(`评分: ${this.healthStatus.score}/100`);

    // 显示关键问题
    if (this.healthStatus.issues.length > 0) {
      console.log('\n🚨 需要关注的问题:');
      this.healthStatus.issues.forEach((issue, index) => {
        const severityIcon = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢',
        }[issue.severity];

        console.log(`${index + 1}. ${severityIcon} ${issue.message}`);
      });
    }

    // 显示部署状态
    console.log(
      `\n🚀 部署状态: ${this.healthStatus.canDeploy ? '✅ 可以部署' : '❌ 暂不建议部署'}`,
    );

    // 显示建议
    if (this.healthStatus.recommendations.length > 0) {
      console.log('\n💡 建议优先处理:');
      this.healthStatus.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // 显示详细报告提示
    console.log('\n📊 查看详细报告: pnpm report');
    console.log('🚀 检查部署就绪: pnpm ready');
  }

  /**
   * 执行健康检查
   */
  async checkHealth() {
    console.log('🎯 项目健康快速检查');
    console.log('='.repeat(30));

    const success = await this.runComplexChecks();
    this.displaySimpleHealth();

    // 返回简单的退出码
    const isHealthy =
      this.healthStatus.overall === 'excellent' ||
      this.healthStatus.overall === 'good';

    return isHealthy;
  }
}

// 命令行接口
if (require.main === module) {
  const checker = new ProjectHealthChecker();
  checker
    .checkHealth()
    .then((healthy) => {
      process.exit(healthy ? 0 : 1);
    })
    .catch((error) => {
      console.error(`❌ 健康检查失败: ${error.message}`);
      process.exit(1);
    });
}

module.exports = ProjectHealthChecker;
