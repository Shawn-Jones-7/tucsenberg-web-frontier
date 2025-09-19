const { readdirSync, statSync } = require('fs');
const { join, resolve } = require('path');

function findTsFiles(dir, pattern = /\.(ts|tsx)$/) {
  const results = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules') {
          results.push(...findTsFiles(fullPath, pattern));
        }
      } else if (stat.isFile() && pattern.test(item)) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`无法读取目录 ${dir}:`, error.message);
  }

  return results;
}

// 测试
const rootDir = resolve(__dirname, '../..');
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

  console.log('\n✅ 文件查找功能正常工作！');
} else {
  console.log('❌ 未找到任何TypeScript文件');
}
