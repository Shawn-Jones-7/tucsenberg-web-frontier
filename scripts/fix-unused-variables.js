#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始修复未使用变量和声明错误...');

// 获取所有未使用变量和声明错误
function getUnusedVariableErrors() {
  try {
    const output = execSync(
      'pnpm type-check 2>&1 | grep -E "(TS6133|TS6196)"',
      { encoding: 'utf8' },
    );
    return output
      .trim()
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const match = line.match(
          /^([^(]+)\((\d+),(\d+)\): error (TS\d+): '([^']+)' is declared but its value is never read\./,
        );
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            errorCode: match[4],
            variable: match[5],
            fullLine: line,
          };
        }
        return null;
      })
      .filter(Boolean);
  } catch (error) {
    console.log('没有找到未使用变量错误');
    return [];
  }
}

// 安全地修复未使用变量
function fixUnusedVariableInFile(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 文件不存在: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;

  // 按行号倒序处理，避免行号偏移问题
  const sortedErrors = errors.sort((a, b) => b.line - a.line);

  for (const error of sortedErrors) {
    const lineIndex = error.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      const {variable} = error;

      // 处理不同类型的未使用变量
      if (error.errorCode === 'TS6133') {
        // 未使用的变量
        if (variable.startsWith('_')) {
          // 已经是下划线前缀，跳过
          continue;
        }

        // 特殊处理：测试文件中的变量可以添加下划线前缀
        if (filePath.includes('.test.') || filePath.includes('__tests__')) {
          const newLine = line.replace(
            new RegExp(`\\b${variable}\\b`),
            `_${variable}`,
          );
          if (newLine !== line) {
            lines[lineIndex] = newLine;
            modified = true;
            console.log(
              `  ✅ 测试文件变量添加下划线前缀: ${variable} -> _${variable}`,
            );
          }
        }
        // 对于非测试文件，如果是函数参数，也可以添加下划线
        else if (line.includes('(') && line.includes(')')) {
          const newLine = line.replace(
            new RegExp(`\\b${variable}\\b`),
            `_${variable}`,
          );
          if (newLine !== line) {
            lines[lineIndex] = newLine;
            modified = true;
            console.log(
              `  ✅ 函数参数添加下划线前缀: ${variable} -> _${variable}`,
            );
          }
        }
      } else if (error.errorCode === 'TS6196') {
        // 未使用的导入
        // 检查是否是单独的导入行
        if (line.trim().startsWith('import') && line.includes(variable)) {
          // 如果是单独导入且只有这一个变量，删除整行
          const importMatch = line.match(/import\s*\{\s*([^}]+)\s*\}/);
          if (importMatch) {
            const imports = importMatch[1].split(',').map((imp) => imp.trim());
            if (imports.length === 1 && imports[0] === variable) {
              // 删除整行导入
              lines.splice(lineIndex, 1);
              modified = true;
              console.log(`  ✅ 删除未使用的导入行: ${variable}`);
              continue;
            } else if (imports.length > 1) {
              // 从多个导入中移除这个变量
              const newImports = imports.filter((imp) => imp !== variable);
              const newLine = line.replace(
                /\{[^}]+\}/,
                `{ ${newImports.join(', ')} }`,
              );
              lines[lineIndex] = newLine;
              modified = true;
              console.log(`  ✅ 从导入中移除: ${variable}`);
            }
          }
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
  const errors = getUnusedVariableErrors();

  if (errors.length === 0) {
    console.log('✅ 没有找到需要修复的未使用变量错误');
    return;
  }

  console.log(`📁 找到 ${errors.length} 个未使用变量错误`);

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
    if (fixUnusedVariableInFile(file, fileErrors)) {
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
    const unusedErrors = execSync(
      'pnpm type-check 2>&1 | grep -E "(TS6133|TS6196)" | wc -l',
      { encoding: 'utf8' },
    ).trim();

    console.log(`总错误数: ${errorCount}`);
    console.log(`剩余未使用变量错误: ${unusedErrors}`);

    if (parseInt(unusedErrors) > 0) {
      console.log('\n剩余错误示例:');
      const examples = execSync(
        'pnpm type-check 2>&1 | grep -E "(TS6133|TS6196)" | head -5',
        { encoding: 'utf8' },
      );
      console.log(examples);
    }
  } catch (error) {
    console.log('验证时出错:', error.message);
  }

  console.log('\n🎯 未使用变量修复任务完成！');
}

main();
