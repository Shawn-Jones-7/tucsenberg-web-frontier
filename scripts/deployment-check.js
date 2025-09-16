#!/usr/bin/env node

/**
 * 部署前检查器 - 确保代码可以安全部署到生产环境
 * Deployment Checker - Ensure code is safe for production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentChecker {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      deployment: {
        ready: false,
        score: 0,
        blockers: [],
        warnings: [],
      },
      checks: {
        build: { status: 'PENDING', message: '' },
        tests: { status: 'PENDING', message: '' },
        security: { status: 'PENDING', message: '' },
        performance: { status: 'PENDING', message: '' },
        quality: { status: 'PENDING', message: '' },
      },
    };
  }

  /**
   * 运行构建验证
   */
  async runBuildCheck() {
    try {
      console.log('🏗️  构建验证检查...');

      execSync('pnpm build:check', {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 120000, // 2分钟超时
      });

      this.report.checks.build = {
        status: 'PASS',
        message: '构建验证成功',
      };

      console.log('✅ 构建验证通过');
      return true;
    } catch (error) {
      this.report.checks.build = {
        status: 'FAIL',
        message: `构建失败: ${error.message.slice(0, 200)}...`,
      };

      this.report.deployment.blockers.push({
        type: 'build',
        severity: 'critical',
        message: '构建失败，无法部署',
        action: '修复构建错误后重试',
      });

      console.log('❌ 构建验证失败');
      return false;
    }
  }

  /**
   * 运行集成测试
   */
  async runIntegrationTests() {
    try {
      console.log('🧪 集成测试检查...');

      execSync('pnpm test', {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 60000, // 1分钟超时
      });

      this.report.checks.tests = {
        status: 'PASS',
        message: '所有测试通过',
      };

      console.log('✅ 集成测试通过');
      return true;
    } catch (error) {
      this.report.checks.tests = {
        status: 'FAIL',
        message: `测试失败: ${error.message.slice(0, 200)}...`,
      };

      this.report.deployment.blockers.push({
        type: 'tests',
        severity: 'critical',
        message: '集成测试失败',
        action: '修复失败的测试用例',
      });

      console.log('❌ 集成测试失败');
      return false;
    }
  }

  /**
   * 运行安全检查
   */
  async runSecurityCheck() {
    try {
      console.log('🔒 安全检查...');

      execSync('pnpm security:audit', {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 60000,
      });

      this.report.checks.security = {
        status: 'PASS',
        message: '安全检查通过',
      };

      console.log('✅ 安全检查通过');
      return true;
    } catch (error) {
      // 检查是否是严重安全问题
      if (
        error.message.includes('high') ||
        error.message.includes('critical')
      ) {
        this.report.checks.security = {
          status: 'FAIL',
          message: `发现严重安全漏洞: ${error.message.slice(0, 200)}...`,
        };

        this.report.deployment.blockers.push({
          type: 'security',
          severity: 'critical',
          message: '发现严重安全漏洞',
          action: '修复安全漏洞后重试部署',
        });

        console.log('❌ 安全检查失败');
        return false;
      } 
        // 轻微安全问题，警告但不阻塞
        this.report.checks.security = {
          status: 'WARN',
          message: `发现轻微安全问题: ${error.message.slice(0, 200)}...`,
        };

        this.report.deployment.warnings.push({
          type: 'security',
          severity: 'medium',
          message: '发现轻微安全问题',
          action: '建议在下次更新中修复',
        });

        console.log('⚠️  安全检查有警告');
        return true;
      
    }
  }

  /**
   * 运行性能检查
   */
  async runPerformanceCheck() {
    try {
      console.log('⚡ 性能检查...');

      execSync('pnpm perf:check', {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 60000,
      });

      this.report.checks.performance = {
        status: 'PASS',
        message: '性能检查通过',
      };

      console.log('✅ 性能检查通过');
      return true;
    } catch (error) {
      this.report.checks.performance = {
        status: 'WARN',
        message: `性能问题: ${error.message.slice(0, 200)}...`,
      };

      this.report.deployment.warnings.push({
        type: 'performance',
        severity: 'medium',
        message: '性能指标超出建议值',
        action: '考虑优化性能后部署',
      });

      console.log('⚠️  性能检查有警告');
      return true; // 性能问题不阻塞部署，但发出警告
    }
  }

  /**
   * 运行质量检查
   */
  async runQualityCheck() {
    try {
      console.log('📊 质量检查...');

      execSync('pnpm quality:quick:verbose', {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 60000,
      });

      this.report.checks.quality = {
        status: 'PASS',
        message: '质量检查通过',
      };

      console.log('✅ 质量检查通过');
      return true;
    } catch (error) {
      this.report.checks.quality = {
        status: 'WARN',
        message: `质量问题: ${error.message.slice(0, 200)}...`,
      };

      this.report.deployment.warnings.push({
        type: 'quality',
        severity: 'low',
        message: '代码质量有改进空间',
        action: '建议修复质量问题',
      });

      console.log('⚠️  质量检查有警告');
      return true; // 质量问题不阻塞部署，但发出警告
    }
  }

  /**
   * 计算部署就绪分数
   */
  calculateDeploymentScore() {
    let score = 100;

    // 阻塞性问题严重扣分
    this.report.deployment.blockers.forEach((blocker) => {
      score -= 50; // 每个阻塞性问题扣50分
    });

    // 警告问题轻微扣分
    this.report.deployment.warnings.forEach((warning) => {
      switch (warning.severity) {
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    this.report.deployment.score = Math.max(0, score);
    this.report.deployment.ready =
      score >= 80 && this.report.deployment.blockers.length === 0;
  }

  /**
   * 生成部署报告
   */
  generateReport() {
    this.calculateDeploymentScore();

    console.log('\n🚀 部署就绪检查报告');
    console.log('='.repeat(50));
    console.log(`📊 部署就绪分数: ${this.report.deployment.score}/100`);
    console.log(
      `🎯 部署状态: ${this.report.deployment.ready ? '✅ 可以部署' : '❌ 不可部署'}`,
    );
    console.log(`🚨 阻塞问题: ${this.report.deployment.blockers.length} 个`);
    console.log(`⚠️  警告问题: ${this.report.deployment.warnings.length} 个`);

    if (this.report.deployment.blockers.length > 0) {
      console.log('\n🚨 阻塞性问题（必须修复）:');
      this.report.deployment.blockers.forEach((blocker, index) => {
        console.log(
          `${index + 1}. [${blocker.severity.toUpperCase()}] ${blocker.message}`,
        );
        console.log(`   解决方案: ${blocker.action}`);
      });
    }

    if (this.report.deployment.warnings.length > 0) {
      console.log('\n⚠️  警告问题（建议修复）:');
      this.report.deployment.warnings.forEach((warning, index) => {
        console.log(
          `${index + 1}. [${warning.severity.toUpperCase()}] ${warning.message}`,
        );
        console.log(`   建议: ${warning.action}`);
      });
    }

    // 保存报告
    this.saveReport();

    return this.report.deployment.ready;
  }

  /**
   * 保存报告到文件
   */
  saveReport() {
    try {
      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const reportPath = path.join(reportsDir, 'deployment-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));

      console.log(`\n📄 部署报告已保存: ${reportPath}`);
    } catch (error) {
      console.warn(`⚠️  保存报告失败: ${error.message}`);
    }
  }

  /**
   * 执行完整的部署前检查
   */
  async runDeploymentCheck() {
    console.log('🚀 开始部署前检查...\n');

    // 按重要性顺序执行检查
    const checks = [
      () => this.runBuildCheck(),
      () => this.runIntegrationTests(),
      () => this.runSecurityCheck(),
      () => this.runPerformanceCheck(),
      () => this.runQualityCheck(),
    ];

    for (const check of checks) {
      await check();
      // 如果有阻塞性问题，提前结束
      if (this.report.deployment.blockers.length > 0) {
        console.log('\n⚠️  发现阻塞性问题，停止后续检查');
        break;
      }
    }

    return this.generateReport();
  }
}

// 命令行接口
if (require.main === module) {
  const checker = new DeploymentChecker();
  checker
    .runDeploymentCheck()
    .then((ready) => {
      if (ready) {
        console.log('\n🎉 部署前检查通过！可以安全部署到生产环境。');
      } else {
        console.log('\n❌ 部署前检查失败！请修复问题后重试。');
      }
      process.exit(ready ? 0 : 1);
    })
    .catch((error) => {
      console.error(`❌ 部署检查执行失败: ${error.message}`);
      process.exit(1);
    });
}

module.exports = DeploymentChecker;
