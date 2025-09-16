#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始修复剩余的import type问题...');

// 获取所有有import type错误的文件
function getFilesWithImportTypeErrors() {
  try {
    const output = execSync(
      'pnpm type-check 2>&1 | grep -E "(TS1484|TS1361)" | grep -o "src/[^(]*" | sort | uniq',
      { encoding: 'utf8' },
    );
    return output
      .trim()
      .split('\n')
      .filter((file) => file.trim());
  } catch (error) {
    console.log('没有找到import type错误');
    return [];
  }
}

// 修复单个文件的import type问题
function fixImportTypeInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 文件不存在: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 常见的需要修复的模式
  const fixes = [
    // TS1484: 需要添加type关键字的类型导入
    {
      pattern: /import \{([^}]*)\} from '([^']+)';/g,
      replacement: (match, imports, from) => {
        // 检查是否包含需要type-only import的类型
        const typeOnlyTypes = [
          'QualityBenchmark',
          'QualityComparison',
          'QualityReport',
          'TranslationManagerConfig',
          'TranslationQualityCheck',
          'ValidationReport',
          'LocaleQualityReport',
          'QualityIssue',
          'QualityScore',
          'TranslationSecurityConfig',
          'SecurityReport',
          'SecurityIssue',
          'QualityCheckResult',
          'QualityMetrics',
          'TranslationQuality',
          'QualityAnalysis',
          'TranslationValidationConfig',
          'ValidationError',
          'ValidationResult',
        ];

        const importList = imports.split(',').map((imp) => imp.trim());
        const typeImports = [];
        const valueImports = [];

        importList.forEach((imp) => {
          if (typeOnlyTypes.some((type) => imp.includes(type))) {
            typeImports.push(imp);
          } else {
            valueImports.push(imp);
          }
        });

        let result = '';
        if (typeImports.length > 0) {
          result += `import type { ${typeImports.join(', ')} } from '${from}';`;
        }
        if (valueImports.length > 0) {
          if (result) result += '\n';
          result += `import { ${valueImports.join(', ')} } from '${from}';`;
        }

        return result || match;
      },
    },
    // STORAGE_KEYS 应该是值导入，不是类型导入
    {
      pattern:
        /import type \{([^}]*),\s*STORAGE_KEYS,([^}]*)\} from '([^']+)';/g,
      replacement: (match, before, after, from) => {
        const beforeClean = before.trim() ? `${before.trim()  },` : '';
        const afterClean = after.trim() ? `,${  after.trim()}` : '';
        return `import type {${beforeClean}${afterClean}} from '${from}';\nimport { STORAGE_KEYS } from '${from}';`;
      },
    },
    {
      pattern: /import type \{\s*STORAGE_KEYS,([^}]*)\} from '([^']+)';/g,
      replacement: (match, after, from) => {
        const afterClean = after.trim() ? after.trim() : '';
        if (afterClean) {
          return `import type {${afterClean}} from '${from}';\nimport { STORAGE_KEYS } from '${from}';`;
        } 
          return `import { STORAGE_KEYS } from '${from}';`;
        
      },
    },
    {
      pattern: /import type \{([^}]*),\s*STORAGE_KEYS\s*\} from '([^']+)';/g,
      replacement: (match, before, from) => {
        const beforeClean = before.trim() ? before.trim() : '';
        if (beforeClean) {
          return `import type {${beforeClean}} from '${from}';\nimport { STORAGE_KEYS } from '${from}';`;
        } 
          return `import { STORAGE_KEYS } from '${from}';`;
        
      },
    },
    // 其他常见的值导入错误
    {
      pattern:
        /import type \{([^}]*),\s*(QUALITY_BENCHMARKS|TRANSLATION_LIMITS|VALIDATION_RULES|STORAGE_CONSTANTS),([^}]*)\} from '([^']+)';/g,
      replacement: (match, before, constant, after, from) => {
        const beforeClean = before.trim() ? `${before.trim()  },` : '';
        const afterClean = after.trim() ? `,${  after.trim()}` : '';
        return `import type {${beforeClean}${afterClean}} from '${from}';\nimport { ${constant} } from '${from}';`;
      },
    },
    // 单独的常量导入
    {
      pattern:
        /import type \{\s*(STORAGE_CONSTANTS|QUALITY_BENCHMARKS|TRANSLATION_LIMITS|VALIDATION_RULES)\s*\} from '([^']+)';/g,
      replacement: (match, constant, from) => {
        return `import { ${constant} } from '${from}';`;
      },
    },
    {
      pattern:
        /import type \{([^}]*),\s*(STORAGE_CONSTANTS|QUALITY_BENCHMARKS|TRANSLATION_LIMITS|VALIDATION_RULES)\s*\} from '([^']+)';/g,
      replacement: (match, before, constant, from) => {
        const beforeClean = before.trim() ? before.trim() : '';
        if (beforeClean) {
          return `import type {${beforeClean}} from '${from}';\nimport { ${constant} } from '${from}';`;
        } 
          return `import { ${constant} } from '${from}';`;
        
      },
    },
  ];

  // 应用修复
  for (const fix of fixes) {
    if (typeof fix.replacement === 'function') {
      content = content.replace(fix.pattern, fix.replacement);
    } else {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
  }

  // 检查是否有修改
  const originalContent = fs.readFileSync(filePath, 'utf8');
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    modified = true;
  }

  return modified;
}

// 主执行函数
function main() {
  const files = getFilesWithImportTypeErrors();

  if (files.length === 0) {
    console.log('✅ 没有找到需要修复的import type错误');
    return;
  }

  console.log(`📁 找到 ${files.length} 个文件需要修复:`);
  files.forEach((file) => console.log(`   - ${file}`));

  let fixedCount = 0;

  for (const file of files) {
    if (fixImportTypeInFile(file)) {
      console.log(`✅ 修复: ${file}`);
      fixedCount++;
    }
  }

  console.log(`\n📊 修复完成统计:`);
  console.log(`   修复文件数: ${fixedCount}`);

  // 验证修复效果
  console.log('\n🔍 验证修复效果...');
  try {
    const errorCount = execSync('pnpm type-check 2>&1 | grep -c "error TS"', {
      encoding: 'utf8',
    }).trim();
    const importTypeErrors = execSync(
      'pnpm type-check 2>&1 | grep -E "(TS1484|TS1361)" | wc -l',
      { encoding: 'utf8' },
    ).trim();

    console.log(`总错误数: ${errorCount}`);
    console.log(`剩余import type错误: ${importTypeErrors}`);

    if (parseInt(importTypeErrors) > 0) {
      console.log('\n剩余错误示例:');
      const examples = execSync(
        'pnpm type-check 2>&1 | grep -E "(TS1484|TS1361)" | head -5',
        { encoding: 'utf8' },
      );
      console.log(examples);
    }
  } catch (error) {
    console.log('验证时出错:', error.message);
  }

  console.log('\n🎯 批量修复任务完成！');
}

main();
