#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 修复测试文件中的相对路径导入问题
 */

const testFiles = [
  'tests/e2e/homepage.spec.ts',
  'tests/e2e/i18n.spec.ts',
  'tests/e2e/navigation.spec.ts',
  'tests/e2e/safe-navigation.spec.ts',
  'tests/error-scenarios/error-handling-summary.test.ts',
  'tests/error-scenarios/network-errors.test.ts',
];

function fixTestRelativeImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let changeCount = 0;

  // 修复 './test-environment-setup' 导入
  modifiedContent = modifiedContent.replace(
    /from\s+['"]\.\/test-environment-setup['"]/g,
    () => {
      changeCount++;
      return `from '@/tests/e2e/test-environment-setup'`;
    },
  );

  // 修复 './setup' 导入
  modifiedContent = modifiedContent.replace(/from\s+['"]\.\/setup['"]/g, () => {
    changeCount++;
    return `from '@/tests/error-scenarios/setup'`;
  });

  if (changeCount > 0) {
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    console.log(`✅ 修复 ${filePath}: ${changeCount} 个导入路径`);
  } else {
    console.log(`⏭️  跳过 ${filePath}: 无需修复`);
  }
}

function main() {
  console.log('🔧 开始修复测试文件的相对路径导入...\n');

  let totalFixed = 0;

  testFiles.forEach((filePath) => {
    try {
      fixTestRelativeImports(filePath);
      totalFixed++;
    } catch (error) {
      console.error(`❌ 修复失败 ${filePath}:`, error.message);
    }
  });

  console.log(`\n🎉 修复完成! 处理了 ${totalFixed} 个文件`);
}

if (require.main === module) {
  main();
}

module.exports = { fixTestRelativeImports };
