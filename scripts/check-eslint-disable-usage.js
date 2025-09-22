#!/usr/bin/env node

/**
 * ESLint 禁用注释使用检查脚本
 *
 * 用途：检查项目中 ESLint 禁用注释的使用是否符合准则
 * 运行：node scripts/check-eslint-disable-usage.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 允许使用 ESLint 禁用注释的目录和文件模式
const ALLOWED_PATTERNS = [
  // API 类型定义文件
  /^src\/types\/.*-api-.*\.ts$/,
  /^src\/types\/whatsapp-.*\.ts$/,
  /^src\/types\/.*-types\.ts$/,
  /^src\/types\/test-types\.ts$/,

  // 开发工具文件
  /^src\/components\/dev-tools\/.*\.(ts|tsx)$/,

  // 脚本文件
  /^scripts\/.*\.js$/,

  // 测试文件（限制性允许）
  /^tests\/.*\.(ts|tsx)$/,
  /^.*\.test\.(ts|tsx)$/,
  /^.*\.spec\.(ts|tsx)$/,
];

// 业务逻辑代码目录（严格禁止）
const FORBIDDEN_PATTERNS = [
  /^src\/components\/(?!dev-tools).*\.(ts|tsx)$/,
  /^src\/lib\/.*\.ts$/,
  /^src\/app\/.*\.(ts|tsx)$/,
  /^src\/hooks\/.*\.ts$/,
];

function findFilesWithEslintDisable() {
  try {
    const result = execSync(
      'find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "eslint-disable" 2>/dev/null || true',
      { encoding: 'utf8' },
    );

    return result
      .trim()
      .split('\n')
      .filter((file) => file.length > 0);
  } catch (error) {
    console.error('查找文件时出错:', error.message);
    return [];
  }
}

function isFileAllowed(filePath) {
  // 检查是否匹配允许的模式
  const isAllowed = ALLOWED_PATTERNS.some((pattern) => pattern.test(filePath));

  // 检查是否匹配禁止的模式
  const isForbidden = FORBIDDEN_PATTERNS.some((pattern) =>
    pattern.test(filePath),
  );

  return isAllowed && !isForbidden;
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    const disableComments = [];
    lines.forEach((line, index) => {
      if (line.includes('eslint-disable')) {
        disableComments.push({
          line: index + 1,
          content: line.trim(),
          hasDocumentation:
            lines[index + 1] && lines[index + 1].includes('/**'),
        });
      }
    });

    return disableComments;
  } catch (error) {
    console.error(`读取文件 ${filePath} 时出错:`, error.message);
    return [];
  }
}

function main() {
  console.log('🔍 检查 ESLint 禁用注释使用情况...\n');

  const filesWithDisable = findFilesWithEslintDisable();

  if (filesWithDisable.length === 0) {
    console.log('✅ 未发现使用 ESLint 禁用注释的文件');
    return;
  }

  let hasViolations = false;
  let allowedFiles = 0;
  let violationFiles = 0;

  console.log(
    `📋 发现 ${filesWithDisable.length} 个文件使用了 ESLint 禁用注释:\n`,
  );

  filesWithDisable.forEach((filePath) => {
    const isAllowed = isFileAllowed(filePath);
    const disableComments = analyzeFile(filePath);

    if (isAllowed) {
      allowedFiles++;
      console.log(`✅ ${filePath}`);
      console.log(`   📝 禁用注释数量: ${disableComments.length}`);

      // 检查是否有文档说明
      const undocumented = disableComments.filter(
        (comment) => !comment.hasDocumentation,
      );
      if (undocumented.length > 0) {
        console.log(`   ⚠️  缺少文档说明的禁用注释: ${undocumented.length}`);
      }
    } else {
      violationFiles++;
      hasViolations = true;
      console.log(`❌ ${filePath}`);
      console.log(`   🚫 此文件不允许使用 ESLint 禁用注释`);
      console.log(`   📝 发现的禁用注释:`);

      disableComments.forEach((comment) => {
        console.log(`      第${comment.line}行: ${comment.content}`);
      });
    }
    console.log('');
  });

  // 总结报告
  console.log('📊 检查结果总结:');
  console.log(`   ✅ 符合准则的文件: ${allowedFiles}`);
  console.log(`   ❌ 违规文件: ${violationFiles}`);
  console.log(`   📋 总文件数: ${filesWithDisable.length}`);

  if (hasViolations) {
    console.log(
      '\n🚨 发现违规使用！请参考 docs/development/eslint-disable-guidelines.md',
    );
    console.log('   建议：优先修复 ESLint 错误而非禁用规则');
    process.exit(1);
  } else {
    console.log('\n🎉 所有 ESLint 禁用注释的使用都符合准则！');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  findFilesWithEslintDisable,
  isFileAllowed,
  analyzeFile,
};
