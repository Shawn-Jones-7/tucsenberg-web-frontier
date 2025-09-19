#!/usr/bin/env tsx
import { readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * 递归查找匹配的TypeScript文件
 */
function findTsFiles(dir: string, pattern: RegExp = /\.(ts|tsx)$/): string[] {
  const results: string[] = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // 跳过node_modules和.git等目录
        if (!item.startsWith('.') && item !== 'node_modules') {
          results.push(...findTsFiles(fullPath, pattern));
        }
      } else if (stat.isFile() && pattern.test(item)) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`无法读取目录 ${dir}:`, error);
  }

  return results;
}

// 测试文件查找
const rootDir = process.cwd().endsWith('scripts/magic-numbers')
  ? resolve(process.cwd(), '../..')
  : process.cwd();

const srcDir = resolve(rootDir, 'src');

console.log('根目录:', rootDir);
console.log('源码目录:', srcDir);

const files = findTsFiles(srcDir);
console.log(`找到 ${files.length} 个TypeScript文件`);

if (files.length > 0) {
  console.log('前10个文件:');
  files.slice(0, 10).forEach((file, index) => {
    console.log(`${index + 1}. ${file.replace(rootDir, '.')}`);
  });
}
