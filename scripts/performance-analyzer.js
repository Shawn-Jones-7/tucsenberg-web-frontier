#!/usr/bin/env node

/**
 * 性能分析器 - 监控打包大小、加载时间和内存使用
 * Performance Analyzer - Monitor bundle size, load time and memory usage
 *
 * 新增功能：
 * - 性能基准对比
 * - 回归检测
 * - CI/CD集成
 * - 详细的性能报告
 * - 性能趋势分析
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceAnalyzer {
  constructor(options = {}) {
    this.options = {
      saveBaseline: options.saveBaseline || false,
      compareWithBaseline: options.compareWithBaseline || false,
      baselineFile: options.baselineFile || 'performance-baseline.json',
      ciMode: options.ciMode || false,
      ...options,
    };

    this.report = {
      timestamp: new Date().toISOString(),
      performance: {
        bundleSize: {},
        loadTime: {},
        memoryUsage: {},
        score: 0,
        webVitals: {},
      },
      limits: {
        mainBundle: 50 * 1024, // 50KB
        totalBundle: 260 * 1024, // 260KB
        loadTime: 3000, // 3秒
        memoryUsage: 50 * 1024 * 1024, // 50MB
        regressionThreshold: 10, // 10% 回归阈值
      },
      baseline: null,
      regression: {
        detected: false,
        details: [],
      },
      passed: true,
      issues: [],
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        ci: process.env.CI || false,
        branch: this.getCurrentBranch(),
        commit: this.getCurrentCommit(),
      },
    };
  }

  /**
   * 分析打包文件大小
   */
  analyzeBundleSize() {
    try {
      console.log('📦 分析打包文件大小...');

      const nextDir = path.join(process.cwd(), '.next');
      if (!fs.existsSync(nextDir)) {
        throw new Error('未找到构建文件，请先运行 pnpm build');
      }

      // 分析静态文件大小
      const staticDir = path.join(nextDir, 'static');
      if (fs.existsSync(staticDir)) {
        const chunks = this.getChunkSizes(staticDir);
        this.report.performance.bundleSize = chunks;

        // 检查主包大小
        const mainBundleSize = chunks.main || 0;
        if (mainBundleSize > this.report.limits.mainBundle) {
          this.report.passed = false;
          this.report.issues.push({
            type: 'bundle-size',
            severity: 'high',
            message: `主包大小 ${this.formatBytes(mainBundleSize)} 超出限制 ${this.formatBytes(this.report.limits.mainBundle)}`,
          });
        }

        // 检查总包大小
        const totalSize = Object.values(chunks).reduce(
          (sum, size) => sum + size,
          0,
        );
        if (totalSize > this.report.limits.totalBundle) {
          this.report.passed = false;
          this.report.issues.push({
            type: 'bundle-size',
            severity: 'medium',
            message: `总包大小 ${this.formatBytes(totalSize)} 超出限制 ${this.formatBytes(this.report.limits.totalBundle)}`,
          });
        }

        console.log(`✅ 主包大小: ${this.formatBytes(mainBundleSize)}`);
        console.log(`✅ 总包大小: ${this.formatBytes(totalSize)}`);
      }
    } catch (error) {
      console.warn(`⚠️  打包大小分析失败: ${error.message}`);
      this.report.issues.push({
        type: 'analysis-error',
        severity: 'low',
        message: `打包大小分析失败: ${error.message}`,
      });
    }
  }

  /**
   * 获取chunk文件大小
   */
  getChunkSizes(staticDir) {
    const chunks = {};

    try {
      const jsDir = path.join(staticDir, 'chunks');
      if (fs.existsSync(jsDir)) {
        const files = fs.readdirSync(jsDir);

        files.forEach((file) => {
          if (file.endsWith('.js')) {
            const filePath = path.join(jsDir, file);
            const stats = fs.statSync(filePath);

            if (file.includes('main')) {
              chunks.main = (chunks.main || 0) + stats.size;
            } else if (file.includes('framework')) {
              chunks.framework = (chunks.framework || 0) + stats.size;
            } else {
              chunks.shared = (chunks.shared || 0) + stats.size;
            }
          }
        });
      }
    } catch (error) {
      console.warn(`⚠️  读取chunk文件失败: ${error.message}`);
    }

    return chunks;
  }

  /**
   * 模拟页面加载时间分析
   */
  analyzeLoadTime() {
    try {
      console.log('⏱️  分析页面加载时间...');

      // 简单的加载时间估算（基于包大小）
      const bundleSize = Object.values(
        this.report.performance.bundleSize,
      ).reduce((sum, size) => sum + size, 0);
      const estimatedLoadTime = Math.max(1000, bundleSize / 100); // 简单估算公式

      this.report.performance.loadTime = {
        estimated: estimatedLoadTime,
        threshold: this.report.limits.loadTime,
      };

      if (estimatedLoadTime > this.report.limits.loadTime) {
        this.report.passed = false;
        this.report.issues.push({
          type: 'load-time',
          severity: 'medium',
          message: `预估加载时间 ${estimatedLoadTime}ms 超出限制 ${this.report.limits.loadTime}ms`,
        });
      }

      console.log(`✅ 预估加载时间: ${estimatedLoadTime}ms`);
    } catch (error) {
      console.warn(`⚠️  加载时间分析失败: ${error.message}`);
    }
  }

  /**
   * 分析内存使用情况
   */
  analyzeMemoryUsage() {
    try {
      console.log('🧠 分析内存使用情况...');

      // 获取当前Node.js进程内存使用
      const memUsage = process.memoryUsage();
      this.report.performance.memoryUsage = {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      };

      if (memUsage.heapUsed > this.report.limits.memoryUsage) {
        this.report.passed = false;
        this.report.issues.push({
          type: 'memory-usage',
          severity: 'medium',
          message: `内存使用 ${this.formatBytes(memUsage.heapUsed)} 超出限制 ${this.formatBytes(this.report.limits.memoryUsage)}`,
        });
      }

      console.log(`✅ 内存使用: ${this.formatBytes(memUsage.heapUsed)}`);
    } catch (error) {
      console.warn(`⚠️  内存分析失败: ${error.message}`);
    }
  }

  /**
   * 计算性能得分
   */
  calculatePerformanceScore() {
    let score = 100;

    // 根据问题严重程度扣分
    this.report.issues.forEach((issue) => {
      switch (issue.severity) {
        case 'high':
          score -= 30;
          break;
        case 'medium':
          score -= 15;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    this.report.performance.score = Math.max(0, score);
  }

  /**
   * 格式化字节数
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 性能分析报告');
    console.log('='.repeat(50));
    console.log(`🕐 时间: ${new Date(this.report.timestamp).toLocaleString()}`);
    console.log(`🌿 分支: ${this.report.environment.branch}`);
    console.log(`📝 提交: ${this.report.environment.commit}`);
    console.log(`⚡ 性能得分: ${this.report.performance.score}/100`);
    console.log(`📦 整体状态: ${this.report.passed ? '✅ 通过' : '❌ 失败'}`);

    // 包大小详情
    this.printBundleSizeDetails();

    // 基准对比
    if (this.report.baseline) {
      this.printBaselineComparison();
    }

    // 回归检测结果
    if (this.report.regression.detected) {
      this.printRegressionDetails();
    }

    // 问题列表
    if (this.report.issues.length > 0) {
      console.log('\n🚨 发现的问题:');
      this.report.issues.forEach((issue, index) => {
        const icon = this.getSeverityIcon(issue.severity);
        console.log(`${index + 1}. ${icon} ${issue.message}`);
      });
    }

    // CI模式下的特殊处理
    if (this.options.ciMode) {
      this.generateCIReport();
    }

    // 保存报告
    this.saveReport();

    return this.report.passed;
  }

  /**
   * 打印包大小详情
   */
  printBundleSizeDetails() {
    console.log('\n📦 包大小分析:');
    const { bundleSize } = this.report.performance;

    Object.entries(bundleSize).forEach(([type, size]) => {
      const limit = this.getBundleLimit(type);
      const percentage = limit ? ((size / limit) * 100).toFixed(1) : 'N/A';
      const status = limit && size > limit ? '🔴' : '🟢';

      console.log(
        `  ${type}: ${this.formatBytes(size)} ${status} ${percentage !== 'N/A' ? `(${percentage}%)` : ''}`,
      );
    });

    const totalSize = Object.values(bundleSize).reduce(
      (sum, size) => sum + size,
      0,
    );
    const totalLimit = this.report.limits.totalBundle;
    const totalPercentage = ((totalSize / totalLimit) * 100).toFixed(1);
    const totalStatus = totalSize > totalLimit ? '🔴' : '🟢';

    console.log(
      `  总计: ${this.formatBytes(totalSize)} ${totalStatus} (${totalPercentage}%)`,
    );
  }

  /**
   * 打印基准对比
   */
  printBaselineComparison() {
    console.log('\n📈 与基准对比:');
    console.log(
      `  基准时间: ${new Date(this.report.baseline.timestamp).toLocaleString()}`,
    );

    const current = this.report.performance;
    const baseline = this.report.baseline.performance;

    // 包大小对比
    const currentTotal = Object.values(current.bundleSize).reduce(
      (sum, size) => sum + size,
      0,
    );
    const baselineTotal = Object.values(baseline.bundleSize || {}).reduce(
      (sum, size) => sum + size,
      0,
    );

    if (baselineTotal > 0) {
      const change = currentTotal - baselineTotal;
      const changePercent = ((change / baselineTotal) * 100).toFixed(1);
      const trend = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      console.log(
        `  包大小: ${trend} ${change > 0 ? '+' : ''}${this.formatBytes(change)} (${change > 0 ? '+' : ''}${changePercent}%)`,
      );
    }

    // 加载时间对比
    if (current.loadTime?.estimated && baseline.loadTime?.estimated) {
      const change = current.loadTime.estimated - baseline.loadTime.estimated;
      const changePercent = (
        (change / baseline.loadTime.estimated) *
        100
      ).toFixed(1);
      const trend = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      console.log(
        `  加载时间: ${trend} ${change > 0 ? '+' : ''}${change}ms (${change > 0 ? '+' : ''}${changePercent}%)`,
      );
    }
  }

  /**
   * 打印回归详情
   */
  printRegressionDetails() {
    console.log('\n🚨 性能回归检测:');
    this.report.regression.details.forEach((regression, index) => {
      const icon = this.getSeverityIcon(regression.severity);
      console.log(`${index + 1}. ${icon} ${regression.metric}:`);
      console.log(`     当前: ${regression.current}`);
      console.log(`     基准: ${regression.baseline}`);
      console.log(`     变化: ${regression.change}`);
    });
  }

  /**
   * 生成CI报告
   */
  generateCIReport() {
    console.log('\n🤖 CI/CD 集成信息:');

    // 设置GitHub Actions输出
    if (process.env.GITHUB_ACTIONS) {
      const summary = this.generateMarkdownSummary();
      console.log('::group::Performance Analysis Summary');
      console.log(summary);
      console.log('::endgroup::');

      // 设置输出变量
      console.log(
        `::set-output name=performance-score::${this.report.performance.score}`,
      );
      console.log(`::set-output name=passed::${this.report.passed}`);
      console.log(
        `::set-output name=regression-detected::${this.report.regression.detected}`,
      );
    }

    // 设置退出码
    if (!this.report.passed) {
      console.log('❌ 性能检查失败，设置退出码为1');
    }
  }

  /**
   * 生成Markdown摘要
   */
  generateMarkdownSummary() {
    const lines = [];

    lines.push('## 📊 性能分析报告');
    lines.push('');
    lines.push(`**性能得分:** ${this.report.performance.score}/100`);
    lines.push(`**状态:** ${this.report.passed ? '✅ 通过' : '❌ 失败'}`);
    lines.push(`**分支:** ${this.report.environment.branch}`);
    lines.push(`**提交:** ${this.report.environment.commit}`);
    lines.push('');

    // 包大小表格
    lines.push('### 📦 包大小分析');
    lines.push('| 类型 | 大小 | 状态 |');
    lines.push('|------|------|------|');

    Object.entries(this.report.performance.bundleSize).forEach(
      ([type, size]) => {
        const limit = this.getBundleLimit(type);
        const status = limit && size > limit ? '🔴 超限' : '🟢 正常';
        lines.push(`| ${type} | ${this.formatBytes(size)} | ${status} |`);
      },
    );

    // 回归检测
    if (this.report.regression.detected) {
      lines.push('');
      lines.push('### 🚨 性能回归');
      this.report.regression.details.forEach((regression) => {
        lines.push(
          `- **${regression.metric}:** ${regression.change} (${regression.current} vs ${regression.baseline})`,
        );
      });
    }

    return lines.join('\n');
  }

  /**
   * 获取包大小限制
   */
  getBundleLimit(type) {
    const limits = {
      main: this.report.limits.mainBundle,
      framework: 130 * 1024, // 130KB
      shared: 220 * 1024, // 220KB
    };
    return limits[type];
  }

  /**
   * 获取严重程度图标
   */
  getSeverityIcon(severity) {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    };
    return icons[severity] || '🔵';
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

      const reportPath = path.join(reportsDir, 'performance-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));

      console.log(`\n📄 性能报告已保存: ${reportPath}`);
    } catch (error) {
      console.warn(`⚠️  保存报告失败: ${error.message}`);
    }
  }

  /**
   * 获取当前Git分支
   */
  getCurrentBranch() {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
      }).trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * 获取当前Git提交
   */
  getCurrentCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' })
        .trim()
        .substring(0, 8);
    } catch {
      return 'unknown';
    }
  }

  /**
   * 加载性能基准
   */
  loadBaseline() {
    try {
      const baselinePath = path.join(
        process.cwd(),
        'reports',
        this.options.baselineFile,
      );
      if (fs.existsSync(baselinePath)) {
        const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
        this.report.baseline = baseline;
        console.log(`📊 已加载性能基准: ${baseline.timestamp}`);
        return baseline;
      }
    } catch (error) {
      console.warn(`⚠️  加载基准失败: ${error.message}`);
    }
    return null;
  }

  /**
   * 保存性能基准
   */
  saveBaseline() {
    try {
      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const baselinePath = path.join(reportsDir, this.options.baselineFile);
      const baseline = {
        timestamp: this.report.timestamp,
        performance: this.report.performance,
        environment: this.report.environment,
      };

      fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
      console.log(`💾 性能基准已保存: ${baselinePath}`);
    } catch (error) {
      console.warn(`⚠️  保存基准失败: ${error.message}`);
    }
  }

  /**
   * 检测性能回归
   */
  detectRegression() {
    if (!this.report.baseline) {
      console.log('📊 无基准数据，跳过回归检测');
      return;
    }

    console.log('🔍 检测性能回归...');
    const current = this.report.performance;
    const baseline = this.report.baseline.performance;
    const regressions = [];

    // 检查包大小回归
    this.checkBundleSizeRegression(current, baseline, regressions);

    // 检查加载时间回归
    this.checkLoadTimeRegression(current, baseline, regressions);

    // 检查内存使用回归
    this.checkMemoryRegression(current, baseline, regressions);

    if (regressions.length > 0) {
      this.report.regression.detected = true;
      this.report.regression.details = regressions;
      this.report.passed = false;

      console.log(`🚨 检测到 ${regressions.length} 个性能回归:`);
      regressions.forEach((regression, index) => {
        console.log(
          `${index + 1}. ${regression.metric}: ${regression.message}`,
        );
      });
    } else {
      console.log('✅ 未检测到性能回归');
    }
  }

  /**
   * 检查包大小回归
   */
  checkBundleSizeRegression(current, baseline, regressions) {
    const currentTotal = Object.values(current.bundleSize).reduce(
      (sum, size) => sum + size,
      0,
    );
    const baselineTotal = Object.values(baseline.bundleSize || {}).reduce(
      (sum, size) => sum + size,
      0,
    );

    if (baselineTotal > 0) {
      const change = ((currentTotal - baselineTotal) / baselineTotal) * 100;
      if (change > this.report.limits.regressionThreshold) {
        regressions.push({
          metric: 'Bundle Size',
          current: this.formatBytes(currentTotal),
          baseline: this.formatBytes(baselineTotal),
          change: `+${change.toFixed(1)}%`,
          message: `包大小增加 ${change.toFixed(1)}% (${this.formatBytes(currentTotal - baselineTotal)})`,
          severity: change > 25 ? 'critical' : change > 15 ? 'high' : 'medium',
        });
      }
    }
  }

  /**
   * 检查加载时间回归
   */
  checkLoadTimeRegression(current, baseline, regressions) {
    if (current.loadTime?.estimated && baseline.loadTime?.estimated) {
      const change =
        ((current.loadTime.estimated - baseline.loadTime.estimated) /
          baseline.loadTime.estimated) *
        100;
      if (change > this.report.limits.regressionThreshold) {
        regressions.push({
          metric: 'Load Time',
          current: `${current.loadTime.estimated}ms`,
          baseline: `${baseline.loadTime.estimated}ms`,
          change: `+${change.toFixed(1)}%`,
          message: `加载时间增加 ${change.toFixed(1)}%`,
          severity: change > 30 ? 'critical' : change > 20 ? 'high' : 'medium',
        });
      }
    }
  }

  /**
   * 检查内存使用回归
   */
  checkMemoryRegression(current, baseline, regressions) {
    if (current.memoryUsage?.heapUsed && baseline.memoryUsage?.heapUsed) {
      const change =
        ((current.memoryUsage.heapUsed - baseline.memoryUsage.heapUsed) /
          baseline.memoryUsage.heapUsed) *
        100;
      if (change > this.report.limits.regressionThreshold) {
        regressions.push({
          metric: 'Memory Usage',
          current: this.formatBytes(current.memoryUsage.heapUsed),
          baseline: this.formatBytes(baseline.memoryUsage.heapUsed),
          change: `+${change.toFixed(1)}%`,
          message: `内存使用增加 ${change.toFixed(1)}%`,
          severity: change > 50 ? 'critical' : change > 30 ? 'high' : 'medium',
        });
      }
    }
  }

  /**
   * 执行完整的性能分析
   */
  async analyze() {
    console.log('🚀 开始性能分析...\n');

    // 加载基准数据
    if (this.options.compareWithBaseline) {
      this.loadBaseline();
    }

    // 执行分析
    this.analyzeBundleSize();
    this.analyzeLoadTime();
    this.analyzeMemoryUsage();
    this.calculatePerformanceScore();

    // 检测回归
    if (this.options.compareWithBaseline) {
      this.detectRegression();
    }

    // 保存基准
    if (this.options.saveBaseline) {
      this.saveBaseline();
    }

    return this.generateReport();
  }
}

// 命令行接口
if (require.main === module) {
  // 解析命令行参数
  const args = process.argv.slice(2);
  const options = {
    saveBaseline: args.includes('--save-baseline'),
    compareWithBaseline: args.includes('--compare-baseline'),
    ciMode: args.includes('--ci') || process.env.CI === 'true',
    baselineFile: 'performance-baseline.json',
  };

  // 自定义基准文件
  const baselineIndex = args.indexOf('--baseline-file');
  if (baselineIndex !== -1 && args[baselineIndex + 1]) {
    options.baselineFile = args[baselineIndex + 1];
  }

  // 显示帮助信息
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📊 性能分析器 - Performance Analyzer

用法:
  node scripts/performance-analyzer.js [选项]

选项:
  --save-baseline          保存当前性能数据作为基准
  --compare-baseline       与基准数据进行对比
  --baseline-file <file>   指定基准文件名 (默认: performance-baseline.json)
  --ci                     CI/CD模式，输出适合自动化的格式
  --help, -h               显示此帮助信息

示例:
  # 基本分析
  node scripts/performance-analyzer.js

  # 保存基准
  node scripts/performance-analyzer.js --save-baseline

  # 对比基准并检测回归
  node scripts/performance-analyzer.js --compare-baseline

  # CI模式
  node scripts/performance-analyzer.js --compare-baseline --ci
    `);
    process.exit(0);
  }

  console.log('🚀 启动性能分析器...');
  console.log(`📋 配置: ${JSON.stringify(options, null, 2)}`);

  const analyzer = new PerformanceAnalyzer(options);
  analyzer
    .analyze()
    .then((success) => {
      if (options.ciMode) {
        console.log(`\n🎯 分析完成，退出码: ${success ? 0 : 1}`);
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error(`❌ 性能分析失败: ${error.message}`);
      if (options.ciMode) {
        console.log('::error::Performance analysis failed');
      }
      process.exit(1);
    });
}

module.exports = PerformanceAnalyzer;
