#!/usr/bin/env tsx

/**
 * 修复映射不一致问题
 *
 * 根据校验报告修正映射文件中的问题：
 * 1. 修正嵌套对象属性的映射格式
 * 2. 清理无效的映射条目
 * 3. 更新模块路径
 */
import fs from 'fs';
import path from 'path';

interface MappingEntry {
  export: string;
  module: string;
  source?: string;
  type?: string;
  alternatives?: string[];
}

class MappingFixer {
  private mappingPath: string;
  private mappingData: Record<string, MappingEntry>;

  constructor(mappingPath: string) {
    this.mappingPath = mappingPath;
    this.mappingData = this.loadMappingFile();
  }

  /**
   * 加载映射文件
   */
  private loadMappingFile(): Record<string, MappingEntry> {
    try {
      const content = fs.readFileSync(this.mappingPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load mapping file: ${error}`);
    }
  }

  /**
   * 保存映射文件
   */
  private saveMappingFile(): void {
    const content = JSON.stringify(this.mappingData, null, 2);
    fs.writeFileSync(this.mappingPath, content);
  }

  /**
   * 修复所有映射问题
   */
  fixAllMappings(): void {
    console.log('🔧 开始修复映射不一致问题...');

    let fixedCount = 0;
    let removedCount = 0;

    for (const [value, entry] of Object.entries(this.mappingData)) {
      if (!entry || !entry.export || !entry.module) {
        console.log(`❌ 删除无效条目: ${value}`);
        delete this.mappingData[value];
        removedCount++;
        continue;
      }

      const originalExport = entry.export;
      const fixed = this.fixSingleMapping(entry);

      if (fixed && entry.export !== originalExport) {
        console.log(`✅ 修复映射: ${originalExport} → ${entry.export}`);
        fixedCount++;
      }
    }

    this.saveMappingFile();
    console.log(`\n📊 修复完成:`);
    console.log(`- 修复的映射: ${fixedCount}`);
    console.log(`- 删除的无效条目: ${removedCount}`);
  }

  /**
   * 修复单个映射条目
   */
  private fixSingleMapping(entry: MappingEntry): boolean {
    let fixed = false;

    // 修复嵌套对象属性映射
    if (entry.export.includes('.')) {
      const parts = entry.export.split('.');
      if (parts.length === 2) {
        // 对于 OBJECT.PROPERTY 格式，改为只映射到 OBJECT
        entry.export = parts[0];
        fixed = true;
      }
    }

    // 修复模块路径
    const originalModule = entry.module;
    entry.module = this.fixModulePath(entry.module);
    if (entry.module !== originalModule) {
      fixed = true;
    }

    return fixed;
  }

  /**
   * 修复模块路径
   */
  private fixModulePath(modulePath: string): string {
    // 将指向magic-numbers的路径重定向到正确的模块
    if (modulePath === '@/constants/magic-numbers') {
      // 这些应该根据实际情况重定向到正确的模块
      // 暂时保持不变，让后续的校验来处理
      return modulePath;
    }

    // 标准化模块路径格式
    if (
      modulePath.startsWith('@/constants/') &&
      !modulePath.endsWith('-constants')
    ) {
      // 确保路径格式正确
      return modulePath;
    }

    return modulePath;
  }

  /**
   * 生成修复报告
   */
  generateReport(): string {
    const lines: string[] = [];

    lines.push('# 映射修复报告');
    lines.push('');
    lines.push(`生成时间: ${new Date().toISOString()}`);
    lines.push('');

    // 统计信息
    const totalEntries = Object.keys(this.mappingData).length;
    const validEntries = Object.values(this.mappingData).filter(
      (entry) => entry && entry.export && entry.module,
    ).length;

    lines.push('## 修复后统计');
    lines.push(`- 总映射条目: ${totalEntries}`);
    lines.push(`- 有效条目: ${validEntries}`);
    lines.push(`- 无效条目: ${totalEntries - validEntries}`);
    lines.push('');

    // 按模块分组统计
    const moduleStats = new Map<string, number>();
    for (const entry of Object.values(this.mappingData)) {
      if (entry && entry.module) {
        moduleStats.set(entry.module, (moduleStats.get(entry.module) || 0) + 1);
      }
    }

    lines.push('## 按模块分布');
    for (const [module, count] of Array.from(moduleStats.entries()).sort()) {
      lines.push(`- ${module}: ${count} 个映射`);
    }
    lines.push('');

    return lines.join('\n');
  }
}

async function main() {
  const mappingPath = path.resolve(__dirname, 'enhanced-codex-mapping.json');
  const fixer = new MappingFixer(mappingPath);

  try {
    // 修复映射
    fixer.fixAllMappings();

    // 生成报告
    const report = fixer.generateReport();
    console.log(`\n${report}`);

    // 保存报告
    const reportPath = path.resolve(__dirname, 'mapping-fix-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`📄 修复报告已保存到: ${reportPath}`);
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
