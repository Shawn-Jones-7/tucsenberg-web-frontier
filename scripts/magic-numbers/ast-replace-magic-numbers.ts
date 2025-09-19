#!/usr/bin/env tsx
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Project, SourceFile, ts } from 'ts-morph';
import {
  ensureConstDefined,
  loadEnhancedMapping,
  mergeAndAliasImports,
  shouldSkipNode,
} from './utils';

export interface ReplaceLogEntry {
  file: string;
  changes: Array<{
    start: number;
    end: number;
    raw: string;
    constant: string;
    negated: boolean;
  }>;
  imports: {
    added: string[];
    aliased: Record<string, string>;
  };
}

export interface Options {
  write: boolean;
  files?: string;
  limit?: number;
  dryRun?: boolean;
}

/**
 * 递归查找匹配的TypeScript文件
 */
function findTsFiles(dir: string, pattern: RegExp = /\.(ts|tsx)$/): string[] {
  const results: string[] = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // 跳过node_modules和.git等目录
        if (!item.startsWith('.') && item !== 'node_modules') {
          results.push(...findTsFiles(fullPath, pattern));
        }
      } else if (stat.isFile() && pattern.test(item)) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`⚠️ 无法读取目录 ${dir}:`, error);
  }

  return results;
}

/**
 * AST-based magic numbers replacement
 */
export async function run(opts: Options): Promise<ReplaceLogEntry[]> {
  console.log('🚀 AST魔法数字替换器启动...');

  // 初始化项目 - 修复路径问题
  const rootDir = process.cwd().endsWith('scripts/magic-numbers')
    ? resolve(process.cwd(), '../..')
    : process.cwd();

  const project = new Project({
    tsConfigFilePath: resolve(rootDir, 'tsconfig.json'),
    manipulationSettings: {
      indentationText: '  ',
    },
  });

  // 获取文件列表
  let filePaths: string[];
  if (opts.files) {
    // 检查是否是单个文件
    if (opts.files.endsWith('.ts') || opts.files.endsWith('.tsx')) {
      // 单个文件模式
      const filePath = opts.files.startsWith('/')
        ? opts.files
        : resolve(rootDir, opts.files);
      filePaths = [filePath];
      console.log(`🎯 单个文件模式: ${filePath}`);
    } else {
      // 目录模式 - 处理相对路径
      let searchDir: string;
      if (opts.files.startsWith('/')) {
        searchDir = opts.files;
      } else {
        // 处理相对路径，确保正确解析
        searchDir = resolve(rootDir, opts.files.replace('/**/*.{ts,tsx}', ''));
      }

      console.log(`🔍 文件模式: ${opts.files}`);
      console.log(`📁 根目录: ${rootDir}`);
      console.log(`🎯 搜索目录: ${searchDir}`);

      // 使用自定义文件查找
      filePaths = findTsFiles(searchDir);
      console.log(`📄 找到文件数量: ${filePaths.length}`);

      if (filePaths.length > 0) {
        console.log(`📋 前5个文件示例:`);
        filePaths.slice(0, 5).forEach((file) => {
          console.log(`  ${file.replace(rootDir, '.')}`);
        });
      }
    }
  } else {
    // 添加所有源文件
    const srcDir = resolve(rootDir, 'src');
    console.log(`📁 默认搜索目录: ${srcDir}`);
    filePaths = findTsFiles(srcDir);
  }

  // 添加文件到项目
  const files = project.addSourceFilesAtPaths(filePaths);

  const targetFiles = files.slice(0, opts.limit ?? files.length);

  // 加载增强版映射
  const mapping = loadEnhancedMapping();
  if (Object.keys(mapping).length === 0) {
    console.error('❌ 映射文件为空或加载失败');
    return [];
  }

  console.log(`📊 处理 ${targetFiles.length} 个文件...`);
  console.log(`📋 可用常量映射: ${Object.keys(mapping).length} 个`);

  const logs: ReplaceLogEntry[] = [];
  let totalReplacements = 0;

  for (const sourceFile of targetFiles) {
    const filePath = sourceFile.getFilePath();
    const relativePath = filePath.replace(`${process.cwd()}/`, '');

    const fileLog: ReplaceLogEntry = {
      file: relativePath,
      changes: [],
      imports: { added: [], aliased: {} },
    };

    const newConstants = new Set<string>();
    const constantsWithModules: Array<{ constant: string; module: string }> =
      [];

    // 直接进行替换，但先处理导入
    sourceFile.forEachDescendant((node) => {
      if (ts.isNumericLiteral(node.compilerNode)) {
        const text = node.getText();

        // 检查是否应该跳过
        if (shouldSkipNode(node)) {
          return;
        }

        const { constantName, isSupported, module } = ensureConstDefined(
          mapping,
          text,
        );

        if (!isSupported) {
          return;
        }

        const parent = node.getParent();

        // 处理负号前缀
        if (
          parent &&
          ts.isPrefixUnaryExpression(parent.compilerNode) &&
          parent.compilerNode.operator === ts.SyntaxKind.MinusToken
        ) {
          fileLog.changes.push({
            start: node.getStart(),
            end: node.getEnd(),
            raw: `-${text}`,
            constant: constantName,
            negated: true,
          });

          // 替换操作数，保留负号
          node.replaceWithText(constantName);
          newConstants.add(constantName);
          constantsWithModules.push({ constant: constantName, module });
          totalReplacements++;
        } else {
          fileLog.changes.push({
            start: node.getStart(),
            end: node.getEnd(),
            raw: text,
            constant: constantName,
            negated: false,
          });

          // 直接替换
          node.replaceWithText(constantName);
          newConstants.add(constantName);
          constantsWithModules.push({ constant: constantName, module });
          totalReplacements++;
        }
      }
    });

    // 处理导入（在替换之后，但在保存之前）
    if (newConstants.size > 0) {
      mergeAndAliasImports(sourceFile, constantsWithModules, fileLog);
    }

    if (newConstants.size > 0) {
      console.log(`🔧 ${relativePath}: ${newConstants.size} 个替换`);
      newConstants.forEach((constName) => {
        console.log(
          `    ${mapping[Object.keys(mapping).find((k) => mapping[k] === constName) || '']} → ${constName}`,
        );
      });
    }

    // 保存文件
    if (!opts.dryRun && opts.write && newConstants.size > 0) {
      await sourceFile.save();
    }

    if (fileLog.changes.length > 0) {
      logs.push(fileLog);
    }
  }

  // 生成日志
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = resolve(__dirname, '../logs', `ast-${timestamp}.json`);

  const logData = {
    timestamp: new Date().toISOString(),
    options: opts,
    summary: {
      filesProcessed: targetFiles.length,
      filesModified: logs.length,
      totalReplacements,
    },
    logs,
  };

  writeFileSync(logPath, JSON.stringify(logData, null, 2));

  console.log(`📊 处理完成:`);
  console.log(`  文件处理: ${targetFiles.length}`);
  console.log(`  文件修改: ${logs.length}`);
  console.log(`  总替换数: ${totalReplacements}`);
  console.log(`📄 日志保存到: ${logPath}`);

  if (opts.dryRun) {
    console.log('🔍 这是干跑模式，未实际修改文件');
  }

  return logs;
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);

  const options: Options = {
    write: args.includes('--write'),
    dryRun: args.includes('--dry-run'),
    files: undefined,
    limit: undefined,
  };

  // 解析 --files 参数
  const filesIndex = args.findIndex((arg) => arg === '--files');
  if (filesIndex !== -1 && filesIndex + 1 < args.length) {
    options.files = args[filesIndex + 1];
  } else {
    const filesArg = args.find((arg) => arg.startsWith('--files='));
    if (filesArg) {
      options.files = filesArg.split('=')[1];
    }
  }

  // 解析 --limit 参数
  const limitIndex = args.findIndex((arg) => arg === '--limit');
  if (limitIndex !== -1 && limitIndex + 1 < args.length) {
    options.limit = parseInt(args[limitIndex + 1]);
  } else {
    const limitArg = args.find((arg) => arg.startsWith('--limit='));
    if (limitArg) {
      options.limit = parseInt(limitArg.split('=')[1]);
    }
  }

  // 默认为干跑模式
  if (!options.write) {
    options.dryRun = true;
  }

  run(options).catch(console.error);
}
