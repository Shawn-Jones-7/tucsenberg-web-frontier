#!/usr/bin/env node

/**
 * Export * 转换 Codemod 脚本
 *
 * 功能：
 * - 自动将 export * 转换为命名导出
 * - 保持功能等价性
 * - 支持批量处理和增量转换
 * - 生成转换报告
 * - 支持回滚操作
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const glob = require('glob');

// 转换配置
const TRANSFORM_CONFIG = {
  // 扫描模式
  scanPatterns: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.{test,spec}.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
  ],

  // 输出目录
  outputDir: path.join(process.cwd(), 'reports', 'transforms'),

  // 备份目录
  backupDir: path.join(process.cwd(), 'backups', 'barrel-exports'),

  // 解析器选项
  parserOptions: {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    plugins: [
      'typescript',
      'jsx',
      'decorators-legacy',
      'classProperties',
      'objectRestSpread',
      'asyncGenerators',
      'functionBind',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'dynamicImport',
    ],
  },

  // 转换选项
  transformOptions: {
    createBackup: true,
    dryRun: false,
    verbose: true,
    preserveComments: true,
  },
};

class BarrelExportTransformer {
  constructor(options = {}) {
    this.options = { ...TRANSFORM_CONFIG.transformOptions, ...options };
    this.outputDir = TRANSFORM_CONFIG.outputDir;
    this.backupDir = TRANSFORM_CONFIG.backupDir;

    // 确保transformStats在所有情况下都正确初始化
    this.initializeStats();

    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.outputDir, this.backupDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 初始化统计信息
   */
  initializeStats() {
    this.transformStats = {
      filesProcessed: 0,
      filesTransformed: 0,
      exportStarRemoved: 0,
      namedExportsAdded: 0,
      errors: [],
    };
  }

  /**
   * 分析文件中的export *语句
   */
  analyzeExportStar(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const ast = parse(content, TRANSFORM_CONFIG.parserOptions);

      const exportStarNodes = [];
      const existingExports = new Set();

      traverse(ast, {
        ExportAllDeclaration(nodePath) {
          exportStarNodes.push({
            node: nodePath.node,
            source: nodePath.node.source.value,
            line: nodePath.node.loc?.start.line,
          });
        },
        ExportNamedDeclaration(nodePath) {
          if (nodePath.node.specifiers) {
            nodePath.node.specifiers.forEach((spec) => {
              if (spec.exported) {
                existingExports.add(spec.exported.name);
              }
            });
          }
        },
      });

      return { exportStarNodes, existingExports, ast, content };
    } catch (error) {
      // 记录错误但不要在处理中重置统计对象，避免引用丢失
      (
        this.transformStats ||
        (this.transformStats = {
          filesProcessed: 0,
          filesTransformed: 0,
          exportStarRemoved: 0,
          namedExportsAdded: 0,
          errors: [],
        })
      ).errors.push({
        file: filePath,
        error: error.message,
        type: 'parse_error',
      });

      console.error(`❌ 解析失败: ${filePath} - ${error.message}`);
      return null;
    }
  }

  /**
   * 解析目标文件的导出
   */
  async resolveExportsFromModule(modulePath, currentFilePath) {
    try {
      // 解析相对路径
      const resolvedPath = this.resolveModulePath(modulePath, currentFilePath);

      if (!resolvedPath || !fs.existsSync(resolvedPath)) {
        return [];
      }

      const content = fs.readFileSync(resolvedPath, 'utf8');
      const ast = parse(content, TRANSFORM_CONFIG.parserOptions);

      const exports = [];

      traverse(ast, {
        ExportNamedDeclaration(nodePath) {
          const { node } = nodePath;

          // 处理 export { a, b }
          if (node.specifiers && node.specifiers.length > 0) {
            node.specifiers.forEach((spec) => {
              if (spec.exported) {
                exports.push(spec.exported.name);
              }
            });
          }

          // 处理 export const/function/class
          if (node.declaration) {
            if (node.declaration.id) {
              exports.push(node.declaration.id.name);
            } else if (node.declaration.declarations) {
              node.declaration.declarations.forEach((decl) => {
                if (decl.id && decl.id.name) {
                  exports.push(decl.id.name);
                }
              });
            }
          }
        },

        ExportDefaultDeclaration(nodePath) {
          exports.push('default');
        },
      });

      return exports;
    } catch (error) {
      if (this.options.verbose) {
        console.warn(`⚠️ 无法解析模块导出: ${modulePath} - ${error.message}`);
      }
      return [];
    }
  }

  /**
   * 解析模块路径
   */
  resolveModulePath(modulePath, currentFilePath) {
    if (!modulePath.startsWith('.')) {
      return null; // 跳过 node_modules
    }

    const currentDir = path.dirname(currentFilePath);
    const resolvedPath = path.resolve(currentDir, modulePath);

    // 尝试不同的扩展名
    const extensions = [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '/index.ts',
      '/index.tsx',
      '/index.js',
      '/index.jsx',
    ];

    for (const ext of extensions) {
      const testPath = resolvedPath + ext;
      if (fs.existsSync(testPath)) {
        return testPath;
      }
    }

    return null;
  }

  /**
   * 转换单个文件
   */
  async transformFile(filePath) {
    try {
      if (this.options.verbose) {
        console.log(`🔄 处理文件: ${filePath}`);
      }

      // 捕获稳定引用，避免在 traverse 回调中丢失 this 上下文
      const stats =
        this.transformStats ||
        (this.transformStats = {
          filesProcessed: 0,
          filesTransformed: 0,
          exportStarRemoved: 0,
          namedExportsAdded: 0,
          errors: [],
        });

      stats.filesProcessed++;

      const analysis = this.analyzeExportStar(filePath);
      if (!analysis || analysis.exportStarNodes.length === 0) {
        return false; // 没有需要转换的内容
      }

      const { exportStarNodes, existingExports, ast, content } = analysis;
      let hasChanges = false;

      // 创建备份
      if (this.options.createBackup && !this.options.dryRun) {
        this.createBackup(filePath, content);
      }

      // 处理每个 export * 语句
      for (const exportInfo of exportStarNodes) {
        try {
          const { node, source } = exportInfo;

          // 获取目标模块的导出
          const moduleExports = await this.resolveExportsFromModule(
            source,
            filePath,
          );

          if (moduleExports.length === 0) {
            if (this.options.verbose) {
              console.warn(`⚠️ 无法解析模块导出: ${source}`);
            }
            continue;
          }

          // 过滤掉已存在的导出
          const newExports = moduleExports.filter(
            (exp) => !existingExports.has(exp),
          );

          if (newExports.length === 0) {
            continue;
          }

          // 转换 AST
          traverse(ast, {
            // 使用箭头函数以捕获外层作用域，避免 this 变更
            ExportAllDeclaration: (nodePath) => {
              if (nodePath.node === node) {
                // 创建命名导出节点
                const specifiers = newExports.map((exportName) => {
                  return {
                    type: 'ExportSpecifier',
                    local: { type: 'Identifier', name: exportName },
                    exported: { type: 'Identifier', name: exportName },
                  };
                });

                const namedExportNode = {
                  type: 'ExportNamedDeclaration',
                  declaration: null,
                  specifiers: specifiers,
                  source: node.source,
                };

                // 替换节点
                nodePath.replaceWith(namedExportNode);
                hasChanges = true;

                // 统计信息更新使用稳定引用
                stats.exportStarRemoved++;
                stats.namedExportsAdded += newExports.length;
              }
            },
          });
        } catch (exportError) {
          // 处理单个 export 处理错误（不重置统计对象）
          stats.errors.push({
            file: filePath,
            error: `Export processing error: ${exportError.message}`,
            type: 'export_processing_error',
          });

          if (this.options.verbose) {
            console.warn(
              `⚠️ 处理export时出错: ${filePath} - ${exportError.message}`,
            );
          }
          continue; // 继续处理其他export
        }
      }

      // 生成新代码
      if (hasChanges && !this.options.dryRun) {
        const result = generate(ast, {
          retainLines: true,
          comments: this.options.preserveComments,
        });

        fs.writeFileSync(filePath, result.code);

        stats.filesTransformed++;

        if (this.options.verbose) {
          console.log(`✅ 已转换: ${filePath}`);
        }
      }

      return hasChanges;
    } catch (error) {
      // 整个方法的错误处理（不重置统计对象）
      const stats =
        this.transformStats ||
        (this.transformStats = {
          filesProcessed: 0,
          filesTransformed: 0,
          exportStarRemoved: 0,
          namedExportsAdded: 0,
          errors: [],
        });

      stats.errors.push({
        file: filePath,
        error: `Transform file error: ${error.message}`,
        type: 'transform_file_error',
      });

      if (this.options.verbose) {
        console.error(`❌ 转换文件失败: ${filePath} - ${error.message}`);
      }

      return false;
    }
  }

  /**
   * 创建文件备份
   */
  createBackup(filePath, content) {
    const relativePath = path.relative(process.cwd(), filePath);
    const backupPath = path.join(this.backupDir, relativePath);
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.writeFileSync(backupPath, content);
  }

  /**
   * 批量转换文件
   */
  async transformFiles(patterns = TRANSFORM_CONFIG.scanPatterns) {
    console.log('🚀 开始 Export * 转换...\n');

    // 获取要处理的文件
    const files = [];
    for (const pattern of patterns) {
      const matchedFiles = glob.sync(pattern, { cwd: process.cwd() });
      files.push(...matchedFiles);
    }

    console.log(`📁 找到 ${files.length} 个文件待处理\n`);

    // 处理文件
    for (const file of files) {
      try {
        await this.transformFile(file);
      } catch (error) {
        (
          this.transformStats ||
          (this.transformStats = {
            filesProcessed: 0,
            filesTransformed: 0,
            exportStarRemoved: 0,
            namedExportsAdded: 0,
            errors: [],
          })
        ).errors.push({
          file,
          error: error.message,
          type: 'transform_error',
        });
        console.error(`❌ 转换失败: ${file} - ${error.message}`);
      }
    }

    // 生成报告
    await this.generateReport();

    console.log('\n📊 转换完成!');
    console.log(`处理文件: ${this.transformStats.filesProcessed}`);
    console.log(`转换文件: ${this.transformStats.filesTransformed}`);
    console.log(`移除 export *: ${this.transformStats.exportStarRemoved}`);
    console.log(`添加命名导出: ${this.transformStats.namedExportsAdded}`);

    if (this.transformStats.errors.length > 0) {
      console.log(`错误数量: ${this.transformStats.errors.length}`);
    }

    return this.transformStats;
  }

  /**
   * 生成转换报告
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      options: this.options,
      stats: this.transformStats,
      summary: {
        success: this.transformStats.errors.length === 0,
        filesProcessed: this.transformStats.filesProcessed,
        filesTransformed: this.transformStats.filesTransformed,
        transformationRate:
          this.transformStats.filesProcessed > 0
            ? `${(
                (this.transformStats.filesTransformed /
                  this.transformStats.filesProcessed) *
                100
              ).toFixed(2)  }%`
            : '0%',
      },
    };

    const reportPath = path.join(
      this.outputDir,
      `barrel-transform-${Date.now()}.json`,
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 报告已生成: ${reportPath}`);
    return report;
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-backup':
        options.createBackup = false;
        break;
      case '--quiet':
        options.verbose = false;
        break;
      case '--no-comments':
        options.preserveComments = false;
        break;
    }
  }

  const transformer = new BarrelExportTransformer(options);

  try {
    await transformer.transformFiles();
  } catch (error) {
    console.error('❌ 转换过程中出现错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = BarrelExportTransformer;
