#!/usr/bin/env node

/**
 * 翻译完整性检查工具
 * 验证翻译文件的完整性、一致性和质量
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始翻译完整性检查...\n');

// 配置
const CONFIG = {
  LOCALES: ['en', 'zh'],
  MESSAGES_DIR: path.join(process.cwd(), 'messages'),
  OUTPUT_DIR: path.join(process.cwd(), 'reports'),

  // 验证规则
  VALIDATION_RULES: {
    checkMissingKeys: true,
    checkEmptyValues: true,
    checkTypeConsistency: true,
    checkSuspiciousTranslations: true,
    checkPlaceholderConsistency: true,
    checkTranslationLength: true,
    checkSpecialCharacters: true,
  },

  // 质量阈值
  QUALITY_THRESHOLDS: {
    minTranslationCoverage: 95, // 最小翻译覆盖率 (%)
    maxLengthRatio: 6.0, // 翻译长度比例上限 (中英文差异较大是正常的)
    minLengthRatio: 0.2, // 翻译长度比例下限
  },

  // 白名单配置
  WHITELIST: {
    // 品牌名称和专有名词 (允许相同)
    brandTerms: [
      'Tucsenberg',
      'Next.js',
      'React',
      'TypeScript',
      'GitHub',
      'LinkedIn',
      'Twitter',
      'API',
      'URL',
      'SEO',
      'UI',
      'UX',
      'CSS',
      'HTML',
      'JavaScript',
    ],

    // URL和链接 (允许相同)
    urlPatterns: [
      /^https?:\/\//,
      /^mailto:/,
      /^tel:/,
      /\.com$/,
      /\.org$/,
      /\.net$/,
    ],

    // 允许相同值的键模式
    allowSameValueKeys: [
      /\.url$/,
      /\.link$/,
      /\.email$/,
      /\.phone$/,
      /social\./,
      /structured-data\./,
      /schema\./,
    ],
  },
};

const validationResults = {
  totalKeys: 0,
  validatedKeys: 0,
  issues: [],
  warnings: [],
  statistics: {
    coverage: {},
    quality: {},
  },
};

/**
 * 加载翻译文件
 */
function loadTranslations() {
  const translations = {};

  for (const locale of CONFIG.LOCALES) {
    const filePath = path.join(CONFIG.MESSAGES_DIR, `${locale}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      translations[locale] = JSON.parse(content);
      console.log(`📖 加载翻译文件: ${locale}.json`);
    } catch (error) {
      console.error(`❌ 无法加载翻译文件: ${locale}.json - ${error.message}`);
      process.exit(1);
    }
  }

  return translations;
}

/**
 * 获取所有翻译键
 */
function getAllTranslationKeys(translations) {
  const allKeys = new Set();

  function extractKeys(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        extractKeys(value, fullKey);
      } else {
        allKeys.add(fullKey);
      }
    }
  }

  for (const locale of CONFIG.LOCALES) {
    if (translations[locale]) {
      extractKeys(translations[locale]);
    }
  }

  return Array.from(allKeys).sort();
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * 验证缺失键
 */
function validateMissingKeys(translations, allKeys) {
  const issues = [];

  for (const key of allKeys) {
    for (const locale of CONFIG.LOCALES) {
      const value = getNestedValue(translations[locale], key);

      if (value === undefined) {
        issues.push({
          type: 'missing_key',
          severity: 'error',
          key,
          locale,
          message: `翻译键 "${key}" 在 ${locale} 中缺失`,
        });
      }
    }
  }

  return issues;
}

/**
 * 验证空值
 */
function validateEmptyValues(translations, allKeys) {
  const issues = [];

  for (const key of allKeys) {
    for (const locale of CONFIG.LOCALES) {
      const value = getNestedValue(translations[locale], key);

      if (typeof value === 'string' && value.trim() === '') {
        issues.push({
          type: 'empty_value',
          severity: 'warning',
          key,
          locale,
          message: `翻译键 "${key}" 在 ${locale} 中为空值`,
        });
      }
    }
  }

  return issues;
}

/**
 * 验证类型一致性
 */
function validateTypeConsistency(translations, allKeys) {
  const issues = [];

  for (const key of allKeys) {
    const types = {};

    for (const locale of CONFIG.LOCALES) {
      const value = getNestedValue(translations[locale], key);
      types[locale] = typeof value;
    }

    const uniqueTypes = new Set(
      Object.values(types).filter((t) => t !== 'undefined'),
    );

    if (uniqueTypes.size > 1) {
      issues.push({
        type: 'type_inconsistency',
        severity: 'error',
        key,
        types,
        message: `翻译键 "${key}" 在不同语言中类型不一致: ${JSON.stringify(types)}`,
      });
    }
  }

  return issues;
}

/**
 * 检查值是否在白名单中
 */
function isWhitelistedValue(key, value) {
  // 检查品牌术语
  if (CONFIG.WHITELIST.brandTerms.some((term) => value.includes(term))) {
    return true;
  }

  // 检查URL模式
  if (CONFIG.WHITELIST.urlPatterns.some((pattern) => pattern.test(value))) {
    return true;
  }

  // 检查键模式
  if (
    CONFIG.WHITELIST.allowSameValueKeys.some((pattern) => pattern.test(key))
  ) {
    return true;
  }

  return false;
}

/**
 * 验证可疑翻译
 */
function validateSuspiciousTranslations(translations, allKeys) {
  const issues = [];

  for (const key of allKeys) {
    const values = {};

    for (const locale of CONFIG.LOCALES) {
      const value = getNestedValue(translations[locale], key);
      if (typeof value === 'string' && value.trim() !== '') {
        values[locale] = value;
      }
    }

    const stringValues = Object.values(values);

    // 检查是否所有值都相同
    if (stringValues.length > 1) {
      const firstValue = stringValues[0];
      const allSame = stringValues.every((value) => value === firstValue);

      if (
        allSame &&
        !firstValue.startsWith('[TODO:') &&
        firstValue.length > 3 &&
        !isWhitelistedValue(key, firstValue)
      ) {
        issues.push({
          type: 'suspicious_translation',
          severity: 'warning',
          key,
          value: firstValue,
          message: `翻译键 "${key}" 在所有语言中都是相同的值，可能未翻译`,
        });
      }
    }
  }

  return issues;
}

/**
 * 验证占位符一致性
 */
function validatePlaceholderConsistency(translations, allKeys) {
  const issues = [];

  for (const key of allKeys) {
    const placeholders = {};

    for (const locale of CONFIG.LOCALES) {
      const value = getNestedValue(translations[locale], key);

      if (typeof value === 'string') {
        // 提取占位符 {variable}
        const matches = value.match(/\{[^}]+\}/g) || [];
        placeholders[locale] = matches.sort();
      }
    }

    // 检查占位符是否一致
    const localesWithPlaceholders = Object.keys(placeholders).filter(
      (locale) => placeholders[locale].length > 0,
    );

    if (localesWithPlaceholders.length > 1) {
      const firstPlaceholders = placeholders[localesWithPlaceholders[0]];

      for (let i = 1; i < localesWithPlaceholders.length; i++) {
        const currentPlaceholders = placeholders[localesWithPlaceholders[i]];

        if (
          JSON.stringify(firstPlaceholders) !==
          JSON.stringify(currentPlaceholders)
        ) {
          issues.push({
            type: 'placeholder_inconsistency',
            severity: 'error',
            key,
            placeholders,
            message: `翻译键 "${key}" 的占位符在不同语言中不一致`,
          });
          break;
        }
      }
    }
  }

  return issues;
}

/**
 * 检查是否应该跳过长度检查
 */
function shouldSkipLengthCheck(key, lengths) {
  // 跳过很短的文本 (单词或短语)
  const maxLength = Math.max(...Object.values(lengths));
  if (maxLength < 10) {
    return true;
  }

  // 跳过特定类型的键
  const skipPatterns = [
    /\.title$/,
    /\.name$/,
    /\.label$/,
    /common\./,
    /accessibility\./,
  ];

  return skipPatterns.some((pattern) => pattern.test(key));
}

/**
 * 验证翻译长度
 */
function validateTranslationLength(translations, allKeys) {
  const issues = [];

  for (const key of allKeys) {
    const lengths = {};

    for (const locale of CONFIG.LOCALES) {
      const value = getNestedValue(translations[locale], key);

      if (typeof value === 'string') {
        lengths[locale] = value.length;
      }
    }

    const validLengths = Object.values(lengths).filter((len) => len > 0);

    if (validLengths.length > 1) {
      const maxLength = Math.max(...validLengths);
      const minLength = Math.min(...validLengths);
      const ratio = maxLength / minLength;

      // 跳过某些类型的长度检查
      if (shouldSkipLengthCheck(key, lengths)) {
        continue;
      }

      if (ratio > CONFIG.QUALITY_THRESHOLDS.maxLengthRatio) {
        issues.push({
          type: 'length_ratio_high',
          severity: 'warning',
          key,
          lengths,
          ratio: ratio.toFixed(2),
          message: `翻译键 "${key}" 的长度比例过高 (${ratio.toFixed(2)})，可能存在翻译质量问题`,
        });
      } else if (ratio < CONFIG.QUALITY_THRESHOLDS.minLengthRatio) {
        issues.push({
          type: 'length_ratio_low',
          severity: 'warning',
          key,
          lengths,
          ratio: ratio.toFixed(2),
          message: `翻译键 "${key}" 的长度比例过低 (${ratio.toFixed(2)})，可能存在翻译不完整`,
        });
      }
    }
  }

  return issues;
}

/**
 * 计算翻译覆盖率
 */
function calculateCoverage(translations, allKeys) {
  const coverage = {};

  for (const locale of CONFIG.LOCALES) {
    let translatedKeys = 0;

    for (const key of allKeys) {
      const value = getNestedValue(translations[locale], key);

      if (
        value !== undefined &&
        typeof value === 'string' &&
        value.trim() !== '' &&
        !value.startsWith('[TODO:')
      ) {
        translatedKeys++;
      }
    }

    coverage[locale] = {
      total: allKeys.length,
      translated: translatedKeys,
      percentage: ((translatedKeys / allKeys.length) * 100).toFixed(2),
    };
  }

  return coverage;
}

/**
 * 生成验证报告
 */
function generateValidationReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalKeys: validationResults.totalKeys,
      validatedKeys: validationResults.validatedKeys,
      issueCount: validationResults.issues.length,
      warningCount: validationResults.warnings.length,
      errorCount: validationResults.issues.filter(
        (issue) => issue.severity === 'error',
      ).length,
    },
    statistics: validationResults.statistics,
    issues: validationResults.issues,
    warnings: validationResults.warnings,
  };

  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  const reportPath = path.join(
    CONFIG.OUTPUT_DIR,
    'translation-validation-report.json',
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`📊 验证报告已生成: ${reportPath}`);
  return report;
}

/**
 * 显示验证结果
 */
function displayResults() {
  console.log('\n📊 验证统计:\n');
  console.log(`   总键数: ${validationResults.totalKeys}`);
  console.log(`   验证键数: ${validationResults.validatedKeys}`);
  console.log(`   问题数: ${validationResults.issues.length}`);
  console.log(
    `   错误数: ${validationResults.issues.filter((i) => i.severity === 'error').length}`,
  );
  console.log(
    `   警告数: ${validationResults.issues.filter((i) => i.severity === 'warning').length}\n`,
  );

  // 显示覆盖率
  console.log('📈 翻译覆盖率:');
  for (const [locale, coverage] of Object.entries(
    validationResults.statistics.coverage,
  )) {
    console.log(
      `   ${locale}: ${coverage.percentage}% (${coverage.translated}/${coverage.total})`,
    );
  }
  console.log();

  // 显示主要问题
  const errorIssues = validationResults.issues.filter(
    (issue) => issue.severity === 'error',
  );
  if (errorIssues.length > 0) {
    console.log('❌ 主要错误:');
    errorIssues.slice(0, 5).forEach((issue) => {
      console.log(`   - ${issue.message}`);
    });
    if (errorIssues.length > 5) {
      console.log(`   ... 还有 ${errorIssues.length - 5} 个错误`);
    }
    console.log();
  }

  const warningIssues = validationResults.issues.filter(
    (issue) => issue.severity === 'warning',
  );
  if (warningIssues.length > 0) {
    console.log('⚠️  主要警告:');
    warningIssues.slice(0, 5).forEach((issue) => {
      console.log(`   - ${issue.message}`);
    });
    if (warningIssues.length > 5) {
      console.log(`   ... 还有 ${warningIssues.length - 5} 个警告`);
    }
    console.log();
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 加载翻译文件
    const translations = loadTranslations();

    // 获取所有翻译键
    const allKeys = getAllTranslationKeys(translations);
    validationResults.totalKeys = allKeys.length;
    validationResults.validatedKeys = allKeys.length;

    console.log(`🔍 开始验证 ${allKeys.length} 个翻译键...\n`);

    // 执行各种验证
    const allIssues = [];

    if (CONFIG.VALIDATION_RULES.checkMissingKeys) {
      console.log('🔍 检查缺失键...');
      allIssues.push(...validateMissingKeys(translations, allKeys));
    }

    if (CONFIG.VALIDATION_RULES.checkEmptyValues) {
      console.log('🔍 检查空值...');
      allIssues.push(...validateEmptyValues(translations, allKeys));
    }

    if (CONFIG.VALIDATION_RULES.checkTypeConsistency) {
      console.log('🔍 检查类型一致性...');
      allIssues.push(...validateTypeConsistency(translations, allKeys));
    }

    if (CONFIG.VALIDATION_RULES.checkSuspiciousTranslations) {
      console.log('🔍 检查可疑翻译...');
      allIssues.push(...validateSuspiciousTranslations(translations, allKeys));
    }

    if (CONFIG.VALIDATION_RULES.checkPlaceholderConsistency) {
      console.log('🔍 检查占位符一致性...');
      allIssues.push(...validatePlaceholderConsistency(translations, allKeys));
    }

    if (CONFIG.VALIDATION_RULES.checkTranslationLength) {
      console.log('🔍 检查翻译长度...');
      allIssues.push(...validateTranslationLength(translations, allKeys));
    }

    // 计算统计信息
    validationResults.statistics.coverage = calculateCoverage(
      translations,
      allKeys,
    );
    validationResults.issues = allIssues;

    // 生成报告
    generateValidationReport();

    // 显示结果
    displayResults();

    // 判断是否通过
    const errorCount = validationResults.issues.filter(
      (issue) => issue.severity === 'error',
    ).length;
    const minCoverage = Math.min(
      ...Object.values(validationResults.statistics.coverage).map((c) =>
        parseFloat(c.percentage),
      ),
    );

    if (
      errorCount === 0 &&
      minCoverage >= CONFIG.QUALITY_THRESHOLDS.minTranslationCoverage
    ) {
      console.log('✅ 翻译完整性检查通过！所有翻译文件质量良好。\n');
      process.exit(0);
    } else if (errorCount === 0) {
      console.log('⚠️  翻译完整性检查基本通过，但覆盖率需要提升。\n');
      process.exit(0);
    } else {
      console.log('❌ 翻译完整性检查失败！存在需要修复的错误。\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 翻译完整性检查失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();
