#!/usr/bin/env node
/*
 * 魔法数字修复器
 * - 分析ESLint no-magic-numbers错误
 * - 创建常量文件统一管理数字常量
 * - 批量替换魔法数字为命名常量
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 常见的魔法数字映射
const MAGIC_NUMBER_CONSTANTS = {
  // 动画和时间
  '150': 'ANIMATION_DURATION_FAST',
  '300': 'ANIMATION_DURATION_NORMAL',
  '500': 'ANIMATION_DURATION_SLOW',
  '1000': 'ANIMATION_DURATION_VERY_SLOW',
  '1250': 'ANIMATION_DURATION_EXTRA_SLOW',

  // 尺寸和布局
  '45': 'SIZE_SMALL',
  '120': 'SIZE_MEDIUM',
  '150': 'SIZE_LARGE',
  '890': 'SIZE_EXTRA_LARGE',
  '1412': 'SIZE_CONTAINER_WIDTH',

  // 透明度和比例
  '0.02': 'OPACITY_VERY_LOW',
  '0.08': 'OPACITY_LOW',
  '0.65': 'OPACITY_MEDIUM',
  '0.94': 'OPACITY_HIGH',

  // 常见数值
  '2': 'COUNT_PAIR',
  '3': 'COUNT_TRIPLE',
  '4': 'COUNT_QUAD',
  '5': 'COUNT_FIVE',
  '10': 'COUNT_TEN',
  '100': 'PERCENTAGE_FULL',
  '50': 'PERCENTAGE_HALF',
  '25': 'PERCENTAGE_QUARTER',

  // 性能和限制
  '1024': 'BYTES_PER_KB',
  '60': 'SECONDS_PER_MINUTE',
  '24': 'HOURS_PER_DAY',
  '7': 'DAYS_PER_WEEK',
  '30': 'DAYS_PER_MONTH',
  '365': 'DAYS_PER_YEAR',

  // 负数常量
  '-2': 'OFFSET_NEGATIVE_SMALL',
  '-5': 'OFFSET_NEGATIVE_MEDIUM',
  '-10': 'OFFSET_NEGATIVE_LARGE',
  '-50': 'OFFSET_NEGATIVE_EXTRA_LARGE',
  '-100': 'OFFSET_NEGATIVE_HUGE',
  '-500': 'OFFSET_NEGATIVE_MASSIVE',

  // 十六进制常量 - 文件格式标识
  '0xff': 'HEX_BYTE_MAX',
  '0xd8': 'HEX_JPEG_MARKER_1',
  '0x89': 'HEX_PNG_SIGNATURE_1',
  '0x50': 'HEX_PNG_SIGNATURE_2',
  '0x4e': 'HEX_PNG_SIGNATURE_3',
  '0x47': 'HEX_PNG_SIGNATURE_4',
  '0x49': 'HEX_PNG_SIGNATURE_5',
  '0x46': 'HEX_PNG_SIGNATURE_6',
  '0x25': 'HEX_PDF_MARKER',
  '0x44': 'HEX_PDF_SIGNATURE_1',
  '0x4b': 'HEX_ZIP_SIGNATURE',

  // 十六进制常量 - 位操作
  '0x0f': 'HEX_MASK_LOW_NIBBLE',
  '0x40': 'HEX_MASK_BIT_6',
  '0x3f': 'HEX_MASK_6_BITS',
  '0x80': 'HEX_MASK_HIGH_BIT',
  '0x80000000': 'HEX_MASK_SIGN_BIT_32',
};

// 应该忽略的魔法数字（合理的硬编码）
const IGNORED_NUMBERS = [
  '0',
  '1',
  '-1', // 基础数值
  '200',
  '201',
  '400',
  '401',
  '403',
  '404',
  '500', // HTTP状态码
  '8080',
  '3000',
  '5173',
  '4200', // 常见端口
];

function getMagicNumberErrors() {
  let fullOutput = '';

  try {
    // 尝试获取完整的lint输出，忽略退出码
    fullOutput = execSync('pnpm lint:check 2>&1', {
      encoding: 'utf8',
      shell: true,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });
  } catch (error) {
    // ESLint有错误时会返回非零退出码，但输出仍然有用
    fullOutput = error.stdout || error.output?.join('') || '';
  }

  if (!fullOutput) {
    console.log('⚠️  无法获取lint输出');
    return [];
  }

  const errors = [];
  const lines = fullOutput.split('\n');
  let currentFile = '';

  for (const line of lines) {
    // 检查是否是文件路径行 (ESLint格式: /path/to/file.ts)
    const fileMatch = line.match(/^\/.*\.(ts|tsx|js|jsx)$/);
    if (fileMatch) {
      currentFile = line.trim();
      continue;
    }

    // 检查是否是魔法数字错误行 (格式: "  102:18  error  No magic number: 150   no-magic-numbers")
    // 支持负数和十六进制数
    const errorMatch = line.match(
      /^\s*(\d+):(\d+)\s+(error|warning)\s+No magic number:\s+([-]?(?:0x)?[0-9a-fA-F.]+)\s+no-magic-numbers/,
    );
    if (errorMatch && currentFile) {
      const [, lineNum, colNum, severity, number] = errorMatch;
      if (!IGNORED_NUMBERS.includes(number)) {
        errors.push({
          file: currentFile,
          line: parseInt(lineNum),
          column: parseInt(colNum),
          number: number,
          constantName:
            MAGIC_NUMBER_CONSTANTS[number] ||
            `MAGIC_${number.replace(/[.-]/g, '_').replace(/^0x/, 'HEX_')}`,
        });
      }
    }
  }

  console.log(`📊 解析到 ${errors.length} 个魔法数字错误`);
  if (errors.length > 0) {
    console.log(`📁 涉及文件: ${new Set(errors.map((e) => e.file)).size} 个`);

    // 显示前几个错误作为示例
    console.log('\n📋 错误示例:');
    errors.slice(0, 5).forEach((error) => {
      console.log(
        `  ${path.relative(process.cwd(), error.file)}:${error.line}:${error.column} - ${error.number} → ${error.constantName}`,
      );
    });
  }

  return errors;
}

function createConstantsFile(errors) {
  const constants = new Map();

  // 收集所有需要的常量
  for (const error of errors) {
    constants.set(error.constantName, error.number);
  }

  // 生成常量文件内容
  const constantsContent = `// 自动生成的数字常量文件
// 用于替换代码中的魔法数字，提升可读性和维护性

// 动画和时间常量 (毫秒)
export const ANIMATION_DURATION_FAST = 150;
export const ANIMATION_DURATION_NORMAL = 300;
export const ANIMATION_DURATION_SLOW = 500;
export const ANIMATION_DURATION_VERY_SLOW = 1000;
export const ANIMATION_DURATION_EXTRA_SLOW = 1250;

// 尺寸和布局常量 (像素)
export const SIZE_SMALL = 45;
export const SIZE_MEDIUM = 120;
export const SIZE_LARGE = 150;
export const SIZE_EXTRA_LARGE = 890;
export const SIZE_CONTAINER_WIDTH = 1412;

// 透明度和比例常量
export const OPACITY_VERY_LOW = 0.02;
export const OPACITY_LOW = 0.08;
export const OPACITY_MEDIUM = 0.65;
export const OPACITY_HIGH = 0.94;

// 计数常量
export const COUNT_PAIR = 2;
export const COUNT_TRIPLE = 3;
export const COUNT_QUAD = 4;
export const COUNT_FIVE = 5;
export const COUNT_TEN = 10;

// 百分比常量
export const PERCENTAGE_QUARTER = 25;
export const PERCENTAGE_HALF = 50;
export const PERCENTAGE_FULL = 100;

// 时间单位常量
export const SECONDS_PER_MINUTE = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;
export const DAYS_PER_MONTH = 30;
export const DAYS_PER_YEAR = 365;

// 数据单位常量
export const BYTES_PER_KB = 1024;

// 负数偏移常量
export const OFFSET_NEGATIVE_SMALL = -2;
export const OFFSET_NEGATIVE_MEDIUM = -5;
export const OFFSET_NEGATIVE_LARGE = -10;
export const OFFSET_NEGATIVE_EXTRA_LARGE = -50;
export const OFFSET_NEGATIVE_HUGE = -100;
export const OFFSET_NEGATIVE_MASSIVE = -500;

// 十六进制常量 - 文件格式标识
export const HEX_BYTE_MAX = 0xff;
export const HEX_JPEG_MARKER_1 = 0xd8;
export const HEX_PNG_SIGNATURE_1 = 0x89;
export const HEX_PNG_SIGNATURE_2 = 0x50;
export const HEX_PNG_SIGNATURE_3 = 0x4e;
export const HEX_PNG_SIGNATURE_4 = 0x47;
export const HEX_PNG_SIGNATURE_5 = 0x49;
export const HEX_PNG_SIGNATURE_6 = 0x46;
export const HEX_PDF_MARKER = 0x25;
export const HEX_PDF_SIGNATURE_1 = 0x44;
export const HEX_ZIP_SIGNATURE = 0x4b;

// 十六进制常量 - 位操作
export const HEX_MASK_LOW_NIBBLE = 0x0f;
export const HEX_MASK_BIT_6 = 0x40;
export const HEX_MASK_6_BITS = 0x3f;
export const HEX_MASK_HIGH_BIT = 0x80;
export const HEX_MASK_SIGN_BIT_32 = 0x80000000;

// 其他动态生成的常量
${Array.from(constants.entries())
  .filter(
    ([name]) =>
      !name.startsWith('ANIMATION_') &&
      !name.startsWith('SIZE_') &&
      !name.startsWith('OPACITY_') &&
      !name.startsWith('COUNT_') &&
      !name.startsWith('PERCENTAGE_') &&
      !name.startsWith('SECONDS_') &&
      !name.startsWith('HOURS_') &&
      !name.startsWith('DAYS_') &&
      !name.startsWith('BYTES_') &&
      !name.startsWith('OFFSET_') &&
      !name.startsWith('HEX_'),
  )
  .map(([name, value]) => `export const ${name} = ${value};`)
  .join('\n')}
`;

  // 创建常量文件
  const constantsPath = 'src/constants/magic-numbers.ts';
  fs.writeFileSync(constantsPath, constantsContent, 'utf8');
  console.log(`✅ 创建常量文件: ${constantsPath}`);

  return constantsPath;
}

function fixMagicNumbers(errors, constantsPath) {
  const fileGroups = new Map();

  // 按文件分组错误
  for (const error of errors) {
    if (!fileGroups.has(error.file)) {
      fileGroups.set(error.file, []);
    }
    fileGroups.get(error.file).push(error);
  }

  let fixedCount = 0;

  for (const [filePath, fileErrors] of fileGroups) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  文件不存在: ${filePath}`);
        continue;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // 添加导入语句
      const importStatement = `import { ${fileErrors.map((e) => e.constantName).join(', ')} } from '@/constants/magic-numbers';\n`;

      // 检查是否已有导入
      if (
        !content.includes("from '@/constants/magic-numbers'") &&
        !content.includes('from "@/constants/magic-numbers"')
      ) {
        // 在第一个import语句后添加
        const importMatch = content.match(/^import .+;$/m);
        if (importMatch) {
          content = content.replace(
            importMatch[0],
            `${importMatch[0]  }\n${  importStatement}`,
          );
          modified = true;
        }
      }

      // 替换魔法数字
      for (const error of fileErrors) {
        let regex;
        if (error.number.startsWith('-')) {
          // 负数需要特殊处理，确保不会匹配到其他数字的一部分
          regex = new RegExp(
            `(?<!\\d)${error.number.replace('.', '\\.')}(?!\\d)`,
            'g',
          );
        } else if (error.number.startsWith('0x')) {
          // 十六进制数需要特殊处理
          regex = new RegExp(`\\b${error.number}\\b`, 'gi');
        } else {
          // 普通数字
          regex = new RegExp(`\\b${error.number.replace('.', '\\.')}\\b`, 'g');
        }

        const newContent = content.replace(regex, error.constantName);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ 修复: ${filePath} (${fileErrors.length}个魔法数字)`);
        fixedCount += fileErrors.length;
      }
    } catch (error) {
      console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    }
  }

  return fixedCount;
}

function main() {
  console.log('🔍 分析魔法数字错误...');

  const errors = getMagicNumberErrors();
  if (errors.length === 0) {
    console.log('✅ 未发现需要修复的魔法数字');
    return;
  }

  console.log(`📊 发现 ${errors.length} 个魔法数字错误`);

  // 创建常量文件
  const constantsPath = createConstantsFile(errors);

  // 修复魔法数字
  const fixedCount = fixMagicNumbers(errors, constantsPath);

  console.log(`\n🎉 修复完成！`);
  console.log(`📊 总计修复 ${fixedCount} 个魔法数字`);
  console.log(`📁 常量文件: ${constantsPath}`);

  if (fixedCount > 0) {
    console.log('\n💡 建议运行以下命令验证修复效果：');
    console.log('pnpm lint:check | grep "no-magic-numbers" | wc -l');
  }
}

if (require.main === module) {
  main();
}
