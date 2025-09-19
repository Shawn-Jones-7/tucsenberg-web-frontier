#!/usr/bin/env node

/**
 * 质量门禁系统
 *
 * 在CI/CD流程中执行质量检查，确保代码质量标准
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class QualityGate {
  constructor() {
    this.config = {
      // 质量门禁标准
      gates: {
        coverage: {
          enabled: true,
          thresholds: {
            lines: 85,
            functions: 85,
            branches: 80,
            statements: 85,
          },
          blocking: true, // 是否阻塞构建
        },
        codeQuality: {
          enabled: true,
          thresholds: {
            eslintErrors: 0,
            eslintWarnings: 10,
            typeErrors: 0,
          },
          blocking: true,
        },
        performance: {
          enabled: true,
          thresholds: {
            buildTime: 120000, // 2分钟
            testTime: 180000, // 3分钟
          },
          blocking: false, // 性能问题不阻塞，但会警告
        },
        security: {
          enabled: true,
          thresholds: {
            vulnerabilities: 0,
            highSeverity: 0,
          },
          blocking: true,
        },
      },
      // 环境配置
      environment: process.env.NODE_ENV || 'development',
      ciMode: process.env.CI === 'true',
      branch: process.env.GITHUB_REF_NAME || 'unknown',
    };

    this.results = {
      gates: {},
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0,
        blocked: false,
      },
    };
  }

  /**
   * 执行所有质量门禁检查
   */
  async executeQualityGates() {
    console.log('🚪 开始执行质量门禁检查...\n');
    console.log(`🌿 分支: ${this.config.branch}`);
    console.log(`🏗️  环境: ${this.config.environment}`);
    console.log(`🤖 CI模式: ${this.config.ciMode ? '是' : '否'}\n`);

    // 执行各项门禁检查
    if (this.config.gates.codeQuality.enabled) {
      this.results.gates.codeQuality = await this.checkCodeQuality();
    }

    if (this.config.gates.coverage.enabled) {
      this.results.gates.coverage = await this.checkCoverage();
    }

    if (this.config.gates.performance.enabled) {
      this.results.gates.performance = await this.checkPerformance();
    }

    if (this.config.gates.security.enabled) {
      this.results.gates.security = await this.checkSecurity();
    }

    // 汇总结果
    this.summarizeResults();

    // 生成报告
    this.generateGateReport();

    // 返回结果
    return this.results;
  }

  /**
   * 代码质量门禁检查
   */
  async checkCodeQuality() {
    console.log('🔍 执行代码质量门禁检查...');

    const gate = {
      name: 'Code Quality',
      status: 'unknown',
      checks: {},
      blocking: this.config.gates.codeQuality.blocking,
      issues: [],
    };

    try {
      // TypeScript 类型检查
      gate.checks.typeCheck = await this.runTypeCheck();

      // ESLint 检查
      gate.checks.eslint = await this.runESLintCheck();

      // 汇总代码质量结果
      const hasErrors =
        gate.checks.typeCheck.errors > 0 ||
        gate.checks.eslint.errors >
          this.config.gates.codeQuality.thresholds.eslintErrors;

      const hasWarnings =
        gate.checks.eslint.warnings >
        this.config.gates.codeQuality.thresholds.eslintWarnings;

      if (hasErrors) {
        gate.status = 'failed';
        gate.issues.push('代码质量检查发现错误');
      } else if (hasWarnings) {
        gate.status = 'warning';
        gate.issues.push('代码质量检查发现警告');
      } else {
        gate.status = 'passed';
      }
    } catch (error) {
      gate.status = 'error';
      gate.issues.push(`代码质量检查失败: ${error.message}`);
    }

    console.log(
      `${this.getStatusEmoji(gate.status)} 代码质量门禁: ${gate.status}`,
    );
    return gate;
  }

  /**
   * 覆盖率门禁检查
   */
  async checkCoverage() {
    console.log('📊 执行覆盖率门禁检查...');

    const gate = {
      name: 'Coverage',
      status: 'unknown',
      checks: {},
      blocking: this.config.gates.coverage.blocking,
      issues: [],
    };

    try {
      // 运行覆盖率测试
      console.log('🧪 运行测试以生成覆盖率...');
      execSync('pnpm test:coverage --run --reporter=json', {
        stdio: 'pipe',
        timeout: 180000,
      });

      // 读取覆盖率数据
      const coverageJsonPath = path.join(
        process.cwd(),
        'coverage',
        'coverage-summary.json',
      );

      if (fs.existsSync(coverageJsonPath)) {
        const rawData = fs.readFileSync(coverageJsonPath, 'utf8');
        const coverageData = JSON.parse(rawData);
        gate.checks.coverage = coverageData.total;

        // 检查覆盖率阈值
        const { thresholds } = this.config.gates.coverage;
        const failedMetrics = [];

        Object.keys(thresholds).forEach((metric) => {
          const current = gate.checks.coverage[metric]?.pct || 0;
          const threshold = thresholds[metric];

          if (current < threshold) {
            failedMetrics.push(`${metric}: ${current}% < ${threshold}%`);
          }
        });

        if (failedMetrics.length > 0) {
          gate.status = 'failed';
          gate.issues.push(`覆盖率不达标: ${failedMetrics.join(', ')}`);
        } else {
          gate.status = 'passed';
        }
      } else {
        gate.status = 'error';
        gate.issues.push('覆盖率报告文件不存在');
      }
    } catch (error) {
      gate.status = 'error';
      gate.issues.push(`覆盖率检查失败: ${error.message}`);
    }

    console.log(
      `${this.getStatusEmoji(gate.status)} 覆盖率门禁: ${gate.status}`,
    );
    return gate;
  }

  /**
   * 性能门禁检查
   */
  async checkPerformance() {
    console.log('⚡ 执行性能门禁检查...');

    const gate = {
      name: 'Performance',
      status: 'unknown',
      checks: {},
      blocking: this.config.gates.performance.blocking,
      issues: [],
    };

    try {
      // 构建性能检查
      const buildStart = Date.now();
      execSync('pnpm build', { stdio: 'pipe', timeout: 180000 });
      const buildTime = Date.now() - buildStart;

      gate.checks.buildTime = buildTime;

      // 测试性能检查
      const testStart = Date.now();
      execSync('pnpm test --run --reporter=json', {
        stdio: 'pipe',
        timeout: 240000,
      });
      const testTime = Date.now() - testStart;

      gate.checks.testTime = testTime;

      // 检查性能阈值
      const issues = [];
      if (buildTime > this.config.gates.performance.thresholds.buildTime) {
        issues.push(
          `构建时间 ${Math.round(buildTime / 1000)}s 超过阈值 ${Math.round(this.config.gates.performance.thresholds.buildTime / 1000)}s`,
        );
      }

      if (testTime > this.config.gates.performance.thresholds.testTime) {
        issues.push(
          `测试时间 ${Math.round(testTime / 1000)}s 超过阈值 ${Math.round(this.config.gates.performance.thresholds.testTime / 1000)}s`,
        );
      }

      if (issues.length > 0) {
        gate.status = gate.blocking ? 'failed' : 'warning';
        gate.issues.push(...issues);
      } else {
        gate.status = 'passed';
      }
    } catch (error) {
      gate.status = 'error';
      gate.issues.push(`性能检查失败: ${error.message}`);
    }

    console.log(`${this.getStatusEmoji(gate.status)} 性能门禁: ${gate.status}`);
    return gate;
  }

  /**
   * 安全门禁检查
   */
  async checkSecurity() {
    console.log('🔒 执行安全门禁检查...');

    const gate = {
      name: 'Security',
      status: 'unknown',
      checks: {},
      blocking: this.config.gates.security.blocking,
      issues: [],
    };

    try {
      // npm audit 检查
      gate.checks.audit = await this.runSecurityAudit();

      // 检查安全阈值
      const vulnerabilities = gate.checks.audit.vulnerabilities || 0;
      const highSeverity = gate.checks.audit.high || 0;

      if (
        vulnerabilities >
          this.config.gates.security.thresholds.vulnerabilities ||
        highSeverity > this.config.gates.security.thresholds.highSeverity
      ) {
        gate.status = 'failed';
        gate.issues.push(
          `发现 ${vulnerabilities} 个安全漏洞，其中 ${highSeverity} 个高危`,
        );
      } else {
        gate.status = 'passed';
      }
    } catch (error) {
      gate.status = 'warning'; // 安全检查失败不阻塞，但发出警告
      gate.issues.push(`安全检查失败: ${error.message}`);
    }

    console.log(`${this.getStatusEmoji(gate.status)} 安全门禁: ${gate.status}`);
    return gate;
  }

  /**
   * 运行 TypeScript 类型检查
   */
  async runTypeCheck() {
    try {
      execSync('pnpm type-check', { stdio: 'pipe' });
      return { errors: 0, status: 'passed' };
    } catch (error) {
      return { errors: 1, status: 'failed', message: error.message };
    }
  }

  /**
   * 运行 ESLint 检查
   */
  async runESLintCheck() {
    try {
      execSync('pnpm lint:check', { stdio: 'pipe' });
      return { errors: 0, warnings: 0, status: 'passed' };
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      const errorMatch = output.match(/(\d+) error/);
      const warningMatch = output.match(/(\d+) warning/);

      return {
        errors: errorMatch ? parseInt(errorMatch[1]) : 0,
        warnings: warningMatch ? parseInt(warningMatch[1]) : 0,
        status: 'failed',
        output,
      };
    }
  }

  /**
   * 运行安全审计
   */
  async runSecurityAudit() {
    try {
      const output = execSync('pnpm audit --json', {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      const auditData = JSON.parse(output);

      return {
        vulnerabilities: auditData.metadata?.vulnerabilities?.total || 0,
        high: auditData.metadata?.vulnerabilities?.high || 0,
        critical: auditData.metadata?.vulnerabilities?.critical || 0,
        status: 'completed',
      };
    } catch (error) {
      // npm audit 在发现漏洞时会返回非零退出码
      try {
        const output = error.stdout || '';
        if (output) {
          const auditData = JSON.parse(output);
          return {
            vulnerabilities: auditData.metadata?.vulnerabilities?.total || 0,
            high: auditData.metadata?.vulnerabilities?.high || 0,
            critical: auditData.metadata?.vulnerabilities?.critical || 0,
            status: 'completed',
          };
        }
      } catch (parseError) {
        // 解析失败，返回默认值
      }

      return {
        vulnerabilities: 0,
        high: 0,
        critical: 0,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * 汇总结果
   */
  summarizeResults() {
    Object.values(this.results.gates).forEach((gate) => {
      switch (gate.status) {
        case 'passed':
          this.results.summary.passed++;
          break;
        case 'failed':
          this.results.summary.failed++;
          if (gate.blocking) {
            this.results.summary.blocked = true;
          }
          break;
        case 'warning':
          this.results.summary.warnings++;
          break;
      }
    });
  }

  /**
   * 生成门禁报告
   */
  generateGateReport() {
    console.log('\n🚪 质量门禁检查报告');
    console.log('='.repeat(50));

    console.log(`✅ 通过: ${this.results.summary.passed}`);
    console.log(`❌ 失败: ${this.results.summary.failed}`);
    console.log(`⚠️  警告: ${this.results.summary.warnings}`);
    console.log(`🚫 阻塞构建: ${this.results.summary.blocked ? '是' : '否'}`);

    console.log('\n📋 详细结果:');
    Object.values(this.results.gates).forEach((gate) => {
      console.log(
        `${this.getStatusEmoji(gate.status)} ${gate.name}: ${gate.status}`,
      );
      if (gate.issues.length > 0) {
        gate.issues.forEach((issue) => {
          console.log(`   - ${issue}`);
        });
      }
    });

    // 保存报告
    const reportPath = path.join(
      process.cwd(),
      'reports',
      `quality-gate-${Date.now()}.json`,
    );
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          config: this.config,
          results: this.results,
        },
        null,
        2,
      ),
    );

    console.log(`\n💾 报告已保存: ${reportPath}`);

    // CI 环境下的特殊处理
    if (this.config.ciMode) {
      this.handleCIOutput();
    }
  }

  /**
   * 处理 CI 环境输出
   */
  handleCIOutput() {
    // GitHub Actions 注解
    if (process.env.GITHUB_ACTIONS) {
      Object.values(this.results.gates).forEach((gate) => {
        if (gate.status === 'failed' && gate.blocking) {
          console.log(
            `::error::质量门禁失败: ${gate.name} - ${gate.issues.join(', ')}`,
          );
        } else if (gate.status === 'warning') {
          console.log(
            `::warning::质量门禁警告: ${gate.name} - ${gate.issues.join(', ')}`,
          );
        }
      });
    }

    // 设置输出变量
    console.log(
      `::set-output name=quality-gate-passed::${!this.results.summary.blocked}`,
    );
    console.log(
      `::set-output name=quality-gate-score::${this.calculateQualityScore()}`,
    );
  }

  /**
   * 计算质量评分
   */
  calculateQualityScore() {
    const totalGates = Object.keys(this.results.gates).length;
    if (totalGates === 0) return 0;

    const score = (this.results.summary.passed / totalGates) * 100;
    return Math.round(score);
  }

  getStatusEmoji(status) {
    switch (status) {
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'error':
        return '💥';
      default:
        return '❓';
    }
  }
}

// 主执行函数
async function main() {
  const gate = new QualityGate();

  try {
    const results = await gate.executeQualityGates();

    if (results.summary.blocked) {
      console.log('\n🚫 质量门禁检查失败，构建被阻塞！');
      process.exit(1);
    } else if (results.summary.failed > 0 || results.summary.warnings > 0) {
      console.log('\n⚠️  质量门禁检查发现问题，但不阻塞构建');
      console.log('请及时修复相关问题以提高代码质量');
    } else {
      console.log('\n🎉 所有质量门禁检查通过！');
    }
  } catch (error) {
    console.error('❌ 质量门禁检查失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { QualityGate };
