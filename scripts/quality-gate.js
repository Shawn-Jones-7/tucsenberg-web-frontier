#!/usr/bin/env node

/**
 * 质量门禁系统
 *
 * 在CI/CD流程中执行质量检查，确保代码质量标准
 *
 * 运行模式：
 * - 完整模式 (默认): node scripts/quality-gate.js
 *   执行所有检查：代码质量、覆盖率、性能、安全
 *
 * - 快速模式: node scripts/quality-gate.js --mode=fast
 *   仅执行快速检查：代码质量、安全（跳过覆盖率和性能测试）
 *   适用于本地 pre-push hook，保持 <2 分钟的快速反馈
 *
 * 覆盖率检查行为：
 * - CI 环境（CI=true）或 --skip-test-run 参数：
 *   仅读取已有覆盖率报告（reports/coverage/coverage-summary.json）
 *   确保 CI 中 pnpm test:coverage 只执行一次
 *
 * - 本地环境（无参数）：
 *   执行 pnpm test:coverage 生成覆盖率报告
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync, spawnSync } = require('child_process');

// 解析命令行参数
const args = process.argv.slice(2);
const isFastMode = args.includes('--mode=fast');
const isFullMode = args.includes('--mode=full') || !isFastMode;
const isJsonOutput = args.includes('--output=json') || args.includes('--json');
const isSilent = args.includes('--silent');

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

// 日志输出函数 - 支持静默模式
function log(...args) {
  if (!isSilent && !isJsonOutput) {
    console.log(...args);
  }
}

class QualityGate {
  constructor() {
    this.config = {
      // 运行模式
      fastMode: isFastMode,
      fullMode: isFullMode,
      jsonOutput: isJsonOutput,
      silent: isSilent,
      // 质量门禁标准
      gates: {
        coverage: {
          enabled: isFullMode, // 快速模式下禁用覆盖率检查
          // Phase 1 渐进式覆盖率目标（≥65%），与 .augment/rules 规范对齐
          // 当前实际覆盖率 ~72%，目标路线：Phase 2 (75%) → Phase 3 (80%)
          thresholds: {
            lines: 65,
            functions: 65,
            branches: 65,
            statements: 65,
          },
          blocking: true, // 启用阻断模式：覆盖率不达标时阻塞构建
          diffCoverageThreshold: 90, // 增量覆盖率阈值：变更代码需达到90%覆盖率
          diffWarningThreshold: 1.5, // 变更覆盖率较全量下降超过该阈值触发 warning（目标 1-2% 区间）
        },
        codeQuality: {
          enabled: true, // 始终启用代码质量检查
          thresholds: {
            eslintErrors: 0,
            eslintWarnings: 10,
            typeErrors: 0,
          },
          blocking: false, // 渐进式改进：代码质量问题警告但不阻塞
        },
        performance: {
          enabled: isFullMode, // 快速模式下禁用性能检查（避免重复构建和测试）
          thresholds: {
            buildTime: 120000, // 2分钟
            testTime: 180000, // 3分钟
          },
          blocking: false, // 性能问题不阻塞，但会警告
        },
        security: {
          enabled: true, // 始终启用安全检查（速度快）
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

  getChangedFiles(filter = 'ACM', options = {}) {
    const { includeStatus = false } = options;
    const base = this.getMergeBase();
    const range = base ? `${base}...HEAD` : '';
    const nameFlag = includeStatus ? '--name-status' : '--name-only';
    const cmd = base
      ? `git diff ${nameFlag} --diff-filter=${filter} ${range}`
      : `git diff ${nameFlag} --diff-filter=${filter}`;
    try {
      const output = execSync(cmd, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .toString()
        .trim();
      if (!output) return [];
      if (!includeStatus) return output.split('\n');
      return output
        .split('\n')
        .map((line) => {
          const parts = line.split('\t');
          const status = (parts[0] || '')[0] || '';
          const file = parts[parts.length - 1] || '';
          if (!status || !file) return null;
          return { status, file };
        })
        .filter(Boolean);
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
    // Include R (renamed) files - treat as modified
    const changedEntries = this.getChangedFiles('ACMR', {
      includeStatus: true,
    }).filter((entry) => entry.file.match(/\.(js|jsx|ts|tsx)$/));

    const addedFiles = changedEntries
      .filter((e) => e.status === 'A' || e.status === 'C')
      .map((e) => e.file);
    // R (renamed) files are treated as modified
    const modifiedFiles = changedEntries
      .filter((e) => e.status === 'M' || e.status === 'R')
      .map((e) => e.file);

    if (addedFiles.length === 0 && modifiedFiles.length === 0) return null;

    const entries = this.normalizeCoverageEntries(coverageData);

    const calculateForFiles = (files) => {
      const fileMetrics = [];
      let totalCovered = 0;
      let totalLines = 0;

      files.forEach((file) => {
        const summary = entries.get(file);
        const fileCovered = summary?.lines?.covered || 0;
        const fileTotal = summary?.lines?.total || 0;
        const filePct = fileTotal > 0 ? (fileCovered / fileTotal) * 100 : 0;

        fileMetrics.push({
          file,
          covered: fileCovered,
          total: fileTotal,
          pct: filePct,
        });
        totalCovered += fileCovered;
        totalLines += fileTotal;
      });

      const pct = totalLines > 0 ? (totalCovered / totalLines) * 100 : 0;
      return {
        pct,
        fileMetrics,
        totalCovered,
        totalLines,
        filesCount: files.length,
      };
    };

    const added = calculateForFiles(addedFiles);
    const modified = calculateForFiles(modifiedFiles);
    const allFiles = [...new Set([...addedFiles, ...modifiedFiles])];
    const total = calculateForFiles(allFiles);
    const overall = coverageData?.total?.lines?.pct || total.pct;

    return { overall, drop: overall - total.pct, added, modified, total };
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
    log('🚪 开始执行质量门禁检查...\n');
    log(`🌿 分支: ${this.config.branch}`);
    log(`🏗️  环境: ${this.config.environment}`);
    log(`🤖 CI模式: ${this.config.ciMode ? '是' : '否'}`);
    log(`⚡ 运行模式: ${this.config.fastMode ? '快速 (--mode=fast)' : '完整'}`);
    if (this.config.fastMode) {
      log('   跳过: 覆盖率检查、性能测试（将在 CI 中执行）');
    }
    log('');

    // 执行各项门禁检查
    if (this.config.gates.codeQuality.enabled) {
      this.results.gates.codeQuality = await this.checkCodeQuality();
    }

    if (this.config.gates.coverage.enabled) {
      this.results.gates.coverage = await this.checkCoverage();
    } else {
      this.results.gates.coverage = {
        name: 'Coverage',
        status: 'skipped',
        checks: {},
        blocking: false,
        issues: ['快速模式下跳过覆盖率检查'],
      };
    }

    if (this.config.gates.performance.enabled) {
      this.results.gates.performance = await this.checkPerformance();
    } else {
      this.results.gates.performance = {
        name: 'Performance',
        status: 'skipped',
        checks: {},
        blocking: false,
        issues: ['快速模式下跳过性能测试'],
      };
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
    log('🔍 执行代码质量门禁检查...');

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

    log(`${this.getStatusEmoji(gate.status)} 代码质量门禁: ${gate.status}`);
    return gate;
  }

  /**
   * 覆盖率门禁检查
   *
   * 支持两种模式：
   * - CI 环境（CI=true 或 --skip-test-run）：仅读取已有覆盖率报告
   * - 本地环境：执行测试并生成覆盖率报告
   *
   * 这确保 CI 中覆盖率测试只执行一次（由 tests job 生成），
   * quality-gate 仅负责阈值检查和阻断决策。
   */
  async checkCoverage() {
    log('📊 执行覆盖率门禁检查...');

    const gate = {
      name: 'Coverage',
      status: 'unknown',
      checks: {},
      blocking: this.config.gates.coverage.blocking,
      issues: [],
    };

    // 检查是否应跳过测试执行（CI 环境或显式参数）
    const skipTestRun = this.config.ciMode || args.includes('--skip-test-run');

    try {
      // 检查是否已有覆盖率报告
      let coverageJsonPath = this.findCoverageSummaryPath();

      if (skipTestRun) {
        // CI 模式：仅读取已有报告
        log('📖 CI 模式：读取已有覆盖率报告...');
        if (!coverageJsonPath) {
          gate.status = 'error';
          gate.issues.push(
            '覆盖率报告不存在。请确保在调用 quality:gate 前已执行 pnpm test:coverage',
          );
          log(`${this.getStatusEmoji(gate.status)} 覆盖率门禁: ${gate.status}`);
          return gate;
        }
      } else {
        // 本地模式：运行覆盖率测试
        log('🧪 运行测试以生成覆盖率...');
        const coverageTimeout =
          Number(process.env.QUALITY_COVERAGE_TIMEOUT_MS) || 480000; // 8min default
        execSync('pnpm test:coverage --run --reporter=json', {
          stdio: 'pipe',
          timeout: coverageTimeout,
          maxBuffer: 50 * 1024 * 1024, // 50MB to handle long test output
        });
        // 重新查找报告路径
        coverageJsonPath = this.findCoverageSummaryPath();
      }

      // 读取覆盖率数据

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

        // 增量覆盖率检查（diff coverage）
        // 策略：新增文件强制阻断，修改文件仅警告
        const diffCoverage = this.calculateDiffCoverage(coverageData);
        if (diffCoverage) {
          const threshold = this.config.gates.coverage.diffCoverageThreshold;
          const warningThreshold =
            this.config.gates.coverage.diffWarningThreshold;

          // 新增文件：强制 90% 覆盖率（阻断）
          // 排除无可测代码的文件（如 barrel/index 文件，0/0 行）
          const lowAddedFiles = diffCoverage.added.fileMetrics.filter(
            (f) => f.total > 0 && f.pct < threshold,
          );
          if (lowAddedFiles.length > 0) {
            gate.status = gate.blocking ? 'failed' : 'warning';
            gate.issues.push(
              `新增文件覆盖率不达标: ${lowAddedFiles.length}/${diffCoverage.added.filesCount} 个新增文件 < ${threshold}%（加权覆盖率 ${diffCoverage.added.pct.toFixed(2)}%，${diffCoverage.added.totalCovered}/${diffCoverage.added.totalLines} 行覆盖）`,
            );
            if (lowAddedFiles.length > 5) {
              gate.issues.push(
                `  共 ${lowAddedFiles.length} 个新增文件覆盖率不达标（仅显示前5个）`,
              );
            }
            lowAddedFiles.slice(0, 5).forEach((f) => {
              gate.issues.push(
                `  - ${f.file}: ${f.pct.toFixed(2)}% (${f.covered}/${f.total})`,
              );
            });
          }

          // 修改文件：仅警告，不阻断（避免历史债务阻断）
          // 排除无可测代码的文件（如 barrel/index 文件，0/0 行）
          const lowModifiedFiles = diffCoverage.modified.fileMetrics.filter(
            (f) => f.total > 0 && f.pct < threshold,
          );
          if (lowModifiedFiles.length > 0) {
            gate.status = gate.status === 'passed' ? 'warning' : gate.status;
            gate.issues.push(
              `修改文件覆盖率低于阈值（仅警告，不阻断）: ${lowModifiedFiles.length}/${diffCoverage.modified.filesCount} 个文件 < ${threshold}%（加权覆盖率 ${diffCoverage.modified.pct.toFixed(2)}%，${diffCoverage.modified.totalCovered}/${diffCoverage.modified.totalLines} 行覆盖）`,
            );
            if (lowModifiedFiles.length > 5) {
              gate.issues.push(
                `  共 ${lowModifiedFiles.length} 个修改文件覆盖率低于阈值（仅显示前5个）`,
              );
            }
            lowModifiedFiles.slice(0, 5).forEach((f) => {
              gate.issues.push(
                `  - ${f.file}: ${f.pct.toFixed(2)}% (${f.covered}/${f.total})`,
              );
            });
          }

          // 检查增量覆盖率下降幅度
          if (diffCoverage.drop > warningThreshold) {
            gate.status = gate.status === 'passed' ? 'warning' : gate.status;
            gate.issues.push(
              `增量覆盖率较全量下降 ${diffCoverage.drop.toFixed(2)}%（增量 ${diffCoverage.total.pct.toFixed(2)}% vs 全量 ${(coverageData.total?.lines?.pct || 0).toFixed(2)}%）`,
            );
          }
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

    log(`${this.getStatusEmoji(gate.status)} 覆盖率门禁: ${gate.status}`);
    return gate;
  }

  /**
   * 性能门禁检查
   */
  async checkPerformance() {
    log('⚡ 执行性能门禁检查...');

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
      const perfTestTimeout =
        Number(process.env.QUALITY_PERF_TEST_TIMEOUT_MS) || 360000; // 6min default
      execSync('pnpm test --run --reporter=json', {
        stdio: 'pipe',
        timeout: perfTestTimeout,
        maxBuffer: 50 * 1024 * 1024, // 50MB to handle long test output
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

    log(`${this.getStatusEmoji(gate.status)} 性能门禁: ${gate.status}`);
    return gate;
  }

  /**
   * 安全门禁检查
   */
  async checkSecurity() {
    log('🔒 执行安全门禁检查...');

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

    log(`${this.getStatusEmoji(gate.status)} 安全门禁: ${gate.status}`);
    return gate;
  }

  /**
   * 运行 TypeScript 类型检查
   */
  async runTypeCheck() {
    try {
      execSync('pnpm type-check', {
        stdio: 'pipe',
        maxBuffer: 20 * 1024 * 1024, // 20MB for potential many type errors
      });
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
        maxBuffer: 10 * 1024 * 1024, // 10MB for audit results
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
        case 'error':
          this.results.summary.failed++;
          if (gate.blocking) {
            this.results.summary.blocked = true;
          }
          break;
        case 'warning':
          this.results.summary.warnings++;
          break;
        case 'skipped':
          // skipped 状态不计入通过/失败，仅记录
          if (!this.results.summary.skipped) {
            this.results.summary.skipped = 0;
          }
          this.results.summary.skipped++;
          break;
      }
    });
  }

  /**
   * 生成门禁报告
   */
  generateGateReport() {
    // JSON 输出模式：仅输出 JSON 到 stdout
    if (this.config.jsonOutput) {
      return this.generateJsonReport();
    }

    log('\n🚪 质量门禁检查报告');
    log('='.repeat(50));

    log(`✅ 通过: ${this.results.summary.passed}`);
    log(`❌ 失败: ${this.results.summary.failed}`);
    log(`⚠️  警告: ${this.results.summary.warnings}`);
    if (this.results.summary.skipped) {
      log(`⏭️  跳过: ${this.results.summary.skipped}`);
    }
    log(`🚫 阻塞构建: ${this.results.summary.blocked ? '是' : '否'}`);

    log('\n📋 详细结果:');
    Object.values(this.results.gates).forEach((gate) => {
      log(`${this.getStatusEmoji(gate.status)} ${gate.name}: ${gate.status}`);
      if (gate.issues && gate.issues.length > 0) {
        gate.issues.forEach((issue) => {
          log(`   - ${issue}`);
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

    log(`\n💾 报告已保存: ${reportPath}`);

    // CI 环境下的特殊处理
    if (this.config.ciMode) {
      this.handleCIOutput();
    }
  }

  /**
   * 生成 JSON 格式报告（用于 CI 消费）
   */
  generateJsonReport() {
    const report = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      mode: this.config.fastMode ? 'fast' : 'full',
      branch: this.config.branch,
      environment: this.config.environment,
      ci: this.config.ciMode,
      summary: {
        passed: this.results.summary.passed,
        failed: this.results.summary.failed,
        warnings: this.results.summary.warnings,
        skipped: this.results.summary.skipped || 0,
        blocked: this.results.summary.blocked,
        score: this.calculateQualityScore(),
      },
      thresholds: {
        coverage: this.config.gates.coverage.thresholds,
        codeQuality: this.config.gates.codeQuality.thresholds,
        security: this.config.gates.security.thresholds,
      },
      gates: {},
    };

    // 格式化每个门禁的结果
    Object.entries(this.results.gates).forEach(([key, gate]) => {
      report.gates[key] = {
        name: gate.name,
        status: gate.status,
        blocking: gate.blocking,
        issues: gate.issues || [],
        checks: gate.checks || {},
      };
    });

    // 输出 JSON 到 stdout（便于 CI 捕获）
    console.log(JSON.stringify(report, null, 2));

    // 同时保存到文件
    const reportPath = path.join(
      process.cwd(),
      'reports',
      'quality-gate-latest.json',
    );
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
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
      case 'skipped':
        return '⏭️';
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

    // JSON 输出模式：静默退出（状态已通过 JSON 传递）
    if (isJsonOutput) {
      process.exit(results.summary.blocked ? 1 : 0);
    }

    if (results.summary.blocked) {
      log('\n🚫 质量门禁检查失败，构建被阻塞！');
      process.exit(1);
    } else if (results.summary.failed > 0 || results.summary.warnings > 0) {
      log('\n⚠️  质量门禁检查发现问题，但不阻塞构建');
      log('请及时修复相关问题以提高代码质量');
    } else {
      log('\n🎉 所有质量门禁检查通过！');
    }
  } catch (error) {
    if (isJsonOutput) {
      console.log(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            error: true,
            message: error.message,
            summary: {
              blocked: true,
              passed: 0,
              failed: 1,
              warnings: 0,
              skipped: 0,
              score: 0,
            },
            gates: {},
          },
          null,
          2,
        ),
      );
      process.exit(1);
    }
    console.error('❌ 质量门禁检查失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { QualityGate };
