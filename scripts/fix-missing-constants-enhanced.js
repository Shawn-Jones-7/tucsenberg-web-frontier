#!/usr/bin/env node

/**
 * 增强版缺失常量修复脚本
 *
 * 功能：
 * 1. 检测缺失的常量引用
 * 2. 自动添加缺失的导入
 * 3. 统计修复结果
 *
 * 使用方法：
 * node scripts/fix-missing-constants-enhanced.js
 */

const fs = require('fs');
const path = require('path');

// 常量映射表 - 根据当前常量系统定义
const CONSTANT_MAPPINGS = {
  // 基础数值
  COUNT_PAIR: '@/constants',
  COUNT_TRIPLE: '@/constants',
  COUNT_QUAD: '@/constants',
  COUNT_FIVE: '@/constants',
  COUNT_TEN: '@/constants',

  // 百分比
  PERCENTAGE_FULL: '@/constants',
  PERCENTAGE_HALF: '@/constants',

  // 时间相关
  SECONDS_PER_MINUTE: '@/constants',
  MINUTES_PER_HOUR: '@/constants',
  HOURS_PER_DAY: '@/constants',
  DAYS_PER_WEEK: '@/constants',
  FIVE_SECONDS_MS: '@/constants',
  TEN_SECONDS_MS: '@/constants',
  THIRTY_SECONDS_MS: '@/constants',
  THREE_SECONDS_MS: '@/constants',
  MINUTE_MS: '@/constants',

  // 魔法数字
  MAGIC_0_1: '@/constants',
  MAGIC_0_25: '@/constants',
  MAGIC_0_8: '@/constants',
  MAGIC_0_95: '@/constants',
  MAGIC_0_99: '@/constants',
  MAGIC_6: '@/constants',
  MAGIC_8: '@/constants',
  MAGIC_9: '@/constants',
  MAGIC_20: '@/constants',
  MAGIC_36: '@/constants',
  MAGIC_72: '@/constants',
  MAGIC_75: '@/constants',
  MAGIC_90: '@/constants',
  MAGIC_95: '@/constants',
  MAGIC_99: '@/constants',
  MAGIC_256: '@/constants',
  MAGIC_300000: '@/constants',
  MAGIC_429: '@/constants',
  MAGIC_600: '@/constants',
  MAGIC_2000: '@/constants',
  MAGIC_2500: '@/constants',
  MAGIC_4000: '@/constants',
  MAGIC_4096: '@/constants',
  MAGIC_10000: '@/constants',

  // 测试相关
  TEST_BASE_NUMBERS: '@/constants',
};

class MissingConstantsFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      constantsAdded: 0,
      errors: 0,
    };
  }

  async run() {
    console.log('🔧 开始修复缺失常量导入...\n');

    try {
      const files = this.getFilesToProcess();
      console.log(`📁 找到 ${files.length} 个文件需要处理\n`);

      for (const file of files) {
        await this.processFile(file);
      }

      this.printStats();
    } catch (error) {
      console.error('❌ 执行失败:', error.message);
      process.exit(1);
    }
  }

  getFilesToProcess() {
    const files = [];

    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (
            !item.startsWith('.') &&
            item !== 'node_modules' &&
            !item.includes('test')
          ) {
            walkDir(fullPath);
          }
        } else if (stat.isFile()) {
          if (
            (item.endsWith('.ts') || item.endsWith('.tsx')) &&
            !item.endsWith('.d.ts') &&
            !item.includes('.test.')
          ) {
            files.push(fullPath);
          }
        }
      }
    };

    walkDir('src');
    return files;
  }

  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // 查找缺失的常量
      const missingConstants = this.findMissingConstants(content);

      if (missingConstants.length === 0) {
        return;
      }

      this.stats.filesProcessed++;

      console.log(`🔍 处理文件: ${filePath}`);
      console.log(
        `   发现 ${missingConstants.length} 个缺失常量: ${missingConstants.join(', ')}`,
      );

      // 添加缺失的导入
      const fixedContent = this.addMissingImports(content, missingConstants);

      // 写入修复后的内容
      fs.writeFileSync(filePath, fixedContent, 'utf8');

      this.stats.constantsAdded += missingConstants.length;
      console.log(`   ✅ 已修复\n`);
    } catch (error) {
      this.stats.errors++;
      console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    }
  }

  findMissingConstants(content) {
    const missingConstants = [];

    // 获取已导入的常量
    const importedConstants = this.getImportedConstants(content);

    // 查找使用但未导入的常量
    for (const [constant, source] of Object.entries(CONSTANT_MAPPINGS)) {
      if (!importedConstants.has(constant)) {
        // 检查是否在代码中使用了这个常量
        const regex = new RegExp(`\\b${constant}\\b`);
        if (regex.test(content)) {
          missingConstants.push(constant);
        }
      }
    }

    return missingConstants;
  }

  getImportedConstants(content) {
    const importedConstants = new Set();
    const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"][^'"]+['"];?/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map((imp) => imp.trim());
      imports.forEach((imp) => importedConstants.add(imp));
    }

    return importedConstants;
  }

  addMissingImports(content, missingConstants) {
    const lines = content.split('\n');

    // 查找最后一个@/constants导入行
    let lastImportIndex = -1;
    let existingConstantsImport = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("from '@/constants'")) {
        lastImportIndex = i;
        const match = line.match(
          /import\s*{\s*([^}]+)\s*}\s*from\s*'@\/constants'/,
        );
        if (match) {
          existingConstantsImport = {
            index: i,
            imports: match[1].split(',').map((imp) => imp.trim()),
          };
        }
      }
    }

    if (existingConstantsImport) {
      // 合并到现有的导入中
      const allImports = [
        ...existingConstantsImport.imports,
        ...missingConstants,
      ];
      const uniqueImports = [...new Set(allImports)].sort();
      const newImportLine = `import { ${uniqueImports.join(', ')} } from '@/constants';`;
      lines[existingConstantsImport.index] = newImportLine;
    } else {
      // 创建新的导入行
      const newImportLine = `import { ${missingConstants.join(', ')} } from '@/constants';`;

      if (lastImportIndex >= 0) {
        // 在最后一个导入后添加
        lines.splice(lastImportIndex + 1, 0, newImportLine);
      } else {
        // 在文件开头添加（在'use client'或其他指令后）
        let insertIndex = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("'use") || lines[i].startsWith('"use')) {
            insertIndex = i + 1;
            break;
          }
        }
        lines.splice(insertIndex, 0, '', newImportLine);
      }
    }

    return lines.join('\n');
  }

  printStats() {
    console.log('\n📊 处理统计:');
    console.log(`   处理文件数: ${this.stats.filesProcessed}`);
    console.log(`   添加常量数: ${this.stats.constantsAdded}`);
    console.log(`   错误数: ${this.stats.errors}`);

    if (this.stats.errors === 0) {
      console.log('\n✅ 缺失常量修复完成！');
    } else {
      console.log('\n⚠️  部分文件处理失败，请检查错误信息');
    }
  }
}

// 执行脚本
if (require.main === module) {
  const fixer = new MissingConstantsFixer();
  fixer.run().catch(console.error);
}

module.exports = MissingConstantsFixer;
