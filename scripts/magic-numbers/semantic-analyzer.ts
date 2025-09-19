#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * 数字语义分类器
 * 将魔法数字按照业务语义进行智能分类
 */

interface NumberCategory {
  name: string;
  description: string;
  pattern: (num: number, str: string) => boolean;
  generateName: (num: number, str: string) => string;
  priority: number; // 优先级，数字越小优先级越高
}

// 定义语义分类规则
const categories: NumberCategory[] = [
  // HTTP状态码
  {
    name: 'HTTP_STATUS',
    description: 'HTTP状态码',
    pattern: (num) =>
      [
        200, 201, 204, 300, 301, 302, 400, 401, 403, 404, 415, 429, 500, 503,
      ].includes(num),
    generateName: (num) => `HTTP_${num}`,
    priority: 1,
  },

  // 时间相关 - 毫秒
  {
    name: 'TIME_MS',
    description: '时间相关（毫秒）',
    pattern: (num) => {
      // 常见的毫秒值：1000, 2000, 3000, 5000, 10000, 30000, 60000等
      return num >= 1000 && num <= 86400000 && num % 1000 === 0;
    },
    generateName: (num) => {
      if (num === 1000) return 'SECOND_MS';
      if (num === 2000) return 'TWO_SECONDS_MS';
      if (num === 3000) return 'THREE_SECONDS_MS';
      if (num === 5000) return 'FIVE_SECONDS_MS';
      if (num === 10000) return 'TEN_SECONDS_MS';
      if (num === 30000) return 'THIRTY_SECONDS_MS';
      if (num === 60000) return 'MINUTE_MS';
      if (num === 3600000) return 'HOUR_MS';
      if (num === 86400000) return 'DAY_MS';
      return `TIME_${num}_MS`;
    },
    priority: 2,
  },

  // 屏幕尺寸和断点
  {
    name: 'BREAKPOINT',
    description: '响应式断点',
    pattern: (num) =>
      [
        320, 375, 480, 640, 667, 720, 768, 800, 1024, 1080, 1200, 1280, 1536,
        1600, 1920,
      ].includes(num),
    generateName: (num) => {
      const breakpoints: Record<number, string> = {
        320: 'BREAKPOINT_MOBILE_SMALL',
        375: 'BREAKPOINT_MOBILE',
        480: 'BREAKPOINT_MOBILE_LARGE',
        640: 'BREAKPOINT_SM',
        667: 'BREAKPOINT_MOBILE_LANDSCAPE',
        720: 'BREAKPOINT_HD_HEIGHT',
        768: 'BREAKPOINT_MD',
        800: 'BREAKPOINT_TABLET_SMALL',
        1024: 'BREAKPOINT_LG',
        1080: 'BREAKPOINT_HD_HEIGHT_FULL',
        1200: 'BREAKPOINT_DESKTOP',
        1280: 'BREAKPOINT_XL',
        1536: 'BREAKPOINT_2XL',
        1600: 'BREAKPOINT_DESKTOP_LARGE',
        1920: 'BREAKPOINT_FULL_HD',
      };
      return breakpoints[num] || `BREAKPOINT_${num}`;
    },
    priority: 3,
  },

  // 百分比（0-1之间的小数）
  {
    name: 'PERCENTAGE_DECIMAL',
    description: '百分比（小数形式）',
    pattern: (num) => num > 0 && num < 1 && num.toString().length <= 5,
    generateName: (num) => {
      const percentageMap: Record<string, string> = {
        '0.01': 'PERCENT_1',
        '0.02': 'PERCENT_2',
        '0.03': 'PERCENT_3',
        '0.05': 'PERCENT_5',
        '0.08': 'PERCENT_8',
        '0.1': 'PERCENT_10',
        '0.12': 'PERCENT_12',
        '0.15': 'PERCENT_15',
        '0.2': 'PERCENT_20',
        '0.25': 'PERCENT_25',
        '0.3': 'PERCENT_30',
        '0.4': 'PERCENT_40',
        '0.45': 'PERCENT_45',
        '0.5': 'PERCENT_50',
        '0.55': 'PERCENT_55',
        '0.6': 'PERCENT_60',
        '0.65': 'PERCENT_65',
        '0.7': 'PERCENT_70',
        '0.75': 'PERCENT_75',
        '0.8': 'PERCENT_80',
        '0.85': 'PERCENT_85',
        '0.9': 'PERCENT_90',
        '0.94': 'PERCENT_94',
        '0.95': 'PERCENT_95',
        '0.96': 'PERCENT_96',
        '0.97': 'PERCENT_97',
        '0.99': 'PERCENT_99',
      };
      return (
        percentageMap[num.toString()] || `OPACITY_${Math.round(num * 100)}`
      );
    },
    priority: 4,
  },

  // 动画持续时间
  {
    name: 'ANIMATION_DURATION',
    description: '动画持续时间',
    pattern: (num) =>
      [
        150, 200, 250, 300, 400, 500, 600, 700, 750, 800, 900, 1000, 1200, 1250,
        1500, 2000,
      ].includes(num),
    generateName: (num) => `ANIMATION_DURATION_${num}`,
    priority: 5,
  },

  // 内存和存储大小
  {
    name: 'MEMORY_SIZE',
    description: '内存和存储大小',
    pattern: (num) => {
      // 2的幂次方，常见的内存大小
      return [
        256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144,
        524288, 1048576, 2097152, 4194304,
      ].includes(num);
    },
    generateName: (num) => {
      const sizeMap: Record<number, string> = {
        256: 'BYTES_256',
        512: 'BYTES_512',
        1024: 'BYTES_1KB',
        2048: 'BYTES_2KB',
        4096: 'BYTES_4KB',
        8192: 'BYTES_8KB',
        16384: 'BYTES_16KB',
        32768: 'BYTES_32KB',
        65536: 'BYTES_64KB',
        131072: 'BYTES_128KB',
        262144: 'BYTES_256KB',
        524288: 'BYTES_512KB',
        1048576: 'BYTES_1MB',
        2097152: 'BYTES_2MB',
        4194304: 'BYTES_4MB',
      };
      return sizeMap[num] || `MEMORY_SIZE_${num}`;
    },
    priority: 6,
  },

  // 年份
  {
    name: 'YEAR',
    description: '年份',
    pattern: (num) => num >= 2020 && num <= 2030 && Number.isInteger(num),
    generateName: (num) => `YEAR_${num}`,
    priority: 7,
  },

  // 角度
  {
    name: 'ANGLE',
    description: '角度值',
    pattern: (num) =>
      [0, 45, 90, 180, 270, 360].includes(num) || (num > 359 && num < 361),
    generateName: (num) => {
      if (num === 0) return 'ANGLE_ZERO';
      if (num === 45) return 'ANGLE_45_DEG';
      if (num === 90) return 'ANGLE_90_DEG';
      if (num === 180) return 'ANGLE_180_DEG';
      if (num === 270) return 'ANGLE_270_DEG';
      if (num === 360 || (num > 359 && num < 361)) return 'ANGLE_360_DEG';
      return `ANGLE_${num.toString().replace('.', '_')}_DEG`;
    },
    priority: 8,
  },

  // 地理坐标
  {
    name: 'COORDINATE',
    description: '地理坐标',
    pattern: (num, str) => {
      // 纬度范围 -90 到 90，经度范围 -180 到 180
      return (
        (num >= -90 && num <= 90 && str.includes('.')) ||
        (num >= -180 && num <= 180 && str.includes('.') && Math.abs(num) > 90)
      );
    },
    generateName: (num, str) => {
      // 根据常见城市坐标进行命名
      if (Math.abs(num - 39.9042) < 0.001) return 'COORD_BEIJING_LAT';
      if (Math.abs(num - 116.4074) < 0.001) return 'COORD_BEIJING_LNG';
      if (Math.abs(num - 40.7128) < 0.001) return 'COORD_NYC_LAT';
      if (Math.abs(num - 74.006) < 0.001) return 'COORD_NYC_LNG';
      return `COORDINATE_${str.replace('.', '_').replace('-', 'NEG_')}`;
    },
    priority: 9,
  },

  // 测试数据 - 精确小数
  {
    name: 'TEST_PRECISION',
    description: '测试用精确小数',
    pattern: (num, str) => {
      // 长小数，通常用于精度测试
      return str.includes('.') && str.length > 10;
    },
    generateName: (num, str) => `TEST_PRECISION_${str.replace('.', '_')}`,
    priority: 10,
  },

  // 端口号
  {
    name: 'PORT',
    description: '端口号',
    pattern: (num) => num >= 3000 && num <= 9000 && Number.isInteger(num),
    generateName: (num) => `PORT_${num}`,
    priority: 11,
  },

  // 默认分类
  {
    name: 'NUMERIC',
    description: '数值常量',
    pattern: () => true, // 匹配所有剩余的数字
    generateName: (num, str) => {
      if (Number.isInteger(num)) {
        return `NUMBER_${num}`;
      }
      return `DECIMAL_${str.replace('.', '_').replace('-', 'NEG_')}`;
    },
    priority: 99,
  },
];

/**
 * 分析数字并分类
 */
function analyzeNumber(numStr: string): {
  category: string;
  constantName: string;
  description: string;
} {
  const num = parseFloat(numStr);

  // 按优先级排序，找到第一个匹配的分类
  const sortedCategories = categories.sort((a, b) => a.priority - b.priority);

  for (const category of sortedCategories) {
    if (category.pattern(num, numStr)) {
      return {
        category: category.name,
        constantName: category.generateName(num, numStr),
        description: category.description,
      };
    }
  }

  // 默认分类（理论上不会到达这里）
  return {
    category: 'UNKNOWN',
    constantName: `UNKNOWN_${numStr.replace('.', '_')}`,
    description: '未知类型',
  };
}

/**
 * 从预检输出中提取所有数字
 */
function extractNumbersFromPreflight(): string[] {
  try {
    const { execSync } = require('child_process');
    const output = execSync('tsx scripts/magic-numbers/preflight.ts', {
      encoding: 'utf8',
      cwd: process.cwd(),
    });

    // 解析输出，提取数字列表
    const lines = output.split('\n');
    const numbers: string[] = [];
    let inNumberSection = false;

    for (const line of lines) {
      if (line.includes('缺失常量定义')) {
        inNumberSection = true;
        continue;
      }

      if (inNumberSection && line.includes('📁 涉及的文件:')) {
        break;
      }

      if (inNumberSection && line.trim().startsWith('"')) {
        // 提取数字：  "0.123": "MAGIC_0_123",
        const match = line.match(/"([^"]+)":/);
        if (match) {
          numbers.push(match[1]);
        }
      }
    }

    return numbers;
  } catch (error) {
    // 如果预检失败，从错误输出中提取数字
    const errorOutput = error.stderr || error.stdout || '';
    const lines = errorOutput.split('\n');
    const numbers: string[] = [];
    let inNumberSection = false;

    for (const line of lines) {
      if (line.includes('缺失常量定义')) {
        inNumberSection = true;
        continue;
      }

      if (inNumberSection && line.includes('📁 涉及的文件:')) {
        break;
      }

      if (inNumberSection && line.trim().startsWith('"')) {
        // 提取数字：  "0.123": "MAGIC_0_123",
        const match = line.match(/"([^"]+)":/);
        if (match) {
          numbers.push(match[1]);
        }
      }
    }

    if (numbers.length === 0) {
      console.error('Failed to extract numbers from preflight:', error.message);
    }

    return numbers;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始语义分析...');

  // 提取所有需要处理的数字
  const numbers = extractNumbersFromPreflight();
  console.log(`📊 发现 ${numbers.length} 个数字需要分析`);

  if (numbers.length === 0) {
    console.log('❌ 没有找到需要处理的数字');
    return;
  }

  // 分析每个数字
  const analysis: Record<string, any> = {};
  const categoryStats: Record<string, number> = {};

  for (const numStr of numbers) {
    const result = analyzeNumber(numStr);
    analysis[numStr] = result;

    categoryStats[result.category] = (categoryStats[result.category] || 0) + 1;
  }

  // 生成分析报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalNumbers: numbers.length,
      categoriesFound: Object.keys(categoryStats).length,
      categoryStats,
    },
    analysis,
    recommendations: generateRecommendations(categoryStats),
  };

  // 保存分析结果
  const reportPath = resolve(__dirname, 'semantic-analysis-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('📊 分析完成！');
  console.log('');
  console.log('📈 分类统计:');
  Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 个`);
    });

  console.log('');
  console.log(`📄 详细报告已保存到: ${reportPath}`);

  return report;
}

/**
 * 生成优化建议
 */
function generateRecommendations(stats: Record<string, number>): string[] {
  const recommendations: string[] = [];

  if (stats.TEST_PRECISION > 10) {
    recommendations.push('建议将测试用精确小数归类到专门的测试常量文件中');
  }

  if (stats.NUMERIC > 50) {
    recommendations.push('存在大量通用数值常量，建议进一步细化分类规则');
  }

  if (stats.BREAKPOINT > 5) {
    recommendations.push('响应式断点较多，建议统一到专门的断点常量文件中');
  }

  return recommendations;
}

// 运行分析
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 语义分析失败:', error);
    process.exit(1);
  });
}

export { analyzeNumber, categories };
