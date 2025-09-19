#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * 智能常量生成器
 * 基于语义分析结果生成有意义的常量名
 */

interface SemanticAnalysis {
  timestamp: string;
  summary: {
    totalNumbers: number;
    categoriesFound: number;
    categoryStats: Record<string, number>;
  };
  analysis: Record<
    string,
    {
      category: string;
      constantName: string;
      description: string;
    }
  >;
  recommendations: string[];
}

/**
 * 生成更有意义的常量名
 */
function generateMeaningfulConstantName(
  numStr: string,
  analysis: { category: string; constantName: string; description: string }
): string {
  const num = parseFloat(numStr);
  const { category } = analysis;

  // 根据分类生成更有意义的常量名
  switch (category) {
    case 'HTTP_STATUS':
      return generateHttpStatusName(num);

    case 'TIME_MS':
      return generateTimeConstantName(num);

    case 'BREAKPOINT':
      return generateBreakpointName(num);

    case 'PERCENTAGE_DECIMAL':
      return generatePercentageName(num);

    case 'ANIMATION_DURATION':
      return generateAnimationDurationName(num);

    case 'MEMORY_SIZE':
      return generateMemorySizeName(num);

    case 'ANGLE':
      return generateAngleName(num);

    case 'COORDINATE':
      return generateCoordinateName(num, numStr);

    case 'PORT':
      return generatePortName(num);

    case 'YEAR':
      return `YEAR_${num}`;

    case 'NUMERIC':
    default:
      return generateNumericConstantName(num, numStr);
  }
}

function generateHttpStatusName(num: number): string {
  const statusMap: Record<number, string> = {
    200: 'HTTP_OK',
    201: 'HTTP_CREATED',
    204: 'HTTP_NO_CONTENT',
    300: 'HTTP_MULTIPLE_CHOICES',
    301: 'HTTP_MOVED_PERMANENTLY',
    302: 'HTTP_FOUND',
    400: 'HTTP_BAD_REQUEST',
    401: 'HTTP_UNAUTHORIZED',
    403: 'HTTP_FORBIDDEN',
    404: 'HTTP_NOT_FOUND',
    415: 'HTTP_UNSUPPORTED_MEDIA_TYPE',
    429: 'HTTP_TOO_MANY_REQUESTS',
    500: 'HTTP_INTERNAL_SERVER_ERROR',
    503: 'HTTP_SERVICE_UNAVAILABLE',
  };
  return statusMap[num] || `HTTP_${num}`;
}

function generateTimeConstantName(num: number): string {
  if (num === 1000) return 'SECOND_MS';
  if (num === 2000) return 'TWO_SECONDS_MS';
  if (num === 3000) return 'THREE_SECONDS_MS';
  if (num === 5000) return 'FIVE_SECONDS_MS';
  if (num === 10000) return 'TEN_SECONDS_MS';
  if (num === 15000) return 'FIFTEEN_SECONDS_MS';
  if (num === 30000) return 'THIRTY_SECONDS_MS';
  if (num === 60000) return 'MINUTE_MS';
  if (num === 120000) return 'TWO_MINUTES_MS';
  if (num === 1800000) return 'THIRTY_MINUTES_MS';
  if (num === 3600000) return 'HOUR_MS';
  if (num === 86400000) return 'DAY_MS';
  if (num === 31536000) return 'YEAR_SECONDS';

  // 自动计算时间单位
  if (num >= 86400000) return `TIME_${Math.round(num / 86400000)}_DAYS_MS`;
  if (num >= 3600000) return `TIME_${Math.round(num / 3600000)}_HOURS_MS`;
  if (num >= 60000) return `TIME_${Math.round(num / 60000)}_MINUTES_MS`;
  if (num >= 1000) return `TIME_${Math.round(num / 1000)}_SECONDS_MS`;

  return `TIME_${num}_MS`;
}

function generateBreakpointName(num: number): string {
  const breakpointMap: Record<number, string> = {
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
  return breakpointMap[num] || `BREAKPOINT_${num}`;
}

function generatePercentageName(num: number): string {
  const percentage = Math.round(num * 100);

  // 特殊百分比命名
  if (percentage === 1) return 'PERCENT_1';
  if (percentage === 2) return 'PERCENT_2';
  if (percentage === 3) return 'PERCENT_3';
  if (percentage === 5) return 'PERCENT_5';
  if (percentage === 8) return 'PERCENT_8';
  if (percentage === 10) return 'PERCENT_10';
  if (percentage === 12) return 'PERCENT_12';
  if (percentage === 15) return 'PERCENT_15';
  if (percentage === 20) return 'PERCENT_20';
  if (percentage === 25) return 'PERCENT_25';
  if (percentage === 30) return 'PERCENT_30';
  if (percentage === 40) return 'PERCENT_40';
  if (percentage === 45) return 'PERCENT_45';
  if (percentage === 50) return 'PERCENT_50';
  if (percentage === 55) return 'PERCENT_55';
  if (percentage === 60) return 'PERCENT_60';
  if (percentage === 65) return 'PERCENT_65';
  if (percentage === 70) return 'PERCENT_70';
  if (percentage === 75) return 'PERCENT_75';
  if (percentage === 80) return 'PERCENT_80';
  if (percentage === 85) return 'PERCENT_85';
  if (percentage === 90) return 'PERCENT_90';
  if (percentage === 94) return 'PERCENT_94';
  if (percentage === 95) return 'PERCENT_95';
  if (percentage === 96) return 'PERCENT_96';
  if (percentage === 97) return 'PERCENT_97';
  if (percentage === 99) return 'PERCENT_99';

  // 透明度相关
  if (num <= 1) return `OPACITY_${percentage}`;

  return `DECIMAL_${num.toString().replace('.', '_')}`;
}

function generateAnimationDurationName(num: number): string {
  if (num === 150) return 'ANIMATION_FAST';
  if (num === 200) return 'ANIMATION_QUICK';
  if (num === 250) return 'ANIMATION_NORMAL';
  if (num === 300) return 'ANIMATION_SMOOTH';
  if (num === 400) return 'ANIMATION_MEDIUM';
  if (num === 500) return 'ANIMATION_SLOW';
  if (num === 600) return 'ANIMATION_SLOWER';
  if (num === 700) return 'ANIMATION_VERY_SLOW';
  if (num === 750) return 'ANIMATION_EXTRA_SLOW';
  if (num === 800) return 'ANIMATION_ULTRA_SLOW';
  if (num === 900) return 'ANIMATION_SUPER_SLOW';
  if (num === 1000) return 'ANIMATION_VERY_SLOW_1S';
  if (num === 1200) return 'ANIMATION_SLOW_1_2S';
  if (num === 1250) return 'ANIMATION_SLOW_1_25S';
  if (num === 1500) return 'ANIMATION_SLOW_1_5S';
  if (num === 2000) return 'ANIMATION_SLOW_2S';

  return `ANIMATION_DURATION_${num}`;
}

function generateMemorySizeName(num: number): string {
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
}

function generateAngleName(num: number): string {
  if (num === 0) return 'ANGLE_ZERO';
  if (num === 45) return 'ANGLE_45_DEG';
  if (num === 90) return 'ANGLE_90_DEG';
  if (num === 180) return 'ANGLE_180_DEG';
  if (num === 270) return 'ANGLE_270_DEG';
  if (num === 360 || (num > 359 && num < 361)) return 'ANGLE_360_DEG';
  if (num === 720) return 'ANGLE_720_DEG';

  return `ANGLE_${num.toString().replace('.', '_')}_DEG`;
}

function generateCoordinateName(num: number, numStr: string): string {
  // 根据常见城市坐标进行命名
  if (Math.abs(num - 39.9042) < 0.001) return 'COORD_BEIJING_LAT';
  if (Math.abs(num - 116.4074) < 0.001) return 'COORD_BEIJING_LNG';
  if (Math.abs(num - 40.7128) < 0.001) return 'COORD_NYC_LAT';
  if (Math.abs(num - 74.006) < 0.001) return 'COORD_NYC_LNG';

  // 测试用精确坐标
  if (numStr.includes('.') && numStr.length > 10) {
    return `TEST_COORDINATE_${numStr.replace('.', '_').replace('-', 'NEG_')}`;
  }

  return `COORDINATE_${numStr.replace('.', '_').replace('-', 'NEG_')}`;
}

function generatePortName(num: number): string {
  const portMap: Record<number, string> = {
    3000: 'PORT_DEV_SERVER',
    3001: 'PORT_DEV_SERVER_ALT',
    4000: 'PORT_DEV_API',
    5000: 'PORT_DEV_FRONTEND',
    8000: 'PORT_HTTP_ALT',
    8080: 'PORT_HTTP_PROXY',
    8888: 'PORT_DEV_SPECIAL',
    9000: 'PORT_DEV_BUILD',
  };
  return portMap[num] || `PORT_${num}`;
}

function generateNumericConstantName(num: number, numStr: string): string {
  // 特殊数字
  if (num === 42) return 'ANSWER_TO_EVERYTHING'; // 银河系漫游指南
  if (num === 123) return 'TEST_NUMBER_123';
  if (num === 456) return 'TEST_NUMBER_456';
  if (num === 999) return 'TEST_MAX_999';
  if (num === 1234) return 'TEST_NUMBER_1234';
  if (num === 12345) return 'TEST_NUMBER_12345';
  if (num === 1234567) return 'TEST_NUMBER_LARGE';

  // 大数字
  if (num >= 1000000000000)
    return `TRILLION_${Math.floor(num / 1000000000000)}`;
  if (num >= 1000000000) return `BILLION_${Math.floor(num / 1000000000)}`;
  if (num >= 1000000) return `MILLION_${Math.floor(num / 1000000)}`;
  if (num >= 1000) return `THOUSAND_${Math.floor(num / 1000)}`;

  // 整数
  if (Number.isInteger(num)) {
    return `NUMBER_${num}`;
  }

  // 小数
  return `DECIMAL_${numStr.replace('.', '_').replace('-', 'NEG_')}`;
}

/**
 * 主函数
 */
async function main() {
  console.log('🎯 开始生成智能常量映射...');

  // 读取语义分析结果
  const analysisPath = resolve(__dirname, 'semantic-analysis-report.json');
  const analysisData: SemanticAnalysis = JSON.parse(
    readFileSync(analysisPath, 'utf-8'),
  );

  console.log(`📊 处理 ${analysisData.summary.totalNumbers} 个数字`);
  console.log(`📋 发现 ${analysisData.summary.categoriesFound} 个分类`);

  // 生成新的映射
  const newMapping: Record<string, string> = {};

  for (const [numStr, analysis] of Object.entries(analysisData.analysis)) {
    const meaningfulName = generateMeaningfulConstantName(numStr, analysis);
    newMapping[numStr] = meaningfulName;
  }

  // 合并现有映射
  const existingMappingPath = resolve(__dirname, 'mapping.json');
  let existingMapping: Record<string, string> = {};

  try {
    existingMapping = JSON.parse(readFileSync(existingMappingPath, 'utf-8'));
  } catch (error) {
    console.log('📝 创建新的映射文件');
  }

  // 合并映射，新的智能映射优先
  const finalMapping = { ...existingMapping, ...newMapping };

  // 保存映射文件
  writeFileSync(existingMappingPath, JSON.stringify(finalMapping, null, 2));

  console.log('📊 映射生成完成！');
  console.log(`  现有常量: ${Object.keys(existingMapping).length} 个`);
  console.log(`  新增常量: ${Object.keys(newMapping).length} 个`);
  console.log(`  总计常量: ${Object.keys(finalMapping).length} 个`);

  // 显示分类统计
  console.log('');
  console.log('📈 智能分类统计:');
  Object.entries(analysisData.summary.categoryStats)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 个`);
    });

  console.log('');
  console.log(`📄 映射文件已更新: ${existingMappingPath}`);

  return finalMapping;
}

// 运行生成器
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 智能常量生成失败:', error);
    process.exit(1);
  });
}

export { generateMeaningfulConstantName };
