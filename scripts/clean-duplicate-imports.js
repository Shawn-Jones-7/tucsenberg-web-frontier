#!/usr/bin/env node

/**
 * 重复导入清理脚本
 *
 * 功能：
 * 1. 检测并移除重复的import语句
 * 2. 统一使用@/constants路径
 * 3. 清理冗余的导入
 *
 * 使用方法：
 * node scripts/clean-duplicate-imports.js
 */

const fs = require('fs');
const path = require('path');

class DuplicateImportCleaner {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      duplicatesFound: 0,
      duplicatesFixed: 0,
      errors: 0,
    };
  }

  /**
   * 主执行函数
   */
  async run() {
    console.log('🔧 开始清理重复导入...\n');

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

  /**
   * 获取要处理的文件列表
   */
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

  /**
   * 处理单个文件
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // 查找重复导入
      const importLines = this.findImportLines(lines);
      const duplicates = this.findDuplicates(importLines);

      if (duplicates.length === 0) {
        return;
      }

      this.stats.filesProcessed++;
      this.stats.duplicatesFound += duplicates.length;

      console.log(`🔍 处理文件: ${filePath}`);
      console.log(`   发现 ${duplicates.length} 个重复导入`);

      // 修复重复导入
      const fixedLines = this.fixDuplicates(lines, duplicates);

      // 写入修复后的内容
      fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8');

      this.stats.duplicatesFixed += duplicates.length;
      console.log(`   ✅ 已修复\n`);
    } catch (error) {
      this.stats.errors++;
      console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    }
  }

  /**
   * 查找导入行
   */
  findImportLines(lines) {
    const imports = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 匹配import语句
      const importMatch = line.match(
        /^import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"];?\s*$/,
      );
      if (importMatch) {
        const [, importList, source] = importMatch;
        const identifiers = importList
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id.length > 0);

        imports.push({
          lineIndex: i,
          line: line,
          source: source,
          identifiers: identifiers,
        });
      }
    }

    return imports;
  }

  /**
   * 查找重复导入
   */
  findDuplicates(importLines) {
    const duplicates = [];
    const seenIdentifiers = new Map();

    for (const importLine of importLines) {
      for (const identifier of importLine.identifiers) {
        if (seenIdentifiers.has(identifier)) {
          const existing = seenIdentifiers.get(identifier);
          duplicates.push({
            identifier,
            existing,
            duplicate: importLine,
          });
        } else {
          seenIdentifiers.set(identifier, importLine);
        }
      }
    }

    return duplicates;
  }

  /**
   * 修复重复导入
   */
  fixDuplicates(lines, duplicates) {
    const linesToRemove = new Set();

    // 标记要移除的重复导入行
    for (const duplicate of duplicates) {
      const { existing, duplicate: dup } = duplicate;

      // 优先保留@/constants路径的导入
      let removeImport;
      if (existing.source === '@/constants') {
        removeImport = dup;
      } else if (dup.source === '@/constants') {
        removeImport = existing;
      } else {
        // 都不是@/constants，移除后面的
        removeImport = dup;
      }

      linesToRemove.add(removeImport.lineIndex);
    }

    // 移除重复的导入行
    return lines.filter((line, index) => !linesToRemove.has(index));
  }

  /**
   * 输出统计信息
   */
  printStats() {
    console.log('\n📊 处理统计:');
    console.log(`   处理文件数: ${this.stats.filesProcessed}`);
    console.log(`   发现重复导入: ${this.stats.duplicatesFound}`);
    console.log(`   修复重复导入: ${this.stats.duplicatesFixed}`);
    console.log(`   错误数: ${this.stats.errors}`);

    if (this.stats.errors === 0) {
      console.log('\n✅ 重复导入清理完成！');
    } else {
      console.log('\n⚠️  部分文件处理失败，请检查错误信息');
    }
  }
}

// 执行脚本
if (require.main === module) {
  const cleaner = new DuplicateImportCleaner();
  cleaner.run().catch(console.error);
}

module.exports = DuplicateImportCleaner;
