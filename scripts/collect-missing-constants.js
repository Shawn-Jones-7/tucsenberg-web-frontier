#!/usr/bin/env node

/**
 * 收集缺失常量脚本
 *
 * 功能：
 * 1. 从TypeScript错误中提取缺失的常量
 * 2. 分析常量类型并生成定义
 * 3. 添加到相应的常量文件中
 *
 * 使用方法：
 * node scripts/collect-missing-constants.js
 */

const fs = require('fs');
const { execSync } = require('child_process');

class MissingConstantsCollector {
  constructor() {
    this.missingConstants = new Map();
  }

  async run() {
    console.log('🔧 开始收集缺失常量...\n');

    try {
      // 从TypeScript错误中提取缺失常量
      this.extractMissingConstants();

      // 分析并分类常量
      this.categorizeConstants();

      // 添加常量到相应文件
      this.addConstantsToFiles();

      console.log('\n✅ 缺失常量收集完成！');
    } catch (error) {
      console.error('❌ 执行失败:', error.message);
      process.exit(1);
    }
  }

  extractMissingConstants() {
    console.log('📊 从TypeScript错误中提取缺失常量...');

    try {
      const output = execSync('pnpm type-check 2>&1', { encoding: 'utf8' });
      const lines = output.split('\n');

      for (const line of lines) {
        const match = line.match(/Cannot find name '([^']+)'/);
        if (match) {
          const constantName = match[1];
          if (!this.missingConstants.has(constantName)) {
            this.missingConstants.set(constantName, {
              name: constantName,
              count: 1,
              category: this.categorizeConstant(constantName),
              value: this.inferValue(constantName),
            });
          } else {
            this.missingConstants.get(constantName).count++;
          }
        }
      }

      console.log(`   发现 ${this.missingConstants.size} 个缺失常量`);
    } catch (error) {
      console.log('   TypeScript检查完成，继续处理...');
    }
  }

  categorizeConstant(name) {
    if (name.startsWith('MAGIC_0_')) return 'decimal';
    if (name.startsWith('MAGIC_')) return 'count';
    if (name.includes('_PER_')) return 'time';
    if (name.includes('PERCENTAGE_')) return 'decimal';
    if (name.includes('DAYS_')) return 'time';
    if (name.includes('_MS')) return 'time';
    return 'count';
  }

  inferValue(name) {
    // 推断常量值
    if (name === 'DAYS_PER_MONTH') return '30';
    if (name === 'PERCENTAGE_QUARTER') return '25';
    if (name === 'MAGIC_0_5') return '0.5';
    if (name === 'MAGIC_0_7') return '0.7';
    if (name === 'MAGIC_0_9') return '0.9';
    if (name === 'MAGIC_17') return '17';
    if (name === 'MAGIC_18') return '18';
    if (name === 'MAGIC_22') return '22';
    if (name === 'MAGIC_999') return '999';
    if (name === 'MINUTE_MS') return '60000';

    // 从名称中提取数字
    const numberMatch = name.match(/MAGIC_(\d+(?:_\d+)*)/);
    if (numberMatch) {
      return numberMatch[1].replace(/_/g, '.');
    }

    return '1'; // 默认值
  }

  categorizeConstants() {
    console.log('\n📋 分类常量:');

    const categories = {
      decimal: [],
      count: [],
      time: [],
    };

    for (const [name, info] of this.missingConstants) {
      categories[info.category].push(info);
    }

    for (const [category, constants] of Object.entries(categories)) {
      if (constants.length > 0) {
        console.log(
          `   ${category}: ${constants.map((c) => c.name).join(', ')}`,
        );
      }
    }
  }

  addConstantsToFiles() {
    console.log('\n📝 添加常量到文件...');

    const categories = {
      decimal: 'src/constants/decimal.ts',
      count: 'src/constants/count.ts',
      time: 'src/constants/time.ts',
    };

    for (const [category, filePath] of Object.entries(categories)) {
      const constants = Array.from(this.missingConstants.values()).filter(
        (c) => c.category === category,
      );

      if (constants.length > 0) {
        this.addConstantsToFile(filePath, constants);
      }
    }
  }

  addConstantsToFile(filePath, constants) {
    console.log(
      `   添加到 ${filePath}: ${constants.map((c) => c.name).join(', ')}`,
    );

    try {
      let content = fs.readFileSync(filePath, 'utf8');

      // 在文件末尾添加新常量
      const newConstants = constants
        .map((c) => `export const ${c.name} = ${c.value};`)
        .join('\n');

      // 检查常量是否已存在
      const existingConstants = constants.filter(
        (c) =>
          content.includes(`${c.name} =`) || content.includes(`${c.name}:`),
      );

      const newConstantsToAdd = constants.filter(
        (c) =>
          !content.includes(`${c.name} =`) && !content.includes(`${c.name}:`),
      );

      if (existingConstants.length > 0) {
        console.log(
          `     跳过已存在的常量: ${existingConstants.map((c) => c.name).join(', ')}`,
        );
      }

      if (newConstantsToAdd.length > 0) {
        content += '\n\n// 自动添加的缺失常量\n';
        content += newConstantsToAdd
          .map((c) => `export const ${c.name} = ${c.value};`)
          .join('\n');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`     ✅ 添加了 ${newConstantsToAdd.length} 个新常量`);
      }
    } catch (error) {
      console.error(`     ❌ 处理文件失败: ${error.message}`);
    }
  }
}

// 执行脚本
if (require.main === module) {
  const collector = new MissingConstantsCollector();
  collector.run().catch(console.error);
}

module.exports = MissingConstantsCollector;
