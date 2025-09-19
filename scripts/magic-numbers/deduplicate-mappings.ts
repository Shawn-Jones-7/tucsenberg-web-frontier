#!/usr/bin/env tsx

/**
 * 去重映射条目
 *
 * 处理重复的导出映射，保留最合适的条目
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

class MappingDeduplicator {
  private mappingPath: string;
  private mappingData: Record<string, MappingEntry>;

  constructor(mappingPath: string) {
    this.mappingPath = mappingPath;
    this.mappingData = this.loadMappingFile();
  }

  private loadMappingFile(): Record<string, MappingEntry> {
    const content = fs.readFileSync(this.mappingPath, 'utf-8');
    return JSON.parse(content);
  }

  private saveMappingFile(): void {
    const content = JSON.stringify(this.mappingData, null, 2);
    fs.writeFileSync(this.mappingPath, content);
  }

  /**
   * 去重映射条目
   */
  deduplicateMappings(): void {
    console.log('🔧 开始去重映射条目...');

    // 按导出名称分组
    const exportGroups = new Map<
      string,
      Array<{ key: string; entry: MappingEntry }>
    >();

    for (const [key, entry] of Object.entries(this.mappingData)) {
      if (!entry || !entry.export) continue;

      if (!exportGroups.has(entry.export)) {
        exportGroups.set(entry.export, []);
      }
      exportGroups.get(entry.export)!.push({ key, entry });
    }

    let removedCount = 0;

    // 处理重复的导出
    for (const [exportName, entries] of exportGroups) {
      if (entries.length > 1) {
        console.log(
          `\n🔍 处理重复导出: ${exportName} (${entries.length} 个条目)`,
        );

        // 选择最佳条目
        const bestEntry = this.selectBestEntry(entries);

        // 删除其他条目
        for (const { key, entry } of entries) {
          if (key !== bestEntry.key) {
            console.log(`  ❌ 删除重复条目: ${key} (${entry.module})`);
            delete this.mappingData[key];
            removedCount++;
          } else {
            console.log(`  ✅ 保留条目: ${key} (${entry.module})`);
          }
        }
      }
    }

    this.saveMappingFile();
    console.log(`\n📊 去重完成: 删除了 ${removedCount} 个重复条目`);
  }

  /**
   * 选择最佳映射条目
   */
  private selectBestEntry(
    entries: Array<{ key: string; entry: MappingEntry }>,
  ): { key: string; entry: MappingEntry } {
    // 优先级规则：
    // 1. 优先选择原始定义模块（非magic-numbers）
    // 2. 优先选择更具体的模块路径
    // 3. 优先选择较小的数值键（通常是原始映射）

    const nonMagicNumbers = entries.filter(
      ({ entry }) => !entry.module.includes('magic-numbers'),
    );

    if (nonMagicNumbers.length > 0) {
      // 在非magic-numbers模块中选择最具体的
      return nonMagicNumbers.sort((a, b) => {
        // 优先选择更具体的模块名
        const aSpecificity = a.entry.module.split('/').length;
        const bSpecificity = b.entry.module.split('/').length;
        if (aSpecificity !== bSpecificity) {
          return bSpecificity - aSpecificity;
        }

        // 其次按数值键排序
        const aNum = parseFloat(a.key);
        const bNum = parseFloat(b.key);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }

        return a.key.localeCompare(b.key);
      })[0];
    }

    // 如果都是magic-numbers，选择数值最小的
    return entries.sort((a, b) => {
      const aNum = parseFloat(a.key);
      const bNum = parseFloat(b.key);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.key.localeCompare(b.key);
    })[0];
  }

  /**
   * 生成去重报告
   */
  generateReport(): string {
    const lines: string[] = [];

    lines.push('# 映射去重报告');
    lines.push('');
    lines.push(`生成时间: ${new Date().toISOString()}`);
    lines.push('');

    // 统计信息
    const totalEntries = Object.keys(this.mappingData).length;

    lines.push('## 去重后统计');
    lines.push(`- 总映射条目: ${totalEntries}`);
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
  const deduplicator = new MappingDeduplicator(mappingPath);

  try {
    // 去重映射
    deduplicator.deduplicateMappings();

    // 生成报告
    const report = deduplicator.generateReport();
    console.log(`\n${report}`);

    // 保存报告
    const reportPath = path.resolve(__dirname, 'mapping-dedup-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`📄 去重报告已保存到: ${reportPath}`);
  } catch (error) {
    console.error('❌ 去重失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
