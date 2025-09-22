#!/usr/bin/env node

/**
 * 修复TS1205重新导出错误
 * 将 export * from 转换为具体的命名导出
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 分析模块的导出内容
 */
function analyzeModuleExports(modulePath) {
  try {
    const content = fs.readFileSync(modulePath, 'utf8');
    const exports = new Set();

    // 匹配 export { ... } from 语句
    const namedExportRegex =
      /export\s*{\s*([^}]+)\s*}\s*from\s*['"][^'"]+['"]/g;
    let match;
    while ((match = namedExportRegex.exec(content)) !== null) {
      const exportList = match[1].split(',').map((exp) => exp.trim());
      exportList.forEach((exp) => {
        // 处理 as 重命名
        const cleanExp = exp.split(' as ')[0].trim();
        exports.add(cleanExp);
      });
    }

    // 匹配 export const/function/class/interface/type 语句
    const directExportRegex =
      /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
    while ((match = directExportRegex.exec(content)) !== null) {
      exports.add(match[1]);
    }

    // 匹配 export type { ... } 语句
    const typeExportRegex = /export\s+type\s*{\s*([^}]+)\s*}/g;
    while ((match = typeExportRegex.exec(content)) !== null) {
      const typeList = match[1].split(',').map((exp) => exp.trim());
      typeList.forEach((exp) => {
        const cleanExp = exp.split(' as ')[0].trim();
        exports.add(cleanExp);
      });
    }

    return Array.from(exports);
  } catch (error) {
    console.warn(`无法分析模块 ${modulePath}: ${error.message}`);
    return [];
  }
}

/**
 * 修复单个文件的export *问题
 */
function fixExportStarInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let modified = false;

    // 匹配 export * from 'module' 语句
    const exportStarRegex = /export\s*\*\s*from\s*['"]([^'"]+)['"]/g;
    const matches = [];
    let match;

    while ((match = exportStarRegex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        modulePath: match[1],
      });
    }

    // 处理每个 export * 语句
    for (const matchInfo of matches) {
      const { fullMatch, modulePath } = matchInfo;

      // 解析相对路径
      let resolvedPath;
      if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
        resolvedPath = path.resolve(path.dirname(filePath), modulePath);
        // 尝试添加.ts扩展名
        if (!fs.existsSync(resolvedPath) && !resolvedPath.endsWith('.ts')) {
          resolvedPath += '.ts';
        }
      } else {
        // 跳过外部模块
        continue;
      }

      if (fs.existsSync(resolvedPath)) {
        const exports = analyzeModuleExports(resolvedPath);

        if (exports.length > 0) {
          // 将导出分为类型和值
          const typeExports = [];
          const valueExports = [];

          // 简单的启发式分类（可以根据需要改进）
          exports.forEach((exp) => {
            if (
              exp.includes('Type') ||
              exp.includes('Interface') ||
              exp.includes('Config') ||
              exp.includes('Options') ||
              (exp.startsWith('I') && exp[1] === exp[1].toUpperCase())
            ) {
              typeExports.push(exp);
            } else {
              valueExports.push(exp);
            }
          });

          let replacement = '';

          // 添加类型导出
          if (typeExports.length > 0) {
            replacement += `export type { ${typeExports.join(', ')} } from '${modulePath}';\n`;
          }

          // 添加值导出
          if (valueExports.length > 0) {
            replacement += `export { ${valueExports.join(', ')} } from '${modulePath}';`;
          }

          // 如果没有分类，全部作为值导出
          if (
            typeExports.length === 0 &&
            valueExports.length === 0 &&
            exports.length > 0
          ) {
            replacement = `export { ${exports.join(', ')} } from '${modulePath}';`;
          }

          if (replacement) {
            newContent = newContent.replace(fullMatch, replacement);
            modified = true;
            console.log(
              `  修复 ${filePath}: 替换 export * from '${modulePath}' -> ${exports.length}个具体导出`,
            );
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error.message);
    return false;
  }
}

/**
 * 递归处理目录中的所有TypeScript文件
 */
function fixExportStarInDirectory(dirPath) {
  let fixedCount = 0;

  function processDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // 跳过不需要处理的目录
        if (
          ![
            'node_modules',
            '.next',
            '.git',
            'dist',
            'build',
            'backups',
          ].includes(item)
        ) {
          processDirectory(fullPath);
        }
      } else if (stat.isFile() && /\.(ts|tsx)$/.test(item)) {
        if (fixExportStarInFile(fullPath)) {
          fixedCount++;
        }
      }
    }
  }

  if (fs.existsSync(dirPath)) {
    processDirectory(dirPath);
  }

  return fixedCount;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始修复TS1205重新导出错误...\n');

  const startTime = Date.now();

  // 修复src目录
  console.log('📁 处理 src 目录...');
  const srcFixedCount = fixExportStarInDirectory('./src');

  const totalFixed = srcFixedCount;
  const duration = Date.now() - startTime;

  console.log(`\n📊 修复完成统计:`);
  console.log(`   修复文件数: ${totalFixed}`);
  console.log(`   耗时: ${duration}ms`);

  // 运行TypeScript检查验证修复效果
  console.log('\n🔍 验证修复效果...');
  try {
    const output = execSync('pnpm type-check 2>&1', { encoding: 'utf8' });
    const errorCount = (output.match(/error TS/g) || []).length;
    console.log(`✅ TypeScript检查完成，剩余错误: ${errorCount}个`);
  } catch (error) {
    const errorOutput = error.stdout || error.stderr || '';
    const errorCount = (errorOutput.match(/error TS/g) || []).length;
    console.log(`⚠️ 仍有TypeScript错误: ${errorCount}个`);

    // 显示TS1205相关错误
    const errorLines = errorOutput.split('\n');
    const ts1205Errors = errorLines.filter((line) => line.includes('TS1205'));
    if (ts1205Errors.length > 0) {
      console.log('\n剩余TS1205错误:');
      ts1205Errors.slice(0, 5).forEach((line) => {
        console.log(`  ${line}`);
      });
    }
  }

  console.log('\n🎯 TS1205修复任务完成！');
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { fixExportStarInFile, fixExportStarInDirectory };
