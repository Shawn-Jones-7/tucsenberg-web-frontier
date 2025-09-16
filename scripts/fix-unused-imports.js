#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始修复未使用的导入声明...');

// 获取所有TS6196错误（未使用的导入）
function getUnusedImportErrors() {
  try {
    const output = execSync('pnpm type-check 2>&1 | grep "TS6196"', {
      encoding: 'utf8',
    });
    return output
      .trim()
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const match = line.match(
          /^([^(]+)\((\d+),(\d+)\): error TS6196: '([^']+)' is declared but never used\./,
        );
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            variable: match[4],
            fullLine: line,
          };
        }
        return null;
      })
      .filter(Boolean);
  } catch (error) {
    console.log('没有找到未使用的导入错误');
    return [];
  }
}

// 修复文件中的未使用导入
function fixUnusedImportsInFile(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 文件不存在: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 按变量名分组处理
  const variablesByLine = {};
  errors.forEach((error) => {
    if (!variablesByLine[error.line]) {
      variablesByLine[error.line] = [];
    }
    variablesByLine[error.line].push(error.variable);
  });

  // 处理每一行的导入
  for (const [lineNum, variables] of Object.entries(variablesByLine)) {
    const lineIndex = parseInt(lineNum) - 1;
    const lines = content.split('\n');

    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];

      // 检查是否是import语句
      if (line.trim().startsWith('import')) {
        let newLine = line;

        // 处理每个未使用的变量
        for (const variable of variables) {
          // 检查是否是花括号导入 import { ... } from '...'
          const braceMatch = newLine.match(/import\s*\{\s*([^}]+)\s*\}\s*from/);
          if (braceMatch) {
            const imports = braceMatch[1]
              .split(',')
              .map((imp) => imp.trim())
              .filter((imp) => imp);
            const filteredImports = imports.filter((imp) => imp !== variable);

            if (filteredImports.length === 0) {
              // 如果没有剩余导入，删除整行
              newLine = '';
              console.log(`  ✅ 删除空导入行: ${variable}`);
            } else if (filteredImports.length < imports.length) {
              // 移除特定的导入
              newLine = newLine.replace(
                /\{[^}]+\}/,
                `{ ${filteredImports.join(', ')} }`,
              );
              console.log(`  ✅ 从导入中移除: ${variable}`);
            }
          }
          // 检查是否是默认导入 import Variable from '...'
          else if (newLine.includes(`import ${variable} from`)) {
            newLine = '';
            console.log(`  ✅ 删除未使用的默认导入: ${variable}`);
          }
          // 检查是否是命名空间导入 import * as Variable from '...'
          else if (newLine.includes(`import * as ${variable} from`)) {
            newLine = '';
            console.log(`  ✅ 删除未使用的命名空间导入: ${variable}`);
          }
        }

        if (newLine !== line) {
          if (newLine.trim() === '') {
            // 删除整行
            lines.splice(lineIndex, 1);
          } else {
            // 更新行内容
            lines[lineIndex] = newLine;
          }
          modified = true;
        }
      }
    }
  }

  if (modified) {
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent);
    return true;
  }

  return false;
}

// 主执行函数
function main() {
  const errors = getUnusedImportErrors();

  if (errors.length === 0) {
    console.log('✅ 没有找到需要修复的未使用导入错误');
    return;
  }

  console.log(`📁 找到 ${errors.length} 个未使用导入错误`);

  // 按文件分组
  const errorsByFile = {};
  errors.forEach((error) => {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  });

  let fixedFiles = 0;
  let totalFixed = 0;

  for (const [file, fileErrors] of Object.entries(errorsByFile)) {
    console.log(`\n📄 处理文件: ${file} (${fileErrors.length} 个错误)`);
    if (fixUnusedImportsInFile(file, fileErrors)) {
      fixedFiles++;
      totalFixed += fileErrors.length;
    }
  }

  console.log(`\n📊 修复完成统计:`);
  console.log(`   修复文件数: ${fixedFiles}`);
  console.log(`   修复错误数: ${totalFixed}`);

  // 验证修复效果
  console.log('\n🔍 验证修复效果...');
  try {
    const errorCount = execSync('pnpm type-check 2>&1 | grep -c "error TS"', {
      encoding: 'utf8',
    }).trim();
    const unusedImportErrors = execSync(
      'pnpm type-check 2>&1 | grep "TS6196" | wc -l',
      { encoding: 'utf8' },
    ).trim();

    console.log(`总错误数: ${errorCount}`);
    console.log(`剩余未使用导入错误: ${unusedImportErrors}`);

    if (parseInt(unusedImportErrors) > 0) {
      console.log('\n剩余错误示例:');
      const examples = execSync(
        'pnpm type-check 2>&1 | grep "TS6196" | head -5',
        { encoding: 'utf8' },
      );
      console.log(examples);
    }
  } catch (error) {
    console.log('验证时出错:', error.message);
  }

  console.log('\n🎯 未使用导入修复任务完成！');
}

main();
