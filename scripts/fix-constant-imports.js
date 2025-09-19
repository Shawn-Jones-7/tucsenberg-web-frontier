#!/usr/bin/env node

/**
 * 修复常量导入语句
 * 将所有从 @/constants/magic-numbers 的导入改为从 @/constants 统一导入
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 查找所有包含 magic-numbers 导入的文件
function findFilesWithMagicNumbersImports() {
  try {
    const result = execSync(
      'find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "from \'@/constants/magic-numbers\'" 2>/dev/null || true',
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
    console.log('⚠️  没有找到使用 magic-numbers 导入的文件');
    return [];
  }
}

// 修复单个文件的导入语句
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 匹配 magic-numbers 导入语句
    const importRegex =
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@\/constants\/magic-numbers['"];?/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const fullImport = match[0];
      const importList = match[1];

      // 替换为统一导入
      const newImport = `import { ${importList} } from '@/constants';`;
      content = content.replace(fullImport, newImport);
      modified = true;

      console.log(`✅ 修复导入: ${filePath}`);
      console.log(`  原始: ${fullImport}`);
      console.log(`  修复: ${newImport}`);
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return 1;
    }

    return 0;
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    return 0;
  }
}

// 主函数
function main() {
  console.log('🔧 开始修复常量导入语句...\n');

  const files = findFilesWithMagicNumbersImports();

  if (files.length === 0) {
    console.log('✅ 没有找到需要修复的文件');
    return;
  }

  console.log(`📁 找到 ${files.length} 个需要修复的文件:\n`);

  let fixedCount = 0;

  for (const file of files) {
    if (fs.existsSync(file)) {
      fixedCount += fixImportsInFile(file);
    }
  }

  console.log(`\n🎉 修复完成！共修复 ${fixedCount} 个文件`);

  // 验证修复结果
  console.log('\n🔍 验证修复结果...');
  try {
    execSync('pnpm type-check', { stdio: 'inherit' });
    console.log('✅ TypeScript 编译通过！');
  } catch (error) {
    console.log('⚠️  仍有 TypeScript 错误，需要进一步检查');
  }
}

if (require.main === module) {
  main();
}
