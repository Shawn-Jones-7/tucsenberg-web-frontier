#!/usr/bin/env tsx
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

async function continueESLintFixes() {
  const log: string[] = [];

  log.push('🔄 继续处理ESLint错误...');
  log.push(`时间: ${new Date().toISOString()}`);

  try {
    // 1. 检查TypeScript编译状态
    try {
      execSync('pnpm type-check', { stdio: 'pipe' });
      log.push('✅ TypeScript编译: 无错误');
    } catch (error) {
      log.push('❌ TypeScript编译: 仍有错误');
    }

    // 2. 运行ESLint自动修复
    log.push('\n🔧 运行ESLint自动修复...');
    try {
      const eslintResult = execSync(
        'pnpm eslint "src/**/*.{ts,tsx}" --fix --max-warnings=0',
        {
          stdio: 'pipe',
          encoding: 'utf8',
        },
      );
      log.push('✅ ESLint自动修复完成');
    } catch (error) {
      log.push('⚠️ ESLint自动修复完成（可能仍有错误）');
    }

    // 3. 检查剩余错误
    try {
      const eslintCheck = execSync(
        'pnpm eslint "src/**/*.{ts,tsx}" --format=compact',
        {
          stdio: 'pipe',
          encoding: 'utf8',
        },
      );
      const errorLines = eslintCheck
        .split('\n')
        .filter((line) => line.includes('error') || line.includes('warning'));
      log.push(`📊 剩余ESLint问题: ${errorLines.length} 个`);
    } catch (error) {
      const output = error.stdout?.toString() || '';
      const errorLines = output
        .split('\n')
        .filter((line) => line.includes('error') || line.includes('warning'));
      log.push(`📊 剩余ESLint问题: ${errorLines.length} 个`);
    }

    // 4. 下一步计划
    log.push('\n🎯 下一步行动:');
    log.push('1. ✅ AST魔法数字工具已修复');
    log.push('2. 🔄 相对路径导入工具已运行');
    log.push('3. 🔄 ESLint自动修复已执行');
    log.push('4. 📋 需要手动处理剩余错误:');
    log.push('   - 安全对象注入问题');
    log.push('   - 显式any类型');
    log.push('   - 其他手动修复项');
  } catch (error) {
    log.push(`❌ 处理失败: ${error}`);
  }

  // 保存结果
  writeFileSync('eslint-fix-progress.txt', log.join('\n'));
  console.log('进度报告已保存到 eslint-fix-progress.txt');
}

continueESLintFixes();
