#!/usr/bin/env tsx
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ExportAssignment, Project, ts, VariableDeclaration } from 'ts-morph';

interface ConstantInfo {
  export: string;
  module: string;
  value: number;
  filePath: string;
  line: number;
}

// 收集现有常量定义脚本
// 扫描路径：
// - src/constants/**/* .ts
// - src/config/**/* .ts
// 目标：抓取右值为字面量数字的命名导出，生成候选表
async function collectExistingConstants() {
  console.log('🔍 收集现有常量定义...');

  // 初始化项目
  const project = new Project({
    tsConfigFilePath: resolve(process.cwd(), 'tsconfig.json'),
  });

  // 扫描目标目录
  const targetPatterns = ['src/constants/**/*.ts', 'src/config/**/*.ts'];

  // 添加源文件
  for (const pattern of targetPatterns) {
    project.addSourceFilesAtPaths(pattern);
  }

  const sourceFiles = project.getSourceFiles();

  console.log(`📊 扫描 ${sourceFiles.length} 个常量文件...`);

  const constants: ConstantInfo[] = [];
  const valueToConstants = new Map<number, ConstantInfo[]>();

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath().replace(`${process.cwd()}/`, '');
    const modulePath = filePath.replace(/^src\//, '@/').replace(/\.ts$/, '');

    console.log(`🔍 分析文件: ${filePath}`);

    // 查找导出的变量声明
    const exportedDeclarations = sourceFile.getExportedDeclarations();

    for (const [exportName, declarations] of exportedDeclarations) {
      for (const declaration of declarations) {
        if (declaration.getKind() === ts.SyntaxKind.VariableDeclaration) {
          const varDecl = declaration as VariableDeclaration;
          const initializer = varDecl.getInitializer();

          if (initializer && ts.isNumericLiteral(initializer.compilerNode)) {
            const value = parseFloat(initializer.getText());
            const line = varDecl.getStartLineNumber();

            const constantInfo: ConstantInfo = {
              export: exportName,
              module: modulePath,
              value,
              filePath,
              line,
            };

            constants.push(constantInfo);

            if (!valueToConstants.has(value)) {
              valueToConstants.set(value, []);
            }
            valueToConstants.get(value)!.push(constantInfo);

            console.log(`  ✅ 发现常量: ${exportName} = ${value} (行 ${line})`);
          }
        }
      }
    }

    // 查找对象中的数字常量
    sourceFile.forEachDescendant((node) => {
      if (ts.isPropertyAssignment(node.compilerNode)) {
        const propAssignment = node;
        const initializer = propAssignment.getInitializer();

        if (initializer && ts.isNumericLiteral(initializer.compilerNode)) {
          const value = parseFloat(initializer.getText());
          const propertyName = propAssignment.getName();

          // 尝试找到包含这个属性的导出对象
          let parent = propAssignment.getParent();
          while (parent && !ts.isVariableDeclaration(parent.compilerNode)) {
            parent = parent.getParent();
          }

          if (parent && ts.isVariableDeclaration(parent.compilerNode)) {
            const varDecl = parent as VariableDeclaration;
            const varName = varDecl.getName();

            // 检查是否被导出
            const exportedDeclarations = sourceFile.getExportedDeclarations();
            if (exportedDeclarations.has(varName)) {
              const line = propAssignment.getStartLineNumber();
              const exportName = `${varName}.${propertyName}`;

              const constantInfo: ConstantInfo = {
                export: exportName,
                module: modulePath,
                value,
                filePath,
                line,
              };

              constants.push(constantInfo);

              if (!valueToConstants.has(value)) {
                valueToConstants.set(value, []);
              }
              valueToConstants.get(value)!.push(constantInfo);

              console.log(
                `  ✅ 发现对象常量: ${exportName} = ${value} (行 ${line})`,
              );
            }
          }
        }
      }
    });
  }

  console.log(`\n📊 收集完成: 发现 ${constants.length} 个常量`);

  // 生成候选映射
  const candidateMapping: Record<string, any> = {};
  const conflicts: Record<string, ConstantInfo[]> = {};

  for (const [value, constantInfos] of valueToConstants) {
    const valueStr = value.toString();

    if (constantInfos.length === 1) {
      // 唯一常量，直接映射
      const info = constantInfos[0];
      candidateMapping[valueStr] = {
        export: info.export,
        module: info.module,
        source: `${info.filePath}:${info.line}`,
      };
    } else {
      // 多个常量，记录冲突
      conflicts[valueStr] = constantInfos;

      // 选择优先级最高的（按模块优先级）
      const prioritized = prioritizeConstant(constantInfos);
      candidateMapping[valueStr] = {
        export: prioritized.export,
        module: prioritized.module,
        source: `${prioritized.filePath}:${prioritized.line}`,
        alternatives: constantInfos
          .filter((c) => c !== prioritized)
          .map((c) => ({
            export: c.export,
            module: c.module,
            source: `${c.filePath}:${c.line}`,
          })),
      };
    }
  }

  // 保存结果
  const outputPath = 'scripts/magic-numbers/existing-constants-analysis.json';
  const result = {
    _comment: '现有常量分析结果',
    _generated: new Date().toISOString(),
    _stats: {
      totalConstants: constants.length,
      uniqueValues: valueToConstants.size,
      conflicts: Object.keys(conflicts).length,
    },
    candidateMapping,
    conflicts,
    allConstants: constants,
  };

  writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n💾 结果保存到: ${outputPath}`);

  // 显示冲突摘要
  if (Object.keys(conflicts).length > 0) {
    console.log('\n⚠️  发现冲突的数值:');
    for (const [value, infos] of Object.entries(conflicts)) {
      console.log(`  ${value}: ${infos.length} 个常量`);
      infos.forEach((info) => {
        console.log(`    - ${info.export} (${info.module})`);
      });
    }
  }

  return result;
}

/**
 * 常量优先级策略
 * 领域常量 > 通用常量 > magic-numbers.ts 兜底
 */
function prioritizeConstant(constants: ConstantInfo[]): ConstantInfo {
  // 优先级规则
  const priorityOrder = [
    // 领域常量（具体业务）
    /constants\/app-constants/,
    /config\/security/,
    /constants\/performance/,

    // 通用常量
    /constants\//,
    /config\//,

    // 兜底
    /magic-numbers/,
  ];

  for (const pattern of priorityOrder) {
    const match = constants.find((c) => pattern.test(c.filePath));
    if (match) return match;
  }

  // 如果没有匹配，返回第一个
  return constants[0];
}

// 运行收集
if (require.main === module) {
  collectExistingConstants().catch((error) => {
    console.error('❌ 收集失败:', error);
    process.exit(1);
  });
}

export { collectExistingConstants, type ConstantInfo };
