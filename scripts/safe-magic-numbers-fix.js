#!/usr/bin/env node
/*
 * 安全魔法数字修复器 (基于CODEX建议)
 * - 修复原脚本的导入逻辑缺陷
 * - 添加预检查验证机制
 * - 实施分批处理和自动验证
 * - 防止上下文替换错误
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 从magic-numbers.ts提取所有可用常量
function getAvailableConstants() {
  const constantsFile = 'src/constants/magic-numbers.ts';
  const content = fs.readFileSync(constantsFile, 'utf8');
  const matches = content.match(/export const (\w+)/g) || [];
  return matches.map(match => match.replace('export const ', ''));
}

// 获取现有导入常量
function getExistingImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importMatch = content.match(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]@\/constants\/magic-numbers['"]/);
  
  if (!importMatch) return [];
  
  return importMatch[1]
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

// 智能更新导入语句 (修复原脚本缺陷)
function updateImports(filePath, newConstants) {
  if (newConstants.length === 0) return false;
  
  const existingImports = getExistingImports(filePath);
  // 使用Set去重并按字母顺序排序 (CODEX建议)
  const allConstants = [...new Set([...existingImports, ...newConstants])].sort();
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 生成新的导入语句
  const newImportStatement = `import { ${allConstants.join(', ')} } from '@/constants/magic-numbers';`;
  
  // 移除旧的导入
  content = content.replace(
    /import\s*{\s*[^}]+\s*}\s*from\s*['"]@\/constants\/magic-numbers['"];?\n?/g,
    ''
  );
  
  // 智能添加新导入 (处理各种文件开头情况)
  if (content.includes('import')) {
    // 在第一个import语句后添加
    const firstImportMatch = content.match(/^import .+;$/m);
    if (firstImportMatch) {
      content = content.replace(
        firstImportMatch[0],
        `${firstImportMatch[0]}\n${newImportStatement}`
      );
    }
  } else {
    // 在文件开头添加 (处理没有其他import的情况)
    content = `${newImportStatement}\n\n${content}`;
  }
  
  fs.writeFileSync(filePath, content);
  return true;
}

// 预检查验证 (CODEX建议)
function validateConstants(errors) {
  const availableConstants = getAvailableConstants();
  const missingConstants = errors.filter(e => 
    !availableConstants.includes(e.constantName)
  );
  
  if (missingConstants.length > 0) {
    console.error('❌ 预检查失败：以下常量未定义');
    missingConstants.forEach(c => {
      console.error(`  - ${c.constantName} (用于数字 ${c.number})`);
    });
    throw new Error(`缺失常量定义: ${missingConstants.map(c => c.constantName).join(', ')}`);
  }
  
  console.log('✅ 预检查通过：所有常量都已定义');
}

// 安全的数字替换 (防止上下文错误)
function safeNumberReplace(content, number, constantName) {
  // 构建更安全的正则表达式
  let regex;
  
  if (number.startsWith('-')) {
    // 负数处理
    regex = new RegExp(`(?<!\\d)${number.replace('.', '\\.')}(?!\\d)`, 'g');
  } else if (number.startsWith('0x')) {
    // 十六进制处理
    regex = new RegExp(`\\b${number}\\b`, 'gi');
  } else {
    // 普通数字 - 添加更严格的边界检查
    const escapedNumber = number.replace('.', '\\.');
    regex = new RegExp(`(?<![\\.\\d])\\b${escapedNumber}\\b(?![\\d])`, 'g');
  }
  
  // 执行替换并记录
  const newContent = content.replace(regex, constantName);
  const replacements = (content.match(regex) || []).length;
  
  if (replacements > 0) {
    console.log(`    替换 ${number} → ${constantName} (${replacements}次)`);
  }
  
  return newContent;
}

// 批处理修复 (CODEX建议)
function processBatch(errors, batchSize = 5) {
  const fileGroups = new Map();
  
  // 按文件分组错误
  for (const error of errors) {
    if (!fileGroups.has(error.file)) {
      fileGroups.set(error.file, []);
    }
    fileGroups.get(error.file).push(error);
  }
  
  const files = Array.from(fileGroups.keys());
  let processedFiles = 0;
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`\n📦 处理批次 ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}`);
    
    for (const filePath of batch) {
      try {
        const fileErrors = fileGroups.get(filePath);
        console.log(`🔧 处理文件: ${path.relative(process.cwd(), filePath)}`);
        
        // 更新导入
        const constantNames = fileErrors.map(e => e.constantName);
        updateImports(filePath, constantNames);
        
        // 安全替换数字
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        for (const error of fileErrors) {
          const newContent = safeNumberReplace(content, error.number, error.constantName);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content);
        }
        
        processedFiles++;
        
      } catch (error) {
        console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
        throw error; // 快速失败
      }
    }
    
    // 批次验证 (CODEX建议)
    console.log('🔍 验证批次结果...');
    try {
      execSync('pnpm run type-check', { stdio: 'pipe' });
      console.log('✅ 批次验证通过');
    } catch (error) {
      console.error('❌ 批次验证失败，停止处理');
      throw new Error('TypeScript编译错误，请检查修复结果');
    }
  }
  
  return processedFiles;
}

// 获取魔法数字错误
function getMagicNumberErrors() {
  let output = '';
  try {
    output = execSync('pnpm lint:check 2>&1', {
      encoding: 'utf8',
      shell: true,
      maxBuffer: 1024 * 1024 * 10,
    });
  } catch (error) {
    output = error.stdout || error.output?.join('') || '';
  }
  
  const errors = [];
  const lines = output.split('\n');
  let currentFile = '';
  
  for (const line of lines) {
    // 检查文件路径
    const fileMatch = line.match(/^\/.*\.(ts|tsx|js|jsx)$/);
    if (fileMatch) {
      currentFile = line.trim();
      continue;
    }
    
    // 检查魔法数字错误
    const errorMatch = line.match(
      /^\s*(\d+):(\d+)\s+(error|warning)\s+No magic number:\s+([-]?(?:0x)?[0-9a-fA-F.]+)\s+no-magic-numbers/
    );
    
    if (errorMatch && currentFile) {
      const [, lineNum, colNum, severity, number] = errorMatch;
      const constantName = getConstantName(number);
      
      errors.push({
        file: currentFile,
        line: parseInt(lineNum),
        column: parseInt(colNum),
        number: number,
        constantName: constantName
      });
    }
  }
  
  return errors;
}

// 生成常量名
function getConstantName(number) {
  const constantMap = {
    '0.5': 'MAGIC_0_5',
    '0.9': 'MAGIC_0_9', 
    '1.5': 'MAGIC_1_5',
    '131': 'MAGIC_131',
    '132': 'MAGIC_132',
    '133': 'MAGIC_133',
    '136': 'MAGIC_136',
    '190': 'MAGIC_190',
    '368': 'MAGIC_368'
  };
  
  return constantMap[number] || `MAGIC_${number.replace(/[.-]/g, '_').replace(/^0x/, 'HEX_')}`;
}

// 主函数
function main() {
  console.log('🔍 安全魔法数字修复器启动...');
  
  const errors = getMagicNumberErrors();
  if (errors.length === 0) {
    console.log('✅ 未发现需要修复的魔法数字');
    return;
  }
  
  console.log(`📊 发现 ${errors.length} 个魔法数字错误`);
  
  try {
    // 预检查验证
    validateConstants(errors);
    
    // 分批处理
    const processedFiles = processBatch(errors, 3); // 小批次，更安全
    
    console.log(`\n🎉 修复完成！处理了 ${processedFiles} 个文件`);
    
    // 最终验证
    console.log('🔍 执行最终验证...');
    execSync('pnpm run type-check', { stdio: 'inherit' });
    
    const remainingErrors = getMagicNumberErrors().length;
    console.log(`📊 剩余魔法数字错误: ${remainingErrors} 个`);
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
    console.log('\n💡 建议检查最近的修改并运行 pnpm run type-check');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
