#!/usr/bin/env tsx
/**
 * 相对路径导入修复工具
 * 将 src 内的相对路径导入 (./../...) 改为 @/ 别名导入
 */
import { existsSync, writeFileSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { ImportDeclaration, Node, Project, SourceFile } from 'ts-morph';

interface ImportFixResult {
  filePath: string;
  fixedImports: number;
  errors: string[];
}

class AliasImportFixer {
  private project: Project;
  private srcPath: string;
  private results: ImportFixResult[] = [];

  constructor() {
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json',
    });
    this.srcPath = resolve(process.cwd(), 'src');
  }

  /**
   * 检查导入路径是否指向 src 内部
   */
  private isInternalSrcImport(
    importPath: string,
    currentFilePath: string,
  ): boolean {
    if (!importPath.startsWith('.')) {
      return false; // 不是相对路径
    }

    const currentDir = dirname(currentFilePath);
    const resolvedPath = resolve(currentDir, importPath);

    // 检查解析后的路径是否在 src 目录内
    return resolvedPath.startsWith(this.srcPath);
  }

  /**
   * 将相对路径转换为 @/ 别名路径
   */
  private convertToAliasPath(
    importPath: string,
    currentFilePath: string,
  ): string {
    const currentDir = dirname(currentFilePath);
    const resolvedPath = resolve(currentDir, importPath);
    const relativePath = relative(this.srcPath, resolvedPath);

    // 确保路径使用正斜杠（Unix风格）
    const normalizedPath = relativePath.replace(/\\/g, '/');

    return `@/${normalizedPath}`;
  }

  /**
   * 验证转换后的路径是否有效
   */
  private validateAliasPath(aliasPath: string): boolean {
    // 移除 @/ 前缀，获取实际文件路径
    const actualPath = aliasPath.replace(/^@\//, '');
    const fullPath = join(this.srcPath, actualPath);

    // 检查文件是否存在（可能有扩展名）
    const possibleExtensions = ['', '.ts', '.tsx', '.js', '.jsx'];

    for (const ext of possibleExtensions) {
      if (existsSync(fullPath + ext)) {
        return true;
      }
      // 检查是否是目录（index文件）
      if (
        existsSync(join(fullPath + ext, 'index.ts')) ||
        existsSync(join(fullPath + ext, 'index.tsx'))
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * 修复单个文件的导入
   */
  private fixFileImports(sourceFile: SourceFile): ImportFixResult {
    const filePath = sourceFile.getFilePath();
    const result: ImportFixResult = {
      filePath: relative(process.cwd(), filePath),
      fixedImports: 0,
      errors: [],
    };

    // 只处理 src 目录内的文件
    if (!filePath.startsWith(this.srcPath)) {
      return result;
    }

    const importDeclarations = sourceFile.getImportDeclarations();

    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();

      if (this.isInternalSrcImport(moduleSpecifier, filePath)) {
        try {
          const aliasPath = this.convertToAliasPath(moduleSpecifier, filePath);

          // 验证转换后的路径
          if (this.validateAliasPath(aliasPath)) {
            importDecl.setModuleSpecifier(aliasPath);
            result.fixedImports++;
            console.log(`  ✓ ${moduleSpecifier} → ${aliasPath}`);
          } else {
            result.errors.push(
              `无法验证路径: ${moduleSpecifier} → ${aliasPath}`,
            );
          }
        } catch (error) {
          result.errors.push(`转换失败: ${moduleSpecifier} - ${error}`);
        }
      }
    }

    return result;
  }

  /**
   * 批量修复所有文件
   */
  public async fixAllImports(dryRun: boolean = false): Promise<void> {
    console.log('🔧 开始修复相对路径导入...');
    console.log(`📁 源码目录: ${this.srcPath}`);
    console.log(`🔍 模式: ${dryRun ? '干跑模式' : '写入模式'}`);
    console.log();

    // 获取所有 TypeScript 文件
    const sourceFiles = this.project.getSourceFiles([
      'src/**/*.ts',
      'src/**/*.tsx',
    ]);

    console.log(`📊 找到 ${sourceFiles.length} 个文件`);
    console.log();

    let totalFixed = 0;
    let totalErrors = 0;

    for (const sourceFile of sourceFiles) {
      const result = this.fixFileImports(sourceFile);

      if (result.fixedImports > 0 || result.errors.length > 0) {
        console.log(`📄 ${result.filePath}:`);

        if (result.fixedImports > 0) {
          console.log(`  ✅ 修复 ${result.fixedImports} 个导入`);
          totalFixed += result.fixedImports;
        }

        if (result.errors.length > 0) {
          console.log(`  ❌ ${result.errors.length} 个错误:`);
          result.errors.forEach((error) => console.log(`    - ${error}`));
          totalErrors += result.errors.length;
        }

        console.log();
      }

      this.results.push(result);
    }

    // 保存更改
    if (!dryRun && totalFixed > 0) {
      console.log('💾 保存更改...');
      await this.project.save();
      console.log('✅ 保存完成');
    }

    // 输出总结
    console.log('📊 修复总结:');
    console.log(`  修复导入: ${totalFixed} 个`);
    console.log(`  错误数量: ${totalErrors} 个`);
    console.log(
      `  处理文件: ${this.results.filter((r) => r.fixedImports > 0).length} 个`,
    );

    if (dryRun) {
      console.log('\n🔍 这是干跑模式，未实际修改文件');
    }
  }

  /**
   * 获取修复结果
   */
  public getResults(): ImportFixResult[] {
    return this.results;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  const fixer = new AliasImportFixer();

  try {
    await fixer.fixAllImports(dryRun);

    // 保存结果到文件
    const results = fixer.getResults();
    const summary = {
      timestamp: new Date().toISOString(),
      dryRun,
      totalFiles: results.length,
      filesWithFixes: results.filter((r) => r.fixedImports > 0).length,
      totalFixes: results.reduce((sum, r) => sum + r.fixedImports, 0),
      results,
    };

    writeFileSync(
      'alias-imports-result.json',
      JSON.stringify(summary, null, 2),
    );
    console.log('结果已保存到 alias-imports-result.json');
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
