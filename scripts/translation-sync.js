#!/usr/bin/env node

/**
 * 增强的翻译同步和更新工具
 * 自动同步翻译文件，支持增量更新和智能合并
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 开始翻译同步和更新...\n');

// 配置
const CONFIG = {
  LOCALES: ['en', 'zh'],
  MESSAGES_DIR: path.join(process.cwd(), 'messages'),
  BACKUP_DIR: path.join(process.cwd(), 'backups', 'translations'),
  OUTPUT_DIR: path.join(process.cwd(), 'reports'),

  // 同步选项
  SYNC_OPTIONS: {
    createMissingKeys: true,
    removeUnusedKeys: false, // 谨慎删除，默认不删除
    backupBeforeSync: true,
    validateAfterSync: true,
  },
};

const syncResults = {
  processed: 0,
  created: 0,
  updated: 0,
  removed: 0,
  errors: [],
  warnings: [],
  backups: [],
};

/**
 * 创建备份
 */
function createBackup() {
  if (!CONFIG.SYNC_OPTIONS.backupBeforeSync) return;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(CONFIG.BACKUP_DIR, timestamp);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  for (const locale of CONFIG.LOCALES) {
    const sourceFile = path.join(CONFIG.MESSAGES_DIR, `${locale}.json`);
    const backupFile = path.join(backupDir, `${locale}.json`);

    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, backupFile);
      syncResults.backups.push(backupFile);
      console.log(`💾 备份创建: ${locale}.json -> ${backupFile}`);
    }
  }

  console.log(`📦 备份目录: ${backupDir}\n`);
}

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
      console.warn(`⚠️  无法加载翻译文件: ${locale}.json - ${error.message}`);
      translations[locale] = {};
    }
  }

  return translations;
}

/**
 * 获取所有翻译键的并集
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
 * 设置嵌套对象的值
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();

  let current = obj;
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

/**
 * 同步翻译键
 */
function syncTranslationKeys(translations) {
  const allKeys = getAllTranslationKeys(translations);
  const syncedTranslations = JSON.parse(JSON.stringify(translations));

  console.log(`🔍 发现 ${allKeys.length} 个唯一翻译键\n`);

  for (const key of allKeys) {
    for (const locale of CONFIG.LOCALES) {
      const currentValue = getNestedValue(syncedTranslations[locale], key);

      if (currentValue === undefined) {
        if (CONFIG.SYNC_OPTIONS.createMissingKeys) {
          // 尝试从其他语言复制或创建占位符
          let fallbackValue = null;

          // 首先尝试从英文复制
          if (locale !== 'en') {
            fallbackValue = getNestedValue(syncedTranslations['en'], key);
          }

          // 如果没有英文，尝试从其他语言复制
          if (!fallbackValue) {
            for (const otherLocale of CONFIG.LOCALES) {
              if (otherLocale !== locale) {
                const otherValue = getNestedValue(
                  syncedTranslations[otherLocale],
                  key,
                );
                if (otherValue && typeof otherValue === 'string') {
                  fallbackValue = otherValue;
                  break;
                }
              }
            }
          }

          // 如果还是没有，创建占位符
          if (!fallbackValue) {
            fallbackValue = `[TODO: ${key}]`;
          }

          setNestedValue(syncedTranslations[locale], key, fallbackValue);
          syncResults.created++;

          console.log(`➕ 创建缺失键: ${locale}.${key} = "${fallbackValue}"`);
        }
      }
    }
  }

  return syncedTranslations;
}

/**
 * 验证翻译完整性
 */
function validateTranslations(translations) {
  const issues = [];
  const allKeys = getAllTranslationKeys(translations);

  for (const key of allKeys) {
    const values = {};

    for (const locale of CONFIG.LOCALES) {
      values[locale] = getNestedValue(translations[locale], key);
    }

    // 检查缺失值
    const missingLocales = CONFIG.LOCALES.filter(
      (locale) => values[locale] === undefined || values[locale] === '',
    );

    if (missingLocales.length > 0) {
      issues.push({
        type: 'missing_translation',
        key,
        locales: missingLocales,
      });
    }

    // 检查可疑的未翻译内容
    const stringValues = Object.entries(values)
      .filter(([_, value]) => typeof value === 'string' && value.trim() !== '')
      .map(([locale, value]) => ({ locale, value }));

    if (stringValues.length > 1) {
      const firstValue = stringValues[0].value;
      const sameValues = stringValues.filter(
        ({ value }) => value === firstValue,
      );

      if (
        sameValues.length === stringValues.length &&
        !key.includes('url') &&
        firstValue.length > 3 &&
        !firstValue.startsWith('[TODO:')
      ) {
        issues.push({
          type: 'suspicious_translation',
          key,
          value: firstValue,
        });
      }
    }
  }

  return issues;
}

/**
 * 保存翻译文件
 */
function saveTranslations(translations) {
  for (const locale of CONFIG.LOCALES) {
    const filePath = path.join(CONFIG.MESSAGES_DIR, `${locale}.json`);

    try {
      const content = `${JSON.stringify(translations[locale], null, 2)}\n`;
      fs.writeFileSync(filePath, content, 'utf8');
      syncResults.updated++;
      console.log(`💾 保存翻译文件: ${locale}.json`);
    } catch (error) {
      syncResults.errors.push({
        type: 'save_error',
        locale,
        error: error.message,
      });
      console.error(`❌ 保存失败: ${locale}.json - ${error.message}`);
    }
  }
}

/**
 * 生成同步报告
 */
function generateSyncReport(validationIssues) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      processed: syncResults.processed,
      created: syncResults.created,
      updated: syncResults.updated,
      removed: syncResults.removed,
      errorCount: syncResults.errors.length,
      warningCount: syncResults.warnings.length,
      backupCount: syncResults.backups.length,
    },
    validationIssues,
    errors: syncResults.errors,
    warnings: syncResults.warnings,
    backups: syncResults.backups,
  };

  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  const reportPath = path.join(
    CONFIG.OUTPUT_DIR,
    'translation-sync-report.json',
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`📊 同步报告已生成: ${reportPath}`);
  return report;
}

/**
 * 显示同步结果
 */
function displayResults(validationIssues) {
  console.log('\n📊 同步统计:\n');
  console.log(`   处理文件: ${syncResults.processed}`);
  console.log(`   创建键: ${syncResults.created}`);
  console.log(`   更新文件: ${syncResults.updated}`);
  console.log(`   删除键: ${syncResults.removed}`);
  console.log(`   错误: ${syncResults.errors.length}`);
  console.log(`   警告: ${syncResults.warnings.length}`);
  console.log(`   备份: ${syncResults.backups.length}\n`);

  // 显示验证问题
  if (validationIssues.length > 0) {
    console.log('⚠️  发现的问题:');

    const missingTranslations = validationIssues.filter(
      (issue) => issue.type === 'missing_translation',
    );

    const suspiciousTranslations = validationIssues.filter(
      (issue) => issue.type === 'suspicious_translation',
    );

    if (missingTranslations.length > 0) {
      console.log(`   缺失翻译: ${missingTranslations.length} 个键`);
    }

    if (suspiciousTranslations.length > 0) {
      console.log(`   可疑翻译: ${suspiciousTranslations.length} 个键`);
    }

    console.log();
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 创建备份
    createBackup();

    // 加载翻译文件
    const translations = loadTranslations();
    syncResults.processed = CONFIG.LOCALES.length;

    // 同步翻译键
    const syncedTranslations = syncTranslationKeys(translations);

    // 保存翻译文件
    saveTranslations(syncedTranslations);

    // 验证翻译完整性
    let validationIssues = [];
    if (CONFIG.SYNC_OPTIONS.validateAfterSync) {
      console.log('\n🔍 验证翻译完整性...');
      validationIssues = validateTranslations(syncedTranslations);
    }

    // 生成报告
    generateSyncReport(validationIssues);

    // 显示结果
    displayResults(validationIssues);

    // 判断是否通过
    const hasErrors = syncResults.errors.length > 0;
    const hasCriticalIssues = validationIssues.some(
      (issue) => issue.type === 'missing_translation',
    );

    if (!hasErrors && !hasCriticalIssues) {
      console.log('✅ 翻译同步完成！所有翻译文件已成功同步。\n');
      process.exit(0);
    } else if (!hasErrors && hasCriticalIssues) {
      console.log('⚠️  翻译同步完成，但存在需要注意的问题。\n');
      process.exit(0);
    } else {
      console.log('❌ 翻译同步失败！存在需要修复的错误。\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 翻译同步失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();
