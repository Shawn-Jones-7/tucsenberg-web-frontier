#!/usr/bin/env node
/*
 * 智能导入修复器
 * - 分析文件中使用的魔法数字常量
 * - 自动添加或更新导入语句
 * - 使用Set去重确保导入列表无重复
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 从magic-numbers.ts提取所有可用常量
function getAvailableConstants() {
  const constantsFile = 'src/constants/magic-numbers.ts';
  const content = fs.readFileSync(constantsFile, 'utf8');
  const matches = content.match(/export const (\w+)/g) || [];
  return matches.map((match) => match.replace('export const ', ''));
}

// 分析文件中使用的常量
function analyzeFileConstants(filePath) {
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf8');
  const availableConstants = getAvailableConstants();
  const usedConstants = [];

  for (const constant of availableConstants) {
    // 检查常量是否在文件中使用（但不是在export语句中定义）
    const regex = new RegExp(`\\b${constant}\\b`, 'g');
    if (regex.test(content) && !content.includes(`export const ${constant}`)) {
      usedConstants.push(constant);
    }
  }

  return [...new Set(usedConstants)]; // 去重
}

// 获取现有导入
function getExistingImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importMatch = content.match(
    /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@\/constants\/magic-numbers['"]/,
  );

  if (!importMatch) return [];

  return importMatch[1]
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

// 更新导入语句
function updateImports(filePath, usedConstants) {
  if (usedConstants.length === 0) return false;

  const existingImports = getExistingImports(filePath);
  const allConstants = [
    ...new Set([...existingImports, ...usedConstants]),
  ].sort();

  let content = fs.readFileSync(filePath, 'utf8');

  // 生成新的导入语句
  const newImportStatement = `import { ${allConstants.join(', ')} } from '@/constants/magic-numbers';`;

  // 移除旧的导入
  content = content.replace(
    /import\s*{\s*[^}]+\s*}\s*from\s*['"]@\/constants\/magic-numbers['"];?\n?/g,
    '',
  );

  // 添加新的导入
  if (existingImports.length > 0 || content.includes('import')) {
    // 在第一个import语句后添加
    const firstImportMatch = content.match(/^import .+;$/m);
    if (firstImportMatch) {
      content = content.replace(
        firstImportMatch[0],
        `${firstImportMatch[0]}\n${newImportStatement}`,
      );
    } else {
      // 在文件开头添加
      content = `${newImportStatement}\n\n${content}`;
    }
  } else {
    // 在文件开头添加
    content = `${newImportStatement}\n\n${content}`;
  }

  fs.writeFileSync(filePath, content);
  return true;
}

// 获取需要修复的文件列表
function getFilesToFix() {
  let output = '';
  try {
    output = execSync('pnpm run type-check 2>&1', {
      encoding: 'utf8',
      shell: true,
      maxBuffer: 1024 * 1024 * 10,
    });
  } catch (error) {
    output = error.stdout || error.output?.join('') || '';
  }

  const files = new Set();
  const lines = output.split('\n');

  for (const line of lines) {
    // 匹配 "Cannot find name" 错误的文件路径
    const match = line.match(
      /^([^(]+)\(\d+,\d+\):\s*error\s+TS2304:\s*Cannot find name/,
    );
    if (match) {
      files.add(match[1]);
    }
  }

  return Array.from(files);
}

// 主执行函数
function main() {
  console.log('🔍 分析需要修复导入的文件...');

  const filesToFix = getFilesToFix();
  console.log(`📊 发现 ${filesToFix.length} 个文件需要修复导入`);

  if (filesToFix.length === 0) {
    console.log('✅ 没有文件需要修复导入');
    return;
  }

  let fixedCount = 0;

  for (const filePath of filesToFix) {
    try {
      const usedConstants = analyzeFileConstants(filePath);
      if (usedConstants.length > 0) {
        const updated = updateImports(filePath, usedConstants);
        if (updated) {
          console.log(`✅ 修复: ${filePath} (${usedConstants.length}个常量)`);
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    }
  }

  console.log(`\n🎉 修复完成！`);
  console.log(`📊 总计修复 ${fixedCount} 个文件`);

  if (fixedCount > 0) {
    console.log('\n💡 建议运行以下命令验证修复效果：');
    console.log('pnpm run type-check');
  }
}

if (require.main === module) {
  main();
}
