#!/usr/bin/env tsx
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface ConstantInfo {
  export: string;
  module: string;
  value: number;
  filePath: string;
  line: number;
}

/**
 * 简单的常量收集器
 * 使用正则表达式扫描文件，查找导出的数字常量
 */
async function collectConstants() {
  console.log('🔍 收集现有常量定义...');

  const constants: ConstantInfo[] = [];
  const targetDirs = ['src/constants', 'src/config'];

  for (const dir of targetDirs) {
    const fullPath = resolve(process.cwd(), dir);
    try {
      await scanDirectory(fullPath, constants);
    } catch (error) {
      console.log(`⚠️  跳过目录 ${dir}: ${error}`);
    }
  }

  console.log(`📊 收集完成: 发现 ${constants.length} 个常量`);

  // 按数值分组
  const valueToConstants = new Map<number, ConstantInfo[]>();
  for (const constant of constants) {
    if (!valueToConstants.has(constant.value)) {
      valueToConstants.set(constant.value, []);
    }
    valueToConstants.get(constant.value)!.push(constant);
  }

  // 生成映射
  const candidateMapping: Record<string, any> = {};
  const conflicts: Record<string, ConstantInfo[]> = {};

  for (const [value, constantInfos] of valueToConstants) {
    const valueStr = value.toString();

    if (constantInfos.length === 1) {
      const info = constantInfos[0];
      candidateMapping[valueStr] = {
        export: info.export,
        module: info.module,
        source: `${info.filePath}:${info.line}`,
      };
    } else {
      conflicts[valueStr] = constantInfos;
      const prioritized = prioritizeConstant(constantInfos);
      candidateMapping[valueStr] = {
        export: prioritized.export,
        module: prioritized.module,
        source: `${prioritized.filePath}:${prioritized.line}`,
        alternatives: constantInfos
          .filter((c) => c !== prioritized)
          .map((c) => ({
            export: c.export,
            module: c.module,
            source: `${c.filePath}:${c.line}`,
          })),
      };
    }
  }

  // 保存结果
  const result = {
    _comment: '现有常量分析结果',
    _generated: new Date().toISOString(),
    _stats: {
      totalConstants: constants.length,
      uniqueValues: valueToConstants.size,
      conflicts: Object.keys(conflicts).length,
    },
    candidateMapping,
    conflicts,
    allConstants: constants,
  };

  const outputPath = 'scripts/magic-numbers/existing-constants-analysis.json';
  writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`💾 结果保存到: ${outputPath}`);

  return result;
}

async function scanDirectory(dirPath: string, constants: ConstantInfo[]) {
  const items = readdirSync(dirPath);

  for (const item of items) {
    const itemPath = join(dirPath, item);
    const stat = statSync(itemPath);

    if (stat.isDirectory()) {
      await scanDirectory(itemPath, constants);
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      await scanFile(itemPath, constants);
    }
  }
}

async function scanFile(filePath: string, constants: ConstantInfo[]) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = filePath.replace(`${process.cwd()}/`, '');
  const modulePath = relativePath.replace(/^src\//, '@/').replace(/\.ts$/, '');

  console.log(`🔍 分析文件: ${relativePath}`);

  // 正则模式匹配导出的数字常量
  const patterns = [
    // export const NAME = 123;
    /^export\s+const\s+([A-Z_][A-Z0-9_]*)\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*;?\s*$/,
    // export const NAME: number = 123;
    /^export\s+const\s+([A-Z_][A-Z0-9_]*)\s*:\s*number\s*=\s*([0-9]+(?:\.[0-9]+)?)\s*;?\s*$/,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const [, exportName, valueStr] = match;
        const value = parseFloat(valueStr);

        constants.push({
          export: exportName,
          module: modulePath,
          value,
          filePath: relativePath,
          line: i + 1,
        });

        console.log(`  ✅ 发现常量: ${exportName} = ${value} (行 ${i + 1})`);
      }
    }
  }

  // 查找对象中的常量（简化版）
  const objectPatterns = [
    // NAME: 123,
    /^\s*([A-Z_][A-Z0-9_]*)\s*:\s*([0-9]+(?:\.[0-9]+)?)\s*,?\s*$/,
  ];

  let inExportedObject = false;
  let currentObjectName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 检测导出对象的开始
    const exportObjectMatch = line.match(
      /^export\s+const\s+([A-Z_][A-Z0-9_]*)\s*=\s*\{/,
    );
    if (exportObjectMatch) {
      inExportedObject = true;
      currentObjectName = exportObjectMatch[1];
      continue;
    }

    // 检测对象结束
    if (inExportedObject && line.includes('}')) {
      inExportedObject = false;
      currentObjectName = '';
      continue;
    }

    // 在导出对象内查找数字常量
    if (inExportedObject) {
      for (const pattern of objectPatterns) {
        const match = line.match(pattern);
        if (match) {
          const [, propertyName, valueStr] = match;
          const value = parseFloat(valueStr);
          const exportName = `${currentObjectName}.${propertyName}`;

          constants.push({
            export: exportName,
            module: modulePath,
            value,
            filePath: relativePath,
            line: i + 1,
          });

          console.log(
            `  ✅ 发现对象常量: ${exportName} = ${value} (行 ${i + 1})`,
          );
        }
      }
    }
  }
}

function prioritizeConstant(constants: ConstantInfo[]): ConstantInfo {
  const priorityOrder = [
    /constants\/app-constants/,
    /config\/security/,
    /constants\/performance/,
    /constants\//,
    /config\//,
    /magic-numbers/,
  ];

  for (const pattern of priorityOrder) {
    const match = constants.find((c) => pattern.test(c.filePath));
    if (match) return match;
  }

  return constants[0];
}

// 运行收集
if (require.main === module) {
  collectConstants().catch((error) => {
    console.error('❌ 收集失败:', error);
    process.exit(1);
  });
}

export { collectConstants, type ConstantInfo };
