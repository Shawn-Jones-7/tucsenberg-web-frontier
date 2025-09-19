#!/usr/bin/env tsx

/**
 * 批量修复相对路径导入脚本
 * 将所有 ../xxx 和 ./xxx 导入替换为 @/xxx 绝对路径导入
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { glob } from 'glob';

interface ImportReplacement {
  file: string;
  line: number;
  original: string;
  replacement: string;
}

/**
 * 将相对路径转换为@/绝对路径
 */
function convertRelativeToAbsolute(
  relativePath: string,
  currentFilePath: string,
): string {
  // 获取当前文件相对于项目根目录的目录路径
  const currentDir = path.dirname(currentFilePath);

  // 解析相对路径，得到绝对路径
  const absolutePath = path.resolve(currentDir, relativePath);

  // 将绝对路径转换为相对于src目录的路径
  const srcRelativePath = path.relative('src', absolutePath);

  // 返回@/格式的路径，确保使用正斜杠
  return `@/${srcRelativePath.replace(/\\/g, '/')}`;
}

/**
 * 处理单个文件的导入替换
 */
function processFile(filePath: string): ImportReplacement[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const replacements: ImportReplacement[] = [];

  let hasChanges = false;
  const newLines = lines.map((line, index) => {
    // 匹配各种导入语句的正则表达式
    const importPatterns = [
      // import ... from './xxx' 或 '../xxx'
      /^(\s*import\s+.*?\s+from\s+['"])(\.\.?\/[^'"]+)(['"])/,
      // import('./xxx') 或 import('../xxx') 动态导入
      /^(\s*.*?import\s*\(\s*['"])(\.\.?\/[^'"]+)(['"])/,
      // require('./xxx') 或 require('../xxx')
      /^(\s*.*?require\s*\(\s*['"])(\.\.?\/[^'"]+)(['"])/,
    ];

    for (const pattern of importPatterns) {
      const match = line.match(pattern);
      if (match) {
        const [, prefix, relativePath, suffix] = match;

        // 跳过已经是@/格式的导入
        if (relativePath.startsWith('@/')) {
          continue;
        }

        // 转换为绝对路径
        const absolutePath = convertRelativeToAbsolute(relativePath, filePath);
        const newLine = `${prefix}${absolutePath}${suffix}`;

        replacements.push({
          file: filePath,
          line: index + 1,
          original: line.trim(),
          replacement: newLine.trim(),
        });

        hasChanges = true;
        return newLine;
      }
    }

    return line;
  });

  // 如果有变更，写回文件
  if (hasChanges) {
    writeFileSync(filePath, newLines.join('\n'), 'utf-8');
  }

  return replacements;
}

/**
 * 主函数
 */
async function main() {
  console.log('🔧 开始批量修复相对路径导入...');

  // 查找所有需要处理的文件
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
    ignore: [
      'src/**/*.test.{ts,tsx,js,jsx}',
      'src/**/__tests__/**',
      'src/test/**',
      'src/testing/**',
    ],
  });

  console.log(`📁 找到 ${files.length} 个文件需要处理`);

  let totalReplacements = 0;
  const allReplacements: ImportReplacement[] = [];

  // 处理每个文件
  for (const file of files) {
    try {
      const replacements = processFile(file);
      if (replacements.length > 0) {
        console.log(`✅ ${file}: ${replacements.length} 个导入已修复`);
        allReplacements.push(...replacements);
        totalReplacements += replacements.length;
      }
    } catch (error) {
      console.error(`❌ 处理文件 ${file} 时出错:`, error);
    }
  }

  // 输出统计信息
  console.log('\n📊 修复统计:');
  console.log(`- 处理文件数: ${files.length}`);
  console.log(`- 修复导入数: ${totalReplacements}`);

  if (allReplacements.length > 0) {
    console.log('\n📝 修复详情:');
    allReplacements.slice(0, 10).forEach((replacement) => {
      console.log(`  ${replacement.file}:${replacement.line}`);
      console.log(`    - ${replacement.original}`);
      console.log(`    + ${replacement.replacement}`);
    });

    if (allReplacements.length > 10) {
      console.log(`  ... 还有 ${allReplacements.length - 10} 个修复项`);
    }
  }

  console.log('\n✨ 相对路径导入修复完成！');
  console.log('💡 建议运行 pnpm lint:check 验证修复效果');
}

// 执行主函数
main().catch((error) => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
