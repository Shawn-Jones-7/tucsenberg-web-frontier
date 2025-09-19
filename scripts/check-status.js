const { execSync } = require('child_process');
const { writeFileSync } = require('fs');

function checkStatus() {
  const results = [];

  try {
    results.push('🔍 检查当前项目状态...\n');

    // 1. TypeScript检查
    try {
      execSync('pnpm type-check', { stdio: 'pipe' });
      results.push('✅ TypeScript编译: 无错误');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorCount = (output.match(/error TS/g) || []).length;
      results.push(`❌ TypeScript编译: ${errorCount} 个错误`);
    }

    // 2. ESLint检查
    try {
      const eslintOutput = execSync(
        'pnpm eslint "src/**/*.{ts,tsx}" --format=compact',
        { stdio: 'pipe' },
      ).toString();
      const errorLines = eslintOutput
        .split('\n')
        .filter((line) => line.includes('error') || line.includes('warning'));
      results.push(`📋 ESLint: ${errorLines.length} 个问题`);
    } catch (error) {
      const output = error.stdout?.toString() || '';
      const errorLines = output
        .split('\n')
        .filter((line) => line.includes('error') || line.includes('warning'));
      results.push(`📋 ESLint: ${errorLines.length} 个问题`);
    }

    // 3. 检查一些关键文件
    const fs = require('fs');
    const path = require('path');

    const srcDir = path.resolve(__dirname, '../src');
    const files = fs
      .readdirSync(srcDir, { recursive: true })
      .filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'));

    results.push(`📄 源文件总数: ${files.length}`);

    // 4. 检查常量文件
    const constantsDir = path.resolve(srcDir, 'constants');
    if (fs.existsSync(constantsDir)) {
      const constantFiles = fs
        .readdirSync(constantsDir)
        .filter((file) => file.endsWith('.ts'));
      results.push(`📁 常量文件: ${constantFiles.length} 个`);
    }

    results.push('\n🎯 下一步建议:');
    results.push('1. 继续处理相对路径导入问题');
    results.push('2. 自动修复未使用变量');
    results.push('3. 处理安全对象注入问题');
    results.push('4. 使用修复后的AST工具处理魔法数字');
  } catch (error) {
    results.push(`❌ 状态检查失败: ${error.message}`);
  }

  const output = results.join('\n');
  writeFileSync('status-report.txt', output);
  console.log('状态报告已保存到 status-report.txt');
}

checkStatus();
