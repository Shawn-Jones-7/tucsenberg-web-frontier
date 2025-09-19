#!/usr/bin/env tsx
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { run } from './ast-replace-magic-numbers';

async function directTest() {
  const log: string[] = [];

  try {
    log.push('🧪 直接测试AST工具...');

    // 测试单个文件模式
    const result = await run({
      files: 'test-sample.ts',
      limit: 10,
      dryRun: true,
      write: false,
    });

    log.push(`📊 测试结果:`);
    log.push(`  处理文件数: ${result.length}`);

    if (result.length > 0) {
      result.forEach((fileLog, index) => {
        log.push(`  文件 ${index + 1}: ${fileLog.file}`);
        log.push(`    变更数量: ${fileLog.changes.length}`);

        fileLog.changes.forEach((change, changeIndex) => {
          log.push(
            `    变更 ${changeIndex + 1}: ${change.raw} → ${change.constant}`,
          );
        });
      });

      log.push('\n✅ AST工具修复成功！');
    } else {
      log.push('\n❌ 没有找到可处理的文件');
    }
  } catch (error) {
    log.push(`❌ 测试失败: ${error}`);
  }

  // 写入结果
  const resultPath = resolve(__dirname, 'direct-test-result.txt');
  writeFileSync(resultPath, log.join('\n'));

  console.log('测试完成，结果已写入 direct-test-result.txt');
}

directTest();
