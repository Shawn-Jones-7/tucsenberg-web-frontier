#!/usr/bin/env node

/**
 * 质量门禁系统
 *
 * 在CI/CD流程中执行质量检查，确保代码质量标准
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync, spawnSync } = require('child_process');

const ESLINT_PACKAGE_PATH = require.resolve('eslint/package.json');
const ESLINT_CLI_PATH = path.join(
  path.dirname(ESLINT_PACKAGE_PATH),
  'bin',
  'eslint.js',
);
const ESLINT_BASE_ARGS = [
  '.',
  '--ext',
  '.js,.jsx,.ts,.tsx',
  '--config',
  'eslint.config.mjs',
  '--cache',
  '--cache-location',
  '.eslintcache',
];

function parseEslintJsonOutput(rawOutput) {
  if (typeof rawOutput !== 'string') {
    throw new Error('ESLint output is not a string');
  }

  const trimmed = rawOutput.trim();
  const start = trimmed.indexOf('[');
  const end = trimmed.lastIndexOf(']');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Unable to locate ESLint JSON payload in output');
  }

  const jsonText = trimmed.slice(start, end + 1);
  return JSON.parse(jsonText);
}

function runEslintWithJson() {
  const result = spawnSync(
    process.execPath,
    [ESLINT_CLI_PATH, ...ESLINT_BASE_ARGS, '--format', 'json'],
    {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB
    },
  );

  if (result.error) {
    throw result.error;
  }

  const rawOutput = (result.stdout || result.stderr || '').toString();
  const lintResults = parseEslintJsonOutput(rawOutput);

  return {
    lintResults,
    exitCode: result.status ?? 0,
    rawOutput,
  };
}

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
          blocking: false, // 渐进式改进：覆盖率不达标时警告但不阻塞
          diffWarningThreshold: 2, // 变更覆盖率较全量下降超过该阈值触发 warning
        },
        codeQuality: {
          enabled: true,
          thresholds: {
            eslintErrors: 0,
            eslintWarnings: 10,
            typeErrors: 0,
          },
          blocking: false, // 渐进式改进：代码质量问题警告但不阻塞
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
      pilotDomain: {
        prefix: 'src/lib/web-vitals/',
        testGlobs: [
          '**/*.test.{ts,tsx}',
          '**/*.spec.{ts,tsx}',
          '**/__tests__/**/*.{ts,tsx}',
        ],
      },
      diffBaseRef: process.env.QUALITY_DIFF_BASE || 'origin/main',
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

  getMergeBase() {
    const candidates = [this.config.diffBaseRef, 'origin/main', 'main'];
    for (const ref of candidates) {
      if (!ref) continue;
      try {
        const base = execSync(`git merge-base HEAD ${ref}`, {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        })
          .toString()
          .trim();
        if (base) return base;
      } catch {
        // ignore
      }
    }
    try {
      return execSync('git rev-parse HEAD~1', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .toString()
        .trim();
    } catch {
      return '';
    }
  }

  getChangedFiles(filter = 'ACM') {
    const base = this.getMergeBase();
    const range = base ? `${base}...HEAD` : '';
    const cmd = base
      ? `git diff --name-only --diff-filter=${filter} ${range}`
      : `git diff --name-only --diff-filter=${filter}`;
    try {
      const output = execSync(cmd, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .toString()
        .trim();
      if (!output) return [];
      return output.split('\n');
    } catch {
      return [];
    }
  }

  findCoverageSummaryPath() {
    const candidates = [
      path.join(process.cwd(), 'reports', 'coverage', 'coverage-summary.json'),
      path.join(process.cwd(), 'coverage', 'coverage-summary.json'),
    ];
    return candidates.find((p) => fs.existsSync(p));
  }

  normalizeCoverageEntries(coverageData) {
    const entries = new Map();
    Object.keys(coverageData || {})
      .filter((key) => key !== 'total')
      .forEach((key) => {
        const rel = path.relative(process.cwd(), key);
        entries.set(rel, coverageData[key]);
        entries.set(key, coverageData[key]);
      });
    return entries;
  }

  calculateDiffCoverage(coverageData) {
    const changedFiles = this.getChangedFiles('ACM').filter((file) =>
      file.match(/\.(js|jsx|ts|tsx)$/),
    );
    if (changedFiles.length === 0) return null;

    const entries = this.normalizeCoverageEntries(coverageData);
    let covered = 0;
    let total = 0;

    changedFiles.forEach((file) => {
      const summary = entries.get(file);
      if (summary?.lines?.total) {
        covered += summary.lines.covered || 0;
        total += summary.lines.total || 0;
      }
    });

    if (total === 0) return { pct: 0, drop: 0 };

    const pct = (covered / total) * 100;
    const overall = coverageData?.total?.lines?.pct || pct;
    return {
      pct,
      drop: overall - pct,
    };
  }

  getAddedPilotDomainFiles() {
    const added = this.getChangedFiles('A');
    const prefix = this.config.pilotDomain.prefix;
    if (!prefix) return [];
    return added.filter(
      (file) =>
        file.startsWith(prefix) && !file.match(/\.(test|spec)\.(ts|tsx)$/),
    );
  }

  hasTestForFile(filePath) {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, path.extname(filePath));
    const candidates = [
      path.join(dir, `${base}.test.ts`),
      path.join(dir, `${base}.test.tsx`),
      path.join(dir, `${base}.spec.ts`),
      path.join(dir, `${base}.spec.tsx`),
      path.join(dir, '__tests__', `${base}.test.ts`),
      path.join(dir, '__tests__', `${base}.spec.ts`),
      path.join(dir, '__tests__', `${base}.test.tsx`),
      path.join(dir, '__tests__', `${base}.spec.tsx`),
    ];

    if (candidates.some((p) => fs.existsSync(p))) {
      return true;
    }

    const globs = (this.config.pilotDomain.testGlobs || []).map((pattern) =>
      path.join(dir, pattern),
    );
    return globs.some((pattern) => glob.sync(pattern).length > 0);
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
      const coverageJsonPath = this.findCoverageSummaryPath();

      if (coverageJsonPath && fs.existsSync(coverageJsonPath)) {
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
          gate.status = gate.blocking ? 'failed' : 'warning';
          gate.issues.push(`覆盖率不达标: ${failedMetrics.join(', ')}`);
        } else {
          gate.status = 'passed';
        }

        // 变更覆盖率对比（diff coverage）
        const diffCoverage = this.calculateDiffCoverage(coverageData);
        if (
          diffCoverage &&
          diffCoverage.drop > this.config.gates.coverage.diffWarningThreshold
        ) {
          gate.status = gate.status === 'passed' ? 'warning' : gate.status;
          gate.issues.push(
            `变更覆盖率下降 ${diffCoverage.drop.toFixed(2)}%（变更 ${diffCoverage.pct.toFixed(2)}% vs 全量 ${(coverageData.total?.lines?.pct || 0).toFixed(2)}%）`,
          );
        }
      } else {
        gate.status = 'error';
        gate.issues.push('覆盖率报告文件不存在');
      }
    } catch (error) {
      gate.status = gate.blocking ? 'error' : 'warning';
      gate.issues.push(`覆盖率检查失败: ${error.message}`);
    }

    // 试点域（web-vitals）新增文件需配套测试的提示
    const addedPilotFiles = this.getAddedPilotDomainFiles();
    const missingTests = addedPilotFiles.filter(
      (file) => !this.hasTestForFile(file),
    );
    if (missingTests.length > 0) {
      gate.status = gate.status === 'passed' ? 'warning' : gate.status;
      gate.issues.push(
        `试点域缺少测试（新增文件未找到配套测试）: ${missingTests.join(', ')}`,
      );
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
      // 使用 spawnSync 捕获 stdout + stderr，确保能识别写入 stderr 的 i18n 报错
      const buildRes = spawnSync('pnpm', ['build'], {
        encoding: 'utf8',
        shell: true,
        maxBuffer: 50 * 1024 * 1024,
      });
      const buildOutput = (buildRes.stdout || '') + (buildRes.stderr || '');
      const buildTime = Date.now() - buildStart;

      gate.checks.buildTime = buildTime;

      // 构建失败时直接阻断并输出节选日志，便于诊断
      if (typeof buildRes.status === 'number' && buildRes.status !== 0) {
        gate.issues.push(`构建失败（退出码 ${buildRes.status}）`);
        gate.issues.push('构建输出（节选）：');
        gate.issues.push(buildOutput.slice(0, 2000));
        gate.status = 'failed';
        gate.blocking = true;
      } else {
        // Zero-tolerance i18n smoke test: fail if next-intl reports missing messages（stdout 或 stderr 均可识别）
        if (/MISSING_MESSAGE/i.test(buildOutput)) {
          gate.issues.push('next-intl MISSING_MESSAGE detected in build logs');
          gate.status = 'failed';
          gate.blocking = true; // enforce blocking when i18n is broken
        }
      }

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
      gate.status = gate.blocking ? 'error' : 'warning';
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
      const { lintResults, exitCode } = runEslintWithJson();
      const totals = lintResults.reduce(
        (acc, fileResult) => {
          acc.errors += fileResult.errorCount || 0;
          acc.warnings += fileResult.warningCount || 0;
          return acc;
        },
        { errors: 0, warnings: 0 },
      );

      return {
        ...totals,
        status: exitCode === 0 && totals.errors === 0 ? 'passed' : 'failed',
      };
    } catch (error) {
      return {
        errors: 0,
        warnings: 0,
        status: 'error',
        message: error.message,
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
