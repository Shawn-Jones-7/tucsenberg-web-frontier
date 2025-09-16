#!/usr/bin/env node

/**
 * 翻译键自动扫描工具
 * 使用AST解析扫描代码中的翻译键，确保翻译完整性
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const glob = require('glob');

console.log('🔍 开始翻译键扫描...\n');

// 配置
const CONFIG = {
  // 扫描的文件模式
  SCAN_PATTERNS: [
    'src/**/*.{ts,tsx,js,jsx}',
    'app/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/*.spec.{ts,tsx,js,jsx}',
    '!**/*.d.ts',
  ],

  // 翻译函数名
  TRANSLATION_FUNCTIONS: ['t', 'useTranslations', 'getTranslations'],

  // 输出目录
  OUTPUT_DIR: path.join(process.cwd(), 'reports'),

  // 翻译文件目录
  MESSAGES_DIR: path.join(process.cwd(), 'messages'),

  // 支持的语言
  LOCALES: ['en', 'zh'],
};

const scanResults = {
  totalFiles: 0,
  scannedFiles: 0,
  translationKeys: new Set(),
  keyUsages: new Map(),
  errors: [],
  warnings: [],
  statistics: {
    totalKeys: 0,
    uniqueKeys: 0,
    missingKeys: [],
    unusedKeys: [],
  },
};

/**
 * 扫描文件中的翻译键
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const ast = parse(content, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'jsx',
        'decorators-legacy',
        'classProperties',
        'objectRestSpread',
        'asyncGenerators',
        'functionBind',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'dynamicImport',
        'nullishCoalescingOperator',
        'optionalChaining',
      ],
    });

    const fileKeys = new Set();

    traverse(ast, {
      // 扫描 useTranslations hook
      CallExpression(nodePath) {
        const { node } = nodePath;

        if (
          node.callee.name === 'useTranslations' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'StringLiteral'
        ) {
          const namespace = node.arguments[0].value;
          fileKeys.add(namespace);
          recordKeyUsage(namespace, filePath, node.loc);
        }
      },

      // 扫描 t() 函数调用
      MemberExpression(nodePath) {
        const { node } = nodePath;

        if (
          node.property &&
          node.property.type === 'Identifier' &&
          node.property.name === 't' &&
          nodePath.parent.type === 'CallExpression'
        ) {
          const callExpression = nodePath.parent;
          if (
            callExpression.arguments.length > 0 &&
            callExpression.arguments[0].type === 'StringLiteral'
          ) {
            const key = callExpression.arguments[0].value;
            fileKeys.add(key);
            recordKeyUsage(key, filePath, callExpression.loc);
          }
        }
      },

      // 扫描直接的 t() 调用
      CallExpression(nodePath) {
        const { node } = nodePath;

        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 't' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'StringLiteral'
        ) {
          const key = node.arguments[0].value;
          fileKeys.add(key);
          recordKeyUsage(key, filePath, node.loc);
        }
      },
    });

    scanResults.scannedFiles++;
    fileKeys.forEach((key) => scanResults.translationKeys.add(key));

    console.log(`✅ 扫描完成: ${filePath} (发现 ${fileKeys.size} 个翻译键)`);
  } catch (error) {
    scanResults.errors.push({
      file: filePath,
      error: error.message,
      type: 'parse_error',
    });
    console.error(`❌ 扫描失败: ${filePath} - ${error.message}`);
  }
}

/**
 * 记录翻译键使用情况
 */
function recordKeyUsage(key, filePath, location) {
  if (!scanResults.keyUsages.has(key)) {
    scanResults.keyUsages.set(key, []);
  }

  scanResults.keyUsages.get(key).push({
    file: filePath,
    line: location ? location.start.line : null,
    column: location ? location.start.column : null,
  });
}

/**
 * 加载现有翻译文件
 */
function loadExistingTranslations() {
  const translations = {};

  for (const locale of CONFIG.LOCALES) {
    const filePath = path.join(CONFIG.MESSAGES_DIR, `${locale}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      translations[locale] = JSON.parse(content);
      console.log(`📖 加载翻译文件: ${locale}.json`);
    } catch (error) {
      console.warn(`⚠️  无法加载翻译文件: ${locale}.json - ${error.message}`);
      translations[locale] = {};
    }
  }

  return translations;
}

/**
 * 获取嵌套对象的所有键
 */
function getAllKeys(obj, prefix = '') {
  const keys = new Set();

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      getAllKeys(value, fullKey).forEach((k) => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }

  return keys;
}

/**
 * 分析翻译键使用情况
 */
function analyzeTranslationUsage(translations) {
  const allTranslationKeys = new Set();

  // 收集所有翻译文件中的键
  for (const locale of CONFIG.LOCALES) {
    if (translations[locale]) {
      getAllKeys(translations[locale]).forEach((key) =>
        allTranslationKeys.add(key),
      );
    }
  }

  // 找出缺失的键（代码中使用但翻译文件中没有）
  const missingKeys = [];
  scanResults.translationKeys.forEach((key) => {
    if (!allTranslationKeys.has(key)) {
      missingKeys.push(key);
    }
  });

  // 找出未使用的键（翻译文件中有但代码中没有使用）
  const unusedKeys = [];
  allTranslationKeys.forEach((key) => {
    if (!scanResults.translationKeys.has(key)) {
      unusedKeys.push(key);
    }
  });

  scanResults.statistics = {
    totalKeys: allTranslationKeys.size,
    uniqueKeys: scanResults.translationKeys.size,
    missingKeys,
    unusedKeys,
  };

  return { missingKeys, unusedKeys };
}

/**
 * 生成扫描报告
 */
function generateScanReport(translations, analysis) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: scanResults.totalFiles,
      scannedFiles: scanResults.scannedFiles,
      errorCount: scanResults.errors.length,
      warningCount: scanResults.warnings.length,
      ...scanResults.statistics,
    },
    translationKeys: Array.from(scanResults.translationKeys).sort(),
    keyUsages: Object.fromEntries(
      Array.from(scanResults.keyUsages.entries()).map(([key, usages]) => [
        key,
        usages,
      ]),
    ),
    analysis,
    errors: scanResults.errors,
    warnings: scanResults.warnings,
  };

  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  // 写入报告文件
  const reportPath = path.join(
    CONFIG.OUTPUT_DIR,
    'translation-scan-report.json',
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`📊 扫描报告已生成: ${reportPath}`);
  return report;
}

/**
 * 显示扫描结果
 */
function displayResults(analysis) {
  console.log('\n📊 扫描统计:\n');
  console.log(
    `   扫描文件: ${scanResults.scannedFiles}/${scanResults.totalFiles}`,
  );
  console.log(`   发现翻译键: ${scanResults.statistics.uniqueKeys}`);
  console.log(`   翻译文件总键数: ${scanResults.statistics.totalKeys}`);
  console.log(`   缺失键: ${analysis.missingKeys.length}`);
  console.log(`   未使用键: ${analysis.unusedKeys.length}`);
  console.log(`   错误: ${scanResults.errors.length}`);
  console.log(`   警告: ${scanResults.warnings.length}\n`);

  // 显示缺失的键
  if (analysis.missingKeys.length > 0) {
    console.log('❌ 缺失的翻译键:');
    analysis.missingKeys.slice(0, 10).forEach((key) => {
      const usages = scanResults.keyUsages.get(key) || [];
      console.log(`   - ${key} (使用 ${usages.length} 次)`);
    });
    if (analysis.missingKeys.length > 10) {
      console.log(`   ... 还有 ${analysis.missingKeys.length - 10} 个键`);
    }
    console.log();
  }

  // 显示未使用的键
  if (analysis.unusedKeys.length > 0) {
    console.log('⚠️  未使用的翻译键:');
    analysis.unusedKeys.slice(0, 10).forEach((key) => {
      console.log(`   - ${key}`);
    });
    if (analysis.unusedKeys.length > 10) {
      console.log(`   ... 还有 ${analysis.unusedKeys.length - 10} 个键`);
    }
    console.log();
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 获取要扫描的文件
    const files = [];
    for (const pattern of CONFIG.SCAN_PATTERNS) {
      const matchedFiles = glob.sync(pattern, { cwd: process.cwd() });
      files.push(...matchedFiles);
    }

    scanResults.totalFiles = files.length;
    console.log(`📁 找到 ${files.length} 个文件待扫描\n`);

    // 扫描文件
    for (const file of files) {
      scanFile(file);
    }

    // 加载现有翻译
    const translations = loadExistingTranslations();

    // 分析使用情况
    const analysis = analyzeTranslationUsage(translations);

    // 生成报告
    generateScanReport(translations, analysis);

    // 显示结果
    displayResults(analysis);

    // 判断是否通过
    const hasErrors = scanResults.errors.length > 0;
    const hasMissingKeys = analysis.missingKeys.length > 0;

    if (!hasErrors && !hasMissingKeys) {
      console.log('✅ 翻译键扫描通过！所有翻译键都已正确定义。\n');
      process.exit(0);
    } else if (!hasErrors && hasMissingKeys) {
      console.log('⚠️  翻译键扫描完成，但发现缺失的翻译键。\n');
      process.exit(1);
    } else {
      console.log('❌ 翻译键扫描失败！存在解析错误。\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 翻译键扫描失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();
