#!/usr/bin/env node

/**
 * 修复导入冲突脚本
 *
 * 功能：
 * 1. 检测导入声明与本地声明的冲突
 * 2. 移除冲突的导入语句
 * 3. 保留本地定义的常量
 *
 * 使用方法：
 * node scripts/fix-import-conflicts.js
 */

const fs = require('fs');
const path = require('path');

class ImportConflictFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      conflictsFixed: 0,
      errors: 0,
    };
  }

  async run() {
    console.log('🔧 开始修复导入冲突...\n');

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

      // 查找导入冲突
      const conflicts = this.findImportConflicts(content);

      if (conflicts.length === 0) {
        return;
      }

      this.stats.filesProcessed++;

      console.log(`🔍 处理文件: ${filePath}`);
      console.log(
        `   发现 ${conflicts.length} 个导入冲突: ${conflicts.join(', ')}`,
      );

      // 修复冲突
      const fixedContent = this.fixConflicts(content, conflicts);

      // 写入修复后的内容
      fs.writeFileSync(filePath, fixedContent, 'utf8');

      this.stats.conflictsFixed += conflicts.length;
      console.log(`   ✅ 已修复\n`);
    } catch (error) {
      this.stats.errors++;
      console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    }
  }

  findImportConflicts(content) {
    const conflicts = [];
    const lines = content.split('\n');

    // 获取所有导入的标识符
    const importedIdentifiers = this.getImportedIdentifiers(content);

    // 获取所有本地定义的标识符
    const localIdentifiers = this.getLocalIdentifiers(content);

    // 查找冲突
    for (const identifier of importedIdentifiers) {
      if (localIdentifiers.has(identifier)) {
        conflicts.push(identifier);
      }
    }

    return conflicts;
  }

  getImportedIdentifiers(content) {
    const identifiers = new Set();
    const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"][^'"]+['"];?/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map((imp) => imp.trim());
      imports.forEach((imp) => identifiers.add(imp));
    }

    return identifiers;
  }

  getLocalIdentifiers(content) {
    const identifiers = new Set();

    // 匹配 export const 声明
    const exportConstRegex = /export\s+const\s+([A-Z_][A-Z0-9_]*)\s*=/g;
    let match;
    while ((match = exportConstRegex.exec(content)) !== null) {
      identifiers.add(match[1]);
    }

    // 匹配 const 声明
    const constRegex = /^const\s+([A-Z_][A-Z0-9_]*)\s*=/gm;
    while ((match = constRegex.exec(content)) !== null) {
      identifiers.add(match[1]);
    }

    return identifiers;
  }

  fixConflicts(content, conflicts) {
    const lines = content.split('\n');
    const fixedLines = [];

    for (const line of lines) {
      // 检查是否是导入行
      const importMatch = line.match(
        /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"];?/,
      );

      if (importMatch) {
        const [fullMatch, importList, source] = importMatch;
        const imports = importList.split(',').map((imp) => imp.trim());

        // 过滤掉冲突的导入
        const filteredImports = imports.filter(
          (imp) => !conflicts.includes(imp),
        );

        if (filteredImports.length === 0) {
          // 如果所有导入都冲突，删除整行
          continue;
        } else if (filteredImports.length < imports.length) {
          // 如果部分导入冲突，重写导入行
          const newImportLine = `import { ${filteredImports.join(', ')} } from '${source}';`;
          fixedLines.push(newImportLine);
        } else {
          // 没有冲突，保留原行
          fixedLines.push(line);
        }
      } else {
        // 非导入行，保留
        fixedLines.push(line);
      }
    }

    return fixedLines.join('\n');
  }

  printStats() {
    console.log('\n📊 处理统计:');
    console.log(`   处理文件数: ${this.stats.filesProcessed}`);
    console.log(`   修复冲突数: ${this.stats.conflictsFixed}`);
    console.log(`   错误数: ${this.stats.errors}`);

    if (this.stats.errors === 0) {
      console.log('\n✅ 导入冲突修复完成！');
    } else {
      console.log('\n⚠️  部分文件处理失败，请检查错误信息');
    }
  }
}

// 执行脚本
if (require.main === module) {
  const fixer = new ImportConflictFixer();
  fixer.run().catch(console.error);
}

module.exports = ImportConflictFixer;
