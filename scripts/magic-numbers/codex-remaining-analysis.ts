#!/usr/bin/env tsx

/**
 * CODEX分层治理：剩余数字分类处理分析
 *
 * 分析剩余的135个数字，按照CODEX方案进行分类：
 * 1. ESLint豁免 - 测试数据、低频数字
 * 2. 单位工具库 - 时间、尺寸、百分比
 * 3. 配置集中化 - 端口、超时、限制
 * 4. 局部常量 - 文件内部使用的业务数字
 * 5. 保持魔法数字 - 明显的数据型数字
 */

interface RemainingNumber {
  value: string;
  files: string[];
  category:
    | 'eslint_exempt'
    | 'units_lib'
    | 'config'
    | 'local_const'
    | 'keep_magic';
  reason: string;
  action: string;
}

/**
 * 从预检输出中提取的剩余数字（简化版）
 */
const remainingNumbers = [
  // 基础计数和小数字
  {
    value: '4',
    files: [
      'src/constants/dev-tools.ts',
      'src/constants/test-app-constants.ts',
    ],
  },
  {
    value: '6',
    files: [
      'src/lib/accessibility-utils.ts',
      'src/components/forms/fields/additional-fields.tsx',
    ],
  },
  {
    value: '7',
    files: ['src/constants/security-constants.ts', 'src/lib/colors/utils.ts'],
  },
  {
    value: '8',
    files: [
      'src/constants/dev-tools.ts',
      'src/constants/security-constants.ts',
    ],
  },
  {
    value: '9',
    files: [
      'src/constants/performance-constants.ts',
      'src/lib/locale-storage-analytics-performance.ts',
    ],
  },

  // 时间相关（毫秒）
  {
    value: '2000',
    files: [
      'src/components/language-toggle.tsx',
      'src/components/i18n/translation-preloader.tsx',
    ],
  },
  {
    value: '4000',
    files: ['src/constants/performance-constants.ts', 'src/hooks/use-toast.ts'],
  },
  { value: '6000', files: ['src/hooks/use-toast.ts'] },
  { value: '7000', files: ['src/lib/i18n-preloader-strategies/configs.ts'] },
  { value: '8000', files: ['src/lib/i18n-preloader-strategies/configs.ts'] },
  { value: '9000', files: ['src/lib/i18n-preloader-strategies/configs.ts'] },
  {
    value: '12000',
    files: [
      'src/lib/i18n-preloader-strategies/configs.ts',
      'src/app/api/analytics/i18n/route.ts',
    ],
  },
  { value: '15000', files: ['src/lib/i18n-preloader-strategies/configs.ts'] },
  { value: '45000', files: ['src/app/api/analytics/web-vitals/route.ts'] },
  { value: '50000', files: ['src/constants/test-performance-constants.ts'] },
  {
    value: '100000',
    files: ['src/constants/dev-tools.ts', 'src/constants/react-scan.ts'],
  },
  { value: '120000', files: ['src/constants/dev-tools.ts'] },
  {
    value: '125000',
    files: ['src/app/api/monitoring/dashboard/handlers/get-handler.ts'],
  },
  { value: '170000', files: ['src/constants/test-performance-constants.ts'] },
  {
    value: '200000',
    files: [
      'src/constants/app-constants.ts',
      'src/lib/locale-storage-types-config/presets.ts',
    ],
  },
  {
    value: '300000',
    files: [
      'src/constants/app-constants.ts',
      'src/lib/locale-storage-types-config/presets.ts',
    ],
  },
  { value: '500000', files: ['src/constants/test-performance-constants.ts'] },

  // 端口号
  { value: '8888', files: ['src/lib/performance-monitoring-types.ts'] },
  {
    value: '8900',
    files: ['src/app/api/monitoring/dashboard/handlers/get-handler.ts'],
  },

  // 尺寸和像素
  {
    value: '16',
    files: [
      'src/hooks/performance-monitor-utils.ts',
      'src/components/ui/animated-counter-helpers.tsx',
    ],
  },
  {
    value: '20',
    files: ['src/config/security.ts', 'src/constants/i18n-constants.ts'],
  },
  {
    value: '32',
    files: ['src/constants/security-constants.ts', 'src/lib/i18n-lru-cache.ts'],
  },
  {
    value: '64',
    files: [
      'src/constants/react-scan.ts',
      'src/lib/locale-storage-types-config/validation.ts',
    ],
  },
  {
    value: '80',
    files: ['src/config/security.ts', 'src/constants/i18n-constants.ts'],
  },
  {
    value: '120',
    files: [
      'src/components/layout/logo.tsx',
      'src/app/api/analytics/i18n/route.ts',
    ],
  },
  { value: '128', files: ['src/constants/security-constants.ts'] },
  {
    value: '150',
    files: [
      'src/constants/performance-constants.ts',
      'src/app/api/analytics/i18n/route.ts',
    ],
  },
  {
    value: '160',
    files: ['src/config/security.ts', 'src/lib/content-utils.ts'],
  },
  { value: '190', files: ['src/types/whatsapp-api-config/errors.ts'] },
  {
    value: '250',
    files: ['src/constants/test-constants.ts', 'src/lib/navigation.ts'],
  },
  {
    value: '256',
    files: [
      'src/constants/security-constants.ts',
      'src/lib/i18n-cache-types-advanced.ts',
    ],
  },
  {
    value: '512',
    files: [
      'src/lib/performance-monitoring-constants.ts',
      'src/lib/i18n-cache-types-advanced.ts',
    ],
  },
  {
    value: '600',
    files: [
      'src/constants/test-performance-constants.ts',
      'src/lib/i18n-preloader-strategies/configs.ts',
    ],
  },
  {
    value: '700',
    files: ['src/lib/site-config.ts', 'src/components/home/call-to-action.tsx'],
  },
  { value: '750', files: ['src/constants/test-performance-constants.ts'] },
  {
    value: '800',
    files: [
      'src/constants/performance-constants.ts',
      'src/lib/enhanced-web-vitals.ts',
    ],
  },
  {
    value: '1200',
    files: [
      'src/constants/app-constants.ts',
      'src/hooks/web-vitals-diagnostics-calculator.ts',
    ],
  },
  { value: '1536', files: ['src/hooks/use-breakpoint.ts'] },
  { value: '1600', files: ['src/app/[locale]/layout.tsx'] },
  {
    value: '1800',
    files: [
      'src/constants/performance-constants.ts',
      'src/lib/enhanced-web-vitals.ts',
    ],
  },

  // 数据大小（字节）
  {
    value: '2048',
    files: [
      'src/constants/security-constants.ts',
      'src/constants/test-performance-constants.ts',
    ],
  },
  {
    value: '4096',
    files: ['src/lib/locale-storage-cookie.ts', 'src/lib/whatsapp-utils.ts'],
  },
  { value: '8192', files: ['src/constants/test-performance-constants.ts'] },
  { value: '65536', files: ['src/constants/test-web-vitals-constants.ts'] },

  // 百分比和比例
  {
    value: '12',
    files: [
      'src/constants/i18n-constants.ts',
      'src/lib/translation-quality.ts',
    ],
  },
  { value: '15', files: ['src/config/security.ts', 'src/lib/validations.ts'] },
  { value: '35', files: ['src/lib/i18n-metrics-collector.ts'] },
  {
    value: '40',
    files: [
      'src/lib/i18n-metrics-collector.ts',
      'src/lib/performance-monitoring-constants.ts',
    ],
  },
  {
    value: '45',
    files: [
      'src/app/api/analytics/i18n/route.ts',
      'src/app/api/analytics/web-vitals/route.ts',
    ],
  },
  { value: '65', files: ['src/app/api/analytics/web-vitals/route.ts'] },
  {
    value: '70',
    files: [
      'src/constants/i18n-constants.ts',
      'src/lib/enhanced-web-vitals.ts',
    ],
  },
  {
    value: '75',
    files: ['src/components/shared/animations/showcase-config.tsx'],
  },
  {
    value: '85',
    files: [
      'src/lib/translation-benchmarks.ts',
      'src/app/api/analytics/web-vitals/route.ts',
    ],
  },
  {
    value: '95',
    files: [
      'src/constants/i18n-constants.ts',
      'src/components/i18n/translation-fallback.tsx',
    ],
  },
  { value: '99', files: ['src/lib/locale-storage-analytics-performance.ts'] },

  // HTTP状态码
  { value: '403', files: ['src/app/api/whatsapp/webhook/route.ts'] },
  { value: '429', files: ['src/app/api/contact/route.ts'] },
  { value: '503', files: ['src/app/api/whatsapp/send/route.ts'] },

  // 测试数据和特殊数字
  { value: '42', files: ['src/lib/site-config.ts'] },
  {
    value: '49',
    files: [
      'src/app/[locale]/diagnostics/page-utils.ts',
      'src/app/[locale]/diagnostics/utils.ts',
    ],
  },
  { value: '96', files: ['src/constants/test-ui-constants.ts'] },
  { value: '131', files: ['src/types/whatsapp-api-config/errors.ts'] },
  {
    value: '255',
    files: [
      'src/constants/security-constants.ts',
      'src/constants/react-scan.ts',
    ],
  },
  { value: '365', files: ['src/constants/i18n-constants.ts'] },
  { value: '999', files: ['src/lib/dev-tools-positioning.ts'] },
  { value: '1234', files: ['src/constants/test-ui-constants.ts'] },
  { value: '12345', files: ['src/constants/test-performance-constants.ts'] },

  // 坐标和精确小数
  {
    value: '184.704',
    files: ['src/lib/colors/dark-theme.ts', 'src/lib/colors/light-theme.ts'],
  },
  { value: '537.36', files: ['src/constants/test-performance-constants.ts'] },
  { value: '1234.56', files: ['src/constants/test-ui-constants.ts'] },
];

/**
 * 分析并分类剩余数字
 */
function analyzeRemainingNumbers(): RemainingNumber[] {
  const analyses: RemainingNumber[] = [];

  for (const item of remainingNumbers) {
    const analysis = categorizeRemainingNumber(item.value, item.files);
    analyses.push(analysis);
  }

  return analyses;
}

/**
 * 对单个剩余数字进行分类
 */
function categorizeRemainingNumber(
  value: string,
  files: string[],
): RemainingNumber {
  const num = parseFloat(value);

  // 1. 测试文件和测试数据 - ESLint豁免
  if (
    files.some((f) => f.includes('test-') || f.includes('__tests__')) ||
    [42, 1234, 12345, 999].includes(num)
  ) {
    return {
      value,
      files,
      category: 'eslint_exempt',
      reason: '测试数据或测试文件中的数字',
      action: '通过ESLint规则豁免，无需创建常量',
    };
  }

  // 2. 时间相关 - 单位工具库
  if (
    [
      2000, 4000, 6000, 7000, 8000, 9000, 12000, 15000, 45000, 50000, 100000,
      120000, 125000, 170000, 200000, 300000, 500000,
    ].includes(num)
  ) {
    return {
      value,
      files,
      category: 'units_lib',
      reason: '时间相关数字，可用单位工具库表达',
      action: `使用 seconds(${num / 1000}) 或 minutes(${num / 60000}) 替代`,
    };
  }

  // 3. 端口号 - 配置集中化
  if ([8888, 8900].includes(num)) {
    return {
      value,
      files,
      category: 'config',
      reason: '端口号，应集中到配置文件',
      action: '迁移到 src/config/app.ts 的 DEV_SERVER_CONFIG',
    };
  }

  // 4. HTTP状态码 - 局部常量（低频）
  if ([403, 429, 503].includes(num)) {
    return {
      value,
      files,
      category: 'local_const',
      reason: 'HTTP状态码，但使用频率低',
      action: '在使用文件中定义局部常量，如 const HTTP_FORBIDDEN = 403',
    };
  }

  // 5. 数据大小 - 单位工具库
  if ([2048, 4096, 8192, 65536].includes(num) && num >= 1024) {
    return {
      value,
      files,
      category: 'units_lib',
      reason: '数据大小，可用单位工具库表达',
      action: `使用 kilobytes(${num / 1024}) 或 megabytes(${num / 1048576}) 替代`,
    };
  }

  // 6. 百分比 - 单位工具库
  if (
    num <= 100 &&
    files.some((f) => f.includes('performance') || f.includes('analytics'))
  ) {
    return {
      value,
      files,
      category: 'units_lib',
      reason: '百分比数字，可用单位工具库表达',
      action: `使用 percent(${num}) 替代`,
    };
  }

  // 7. 尺寸和像素 - 局部常量或单位工具库
  if (
    [
      16, 20, 32, 64, 80, 120, 128, 150, 160, 190, 250, 256, 512, 600, 700, 750,
      800, 1200, 1536, 1600, 1800,
    ].includes(num)
  ) {
    if (files.length === 1) {
      return {
        value,
        files,
        category: 'local_const',
        reason: '尺寸数字，单文件使用',
        action: '在使用文件中定义局部常量',
      };
    }
    return {
      value,
      files,
      category: 'units_lib',
      reason: '尺寸数字，多文件使用',
      action: `使用 pixels(${num}) 或相关单位函数替代`,
    };
  }

  // 8. 坐标和精确小数 - 保持魔法数字
  if (value.includes('.') || [184.704, 537.36, 1234.56].includes(num)) {
    return {
      value,
      files,
      category: 'keep_magic',
      reason: '坐标或精确小数，属于数据型数字',
      action: '保持原样，通过AST过滤器自动跳过',
    };
  }

  // 9. 特殊业务数字 - 局部常量
  if ([365, 255, 131].includes(num)) {
    return {
      value,
      files,
      category: 'local_const',
      reason: '特殊业务数字，有明确含义',
      action: '在使用文件中定义有意义的局部常量',
    };
  }

  // 默认：局部常量
  return {
    value,
    files,
    category: 'local_const',
    reason: '其他业务数字',
    action: '在使用文件中定义局部常量',
  };
}

/**
 * 生成分类处理报告
 */
function generateProcessingReport(analyses: RemainingNumber[]): void {
  console.log('🎯 CODEX分层治理：剩余数字分类处理报告');
  console.log('');

  // 按类别统计
  const categories = {
    eslint_exempt: analyses.filter((a) => a.category === 'eslint_exempt'),
    units_lib: analyses.filter((a) => a.category === 'units_lib'),
    config: analyses.filter((a) => a.category === 'config'),
    local_const: analyses.filter((a) => a.category === 'local_const'),
    keep_magic: analyses.filter((a) => a.category === 'keep_magic'),
  };

  console.log('📊 分类统计:');
  console.log(`  ESLint豁免: ${categories.eslint_exempt.length}个`);
  console.log(`  单位工具库: ${categories.units_lib.length}个`);
  console.log(`  配置集中化: ${categories.config.length}个`);
  console.log(`  局部常量: ${categories.local_const.length}个`);
  console.log(`  保持魔法数字: ${categories.keep_magic.length}个`);
  console.log('');

  // 详细分类报告
  Object.entries(categories).forEach(([category, items]) => {
    if (items.length > 0) {
      console.log(`🔸 ${getCategoryName(category)} (${items.length}个):`);
      items.forEach((item) => {
        console.log(`  ${item.value} - ${item.reason}`);
        console.log(`    处理方式: ${item.action}`);
        console.log(`    涉及文件: ${item.files.length}个`);
      });
      console.log('');
    }
  });

  // 处理优先级建议
  console.log('📋 处理优先级建议:');
  console.log('  1. 高优先级: 配置集中化 (影响部署配置)');
  console.log('  2. 中优先级: 单位工具库 (提升代码可读性)');
  console.log('  3. 低优先级: 局部常量 (逐步优化)');
  console.log('  4. 自动处理: ESLint豁免和保持魔法数字');
}

function getCategoryName(category: string): string {
  const names = {
    eslint_exempt: 'ESLint规则豁免',
    units_lib: '单位工具库处理',
    config: '配置集中化',
    local_const: '局部常量定义',
    keep_magic: '保持魔法数字',
  };
  return names[category as keyof typeof names] || category;
}

// 执行分析
if (require.main === module) {
  const analyses = analyzeRemainingNumbers();
  generateProcessingReport(analyses);
}
