#!/usr/bin/env node
/*
 * 修复所有import语句
 * - 分析每个文件使用的常量
 * - 生成正确的import语句
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getAllAvailableConstants() {
  try {
    const constantsContent = fs.readFileSync(
      'src/constants/magic-numbers.ts',
      'utf8',
    );
    const constants = new Set();

    const matches = constantsContent.matchAll(
      /export const ([A-Z_][A-Z0-9_]*)/g,
    );
    for (const match of matches) {
      constants.add(match[1]);
    }

    return constants;
  } catch (error) {
    console.error('❌ 无法读取常量文件:', error.message);
    return new Set();
  }
}

function findFilesWithMagicConstants() {
  try {
    const result = execSync(
      'find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "MAGIC_\\|ANIMATION_\\|SIZE_\\|OPACITY_\\|COUNT_\\|PERCENTAGE_\\|OFFSET_\\|HEX_\\|DECIMAL_\\|BYTES_\\|SECONDS_\\|HOURS_\\|DAYS_"',
      {
        encoding: 'utf8',
        shell: true,
      },
    );
    return result
      .trim()
      .split('\n')
      .filter((file) => file.length > 0);
  } catch (error) {
    console.log('⚠️  没有找到使用常量的文件');
    return [];
  }
}

function getUsedConstantsInFile(filePath, availableConstants) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const usedConstants = new Set();

    // 查找所有可能的常量使用
    for (const constant of availableConstants) {
      const regex = new RegExp(`\\b${constant}\\b`, 'g');
      if (regex.test(content)) {
        usedConstants.add(constant);
      }
    }

    return usedConstants;
  } catch (error) {
    console.error(`❌ 无法读取文件 ${filePath}:`, error.message);
    return new Set();
  }
}

function fixImportInFile(filePath, usedConstants) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 移除现有的magic-numbers导入
    const importRegex =
      /import\s*\{[^}]*\}\s*from\s*['"]@\/constants\/magic-numbers['"];\s*\n?/g;
    content = content.replace(importRegex, '');

    if (usedConstants.size > 0) {
      // 生成新的import语句
      const sortedConstants = Array.from(usedConstants).sort();
      const newImport = `import { ${sortedConstants.join(', ')} } from '@/constants/magic-numbers';\n`;

      // 在第一个import语句后插入
      const firstImportMatch = content.match(/^import .+;$/m);
      if (firstImportMatch) {
        content = content.replace(
          firstImportMatch[0],
          `${firstImportMatch[0]  }\n${  newImport}`,
        );
      } else {
        // 如果没有其他import，在文件开头插入
        content = `${newImport  }\n${  content}`;
      }

      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 修复: ${filePath} (${usedConstants.size}个常量)`);
      return 1;
    }

    return 0;
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('🔧 修复所有import语句...');

  const availableConstants = getAllAvailableConstants();
  console.log(`📊 可用常量: ${availableConstants.size} 个`);

  const affectedFiles = findFilesWithMagicConstants();
  if (affectedFiles.length === 0) {
    console.log('✅ 没有发现使用常量的文件');
    return;
  }

  console.log(`📊 发现 ${affectedFiles.length} 个使用常量的文件`);

  let totalFixes = 0;
  for (const filePath of affectedFiles) {
    const usedConstants = getUsedConstantsInFile(filePath, availableConstants);
    if (usedConstants.size > 0) {
      totalFixes += fixImportInFile(filePath, usedConstants);
    }
  }

  console.log(`\n🎉 修复完成！`);
  console.log(`📊 总计修复 ${totalFixes} 个文件的import语句`);

  if (totalFixes > 0) {
    console.log('\n💡 建议运行以下命令验证修复效果：');
    console.log('pnpm type-check');
  }
}

if (require.main === module) {
  main();
}
