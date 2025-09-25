#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * 生成常量名称
 */
function generateConstantName(num: string): string {
  // 处理科学计数法
  if (num.includes('e') || num.includes('E')) {
    return `SCIENTIFIC_${num
      .replace(/[e\-\.]/gi, '_')
      .replace(/\+/g, 'PLUS_')
      .toUpperCase()}`;
  }

  // 处理负数
  if (num.startsWith('-')) {
    return `NEGATIVE_${generateConstantName(num.slice(1))}`;
  }

  // 处理小数
  if (num.includes('.')) {
    const parts = num.split('.');
    const intPart = parts[0] || '0';
    const decPart = parts[1] || '0';

    // 特殊处理一些常见的小数
    const specialDecimals: Record<string, string> = {
      '0.1': 'DECIMAL_TENTH',
      '0.2': 'DECIMAL_TWENTY_PERCENT',
      '0.25': 'DECIMAL_QUARTER',
      '0.3': 'DECIMAL_THIRTY_PERCENT',
      '0.4': 'DECIMAL_FORTY_PERCENT',
      '0.5': 'DECIMAL_HALF',
      '0.6': 'DECIMAL_SIXTY_PERCENT',
      '0.7': 'DECIMAL_SEVENTY_PERCENT',
      '0.75': 'DECIMAL_THREE_QUARTERS',
      '0.8': 'DECIMAL_EIGHTY_PERCENT',
      '0.9': 'DECIMAL_NINETY_PERCENT',
      '0.95': 'DECIMAL_NINETY_FIVE_PERCENT',
      '0.99': 'DECIMAL_NINETY_NINE_PERCENT',
    };

    if (specialDecimals[num]) {
      return specialDecimals[num];
    }

    // 处理长小数（测试数据）
    if (decPart.length > 6) {
      return `TEST_DECIMAL_${intPart}_${decPart.slice(0, 6)}`;
    }

    return `DECIMAL_${intPart}_${decPart}`;
  }

  // 处理整数
  const numValue = parseInt(num);

  // 特殊处理一些常见的数字
  const specialNumbers: Record<string, string> = {
    '0': 'ZERO',
    '1': 'ONE',
    '2': 'TWO',
    '3': 'THREE',
    '4': 'FOUR',
    '5': 'FIVE',
    '6': 'SIX',
    '7': 'SEVEN',
    '8': 'EIGHT',
    '9': 'NINE',
    '10': 'TEN',
    '42': 'ANSWER_TO_EVERYTHING',
    '100': 'ONE_HUNDRED',
    '200': 'HTTP_OK',
    '400': 'HTTP_BAD_REQUEST',
    '401': 'HTTP_UNAUTHORIZED',
    '403': 'HTTP_FORBIDDEN',
    '404': 'HTTP_NOT_FOUND',
    '500': 'HTTP_INTERNAL_SERVER_ERROR',
    '1000': 'ONE_THOUSAND',
    '1024': 'BYTES_PER_KB',
  };

  if (specialNumbers[num]) {
    return specialNumbers[num];
  }

  // HTTP状态码
  if (numValue >= 100 && numValue < 600) {
    return `HTTP_${num}`;
  }

  // 端口号
  if (
    (numValue >= 1000 && numValue <= 65535 && num.endsWith('80')) ||
    num.endsWith('00')
  ) {
    return `PORT_${num}`;
  }

  // 时间相关
  if (numValue === 60) return 'SECONDS_PER_MINUTE';
  if (numValue === 3600) return 'SECONDS_PER_HOUR';
  if (numValue === 86400) return 'SECONDS_PER_DAY';
  if (numValue === 86400000) return 'MILLISECONDS_PER_DAY';
  if (numValue === 3600000) return 'MILLISECONDS_PER_HOUR';
  if (numValue === 60000) return 'MILLISECONDS_PER_MINUTE';

  // 屏幕尺寸
  if (numValue === 320) return 'MOBILE_WIDTH_SMALL';
  if (numValue === 375) return 'MOBILE_WIDTH_MEDIUM';
  if (numValue === 640) return 'TABLET_WIDTH_SMALL';
  if (numValue === 768) return 'TABLET_WIDTH';
  if (numValue === 1024) return 'DESKTOP_WIDTH_SMALL';
  if (numValue === 1280) return 'DESKTOP_WIDTH_MEDIUM';
  if (numValue === 1920) return 'DESKTOP_WIDTH_LARGE';

  // 内存大小
  if (numValue === 1048576) return 'BYTES_PER_MB';
  if (numValue === 1073741824) return 'BYTES_PER_GB';

  // 大数字
  if (numValue >= 1000000000)
    return `BILLION_${Math.floor(numValue / 1000000000)}`;
  if (numValue >= 1000000) return `MILLION_${Math.floor(numValue / 1000000)}`;
  if (numValue >= 1000) return `THOUSAND_${Math.floor(numValue / 1000)}`;

  // 默认命名
  return `NUMBER_${num.replace(/\./g, '_')}`;
}

/**
 * 从预检输出中提取缺失的常量
 */
function extractMissingConstants(): string[] {
  try {
    // 运行预检并捕获输出
    const { execSync } = require('child_process');
    const output = execSync('tsx scripts/magic-numbers/preflight.ts', {
      encoding: 'utf8',
      cwd: process.cwd(),
    });

    // 这不会执行到，因为预检会失败
    return [];
  } catch (error: unknown) {
    const output =
      (error as { stdout?: string; message?: string }).stdout ||
      (error as { message?: string }).message ||
      '';

    // 从输出中提取数字
    const lines = output.split('\n');
    const numbers: string[] = [];

    let inMissingSection = false;
    for (const line of lines) {
      if (line.includes('缺失常量定义')) {
        inMissingSection = true;
        continue;
      }

      if (inMissingSection && line.includes('📁 涉及的文件')) {
        break;
      }

      if (inMissingSection && line.includes('"') && line.includes(':')) {
        const match = line.match(/"([^"]+)":/);
        if (match) {
          numbers.push(match[1]);
        }
      }
    }

    return numbers;
  }
}

/**
 * 生成映射文件和常量定义
 */
async function generateConstants() {
  console.log('🔍 提取缺失的常量...');

  const missingNumbers = extractMissingConstants();
  console.log(`📊 发现 ${missingNumbers.length} 个缺失的常量`);

  if (missingNumbers.length === 0) {
    console.log('✅ 没有缺失的常量');
    return;
  }

  // 读取现有映射
  const mappingPath = resolve(__dirname, 'mapping.json');
  let existingMapping: Record<string, string> = {};

  try {
    existingMapping = JSON.parse(readFileSync(mappingPath, 'utf-8'));
  } catch (error) {
    console.log('📝 创建新的映射文件');
  }

  // 生成新的映射
  const newMapping = { ...existingMapping };
  const newConstants: Array<{ name: string; value: string }> = [];

  for (const num of missingNumbers) {
    if (!newMapping[num]) {
      const constantName = generateConstantName(num);
      newMapping[num] = constantName;
      newConstants.push({ name: constantName, value: num });
    }
  }

  // 保存映射文件
  writeFileSync(mappingPath, JSON.stringify(newMapping, null, 2));
  console.log(`📄 映射文件已更新: ${Object.keys(newMapping).length} 个常量`);

  // 读取现有的常量文件
  const constantsPath = resolve(
    process.cwd(),
    'src/constants/magic-numbers.ts',
  );
  let constantsContent = '';

  try {
    constantsContent = readFileSync(constantsPath, 'utf-8');
  } catch (error) {
    constantsContent =
      '// 自动生成的数字常量文件\n// 用于替换代码中的魔法数字，提升可读性和维护性\n\n';
  }

  // 添加新常量
  if (newConstants.length > 0) {
    constantsContent += '\n// 自动生成的常量\n';

    for (const { name, value } of newConstants) {
      constantsContent += `export const ${name} = ${value};\n`;
    }

    writeFileSync(constantsPath, constantsContent);
    console.log(`📄 常量文件已更新: 添加了 ${newConstants.length} 个新常量`);
  }

  console.log('✅ 常量生成完成');
}

// 运行生成器
if (require.main === module) {
  generateConstants().catch(console.error);
}
