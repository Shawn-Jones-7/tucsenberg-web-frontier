#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface ConstantInfo {
  export: string;
  module: string;
  value: number;
  filePath: string;
  line: number;
}

interface MappingEntry {
  export: string;
  module: string;
  source: string;
  alternatives?: Array<{
    export: string;
    module: string;
    source: string;
  }>;
}

/**
 * 生成增强版CODEX映射
 * 整合现有常量分析结果，生成支持模块导入的映射文件
 */
async function generateEnhancedMapping() {
  console.log('🔧 生成增强版CODEX映射...');

  // 读取现有常量分析结果
  const analysisPath = 'scripts/magic-numbers/existing-constants-analysis.json';
  const analysisData = JSON.parse(readFileSync(analysisPath, 'utf-8'));

  // 读取原始CODEX映射
  const originalMappingPath = 'scripts/magic-numbers/codex-mapping.json';
  const originalMapping = JSON.parse(
    readFileSync(originalMappingPath, 'utf-8'),
  );

  console.log(
    `📊 原始CODEX映射: ${Object.keys(originalMapping).filter((k) => !k.startsWith('_')).length} 个`,
  );
  console.log(
    `📊 现有常量分析: ${analysisData._stats.uniqueValues} 个唯一数值`,
  );

  // 预检中发现的缺失数字
  const missingNumbers = [
    '14',
    '17',
    '18',
    '22',
    '23',
    '35',
    '36',
    '64',
    '82',
    '83',
    '84',
    '87',
    '88',
    '130',
    '131',
    '132',
    '133',
    '136',
    '184.704',
    '254',
    '255',
    '368',
    '450',
    '600',
    '890',
    '1005',
    '1010',
    '1020',
    '1080',
    '1180',
    '1250',
    '1300',
    '1400',
    '1412',
    '1450',
    '1900',
    '2200',
    '2800',
    '200100',
  ];

  // 生成增强映射
  const enhancedMapping: Record<string, any> = {
    _comment: 'CODEX分层治理：增强版魔法数字映射',
    _description: '整合现有常量定义，支持模块导入的映射文件',
    _optimization: '从301个减少到核心常量，复用现有语义化常量',
    _updated: new Date().toISOString(),
    _stats: {
      originalCodexConstants: Object.keys(originalMapping).filter(
        (k) => !k.startsWith('_'),
      ).length,
      existingConstants: analysisData._stats.totalConstants,
      uniqueValues: analysisData._stats.uniqueValues,
      missingNumbersFound: 0,
    },
  };

  // 1. 保留原始CODEX映射中的核心常量
  for (const [value, constantName] of Object.entries(originalMapping)) {
    if (!value.startsWith('_')) {
      enhancedMapping[value] = {
        export: constantName,
        module: '@/constants/magic-numbers',
        source: 'CODEX核心常量',
        type: 'codex-core',
      };
    }
  }

  // 2. 添加缺失数字的现有常量映射
  let foundCount = 0;
  for (const missingNumber of missingNumbers) {
    const candidateMapping = analysisData.candidateMapping[missingNumber];
    if (candidateMapping) {
      enhancedMapping[missingNumber] = {
        export: candidateMapping.export,
        module: candidateMapping.module,
        source: candidateMapping.source,
        type: 'existing-constant',
        alternatives: candidateMapping.alternatives,
      };
      foundCount++;
      console.log(
        `  ✅ 找到缺失数字 ${missingNumber}: ${candidateMapping.export}`,
      );
    } else {
      console.log(`  ❌ 未找到缺失数字 ${missingNumber} 的常量定义`);
    }
  }

  enhancedMapping._stats.missingNumbersFound = foundCount;

  // 3. 添加高频使用的其他常量（可选）
  const highFrequencyNumbers = ['100', '200', '300', '400', '500', '1000'];
  for (const number of highFrequencyNumbers) {
    if (!enhancedMapping[number] && analysisData.candidateMapping[number]) {
      const candidate = analysisData.candidateMapping[number];
      enhancedMapping[number] = {
        export: candidate.export,
        module: candidate.module,
        source: candidate.source,
        type: 'high-frequency',
        alternatives: candidate.alternatives,
      };
      console.log(`  📈 添加高频数字 ${number}: ${candidate.export}`);
    }
  }

  // 保存增强映射
  const outputPath = 'scripts/magic-numbers/enhanced-codex-mapping.json';
  writeFileSync(outputPath, JSON.stringify(enhancedMapping, null, 2));

  console.log(`\n💾 增强映射保存到: ${outputPath}`);
  console.log(
    `📊 总计映射: ${Object.keys(enhancedMapping).filter((k) => !k.startsWith('_')).length} 个数值`,
  );
  console.log(
    `✅ 缺失数字覆盖: ${foundCount}/${missingNumbers.length} (${Math.round((foundCount / missingNumbers.length) * 100)}%)`,
  );

  // 生成导入优化建议
  const importSuggestions = generateImportSuggestions(enhancedMapping);
  const suggestionsPath =
    'scripts/magic-numbers/import-optimization-suggestions.json';
  writeFileSync(suggestionsPath, JSON.stringify(importSuggestions, null, 2));
  console.log(`📋 导入优化建议保存到: ${suggestionsPath}`);

  return enhancedMapping;
}

/**
 * 生成导入优化建议
 */
function generateImportSuggestions(mapping: Record<string, any>) {
  const moduleUsage = new Map<string, string[]>();

  for (const [value, info] of Object.entries(mapping)) {
    if (!value.startsWith('_') && info.module) {
      if (!moduleUsage.has(info.module)) {
        moduleUsage.set(info.module, []);
      }
      moduleUsage.get(info.module)!.push(`${info.export} (${value})`);
    }
  }

  const suggestions = {
    _comment: '导入优化建议',
    _description: '按模块分组的常量使用情况，用于优化导入语句',
    _generated: new Date().toISOString(),
    moduleUsage: Object.fromEntries(moduleUsage),
    importStatements: Array.from(moduleUsage.entries()).map(
      ([module, constants]) => ({
        module,
        constantCount: constants.length,
        suggestedImport: `import { ${constants.map((c) => c.split(' ')[0]).join(', ')} } from '${module}';`,
      }),
    ),
  };

  return suggestions;
}

// 运行生成
if (require.main === module) {
  generateEnhancedMapping().catch((error) => {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  });
}

export { generateEnhancedMapping };
