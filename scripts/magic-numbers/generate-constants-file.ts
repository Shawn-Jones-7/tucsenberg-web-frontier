#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * 生成完整的常量定义文件
 */

interface ConstantGroup {
  title: string;
  description: string;
  constants: Array<{ name: string; value: string; comment?: string }>;
}

/**
 * 根据常量名分组
 */
function groupConstants(mapping: Record<string, string>): ConstantGroup[] {
  const groups: ConstantGroup[] = [
    {
      title: 'HTTP状态码',
      description: 'HTTP响应状态码常量',
      constants: [],
    },
    {
      title: '时间相关常量',
      description: '时间、持续时间相关常量（毫秒）',
      constants: [],
    },
    {
      title: '响应式断点',
      description: '屏幕尺寸断点常量（像素）',
      constants: [],
    },
    {
      title: '百分比和透明度',
      description: '百分比、透明度相关常量（0-1之间的小数）',
      constants: [],
    },
    {
      title: '动画持续时间',
      description: '动画和过渡效果持续时间（毫秒）',
      constants: [],
    },
    {
      title: '内存和存储大小',
      description: '内存、存储大小相关常量（字节）',
      constants: [],
    },
    {
      title: '角度常量',
      description: '角度相关常量（度）',
      constants: [],
    },
    {
      title: '地理坐标',
      description: '地理坐标和测试坐标常量',
      constants: [],
    },
    {
      title: '端口号',
      description: '网络端口号常量',
      constants: [],
    },
    {
      title: '年份',
      description: '年份相关常量',
      constants: [],
    },
    {
      title: '数值常量',
      description: '通用数值常量',
      constants: [],
    },
  ];

  // 分组映射
  for (const [numStr, constantName] of Object.entries(mapping)) {
    const num = parseFloat(numStr);
    const constant = { name: constantName, value: numStr };

    if (constantName.startsWith('HTTP_')) {
      groups[0].constants.push(constant);
    } else if (
      constantName.includes('_MS') ||
      constantName.includes('SECOND') ||
      constantName.includes('MINUTE') ||
      constantName.includes('HOUR') ||
      constantName.includes('DAY') ||
      constantName.includes('TIME_')
    ) {
      groups[1].constants.push(constant);
    } else if (constantName.startsWith('BREAKPOINT_')) {
      groups[2].constants.push(constant);
    } else if (
      constantName.startsWith('PERCENT_') ||
      constantName.startsWith('OPACITY_') ||
      constantName.startsWith('DECIMAL_')
    ) {
      groups[3].constants.push(constant);
    } else if (constantName.startsWith('ANIMATION_')) {
      groups[4].constants.push(constant);
    } else if (
      constantName.startsWith('BYTES_') ||
      constantName.startsWith('MEMORY_')
    ) {
      groups[5].constants.push(constant);
    } else if (constantName.startsWith('ANGLE_')) {
      groups[6].constants.push(constant);
    } else if (
      constantName.startsWith('COORD_') ||
      constantName.startsWith('TEST_COORDINATE') ||
      constantName.startsWith('COORDINATE_')
    ) {
      groups[7].constants.push(constant);
    } else if (constantName.startsWith('PORT_')) {
      groups[8].constants.push(constant);
    } else if (constantName.startsWith('YEAR_')) {
      groups[9].constants.push(constant);
    } else {
      groups[10].constants.push(constant);
    }
  }

  // 过滤空组并排序
  return groups
    .filter((group) => group.constants.length > 0)
    .map((group) => ({
      ...group,
      constants: group.constants.sort((a, b) => {
        const aNum = parseFloat(a.value);
        const bNum = parseFloat(b.value);
        return aNum - bNum;
      }),
    }));
}

/**
 * 生成TypeScript常量定义
 */
function generateConstantDefinition(name: string, value: string): string {
  const num = parseFloat(value);

  if (Number.isInteger(num)) {
    return `export const ${name} = ${num};`;
  }
  return `export const ${name} = ${num};`;
}

/**
 * 生成文件头部注释
 */
function generateFileHeader(): string {
  return `// 自动生成的数字常量文件
// 用于替换代码中的魔法数字，提升可读性和维护性
// 
// 此文件由 AST 魔法数字替换系统自动生成
// 生成时间: ${new Date().toISOString()}
// 
// 🚫 请勿手动修改此文件
// 如需添加新常量，请更新 scripts/magic-numbers/mapping.json

`;
}

/**
 * 主函数
 */
async function main() {
  console.log('📝 开始生成常量定义文件...');

  // 读取映射文件
  const mappingPath = resolve(__dirname, 'mapping.json');
  const mapping: Record<string, string> = JSON.parse(
    readFileSync(mappingPath, 'utf-8'),
  );

  console.log(`📊 处理 ${Object.keys(mapping).length} 个常量`);

  // 分组常量
  const groups = groupConstants(mapping);

  // 生成文件内容
  let content = generateFileHeader();

  for (const group of groups) {
    content += `// ${group.title}\n`;
    content += `// ${group.description}\n`;

    for (const constant of group.constants) {
      content += `${generateConstantDefinition(constant.name, constant.value)}\n`;
    }

    content += '\n';
  }

  // 写入文件
  const outputPath = resolve(process.cwd(), 'src/constants/magic-numbers.ts');
  writeFileSync(outputPath, content);

  console.log('📊 常量定义文件生成完成！');
  console.log(`  总常量数: ${Object.keys(mapping).length} 个`);
  console.log(`  分组数: ${groups.length} 个`);

  // 显示分组统计
  console.log('');
  console.log('📈 分组统计:');
  groups.forEach((group) => {
    console.log(`  ${group.title}: ${group.constants.length} 个`);
  });

  console.log('');
  console.log(`📄 文件已保存到: ${outputPath}`);

  return content;
}

// 运行生成器
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 常量定义文件生成失败:', error);
    process.exit(1);
  });
}

export { groupConstants, generateConstantDefinition };
