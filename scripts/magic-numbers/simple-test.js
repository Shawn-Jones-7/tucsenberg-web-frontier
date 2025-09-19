const { run } = require('./ast-replace-magic-numbers.ts');

// 简单测试
async function simpleTest() {
  try {
    console.log('开始测试...');

    const result = await run({
      files: './test-sample.ts',
      limit: 10,
      dryRun: true,
      write: false,
    });

    console.log('测试完成，结果:', result.length);

    if (result.length > 0) {
      console.log('✅ AST工具工作正常');
      console.log('修改的文件数:', result.length);
      result.forEach((log) => {
        console.log(`文件: ${log.file}, 变更: ${log.changes.length}`);
      });
    } else {
      console.log('❌ 没有找到可处理的文件或数字');
    }
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

simpleTest();
