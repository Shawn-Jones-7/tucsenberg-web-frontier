#!/usr/bin/env node
/*
 * 修复import语句中的魔法数字错误
 * - 清理import语句中不再需要的常量
 * - 修复错误的import语法
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findFilesWithBadImports() {
  try {
    const result = execSync(
      'grep -r "import.*MAGIC_\\|import.*[0-9]\\.[0-9]" src/ --include="*.ts" --include="*.tsx" -l',
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
    console.log('⚠️  没有找到有问题的import语句');
    return [];
  }
}

function fixImportStatements(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 查找所有import语句
    const importRegex =
      /import\s*\{([^}]+)\}\s*from\s*['"]@\/constants\/magic-numbers['"];/g;
    const matches = [...content.matchAll(importRegex)];

    for (const match of matches) {
      const fullImport = match[0];
      const importList = match[1];

      // 检查是否包含无效的导入
      if (importList.includes('MAGIC_') || /\b\d+\.\d+\b/.test(importList)) {
        console.log(`🔍 发现问题import: ${fullImport.substring(0, 100)}...`);

        // 分析文件中实际使用的常量
        const usedConstants = new Set();

        // 查找文件中使用的常量
        const constantPatterns = [
          /\b(ANIMATION_DURATION_\w+)\b/g,
          /\b(SIZE_\w+)\b/g,
          /\b(OPACITY_\w+)\b/g,
          /\b(COUNT_\w+)\b/g,
          /\b(PERCENTAGE_\w+)\b/g,
          /\b(OFFSET_NEGATIVE_\w+)\b/g,
          /\b(HEX_\w+)\b/g,
          /\b(DECIMAL_\w+)\b/g,
          /\b(BYTES_PER_\w+)\b/g,
          /\b(SECONDS_PER_\w+)\b/g,
          /\b(HOURS_PER_\w+)\b/g,
          /\b(DAYS_PER_\w+)\b/g,
        ];

        for (const pattern of constantPatterns) {
          const constantMatches = [...content.matchAll(pattern)];
          constantMatches.forEach((m) => usedConstants.add(m[1]));
        }

        // 生成新的import语句
        if (usedConstants.size > 0) {
          const newImportList = Array.from(usedConstants).sort().join(', ');
          const newImport = `import { ${newImportList} } from '@/constants/magic-numbers';`;
          content = content.replace(fullImport, newImport);
          console.log(`✅ 修复import: ${newImport.substring(0, 100)}...`);
        } else {
          // 如果没有使用任何常量，删除import语句
          content = content.replace(`${fullImport  }\n`, '');
          console.log(`🗑️  删除未使用的import语句`);
        }

        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 修复文件: ${filePath}`);
      return 1;
    }

    return 0;
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('🔧 修复import语句中的魔法数字错误...');

  const affectedFiles = findFilesWithBadImports();
  if (affectedFiles.length === 0) {
    console.log('✅ 没有发现需要修复的import语句');
    return;
  }

  console.log(`📊 发现 ${affectedFiles.length} 个受影响的文件`);

  let totalFixes = 0;
  for (const filePath of affectedFiles) {
    totalFixes += fixImportStatements(filePath);
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
