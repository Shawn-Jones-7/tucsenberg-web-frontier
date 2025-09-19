#!/usr/bin/env tsx

/**
 * 映射一致性校验脚本
 *
 * 按照CODEX建议，验证enhanced-codex-mapping.json中每个映射条目
 * 与实际模块导出的一致性，生成缺失/冲突报告
 */
import fs from 'fs';
import path from 'path';
import { Project, SourceFile } from 'ts-morph';

interface MappingEntry {
  export: string;
  module: string;
  source?: string;
  type?: string;
}

interface ValidationResult {
  valid: MappingEntry[];
  missing: Array<{ entry: MappingEntry; reason: string }>;
  conflicts: Array<{ entry: MappingEntry; reason: string }>;
  duplicates: Array<{ export: string; modules: string[] }>;
}

class MappingValidator {
  private project: Project;
  private srcPath: string;

  constructor() {
    // 确保从项目根目录运行
    const projectRoot = path.resolve(__dirname, '../..');
    this.project = new Project({
      tsConfigFilePath: path.resolve(projectRoot, 'tsconfig.json'),
    });
    this.srcPath = path.resolve(projectRoot, 'src');
  }

  /**
   * 验证映射文件的一致性
   */
  async validateMapping(mappingPath: string): Promise<ValidationResult> {
    const mappingData = this.loadMappingFile(mappingPath);
    const result: ValidationResult = {
      valid: [],
      missing: [],
      conflicts: [],
      duplicates: [],
    };

    // 检查重复导出
    this.checkDuplicateExports(mappingData, result);

    // 验证每个映射条目
    for (const [value, entry] of Object.entries(mappingData)) {
      await this.validateEntry(value, entry, result);
    }

    return result;
  }

  /**
   * 加载映射文件
   */
  private loadMappingFile(mappingPath: string): Record<string, MappingEntry> {
    try {
      const content = fs.readFileSync(mappingPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load mapping file: ${error}`);
    }
  }

  /**
   * 检查重复导出
   */
  private checkDuplicateExports(
    mappingData: Record<string, MappingEntry>,
    result: ValidationResult,
  ) {
    const exportMap = new Map<string, string[]>();

    for (const entry of Object.values(mappingData)) {
      const exportName = entry.export;
      if (!exportMap.has(exportName)) {
        exportMap.set(exportName, []);
      }
      exportMap.get(exportName)!.push(entry.module);
    }

    for (const [exportName, modules] of exportMap) {
      if (modules.length > 1) {
        result.duplicates.push({ export: exportName, modules });
      }
    }
  }

  /**
   * 验证单个映射条目
   */
  private async validateEntry(
    value: string,
    entry: MappingEntry,
    result: ValidationResult,
  ) {
    try {
      // 检查条目是否有效
      if (!entry || !entry.export || !entry.module) {
        result.conflicts.push({
          entry,
          reason: `Invalid mapping entry: missing export or module field`,
        });
        return;
      }

      const modulePath = this.resolveModulePath(entry.module);
      const sourceFile = this.project.getSourceFile(modulePath);

      if (!sourceFile) {
        result.missing.push({
          entry,
          reason: `Module file not found: ${modulePath}`,
        });
        return;
      }

      const hasExport = this.checkExportExists(sourceFile, entry.export);
      if (!hasExport) {
        result.missing.push({
          entry,
          reason: `Export '${entry.export}' not found in module ${entry.module}`,
        });
        return;
      }

      result.valid.push(entry);
    } catch (error) {
      result.conflicts.push({
        entry,
        reason: `Validation error: ${error}`,
      });
    }
  }

  /**
   * 解析模块路径
   */
  private resolveModulePath(moduleSpecifier: string): string {
    // 处理 @/ 别名
    if (moduleSpecifier.startsWith('@/')) {
      return path.resolve(this.srcPath, `${moduleSpecifier.slice(2)}.ts`);
    }

    // 处理相对路径
    if (moduleSpecifier.startsWith('./')) {
      return path.resolve(
        this.srcPath,
        'constants',
        `${moduleSpecifier.slice(2)}.ts`,
      );
    }

    // 处理绝对路径
    return path.resolve(this.srcPath, `${moduleSpecifier}.ts`);
  }

  /**
   * 检查导出是否存在
   */
  private checkExportExists(
    sourceFile: SourceFile,
    exportName: string,
  ): boolean {
    // 检查命名导出
    const namedExports = sourceFile.getExportedDeclarations();
    if (namedExports.has(exportName)) {
      return true;
    }

    // 检查 export * 重新导出
    const exportDeclarations = sourceFile.getExportDeclarations();
    for (const exportDecl of exportDeclarations) {
      if (exportDecl.isNamespaceExport()) {
        // 这是 export * from '...' 的情况
        const moduleSpecifier = exportDecl.getModuleSpecifierValue();
        if (moduleSpecifier) {
          const reexportedFile = this.resolveReexportedFile(
            sourceFile,
            moduleSpecifier,
          );
          if (
            reexportedFile &&
            this.checkExportExists(reexportedFile, exportName)
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * 解析重新导出的文件
   */
  private resolveReexportedFile(
    sourceFile: SourceFile,
    moduleSpecifier: string,
  ): SourceFile | undefined {
    const sourceDir = path.dirname(sourceFile.getFilePath());
    let resolvedPath: string;

    if (moduleSpecifier.startsWith('./') || moduleSpecifier.startsWith('../')) {
      resolvedPath = path.resolve(sourceDir, `${moduleSpecifier}.ts`);
    } else if (moduleSpecifier.startsWith('@/')) {
      resolvedPath = path.resolve(
        this.srcPath,
        `${moduleSpecifier.slice(2)}.ts`,
      );
    } else {
      resolvedPath = path.resolve(sourceDir, `${moduleSpecifier}.ts`);
    }

    return this.project.getSourceFile(resolvedPath);
  }

  /**
   * 生成验证报告
   */
  generateReport(result: ValidationResult): string {
    const lines: string[] = [];

    lines.push('# 映射一致性校验报告');
    lines.push('');
    lines.push(`生成时间: ${new Date().toISOString()}`);
    lines.push('');

    // 统计信息
    lines.push('## 统计信息');
    lines.push(`- 有效映射: ${result.valid.length}`);
    lines.push(`- 缺失导出: ${result.missing.length}`);
    lines.push(`- 冲突错误: ${result.conflicts.length}`);
    lines.push(`- 重复导出: ${result.duplicates.length}`);
    lines.push('');

    // 缺失导出
    if (result.missing.length > 0) {
      lines.push('## 缺失导出');
      for (const item of result.missing) {
        lines.push(
          `- **${item.entry.export}** (${item.entry.module}): ${item.reason}`,
        );
      }
      lines.push('');
    }

    // 冲突错误
    if (result.conflicts.length > 0) {
      lines.push('## 冲突错误');
      for (const item of result.conflicts) {
        lines.push(
          `- **${item.entry.export}** (${item.entry.module}): ${item.reason}`,
        );
      }
      lines.push('');
    }

    // 重复导出
    if (result.duplicates.length > 0) {
      lines.push('## 重复导出');
      for (const item of result.duplicates) {
        lines.push(`- **${item.export}**: ${item.modules.join(', ')}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}

async function main() {
  const mappingPath = path.resolve(__dirname, 'enhanced-codex-mapping.json');
  const validator = new MappingValidator();

  console.log('🔍 开始验证映射一致性...');

  try {
    const result = await validator.validateMapping(mappingPath);
    const report = validator.generateReport(result);

    // 输出报告到控制台
    console.log(report);

    // 保存报告到文件
    const reportPath = path.resolve(__dirname, 'mapping-validation-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 报告已保存到: ${reportPath}`);

    // 返回适当的退出码
    const hasErrors = result.missing.length > 0 || result.conflicts.length > 0;
    process.exit(hasErrors ? 1 : 0);
  } catch (error) {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
