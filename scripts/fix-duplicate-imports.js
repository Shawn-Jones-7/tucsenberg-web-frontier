#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 修复重复导入的脚本
 * 处理魔法数字脚本引入的重复导入问题
 */

function fixDuplicateImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let modified = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 检查是否是从 @/constants/magic-numbers 的导入行
      if (line.includes("import {") && line.includes("from '@/constants/magic-numbers'")) {
        // 提取导入的内容
        const importMatch = line.match(/import\s*{\s*([^}]+)\s*}\s*from\s*'@\/constants\/magic-numbers'/);
        if (importMatch) {
          const imports = importMatch[1];
          
          // 分割导入项并去重
          const importItems = imports.split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
          
          // 去重
          const uniqueImports = [...new Set(importItems)];
          
          if (uniqueImports.length !== importItems.length) {
            // 有重复，需要修复
            const newImportLine = `import { ${uniqueImports.join(', ')} } from '@/constants/magic-numbers';`;
            lines[i] = newImportLine;
            modified = true;
            console.log(`修复重复导入: ${filePath}`);
            console.log(`  原始: ${line.trim()}`);
            console.log(`  修复: ${newImportLine}`);
          }
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let totalFixed = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // 跳过 node_modules 和其他不需要处理的目录
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
        totalFixed += processDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      if (fixDuplicateImports(fullPath)) {
        totalFixed++;
      }
    }
  }
  
  return totalFixed;
}

// 主执行逻辑
console.log('开始修复重复导入...');

const srcPath = path.join(process.cwd(), 'src');
if (!fs.existsSync(srcPath)) {
  console.error('src 目录不存在');
  process.exit(1);
}

const fixedCount = processDirectory(srcPath);
console.log(`\n修复完成！共修复了 ${fixedCount} 个文件的重复导入问题。`);
