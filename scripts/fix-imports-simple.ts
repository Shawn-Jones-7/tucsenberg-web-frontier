#!/usr/bin/env tsx

/**
 * 简化版相对路径导入修复脚本
 * 使用更直接的字符串替换方法
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { glob } from 'glob';

interface FixResult {
  file: string;
  changes: number;
  errors: string[];
}

/**
 * 修复单个文件中的相对路径导入
 */
function fixFileImports(filePath: string): FixResult {
  const result: FixResult = {
    file: filePath,
    changes: 0,
    errors: [],
  };

  try {
    const content = readFileSync(filePath, 'utf-8');
    let newContent = content;

    // 获取文件相对于src目录的路径信息
    const relativePath = path.relative('src', filePath);
    const currentDir = path.dirname(relativePath);

    // 计算需要回退的层级数
    const levels = currentDir === '.' ? 0 : currentDir.split('/').length;

    // 替换 ../xxx 格式的导入
    const parentImportRegex = /from\s+['"](\.\.\/)([^'"]+)['"]/g;
    newContent = newContent.replace(
      parentImportRegex,
      (match, prefix, importPath) => {
        result.changes++;
        // 简单处理：直接替换为@/路径
        // 对于 ../xxx，我们需要根据当前文件位置计算正确的@/路径
        if (levels === 1) {
          // 当前在src的直接子目录中，../xxx 应该是 @/xxx
          return `from '@/${importPath}'`;
        } else if (levels === 2) {
          // 当前在src的二级子目录中，../xxx 可能指向上一级
          const parentDir = path.dirname(currentDir);
          return `from '@/${parentDir}/${importPath}'`;
        }
        // 复杂情况，尝试智能推断
        return `from '@/${importPath}'`;
      },
    );

    // 替换 ./xxx 格式的导入
    const currentImportRegex = /from\s+['"](\.\/)([^'"]+)['"]/g;
    newContent = newContent.replace(
      currentImportRegex,
      (match, prefix, importPath) => {
        result.changes++;
        // ./xxx 应该是 @/currentDir/xxx
        if (currentDir === '.') {
          return `from '@/${importPath}'`;
        }
        return `from '@/${currentDir}/${importPath}'`;
      },
    );

    // 处理动态导入 import('./xxx') 和 import('../xxx')
    const dynamicImportRegex = /import\s*\(\s*['"](\.\.\?\/[^'"]+)['"]\s*\)/g;
    newContent = newContent.replace(dynamicImportRegex, (match, importPath) => {
      result.changes++;
      if (importPath.startsWith('../')) {
        const cleanPath = importPath.substring(3); // 移除 ../
        if (levels === 1) {
          return `import('@/${cleanPath}')`;
        } else if (levels === 2) {
          const parentDir = path.dirname(currentDir);
          return `import('@/${parentDir}/${cleanPath}')`;
        }
        return `import('@/${cleanPath}')`;
      } else if (importPath.startsWith('./')) {
        const cleanPath = importPath.substring(2); // 移除 ./
        if (currentDir === '.') {
          return `import('@/${cleanPath}')`;
        }
        return `import('@/${currentDir}/${cleanPath}')`;
      }
      return match;
    });

    // 如果有变更，写回文件
    if (result.changes > 0) {
      writeFileSync(filePath, newContent, 'utf-8');
    }
  } catch (error) {
    result.errors.push(`处理文件时出错: ${error}`);
  }

  return result;
}

/**
 * 主函数
 */
async function main() {
  console.log('🔧 开始简化版相对路径导入修复...');

  // 查找所有需要处理的文件（排除测试文件）
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: [
      'src/**/*.test.{ts,tsx}',
      'src/**/__tests__/**',
      'src/test/**',
      'src/testing/**',
    ],
  });

  console.log(`📁 找到 ${files.length} 个文件需要处理`);

  let totalChanges = 0;
  let processedFiles = 0;
  const errors: string[] = [];

  // 处理每个文件
  for (const file of files) {
    const result = fixFileImports(file);

    if (result.changes > 0) {
      console.log(`✅ ${file}: ${result.changes} 个导入已修复`);
      processedFiles++;
      totalChanges += result.changes;
    }

    if (result.errors.length > 0) {
      errors.push(...result.errors);
    }
  }

  // 输出统计信息
  console.log('\n📊 修复统计:');
  console.log(`- 扫描文件数: ${files.length}`);
  console.log(`- 修改文件数: ${processedFiles}`);
  console.log(`- 修复导入数: ${totalChanges}`);

  if (errors.length > 0) {
    console.log('\n❌ 错误信息:');
    errors.forEach((error) => console.log(`  ${error}`));
  }

  console.log('\n✨ 相对路径导入修复完成！');
  console.log('💡 建议运行 pnpm lint:check 验证修复效果');
}

// 执行主函数
main().catch((error) => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
