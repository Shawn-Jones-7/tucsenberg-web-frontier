#!/usr/bin/env node

/**
 * 性能基准监控系统
 *
 * 监控构建性能、测试性能、包大小等关键性能指标
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceBenchmarkMonitor {
  constructor() {
    this.dataDir = path.join(
      process.cwd(),
      'reports',
      'performance-benchmarks',
    );
    this.baselines = {
      buildTime: 60000, // 60秒
      testTime: 120000, // 2分钟
      bundleSize: 50 * 1024, // 50KB
      typeCheckTime: 30000, // 30秒
      lintTime: 20000, // 20秒
    };
    this.regressionThresholds = {
      buildTime: 1.2, // 20%增长触发警报
      testTime: 1.3, // 30%增长触发警报
      bundleSize: 1.1, // 10%增长触发警报
      typeCheckTime: 1.5, // 50%增长触发警报
      lintTime: 1.5, // 50%增长触发警报
    };

    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * 运行完整性能基准测试
   */
  async runBenchmarks() {
    console.log('🚀 开始性能基准测试...\n');

    const benchmarks = {
      timestamp: new Date().toISOString(),
      commit: this.getCurrentCommit(),
      branch: this.getCurrentBranch(),
      environment: this.getEnvironmentInfo(),
      metrics: {},
    };

    // 运行各项性能测试
    benchmarks.metrics.typeCheck = await this.benchmarkTypeCheck();
    benchmarks.metrics.lint = await this.benchmarkLint();
    benchmarks.metrics.test = await this.benchmarkTest();
    benchmarks.metrics.build = await this.benchmarkBuild();
    benchmarks.metrics.bundle = await this.analyzeBundleSize();

    // 保存基准数据
    this.saveBenchmarkData(benchmarks);

    // 分析性能回归
    const analysis = this.analyzePerformanceRegression(benchmarks);

    // 生成报告
    this.generatePerformanceReport(benchmarks, analysis);

    return { benchmarks, analysis };
  }

  /**
   * TypeScript 类型检查基准测试
   */
  async benchmarkTypeCheck() {
    console.log('🔍 TypeScript 类型检查基准测试...');

    try {
      const startTime = Date.now();
      execSync('pnpm type-check', { stdio: 'pipe', timeout: 60000 });
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ TypeScript 类型检查完成: ${duration}ms`);
      return {
        duration,
        status: 'success',
        baseline: this.baselines.typeCheckTime,
        regression: duration / this.baselines.typeCheckTime,
      };
    } catch (error) {
      console.log(`❌ TypeScript 类型检查失败: ${error.message}`);
      return {
        duration: 0,
        status: 'failed',
        error: error.message,
        baseline: this.baselines.typeCheckTime,
        regression: 0,
      };
    }
  }

  /**
   * ESLint 基准测试
   */
  async benchmarkLint() {
    console.log('🔍 ESLint 基准测试...');

    try {
      const startTime = Date.now();
      execSync('pnpm lint:check', { stdio: 'pipe', timeout: 60000 });
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ ESLint 检查完成: ${duration}ms`);
      return {
        duration,
        status: 'success',
        baseline: this.baselines.lintTime,
        regression: duration / this.baselines.lintTime,
      };
    } catch (error) {
      console.log(`❌ ESLint 检查失败: ${error.message}`);
      return {
        duration: 0,
        status: 'failed',
        error: error.message,
        baseline: this.baselines.lintTime,
        regression: 0,
      };
    }
  }

  /**
   * 测试基准测试
   */
  async benchmarkTest() {
    console.log('🧪 测试基准测试...');

    try {
      const startTime = Date.now();
      execSync('pnpm test --run --reporter=json', {
        stdio: 'pipe',
        timeout: 180000,
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ 测试完成: ${duration}ms`);
      return {
        duration,
        status: 'success',
        baseline: this.baselines.testTime,
        regression: duration / this.baselines.testTime,
      };
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
      return {
        duration: 0,
        status: 'failed',
        error: error.message,
        baseline: this.baselines.testTime,
        regression: 0,
      };
    }
  }

  /**
   * 构建基准测试
   */
  async benchmarkBuild() {
    console.log('🏗️  构建基准测试...');

    try {
      const startTime = Date.now();
      execSync('pnpm build', { stdio: 'pipe', timeout: 180000 });
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ 构建完成: ${duration}ms`);
      return {
        duration,
        status: 'success',
        baseline: this.baselines.buildTime,
        regression: duration / this.baselines.buildTime,
      };
    } catch (error) {
      console.log(`❌ 构建失败: ${error.message}`);
      return {
        duration: 0,
        status: 'failed',
        error: error.message,
        baseline: this.baselines.buildTime,
        regression: 0,
      };
    }
  }

  /**
   * 包大小分析
   */
  async analyzeBundleSize() {
    console.log('📦 包大小分析...');

    try {
      const buildDir = path.join(process.cwd(), '.next');
      if (!fs.existsSync(buildDir)) {
        throw new Error('构建目录不存在，请先运行构建');
      }

      const size = this.getDirectorySize(buildDir);
      const regression = size / this.baselines.bundleSize;

      console.log(`📊 包大小: ${this.formatBytes(size)}`);
      return {
        size,
        sizeFormatted: this.formatBytes(size),
        status: 'success',
        baseline: this.baselines.bundleSize,
        regression,
      };
    } catch (error) {
      console.log(`❌ 包大小分析失败: ${error.message}`);
      return {
        size: 0,
        status: 'failed',
        error: error.message,
        baseline: this.baselines.bundleSize,
        regression: 0,
      };
    }
  }

  /**
   * 获取目录大小
   */
  getDirectorySize(dirPath) {
    let totalSize = 0;

    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      });
    }

    return totalSize;
  }

  /**
   * 保存基准数据
   */
  saveBenchmarkData(benchmarks) {
    const filename = `benchmark-${Date.now()}.json`;
    const filepath = path.join(this.dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(benchmarks, null, 2));

    // 清理旧数据（保留最近30天）
    this.cleanupOldData();
  }

  /**
   * 清理旧数据
   */
  cleanupOldData() {
    try {
      const files = fs.readdirSync(this.dataDir);
      const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30天前

      files.forEach((file) => {
        if (file.startsWith('benchmark-') && file.endsWith('.json')) {
          const timestamp = parseInt(
            file.replace('benchmark-', '').replace('.json', ''),
          );
          if (timestamp < cutoffTime) {
            fs.unlinkSync(path.join(this.dataDir, file));
          }
        }
      });
    } catch (error) {
      console.warn('⚠️  清理旧数据时出错:', error.message);
    }
  }

  /**
   * 分析性能回归
   */
  analyzePerformanceRegression(benchmarks) {
    console.log('📊 分析性能回归...');

    const regressions = [];
    const improvements = [];
    const alerts = [];

    Object.entries(benchmarks.metrics).forEach(([metric, data]) => {
      if (data.status !== 'success') return;

      const {regression} = data;
      const threshold = this.regressionThresholds[metric] || 1.2;

      if (regression > threshold) {
        const regressionData = {
          metric,
          regression,
          threshold,
          severity: regression > threshold * 1.5 ? 'critical' : 'warning',
          message: `${metric} 性能回归 ${((regression - 1) * 100).toFixed(1)}%`,
          current: data.duration || data.size,
          baseline: data.baseline,
        };

        regressions.push(regressionData);
        alerts.push(regressionData);
      } else if (regression < 0.9) {
        improvements.push({
          metric,
          improvement: 1 - regression,
          message: `${metric} 性能提升 ${((1 - regression) * 100).toFixed(1)}%`,
          current: data.duration || data.size,
          baseline: data.baseline,
        });
      }
    });

    // 加载历史数据进行趋势分析
    const historicalData = this.loadHistoricalData();
    const trends = this.analyzeTrends(historicalData, benchmarks);

    return {
      regressions,
      improvements,
      alerts,
      trends,
      summary: {
        totalMetrics: Object.keys(benchmarks.metrics).length,
        successfulMetrics: Object.values(benchmarks.metrics).filter(
          (m) => m.status === 'success',
        ).length,
        regressionCount: regressions.length,
        improvementCount: improvements.length,
        alertCount: alerts.length,
      },
    };
  }

  /**
   * 加载历史数据
   */
  loadHistoricalData() {
    try {
      const files = fs
        .readdirSync(this.dataDir)
        .filter(
          (file) => file.startsWith('benchmark-') && file.endsWith('.json'),
        )
        .sort()
        .slice(-10); // 最近10次

      return files.map((file) => {
        const content = fs.readFileSync(path.join(this.dataDir, file), 'utf8');
        return JSON.parse(content);
      });
    } catch (error) {
      console.warn('⚠️  加载历史数据时出错:', error.message);
      return [];
    }
  }

  /**
   * 分析趋势
   */
  analyzeTrends(historicalData, current) {
    if (historicalData.length < 2) {
      return { status: 'insufficient-data' };
    }

    const trends = {};
    const metrics = ['typeCheck', 'lint', 'test', 'build', 'bundle'];

    metrics.forEach((metric) => {
      const values = historicalData
        .map((data) => data.metrics[metric])
        .filter((m) => m && m.status === 'success')
        .map((m) => m.duration || m.size);

      if (values.length >= 2) {
        const recent = values.slice(-3); // 最近3次
        const average = recent.reduce((a, b) => a + b, 0) / recent.length;
        const currentValue =
          current.metrics[metric]?.duration ||
          current.metrics[metric]?.size ||
          0;

        trends[metric] = {
          average,
          current: currentValue,
          trend:
            currentValue > average * 1.1
              ? 'declining'
              : currentValue < average * 0.9
                ? 'improving'
                : 'stable',
          changePercent: ((currentValue - average) / average) * 100,
        };
      }
    });

    return { status: 'success', trends };
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(benchmarks, analysis) {
    console.log('\n📊 性能基准测试报告');
    console.log('='.repeat(60));

    console.log(
      `📅 测试时间: ${new Date(benchmarks.timestamp).toLocaleString()}`,
    );
    console.log(`🌿 分支: ${benchmarks.branch}`);
    console.log(`📝 提交: ${benchmarks.commit.substring(0, 8)}`);

    console.log('\n📈 性能指标:');
    Object.entries(benchmarks.metrics).forEach(([metric, data]) => {
      if (data.status === 'success') {
        const value = data.duration
          ? `${data.duration}ms`
          : this.formatBytes(data.size);
        const regressionPercent = ((data.regression - 1) * 100).toFixed(1);
        const emoji =
          data.regression > 1.2 ? '🔴' : data.regression < 0.9 ? '🟢' : '🟡';
        console.log(
          `  ${emoji} ${metric}: ${value} (${regressionPercent >= 0 ? '+' : ''}${regressionPercent}%)`,
        );
      } else {
        console.log(`  ❌ ${metric}: 失败 - ${data.error}`);
      }
    });

    if (analysis.improvements.length > 0) {
      console.log('\n🟢 性能提升:');
      analysis.improvements.forEach((improvement) => {
        console.log(`  ✅ ${improvement.message}`);
      });
    }

    if (analysis.regressions.length > 0) {
      console.log('\n🔴 性能回归:');
      analysis.regressions.forEach((regression) => {
        const emoji = regression.severity === 'critical' ? '🚨' : '⚠️';
        console.log(`  ${emoji} ${regression.message}`);
      });
    }

    // 保存报告
    const reportPath = path.join(
      this.dataDir,
      `performance-report-${Date.now()}.json`,
    );
    fs.writeFileSync(
      reportPath,
      JSON.stringify({ benchmarks, analysis }, null, 2),
    );
    console.log(`\n💾 报告已保存: ${reportPath}`);
  }

  /**
   * 获取环境信息
   */
  getEnvironmentInfo() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: require('os').cpus().length,
      memory: `${Math.round(require('os').totalmem() / 1024 / 1024 / 1024)  }GB`,
    };
  }

  getCurrentCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  getCurrentBranch() {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
      }).trim();
    } catch {
      return 'unknown';
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k**i).toFixed(2))  } ${  sizes[i]}`;
  }
}

// 主执行函数
async function main() {
  const monitor = new PerformanceBenchmarkMonitor();

  try {
    const { benchmarks, analysis } = await monitor.runBenchmarks();

    // 如果有严重性能回归，退出码为1
    if (analysis.alerts.some((alert) => alert.severity === 'critical')) {
      console.log('\n🚨 检测到严重性能回归，请立即处理！');
      process.exit(1);
    }

    console.log('\n✅ 性能基准测试完成');
  } catch (error) {
    console.error('❌ 性能基准测试失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PerformanceBenchmarkMonitor };
