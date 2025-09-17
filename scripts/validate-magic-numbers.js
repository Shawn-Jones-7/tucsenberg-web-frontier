#!/usr/bin/env node
/*
 * 魔法数字修复验证器 (基于CODEX建议)
 * - 验证常量定义完整性
 * - 检查导入语句正确性
 * - 生成修复前后对比报告
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取所有可用常量
function getAvailableConstants() {
  const constantsFile = 'src/constants/magic-numbers.ts';
  const content = fs.readFileSync(constantsFile, 'utf8');
  const matches = content.match(/export const (\w+)/g) || [];
  return matches.map(match => match.replace('export const ', ''));
}

// 获取当前魔法数字错误
function getCurrentMagicNumberErrors() {
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
    const fileMatch = line.match(/^\/.*\.(ts|tsx|js|jsx)$/);
    if (fileMatch) {
      currentFile = line.trim();
      continue;
    }
    
    const errorMatch = line.match(
      /^\s*(\d+):(\d+)\s+(error|warning)\s+No magic number:\s+([-]?(?:0x)?[0-9a-fA-F.]+)\s+no-magic-numbers/
    );
    
    if (errorMatch && currentFile) {
      const [, lineNum, colNum, severity, number] = errorMatch;
      errors.push({
        file: currentFile,
        line: parseInt(lineNum),
        column: parseInt(colNum),
        number: number,
        constantName: getConstantName(number)
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

// 验证常量定义完整性
function validateConstantDefinitions() {
  console.log('🔍 验证常量定义完整性...');
  
  const errors = getCurrentMagicNumberErrors();
  const availableConstants = getAvailableConstants();
  const missingConstants = [];
  
  for (const error of errors) {
    if (!availableConstants.includes(error.constantName)) {
      missingConstants.push({
        number: error.number,
        constantName: error.constantName,
        files: errors.filter(e => e.constantName === error.constantName).map(e => e.file)
      });
    }
  }
  
  // 去重
  const uniqueMissing = missingConstants.reduce((acc, current) => {
    const existing = acc.find(item => item.constantName === current.constantName);
    if (!existing) {
      acc.push(current);
    }
    return acc;
  }, []);
  
  if (uniqueMissing.length === 0) {
    console.log('✅ 所有需要的常量都已定义');
    return true;
  } else {
    console.log('❌ 发现缺失的常量定义:');
    uniqueMissing.forEach(missing => {
      console.log(`  - ${missing.constantName} = ${missing.number}; // 用于 ${missing.files.length} 个文件`);
    });
    return false;
  }
}

// 检查导入语句正确性
function validateImports() {
  console.log('🔍 验证导入语句正确性...');
  
  const errors = getCurrentMagicNumberErrors();
  const fileGroups = new Map();
  
  // 按文件分组
  for (const error of errors) {
    if (!fileGroups.has(error.file)) {
      fileGroups.set(error.file, []);
    }
    fileGroups.get(error.file).push(error);
  }
  
  const importIssues = [];
  
  for (const [filePath, fileErrors] of fileGroups) {
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const importMatch = content.match(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]@\/constants\/magic-numbers['"]/);
    
    const neededConstants = fileErrors.map(e => e.constantName);
    const importedConstants = importMatch ? 
      importMatch[1].split(',').map(item => item.trim()).filter(item => item.length > 0) : [];
    
    const missingImports = neededConstants.filter(constant => !importedConstants.includes(constant));
    
    if (missingImports.length > 0) {
      importIssues.push({
        file: filePath,
        missing: missingImports,
        needed: neededConstants,
        imported: importedConstants
      });
    }
  }
  
  if (importIssues.length === 0) {
    console.log('✅ 所有导入语句都正确');
    return true;
  } else {
    console.log('❌ 发现导入问题:');
    importIssues.forEach(issue => {
      console.log(`  文件: ${path.relative(process.cwd(), issue.file)}`);
      console.log(`    缺失导入: ${issue.missing.join(', ')}`);
    });
    return false;
  }
}

// 生成修复报告
function generateReport() {
  console.log('📊 生成修复状态报告...');
  
  const errors = getCurrentMagicNumberErrors();
  const availableConstants = getAvailableConstants();
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_magic_number_errors: errors.length,
      total_available_constants: availableConstants.length,
      files_with_errors: new Set(errors.map(e => e.file)).size
    },
    errors_by_number: {},
    errors_by_file: {},
    next_steps: []
  };
  
  // 按数字分组错误
  for (const error of errors) {
    if (!report.errors_by_number[error.number]) {
      report.errors_by_number[error.number] = {
        constant_name: error.constantName,
        count: 0,
        files: []
      };
    }
    report.errors_by_number[error.number].count++;
    report.errors_by_number[error.number].files.push(error.file);
  }
  
  // 按文件分组错误
  for (const error of errors) {
    if (!report.errors_by_file[error.file]) {
      report.errors_by_file[error.file] = [];
    }
    report.errors_by_file[error.file].push({
      line: error.line,
      column: error.column,
      number: error.number,
      constant_name: error.constantName
    });
  }
  
  // 生成下一步建议
  if (errors.length === 0) {
    report.next_steps.push('🎉 所有魔法数字错误已修复！');
  } else {
    report.next_steps.push(`📝 剩余 ${errors.length} 个魔法数字错误需要修复`);
    report.next_steps.push('🔧 运行 node scripts/safe-magic-numbers-fix.js 进行安全修复');
    report.next_steps.push('✅ 每批修复后运行 pnpm run type-check 验证');
  }
  
  // 保存报告
  const reportPath = 'scripts/magic-numbers-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 报告已保存到: ${reportPath}`);
  
  return report;
}

// 主函数
function main() {
  console.log('🔍 魔法数字修复验证器启动...\n');
  
  try {
    // 验证TypeScript编译状态
    console.log('🔍 验证TypeScript编译状态...');
    execSync('pnpm run type-check', { stdio: 'pipe' });
    console.log('✅ TypeScript编译正常\n');
    
    // 验证常量定义
    const constantsValid = validateConstantDefinitions();
    console.log('');
    
    // 验证导入语句
    const importsValid = validateImports();
    console.log('');
    
    // 生成报告
    const report = generateReport();
    
    // 总结
    console.log('\n📋 验证总结:');
    console.log(`  TypeScript编译: ✅ 正常`);
    console.log(`  常量定义: ${constantsValid ? '✅ 完整' : '❌ 缺失'}`);
    console.log(`  导入语句: ${importsValid ? '✅ 正确' : '❌ 有问题'}`);
    console.log(`  剩余魔法数字错误: ${report.summary.total_magic_number_errors} 个`);
    
    if (constantsValid && importsValid && report.summary.total_magic_number_errors === 0) {
      console.log('\n🎉 所有验证通过！魔法数字修复完成！');
    } else {
      console.log('\n⚠️  仍有问题需要解决，请查看上述详细信息');
    }
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
