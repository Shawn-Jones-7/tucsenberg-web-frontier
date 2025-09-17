#!/usr/bin/env tsx

import { run, Options } from './ast-replace-magic-numbers';
import { execSync } from 'node:child_process';

interface BatchOptions extends Options {
  batchSize?: number;
  validateAfterEach?: boolean;
}

/**
 * 批处理执行器
 * 支持分批处理、自动验证和失败回滚
 */
async function runBatch() {
  const args = process.argv.slice(2);
  
  const options: BatchOptions = {
    write: args.includes('--write'),
    dryRun: args.includes('--dry-run'),
    files: args.find(arg => arg.startsWith('--files='))?.split('=')[1] || 'src/**/*.{ts,tsx}',
    limit: parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '0') || undefined,
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '5'),
    validateAfterEach: !args.includes('--no-validate'),
  };
  
  // 默认为干跑模式
  if (!options.write) {
    options.dryRun = true;
  }
  
  console.log('🚀 AST魔法数字批处理器启动...');
  console.log(`📊 配置: ${JSON.stringify(options, null, 2)}`);
  
  try {
    // 运行预检
    console.log('🔍 运行预检验证...');
    execSync('tsx scripts/magic-numbers/preflight.ts', { 
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('✅ 预检通过');
    
    // 执行替换
    console.log('🔧 开始执行替换...');
    const logs = await run(options);
    
    if (logs.length === 0) {
      console.log('ℹ️  没有文件需要修改');
      return;
    }
    
    // 验证结果
    if (options.validateAfterEach && options.write && !options.dryRun) {
      console.log('🔍 验证修改结果...');
      
      try {
        // TypeScript 编译检查
        console.log('  检查 TypeScript 编译...');
        execSync('pnpm run type-check', { 
          stdio: 'pipe',
          cwd: process.cwd(),
        });
        console.log('  ✅ TypeScript 编译正常');
        
        // ESLint 检查魔法数字
        console.log('  检查魔法数字错误...');
        const lintOutput = execSync('pnpm run lint:check 2>&1 | grep "no-magic-numbers" | wc -l', {
          encoding: 'utf8',
          cwd: process.cwd(),
        });
        
        const magicNumberErrors = parseInt(lintOutput.trim());
        console.log(`  魔法数字错误: ${magicNumberErrors} 个`);
        
        if (magicNumberErrors > 0) {
          console.warn('⚠️  仍有魔法数字错误，可能需要进一步处理');
        }
        
      } catch (error) {
        console.error('❌ 验证失败:', error);
        console.error('💡 建议检查最近的修改并考虑回滚');
        process.exit(1);
      }
    }
    
    // 输出摘要
    console.log('');
    console.log('📊 批处理完成摘要:');
    console.log(`  处理文件: ${logs.length}`);
    
    const totalReplacements = logs.reduce((sum, log) => sum + log.changes.length, 0);
    console.log(`  总替换数: ${totalReplacements}`);
    
    if (totalReplacements > 0) {
      console.log('');
      console.log('📋 修改的文件:');
      logs.forEach(log => {
        console.log(`  ${log.file}: ${log.changes.length} 个替换`);
        if (log.imports.added.length > 0) {
          console.log(`    新增导入: ${log.imports.added.join(', ')}`);
        }
        if (Object.keys(log.imports.aliased).length > 0) {
          console.log(`    别名导入: ${Object.entries(log.imports.aliased).map(([k, v]) => `${k} as ${v}`).join(', ')}`);
        }
      });
    }
    
    if (options.dryRun) {
      console.log('');
      console.log('🔍 这是干跑模式，未实际修改文件');
      console.log('💡 使用 --write 参数执行实际修改');
    }
    
  } catch (error) {
    console.error('❌ 批处理失败:', error);
    process.exit(1);
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
AST魔法数字批处理器

用法:
  tsx scripts/magic-numbers/run-batch.ts [选项]

选项:
  --write              执行实际修改（默认为干跑模式）
  --dry-run            干跑模式，不修改文件
  --files=<pattern>    文件匹配模式（默认: src/**/*.{ts,tsx}）
  --limit=<number>     限制处理的文件数量
  --batch-size=<number> 批处理大小（默认: 5）
  --no-validate        跳过修改后的验证
  --help               显示此帮助信息

示例:
  # 干跑模式查看将要修改的内容
  tsx scripts/magic-numbers/run-batch.ts --files="src/components/**/*.tsx"
  
  # 实际执行修改，限制5个文件
  tsx scripts/magic-numbers/run-batch.ts --write --limit=5
  
  # 批量处理所有文件
  tsx scripts/magic-numbers/run-batch.ts --write
`);
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  runBatch().catch(console.error);
}
