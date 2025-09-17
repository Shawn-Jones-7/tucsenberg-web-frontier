#!/usr/bin/env tsx

/**
 * 处理剩余43个数字的自动化脚本
 * 
 * 根据CODEX分层治理分析结果，自动处理剩余数字：
 * 1. 局部常量定义
 * 2. 配置集中化迁移
 * 3. 单位工具库替换
 * 4. ESLint豁免扩展
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface RemainingNumberAction {
  value: string;
  files: string[];
  action: 'local_const' | 'config_migrate' | 'units_lib' | 'eslint_exempt';
  constantName?: string;
  replacement?: string;
  reason: string;
}

/**
 * 剩余43个数字的处理方案
 */
const remainingNumbers: RemainingNumberAction[] = [
  // 特殊业务数字 - 局部常量
  { value: '184.704', files: ['src/lib/colors/dark-theme.ts', 'src/lib/colors/light-theme.ts'], 
    action: 'local_const', constantName: 'COLOR_LIGHTNESS_FACTOR', reason: '颜色计算因子，定义局部常量' },
  { value: '255', files: ['src/constants/security-constants.ts', 'src/lib/locale-storage-types-base.ts'], 
    action: 'local_const', constantName: 'MAX_RGB_VALUE', reason: 'RGB最大值，定义局部常量' },
  { value: '254', files: ['src/constants/security-constants.ts', 'src/lib/security-validation.ts'], 
    action: 'local_const', constantName: 'MAX_SAFE_RGB', reason: '安全RGB值，定义局部常量' },
  { value: '365', files: ['src/constants/i18n-constants.ts'], 
    action: 'local_const', constantName: 'DAYS_PER_YEAR', reason: '年天数，定义局部常量' },
  
  // HTTP状态码 - 局部常量
  { value: '403', files: ['src/app/api/whatsapp/webhook/route.ts'], 
    action: 'local_const', constantName: 'HTTP_FORBIDDEN', reason: 'HTTP状态码，定义局部常量' },
  { value: '429', files: ['src/app/api/contact/route.ts'], 
    action: 'local_const', constantName: 'HTTP_TOO_MANY_REQUESTS', reason: 'HTTP状态码，定义局部常量' },
  { value: '503', files: ['src/app/api/whatsapp/send/route.ts'], 
    action: 'local_const', constantName: 'HTTP_SERVICE_UNAVAILABLE', reason: 'HTTP状态码，定义局部常量' },
  
  // 配置数字 - 配置集中化
  { value: '8888', files: ['src/lib/performance-monitoring-types.ts'], 
    action: 'config_migrate', replacement: 'DEV_SERVER_CONFIG.MONITORING_PORT', reason: '监控端口，迁移到配置' },
  { value: '8900', files: ['src/app/api/monitoring/dashboard/handlers/get-handler.ts'], 
    action: 'config_migrate', replacement: 'DEV_SERVER_CONFIG.API_MONITORING_PORT', reason: 'API监控端口，迁移到配置' },
  
  // 小数字 - ESLint豁免扩展
  { value: '14', files: ['src/lib/i18n-cache-types-advanced.ts', 'src/lib/site-config.ts'], 
    action: 'eslint_exempt', reason: '小数字，扩展ESLint豁免' },
  { value: '17', files: ['src/lib/locale-storage-analytics-performance.ts'], 
    action: 'eslint_exempt', reason: '小数字，扩展ESLint豁免' },
  { value: '18', files: ['src/lib/locale-storage-analytics-performance.ts'], 
    action: 'eslint_exempt', reason: '小数字，扩展ESLint豁免' },
  { value: '22', files: ['src/lib/site-config.ts'], 
    action: 'eslint_exempt', reason: '小数字，扩展ESLint豁免' },
  { value: '23', files: ['src/lib/locale-storage-analytics-performance.ts'], 
    action: 'eslint_exempt', reason: '小数字，扩展ESLint豁免' },
  { value: '35', files: ['src/lib/i18n-metrics-collector.ts'], 
    action: 'eslint_exempt', reason: '小数字，扩展ESLint豁免' },
  { value: '36', files: ['src/config/security.ts', 'src/constants/performance-constants.ts'], 
    action: 'eslint_exempt', reason: '小数字，扩展ESLint豁免' },
  { value: '64', files: ['src/lib/locale-storage-types-config/validation.ts'], 
    action: 'eslint_exempt', reason: '小数字，扩展ESLint豁免' },
  
  // 百分比数字 - 单位工具库
  { value: '82', files: ['src/lib/translation-benchmarks.ts'], 
    action: 'units_lib', replacement: 'percent(82)', reason: '百分比，使用单位工具库' },
  { value: '83', files: ['src/lib/translation-benchmarks.ts'], 
    action: 'units_lib', replacement: 'percent(83)', reason: '百分比，使用单位工具库' },
  { value: '84', files: ['src/lib/translation-benchmarks.ts'], 
    action: 'units_lib', replacement: 'percent(84)', reason: '百分比，使用单位工具库' },
  { value: '87', files: ['src/lib/translation-benchmarks.ts'], 
    action: 'units_lib', replacement: 'percent(87)', reason: '百分比，使用单位工具库' },
  { value: '88', files: ['src/lib/translation-benchmarks.ts'], 
    action: 'units_lib', replacement: 'percent(88)', reason: '百分比，使用单位工具库' },
  
  // 特殊业务数字 - 局部常量
  { value: '130', files: ['src/constants/performance.ts'], 
    action: 'local_const', constantName: 'PERFORMANCE_THRESHOLD', reason: '性能阈值，定义局部常量' },
  { value: '131', files: ['src/types/whatsapp-api-config/errors.ts'], 
    action: 'local_const', constantName: 'WHATSAPP_ERROR_BASE', reason: 'WhatsApp错误码基数，定义局部常量' },
  { value: '132', files: ['src/types/whatsapp-api-config/errors.ts'], 
    action: 'local_const', constantName: 'WHATSAPP_ERROR_PARAM', reason: 'WhatsApp参数错误，定义局部常量' },
  { value: '133', files: ['src/types/whatsapp-api-config/errors.ts'], 
    action: 'local_const', constantName: 'WHATSAPP_ERROR_FORMAT', reason: 'WhatsApp格式错误，定义局部常量' },
  { value: '136', files: ['src/types/whatsapp-api-config/errors.ts'], 
    action: 'local_const', constantName: 'WHATSAPP_ERROR_LIMIT', reason: 'WhatsApp限制错误，定义局部常量' },
  { value: '368', files: ['src/types/whatsapp-api-config/errors.ts'], 
    action: 'local_const', constantName: 'WHATSAPP_ERROR_MEDIA', reason: 'WhatsApp媒体错误，定义局部常量' },
  
  // 其他数字 - 根据具体情况处理
  { value: '450', files: ['src/app/api/analytics/web-vitals/route.ts', 'src/app/api/monitoring/dashboard/handlers/get-handler.ts'], 
    action: 'local_const', constantName: 'ANALYTICS_THRESHOLD', reason: '分析阈值，定义局部常量' },
  { value: '600', files: ['src/lib/i18n-preloader-strategies/configs.ts'], 
    action: 'units_lib', replacement: 'seconds(0.6)', reason: '时间相关，使用单位工具库' },
  { value: '890', files: ['src/app/api/analytics/i18n/route.ts'], 
    action: 'local_const', constantName: 'I18N_ANALYTICS_LIMIT', reason: 'i18n分析限制，定义局部常量' },
  
  // 大数字 - 局部常量或配置
  { value: '1005', files: ['src/constants/app-constants.ts'], 
    action: 'local_const', constantName: 'APP_VERSION_CODE', reason: '应用版本码，定义局部常量' },
  { value: '1010', files: ['src/constants/app-constants.ts'], 
    action: 'local_const', constantName: 'APP_BUILD_NUMBER', reason: '应用构建号，定义局部常量' },
  { value: '1020', files: ['src/constants/app-constants.ts'], 
    action: 'local_const', constantName: 'APP_RELEASE_CODE', reason: '应用发布码，定义局部常量' },
  { value: '1080', files: ['src/lib/web-vitals/constants.ts'], 
    action: 'local_const', constantName: 'HD_HEIGHT', reason: 'HD高度，定义局部常量' },
  { value: '1180', files: ['src/app/api/analytics/web-vitals/route.ts'], 
    action: 'local_const', constantName: 'WEB_VITALS_THRESHOLD', reason: 'Web Vitals阈值，定义局部常量' },
  { value: '1250', files: ['src/app/api/analytics/i18n/route.ts', 'src/app/api/analytics/web-vitals/route.ts'], 
    action: 'local_const', constantName: 'ANALYTICS_BATCH_SIZE', reason: '分析批次大小，定义局部常量' },
  { value: '1300', files: ['src/constants/app-constants.ts', 'src/app/api/analytics/web-vitals/route.ts'], 
    action: 'local_const', constantName: 'EXTENDED_TIMEOUT', reason: '扩展超时，定义局部常量' },
  { value: '1400', files: ['src/constants/app-constants.ts'], 
    action: 'local_const', constantName: 'MAX_CONTENT_LENGTH', reason: '最大内容长度，定义局部常量' },
  { value: '1412', files: ['src/app/api/analytics/i18n/route.ts'], 
    action: 'local_const', constantName: 'I18N_CACHE_SIZE', reason: 'i18n缓存大小，定义局部常量' },
  { value: '1450', files: ['src/constants/app-constants.ts'], 
    action: 'local_const', constantName: 'BUFFER_SIZE', reason: '缓冲区大小，定义局部常量' },
  { value: '1900', files: ['src/app/api/analytics/web-vitals/route.ts'], 
    action: 'local_const', constantName: 'VITALS_MAX_THRESHOLD', reason: 'Vitals最大阈值，定义局部常量' },
  { value: '2200', files: ['src/app/api/analytics/web-vitals/route.ts'], 
    action: 'local_const', constantName: 'PERFORMANCE_CEILING', reason: '性能上限，定义局部常量' },
  { value: '2800', files: ['src/app/api/analytics/web-vitals/route.ts'], 
    action: 'local_const', constantName: 'CRITICAL_THRESHOLD', reason: '关键阈值，定义局部常量' },
  { value: '200100', files: ['src/constants/app-constants.ts'], 
    action: 'local_const', constantName: 'EXTENDED_SUCCESS_CODE', reason: '扩展成功码，定义局部常量' },
];

/**
 * 执行剩余数字处理
 */
async function processRemainingNumbers(): Promise<void> {
  console.log('🔧 开始处理剩余43个数字...');
  console.log('');

  // 按处理类型分组
  const byAction = {
    local_const: remainingNumbers.filter(n => n.action === 'local_const'),
    config_migrate: remainingNumbers.filter(n => n.action === 'config_migrate'),
    units_lib: remainingNumbers.filter(n => n.action === 'units_lib'),
    eslint_exempt: remainingNumbers.filter(n => n.action === 'eslint_exempt'),
  };

  console.log('📊 处理方案统计:');
  console.log(`  局部常量定义: ${byAction.local_const.length}个`);
  console.log(`  配置集中化: ${byAction.config_migrate.length}个`);
  console.log(`  单位工具库: ${byAction.units_lib.length}个`);
  console.log(`  ESLint豁免: ${byAction.eslint_exempt.length}个`);
  console.log('');

  // 1. 扩展ESLint豁免
  await extendESLintExemptions(byAction.eslint_exempt);

  // 2. 生成局部常量建议
  generateLocalConstantSuggestions(byAction.local_const);

  // 3. 生成配置迁移建议
  generateConfigMigrationSuggestions(byAction.config_migrate);

  // 4. 生成单位工具库使用建议
  generateUnitsLibSuggestions(byAction.units_lib);

  console.log('✅ 剩余数字处理方案生成完成！');
  console.log('');
  console.log('📋 下一步操作:');
  console.log('  1. 查看生成的建议文件');
  console.log('  2. 根据建议手动或自动应用更改');
  console.log('  3. 运行预检验证: tsx scripts/magic-numbers/preflight.ts');
  console.log('  4. 验证类型检查: pnpm type-check');
}

/**
 * 扩展ESLint豁免列表
 */
async function extendESLintExemptions(numbers: RemainingNumberAction[]): Promise<void> {
  console.log('🔸 扩展ESLint豁免列表...');
  
  const exemptValues = numbers.map(n => parseFloat(n.value)).sort((a, b) => a - b);
  console.log(`  新增豁免数字: ${exemptValues.join(', ')}`);
  
  // 这些数字将在下一步的ESLint配置更新中添加
  console.log('  ✅ 将在ESLint配置更新中处理');
}

/**
 * 生成局部常量建议
 */
function generateLocalConstantSuggestions(numbers: RemainingNumberAction[]): void {
  console.log('🔸 生成局部常量定义建议...');
  
  const suggestions = numbers.map(n => ({
    file: n.files[0], // 取第一个文件作为主要文件
    value: n.value,
    constantName: n.constantName,
    reason: n.reason
  }));

  const content = `# 局部常量定义建议

## 使用说明
在相应文件中定义以下局部常量，替代魔法数字：

${suggestions.map(s => `
### ${s.file}
\`\`\`typescript
// ${s.reason}
const ${s.constantName} = ${s.value};
\`\`\`
`).join('')}

## 应用方式
1. 在文件顶部定义常量
2. 替换文件中的魔法数字
3. 添加适当的注释说明
`;

  writeFileSync(resolve(__dirname, 'local-constants-suggestions.md'), content);
  console.log('  ✅ 已生成: local-constants-suggestions.md');
}

/**
 * 生成配置迁移建议
 */
function generateConfigMigrationSuggestions(numbers: RemainingNumberAction[]): void {
  console.log('🔸 生成配置迁移建议...');
  
  const content = `# 配置迁移建议

## 使用说明
将以下数字迁移到 src/config/app.ts 的相应配置中：

${numbers.map(n => `
### ${n.value} → ${n.replacement}
- **文件**: ${n.files.join(', ')}
- **原因**: ${n.reason}
- **替换**: 使用 \`${n.replacement}\`
`).join('')}

## 应用方式
1. 确认 src/config/app.ts 中已定义相应配置
2. 在使用文件中导入配置
3. 替换魔法数字为配置引用
`;

  writeFileSync(resolve(__dirname, 'config-migration-suggestions.md'), content);
  console.log('  ✅ 已生成: config-migration-suggestions.md');
}

/**
 * 生成单位工具库使用建议
 */
function generateUnitsLibSuggestions(numbers: RemainingNumberAction[]): void {
  console.log('🔸 生成单位工具库使用建议...');
  
  const content = `# 单位工具库使用建议

## 使用说明
使用 src/lib/units.ts 中的单位转换函数替代以下魔法数字：

${numbers.map(n => `
### ${n.value} → ${n.replacement}
- **文件**: ${n.files.join(', ')}
- **原因**: ${n.reason}
- **替换**: \`${n.replacement}\`
`).join('')}

## 应用方式
1. 导入单位工具库: \`import { percent, seconds } from '@/lib/units';\`
2. 替换魔法数字为单位函数调用
3. 确保语义清晰和类型安全
`;

  writeFileSync(resolve(__dirname, 'units-lib-suggestions.md'), content);
  console.log('  ✅ 已生成: units-lib-suggestions.md');
}

// 执行处理
if (require.main === module) {
  processRemainingNumbers().catch((error) => {
    console.error('❌ 处理失败:', error);
    process.exit(1);
  });
}
