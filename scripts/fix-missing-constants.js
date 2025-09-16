#!/usr/bin/env node
/*
 * 修复缺失的魔法数字常量
 * - 收集所有使用的MAGIC_常量
 * - 将它们添加到常量文件中
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findAllMagicConstants() {
  try {
    const result = execSync(
      'grep -r "MAGIC_[0-9]" src/ --include="*.ts" --include="*.tsx" -o',
      {
        encoding: 'utf8',
        shell: true,
      },
    );

    const constants = new Set();
    const lines = result.trim().split('\n');

    for (const line of lines) {
      const match = line.match(/MAGIC_([0-9_]+)/);
      if (match) {
        const constantName = match[0];
        const value = match[1].replace(/_/g, '.');
        constants.add({ name: constantName, value: value });
      }
    }

    return Array.from(constants);
  } catch (error) {
    console.log('⚠️  没有找到MAGIC常量');
    return [];
  }
}

function updateConstantsFile(magicConstants) {
  const constantsPath = 'src/constants/magic-numbers.ts';

  try {
    let content = fs.readFileSync(constantsPath, 'utf8');

    // 生成缺失的常量
    const missingConstants = [];

    for (const { name, value } of magicConstants) {
      if (!content.includes(`export const ${name}`)) {
        missingConstants.push({ name, value });
      }
    }

    if (missingConstants.length === 0) {
      console.log('✅ 所有常量都已存在');
      return;
    }

    console.log(`📊 发现 ${missingConstants.length} 个缺失的常量`);

    // 按数值大小排序
    missingConstants.sort((a, b) => {
      const numA = parseFloat(a.value);
      const numB = parseFloat(b.value);
      return numA - numB;
    });

    // 生成常量定义
    const newConstants = `
// 自动生成的缺失常量
${missingConstants
  .map(({ name, value }) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return `export const ${name} = ${value}; // 原始值: ${value}`;
    } 
      return `export const ${name} = ${numValue};`;
    
  })
  .join('\n')}
`;

    // 在文件末尾添加常量
    content += newConstants;
    fs.writeFileSync(constantsPath, content, 'utf8');
    console.log(
      `✅ 添加了 ${missingConstants.length} 个常量到 ${constantsPath}`,
    );

    // 显示添加的常量
    console.log('\n📋 添加的常量:');
    missingConstants.slice(0, 10).forEach(({ name, value }) => {
      console.log(`  ${name} = ${value}`);
    });
    if (missingConstants.length > 10) {
      console.log(`  ... 还有 ${missingConstants.length - 10} 个常量`);
    }
  } catch (error) {
    console.error(`❌ 更新常量文件失败:`, error.message);
  }
}

function main() {
  console.log('🔧 修复缺失的魔法数字常量...');

  const magicConstants = findAllMagicConstants();
  if (magicConstants.length === 0) {
    console.log('✅ 没有发现MAGIC常量');
    return;
  }

  console.log(`📊 发现 ${magicConstants.length} 个MAGIC常量`);
  updateConstantsFile(magicConstants);

  console.log(`\n🎉 修复完成！`);
  console.log('\n💡 建议运行以下命令验证修复效果：');
  console.log('pnpm type-check');
}

if (require.main === module) {
  main();
}
