#!/usr/bin/env tsx
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Project, ts } from 'ts-morph';
import {
  ensureConstDefined,
  loadEnhancedMapping,
  shouldSkipNode,
} from './utils';

// 测试AST工具的核心功能
async function testASTCore() {
  const log: string[] = [];
  log.push('🧪 测试AST工具核心功能...');

  // 初始化项目
  const rootDir = resolve(__dirname, '../..');
  const project = new Project({
    tsConfigFilePath: resolve(rootDir, 'tsconfig.json'),
  });

  // 添加测试文件
  const testFilePath = resolve(__dirname, 'test-sample.ts');
  log.push(`📄 测试文件: ${testFilePath}`);

  try {
    const sourceFile = project.addSourceFileAtPath(testFilePath);
    log.push(`✅ 成功加载测试文件`);

    // 加载映射
    const mapping = loadEnhancedMapping();
    log.push(`📋 加载映射: ${Object.keys(mapping).length} 个常量`);

    // 查找数字字面量
    let foundNumbers = 0;
    let replacements = 0;

    sourceFile.forEachDescendant((node) => {
      if (ts.isNumericLiteral(node.compilerNode)) {
        const text = node.getText();
        foundNumbers++;

        log.push(`🔍 发现数字: ${text}`);

        // 检查是否应该跳过
        if (shouldSkipNode(node)) {
          log.push(`  ⏭️ 跳过: ${text}`);
          return;
        }

        const { constantName, isSupported } = ensureConstDefined(mapping, text);

        if (isSupported) {
          log.push(`  ✅ 可替换: ${text} → ${constantName}`);
          replacements++;
        } else {
          log.push(`  ❌ 无映射: ${text}`);
        }
      }
    });

    log.push(`\n📊 测试结果:`);
    log.push(`  发现数字: ${foundNumbers}`);
    log.push(`  可替换: ${replacements}`);

    // 写入结果到文件
    const resultPath = resolve(__dirname, 'test-result.txt');
    writeFileSync(resultPath, log.join('\n'));

    if (foundNumbers > 0 && replacements > 0) {
      log.push(`\n🎉 AST工具核心功能正常！`);
      writeFileSync(resultPath, log.join('\n'));
      return true;
    }
    log.push(`\n❌ AST工具可能存在问题`);
    writeFileSync(resultPath, log.join('\n'));
    return false;
  } catch (error) {
    log.push(`❌ 测试失败: ${error}`);
    const resultPath = resolve(__dirname, 'test-result.txt');
    writeFileSync(resultPath, log.join('\n'));
    return false;
  }
}

// 运行测试
if (require.main === module) {
  testASTCore().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { testASTCore };
