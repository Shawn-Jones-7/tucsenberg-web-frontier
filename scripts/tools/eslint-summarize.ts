#!/usr/bin/env tsx
/**
 * ESLint错误统计分析工具
 * 读取ESLint JSON输出，按规则聚合计数与文件分布
 */
import { readFileSync } from 'fs';
import { join } from 'path';

interface ESLintMessage {
  ruleId: string | null;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType?: string;
  messageId?: string;
  endLine?: number;
  endColumn?: number;
}

interface ESLintResult {
  filePath: string;
  messages: ESLintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source?: string;
}

interface RuleSummary {
  ruleId: string;
  errorCount: number;
  warningCount: number;
  totalCount: number;
  files: Map<string, number>;
}

function main() {
  try {
    const eslintJsonPath = join(process.cwd(), '.tmp/eslint.json');
    const eslintData: ESLintResult[] = JSON.parse(
      readFileSync(eslintJsonPath, 'utf-8'),
    );

    console.log('🔍 ESLint错误统计分析报告');
    console.log('='.repeat(50));

    // 统计总体情况
    const totalFiles = eslintData.length;
    const filesWithIssues = eslintData.filter(
      (result) => result.messages.length > 0,
    ).length;
    const totalErrors = eslintData.reduce(
      (sum, result) => sum + result.errorCount,
      0,
    );
    const totalWarnings = eslintData.reduce(
      (sum, result) => sum + result.warningCount,
      0,
    );

    console.log(`📊 总体统计:`);
    console.log(`  检查文件: ${totalFiles}`);
    console.log(`  有问题文件: ${filesWithIssues}`);
    console.log(`  错误总数: ${totalErrors}`);
    console.log(`  警告总数: ${totalWarnings}`);
    console.log(`  问题总计: ${totalErrors + totalWarnings}`);
    console.log();

    // 按规则聚合
    const ruleSummaries = new Map<string, RuleSummary>();

    for (const result of eslintData) {
      for (const message of result.messages) {
        const ruleId = message.ruleId || 'no-rule';

        if (!ruleSummaries.has(ruleId)) {
          ruleSummaries.set(ruleId, {
            ruleId,
            errorCount: 0,
            warningCount: 0,
            totalCount: 0,
            files: new Map(),
          });
        }

        const summary = ruleSummaries.get(ruleId)!;

        if (message.severity === 2) {
          summary.errorCount++;
        } else {
          summary.warningCount++;
        }
        summary.totalCount++;

        // 统计文件分布
        const fileName = result.filePath
          .replace(process.cwd(), '')
          .replace(/^\//, '');
        const currentCount = summary.files.get(fileName) || 0;
        summary.files.set(fileName, currentCount + 1);
      }
    }

    // 按总数排序
    const sortedRules = Array.from(ruleSummaries.values()).sort(
      (a, b) => b.totalCount - a.totalCount,
    );

    console.log(`🔥 Top 10 ESLint规则 (按问题数量排序):`);
    console.log('-'.repeat(80));
    console.log(
      `${'规则名称'.padEnd(40) + '错误'.padEnd(8) + '警告'.padEnd(8)}总计`,
    );
    console.log('-'.repeat(80));

    for (const rule of sortedRules.slice(0, 10)) {
      console.log(
        rule.ruleId.padEnd(40) +
          rule.errorCount.toString().padEnd(8) +
          rule.warningCount.toString().padEnd(8) +
          rule.totalCount.toString(),
      );
    }

    console.log();
    console.log(`📁 Top 5 问题最多的文件:`);
    console.log('-'.repeat(60));

    // 统计每个文件的总问题数
    const fileIssues = new Map<string, number>();
    for (const result of eslintData) {
      if (result.messages.length > 0) {
        const fileName = result.filePath
          .replace(process.cwd(), '')
          .replace(/^\//, '');
        fileIssues.set(fileName, result.messages.length);
      }
    }

    const sortedFiles = Array.from(fileIssues.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    for (const [fileName, count] of sortedFiles) {
      console.log(`${count.toString().padStart(3)} 问题 - ${fileName}`);
    }

    console.log();
    console.log(`🎯 重点关注规则详情:`);
    console.log('-'.repeat(60));

    // 重点规则详细分析
    const focusRules = [
      'no-restricted-imports',
      'security/detect-object-injection',
      '@typescript-eslint/no-unused-vars',
      'no-magic-numbers',
      '@typescript-eslint/no-explicit-any',
    ];

    for (const ruleId of focusRules) {
      const rule = ruleSummaries.get(ruleId);
      if (rule) {
        console.log(`\n📌 ${ruleId}: ${rule.totalCount} 个问题`);
        console.log(`   错误: ${rule.errorCount}, 警告: ${rule.warningCount}`);
        console.log(`   影响文件: ${rule.files.size} 个`);

        // 显示问题最多的3个文件
        const topFiles = Array.from(rule.files.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        for (const [fileName, count] of topFiles) {
          console.log(`     ${count} 个 - ${fileName}`);
        }
      } else {
        console.log(`\n📌 ${ruleId}: 0 个问题 ✅`);
      }
    }

    console.log();
    console.log('✅ 统计完成！');
  } catch (error) {
    console.error('❌ 统计失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
