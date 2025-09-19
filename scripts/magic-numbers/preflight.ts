#!/usr/bin/env tsx
import { resolve } from 'node:path';
import { Project, ts } from 'ts-morph';
import { loadMapping, normalize, shouldSkipNode } from './utils';

/**
 * 预检验证脚本
 * 扫描所有将被替换的数字，确保对应的常量都已定义
 */
async function preflight() {
  console.log('🔍 AST魔法数字预检验证启动...');

  // 初始化项目 - 修复路径问题
  const rootDir = process.cwd().endsWith('scripts/magic-numbers')
    ? resolve(process.cwd(), '../..')
    : process.cwd();

  const project = new Project({
    tsConfigFilePath: resolve(rootDir, 'tsconfig.json'),
  });

  // 添加源文件
  project.addSourceFilesAtPaths(resolve(rootDir, 'src/**/*.{ts,tsx}'));
  const sourceFiles = project.getSourceFiles();

  console.log(`📊 扫描 ${sourceFiles.length} 个文件...`);

  // 加载映射
  const mapping = loadMapping();
  if (Object.keys(mapping).length === 0) {
    console.error('❌ 映射文件为空或加载失败');
    process.exit(1);
  }

  console.log(`📋 可用常量映射: ${Object.keys(mapping).length} 个`);

  // 收集所有将被使用的数字
  const willUse = new Set<string>();
  const fileUsage = new Map<string, Set<string>>();

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath().replace(`${process.cwd()}/`, '');
    const numbersInFile = new Set<string>();

    sourceFile.forEachDescendant((node) => {
      if (ts.isNumericLiteral(node.compilerNode)) {
        // 应用相同的过滤逻辑
        if (shouldSkipNode(node)) {
          return;
        }

        const text = node.getText();
        const normalized = normalize(text);

        willUse.add(normalized);
        numbersInFile.add(normalized);
      }
    });

    if (numbersInFile.size > 0) {
      fileUsage.set(filePath, numbersInFile);
    }
  }

  console.log(`🔢 发现 ${willUse.size} 个不同的数字将被替换`);

  // 检查缺失的常量
  const missing = [...willUse].filter((num) => !mapping[num]);

  if (missing.length > 0) {
    console.error(
      '❌ 缺失常量定义，请先补充以下常量到 mapping.json 和 src/constants/magic-numbers.ts:',
    );
    console.error('');

    missing
      .sort((a, b) => parseFloat(a) - parseFloat(b))
      .forEach((num) => {
        console.error(
          `  "${num}": "MAGIC_${num.replace('.', '_').replace('-', 'NEG_')}",`,
        );
      });

    console.error('');
    console.error('📁 涉及的文件:');
    fileUsage.forEach((numbers, file) => {
      const missingInFile = [...numbers].filter((num) => missing.includes(num));
      if (missingInFile.length > 0) {
        console.error(`  ${file}: ${missingInFile.join(', ')}`);
      }
    });

    process.exit(1);
  }

  // 显示将被替换的数字统计
  console.log('');
  console.log('📊 将被替换的数字统计:');
  const sortedNumbers = [...willUse].sort(
    (a, b) => parseFloat(a) - parseFloat(b),
  );
  sortedNumbers.forEach((num) => {
    const count = [...fileUsage.values()].reduce(
      (acc, set) => acc + (set.has(num) ? 1 : 0),
      0,
    );
    console.log(`  ${num} → ${mapping[num]} (${count} 个文件)`);
  });

  console.log('');
  console.log('✅ 预检通过！所有将替换的数值均有常量定义。');
  console.log(
    `📈 总计: ${willUse.size} 种数字，分布在 ${fileUsage.size} 个文件中`,
  );
}

// 运行预检
if (require.main === module) {
  preflight().catch((error) => {
    console.error('❌ 预检失败:', error);
    process.exit(1);
  });
}
