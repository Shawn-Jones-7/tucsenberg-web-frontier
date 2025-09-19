import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Node, SourceFile, SyntaxKind, ts } from 'ts-morph';

/**
 * 映射条目接口
 */
export interface MappingEntry {
  export: string;
  module: string;
  source: string;
  type?: string;
  alternatives?: Array<{
    export: string;
    module: string;
    source: string;
  }>;
}

/**
 * 加载增强版映射文件
 */
export function loadEnhancedMapping(): Record<string, MappingEntry> {
  // 优先使用增强版映射 - 修复路径解析
  const baseDir = __dirname.includes('scripts/magic-numbers')
    ? resolve(__dirname, '../..')
    : process.cwd();
  const enhancedMappingPath = resolve(
    baseDir,
    'scripts/magic-numbers/enhanced-codex-mapping.json',
  );
  const fallbackMappingPath = resolve(
    baseDir,
    'scripts/magic-numbers/codex-mapping.json',
  );

  try {
    let content: string;

    try {
      content = readFileSync(enhancedMappingPath, 'utf-8');
      console.log('📋 使用增强版CODEX映射');
    } catch {
      content = readFileSync(fallbackMappingPath, 'utf-8');
      console.log('📋 使用原始CODEX映射');
    }

    const data = JSON.parse(content);

    // 过滤掉元数据字段
    const mapping: Record<string, MappingEntry> = {};
    for (const [key, value] of Object.entries(data)) {
      if (!key.startsWith('_')) {
        if (typeof value === 'string') {
          // 兼容原始格式
          mapping[key] = {
            export: value,
            module: '@/constants/magic-numbers',
            source: '原始CODEX映射',
            type: 'codex-legacy',
          };
        } else if (typeof value === 'object' && value !== null) {
          // 增强格式
          mapping[key] = value as MappingEntry;
        }
      }
    }

    return mapping;
  } catch (error) {
    console.error('❌ 无法加载映射文件:', error);
    return {};
  }
}

/**
 * 兼容性函数：获取简单的字符串映射
 */
export function loadMapping(): Record<string, string> {
  const enhancedMapping = loadEnhancedMapping();
  const simpleMapping: Record<string, string> = {};

  for (const [key, entry] of Object.entries(enhancedMapping)) {
    simpleMapping[key] = entry.export;
  }

  return simpleMapping;
}

/**
 * 规范化数字字符串
 * 处理科学计数法、数字分隔符等
 */
export function normalize(text: string): string {
  // 移除数字分隔符 (1_000 -> 1000)
  const withoutSeparators = text.replace(/_/g, '');

  // 转换为数字再转回字符串以规范化格式
  const num = parseFloat(withoutSeparators);

  // 处理整数和小数
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toString();
}

/**
 * 确保常量已定义 - 支持增强版映射格式
 */
export function ensureConstDefined(
  map: Record<string, MappingEntry | string>,
  text: string,
) {
  const normalized = normalize(text);
  const entry = map[normalized];

  if (!entry) {
    return { constantName: '', isSupported: false, module: '' };
  }

  // 兼容旧格式（字符串）
  if (typeof entry === 'string') {
    return {
      constantName: entry,
      isSupported: true,
      module: '@/constants/magic-numbers',
    };
  }

  // 新格式（MappingEntry对象）
  return {
    constantName: entry.export,
    isSupported: true,
    module: entry.module,
  };
}

/**
 * CODEX分层治理：判断是否应该跳过该节点
 * 跳过类型域、BigInt、字符串/模板/JSX/正则/注释、测试文件、数据型数字等
 */
export function shouldSkipNode(node: Node): boolean {
  const { compilerNode } = node;
  const sourceFile = node.getSourceFile();
  const filePath = sourceFile.getFilePath();

  // 1. 路径过滤：跳过测试文件、夹具、Mock等
  if (shouldSkipByPath(filePath)) {
    return true;
  }

  // 2. 跳过 BigInt 字面量
  if (ts.isBigIntLiteral(compilerNode)) {
    return true;
  }

  // 3. 跳过常量定义文件和单位工具库，避免循环引用
  if (
    filePath.includes('constants/magic-numbers.ts') ||
    filePath.includes('constants/count.ts') ||
    filePath.includes('constants/decimal.ts') ||
    filePath.includes('constants/hex.ts') ||
    filePath.includes('constants/time.ts') ||
    filePath.includes('lib/units.ts') ||
    filePath.includes('constants/app-constants.ts') ||
    filePath.includes('constants/performance-constants.ts') ||
    filePath.includes('constants/security-constants.ts') ||
    filePath.includes('constants/i18n-constants.ts') ||
    filePath.includes('constants/performance.ts') ||
    (filePath.includes('constants/') && filePath.includes('-constants.ts'))
  ) {
    return true;
  }

  // 4. 语境过滤：跳过类型域、字符串等
  if (shouldSkipByContext(node)) {
    return true;
  }

  // 5. 数值形态过滤：跳过数据型数字
  const text = node.getText();
  const num = parseFloat(text);
  if (shouldSkipByNumericPattern(num, text)) {
    return true;
  }

  // 6. 语义键名过滤：根据属性名判断是否为坐标等数据
  if (shouldSkipBySemanticContext(node)) {
    return true;
  }

  // 7. 方法调用语境过滤：跳过特定方法调用中的参数
  if (shouldSkipByMethodContext(node)) {
    return true;
  }

  // 8. 语义不匹配过滤：根据变量名和上下文判断语义
  if (shouldSkipBySemanticMismatch(node)) {
    return true;
  }

  return false;
}

/**
 * 路径过滤：跳过测试文件、夹具、Mock等
 */
function shouldSkipByPath(filePath: string): boolean {
  const skipPatterns = [
    // 测试文件
    /\.test\.(js|jsx|ts|tsx)$/,
    /__tests__\//,
    /\/tests?\//,
    /\/e2e\//,

    // 夹具和Mock
    /__fixtures__\//,
    /\/mocks?\//,
    /\/fixtures?\//,

    // 配置和脚本（部分豁免）
    /\/scripts\//,
    /\.config\.(js|ts|mjs)$/,

    // 类型定义文件
    /\.d\.ts$/,
    /@types\//,

    // CODEX分层治理：扩展测试相关文件
    /test-.*\.ts$/,
    /test-.*\.tsx$/,
    /\/test-/,
    /-test\./,
    /constants\/test-/,
    /constants.*test/,

    // 开发工具和诊断文件
    /dev-tools/,
    /diagnostics/,
    /react-scan/,

    // 配置文件（应该使用配置集中化）
    /config\/app\.ts$/,

    // CODEX分层治理：内容型数据文件豁免
    /lib\/site-config\.ts$/,
    /lib\/colors\/.*\.ts$/,
    /lib\/translation-benchmarks\.ts$/,
    /lib\/.*-benchmarks\.ts$/,

    // API路由中的业务数据
    /app\/api\/.*\/route\.ts$/,

    // 类型定义中的配置数据
    /types\/.*-config\/.*\.ts$/,
  ];

  return skipPatterns.some((pattern) => pattern.test(filePath));
}

/**
 * 语境过滤：跳过类型域、字符串、模板、JSX等
 */
function shouldSkipByContext(node: Node): boolean {
  const parent = node.getParent();
  if (!parent) return true;

  const parentNode = parent.compilerNode;

  // 跳过类型域中的字面量
  if (ts.isLiteralTypeNode(parentNode)) {
    return true;
  }

  // 跳过字符串字面量中的内容
  if (
    ts.isStringLiteral(parentNode) ||
    ts.isNoSubstitutionTemplateLiteral(parentNode)
  ) {
    return true;
  }

  // 跳过模板字面量的非表达式部分
  if (
    ts.isTemplateHead(parentNode) ||
    ts.isTemplateMiddle(parentNode) ||
    ts.isTemplateTail(parentNode)
  ) {
    return true;
  }

  // 跳过正则表达式
  if (ts.isRegularExpressionLiteral(parentNode)) {
    return true;
  }

  // 跳过 JSX 文本和属性
  if (ts.isJsxText(parentNode) || ts.isJsxAttribute(parentNode)) {
    return true;
  }

  // 跳过注释（通过检查父节点的 trivia）
  const sourceFile = node.getSourceFile();
  const start = node.getStart();
  const fullStart = node.getFullStart();

  if (start !== fullStart) {
    const triviaText = sourceFile.getFullText().slice(fullStart, start);
    if (triviaText.includes('//') || triviaText.includes('/*')) {
      return true;
    }
  }

  return false;
}

/**
 * 数值形态过滤：跳过数据型数字
 */
function shouldSkipByNumericPattern(num: number, text: string): boolean {
  // 1. 时间戳过滤：13位毫秒时间戳
  if (isTimestampMs(num)) {
    return true;
  }

  // 2. 长小数过滤：精度测试用的长小数
  if (isLongDecimal(text)) {
    return true;
  }

  // 3. 大整数过滤：ID、计数等
  if (isHugeInteger(num)) {
    return true;
  }

  // 4. 地理坐标范围过滤 (临时禁用用于测试)
  // if (isCoordinateRange(num)) {
  //   return true;
  // }

  // 5. CODEX分层治理：常见数字豁免 (临时禁用用于测试)
  // if (isCommonNumber(num)) {
  //   return true;
  // }

  // 6. 测试数据过滤
  if (isTestData(num)) {
    return true;
  }

  // 7. 配置数字过滤（应该用配置集中化）
  if (isConfigNumber(num)) {
    return true;
  }

  return false;
}

/**
 * 方法调用语境过滤：跳过特定方法调用中的参数
 */
function shouldSkipByMethodContext(node: Node): boolean {
  const parent = node.getParent();
  if (!parent) return false;

  // 检查是否在方法调用中
  let current = parent;
  while (current && !ts.isCallExpression(current.compilerNode)) {
    current = current.getParent();
    if (!current) return false;
  }

  if (!current || !ts.isCallExpression(current.compilerNode)) {
    return false;
  }

  const callExpression = current.compilerNode as ts.CallExpression;
  const callText = current.getText();

  // 跳过进制转换方法
  if (callText.includes('.toString(') && node.getText() === '36') {
    return true;
  }

  // 跳过数组切片方法
  if (
    callText.includes('.slice(') &&
    (node.getText() === '500' || node.getText() === '-500')
  ) {
    return true;
  }

  // 跳过数学运算方法
  if (
    callText.includes('Math.') &&
    ['36', '16', '10', '2'].includes(node.getText())
  ) {
    return true;
  }

  // 跳过时间戳和随机数生成
  if (callText.includes('Date.now()') || callText.includes('Math.random()')) {
    return true;
  }

  return false;
}

/**
 * 语义不匹配过滤：根据变量名和上下文判断语义是否匹配
 */
function shouldSkipBySemanticMismatch(node: Node): boolean {
  const value = node.getText();
  const parent = node.getParent();
  if (!parent) return false;

  // 获取上下文信息
  const contextText = parent.getText().toLowerCase();

  // HTTP状态码语义检查
  if (['200', '400', '401', '404', '500'].includes(value)) {
    // 如果上下文包含动画、持续时间、延迟等关键词，跳过HTTP状态码映射
    const animationKeywords = [
      'animation',
      'duration',
      'delay',
      'timeout',
      'interval',
      'transition',
      'easing',
      'timing',
      'debounce',
      'throttle',
    ];

    if (animationKeywords.some((keyword) => contextText.includes(keyword))) {
      return true;
    }
  }

  // 动画持续时间语义检查
  if (['300', '500', '1000'].includes(value)) {
    // 如果上下文包含HTTP、状态、响应等关键词，跳过动画持续时间映射
    const httpKeywords = [
      'http',
      'status',
      'response',
      'request',
      'api',
      'error',
      'success',
      'fail',
      'code',
      'result',
    ];

    if (httpKeywords.some((keyword) => contextText.includes(keyword))) {
      return true;
    }
  }

  // 尺寸和像素值语义检查
  if (['640', '768', '1024', '1280', '1920'].includes(value)) {
    // 如果上下文不包含屏幕、宽度、断点等关键词，可能是其他用途
    const sizeKeywords = [
      'width',
      'height',
      'screen',
      'breakpoint',
      'viewport',
      'resolution',
      'size',
      'dimension',
    ];

    if (!sizeKeywords.some((keyword) => contextText.includes(keyword))) {
      // 进一步检查是否为时间戳或其他数据
      if (
        contextText.includes('timestamp') ||
        contextText.includes('time') ||
        contextText.includes('date') ||
        contextText.includes('id')
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 语义键名过滤：根据属性名判断是否为坐标等数据
 */
function shouldSkipBySemanticContext(node: Node): boolean {
  // 查找父级属性名或变量名
  let current = node.getParent();
  let depth = 0;
  const maxDepth = 3; // 最多向上查找3层

  while (current && depth < maxDepth) {
    const currentNode = current.compilerNode;

    // 检查属性赋值：{ lat: 39.9042 }
    if (ts.isPropertyAssignment(currentNode)) {
      const propertyName = currentNode.name;
      if (ts.isIdentifier(propertyName) || ts.isStringLiteral(propertyName)) {
        const name = propertyName.getText().toLowerCase();
        if (isCoordinatePropertyName(name)) {
          return true;
        }
      }
    }

    // 检查变量声明：const lat = 39.9042
    if (ts.isVariableDeclaration(currentNode)) {
      const { name } = currentNode;
      if (ts.isIdentifier(name)) {
        const varName = name.getText().toLowerCase();
        if (isCoordinatePropertyName(varName)) {
          return true;
        }
      }
    }

    current = current.getParent();
    depth++;
  }

  return false;
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 判断是否为时间戳（13位毫秒）
 */
function isTimestampMs(num: number): boolean {
  return num >= 1_000_000_000_000 && num < 2_000_000_000_000;
}

/**
 * 判断是否为长小数（精度测试用）
 */
function isLongDecimal(text: string): boolean {
  return /\.\d{4,}$/.test(text);
}

/**
 * 判断是否为大整数（ID、计数等）
 */
function isHugeInteger(num: number): boolean {
  return Number.isInteger(num) && Math.abs(num) >= 1_000_000;
}

/**
 * 判断是否在地理坐标范围内
 */
function isCoordinateRange(num: number): boolean {
  // 纬度范围 -90 到 90，经度范围 -180 到 180
  return num >= -180 && num <= 180 && num % 1 !== 0; // 有小数部分
}

/**
 * 判断属性名是否为坐标相关
 */
function isCoordinatePropertyName(name: string): boolean {
  const coordinatePatterns = [
    /^(lat|latitude)$/i,
    /^(lng|lon|longitude)$/i,
    /^(x|y)$/i,
    /coord/i,
    /position/i,
    /location/i,
  ];

  return coordinatePatterns.some((pattern) => pattern.test(name));
}

/**
 * CODEX分层治理：判断是否为常见数字（应该豁免）
 */
function isCommonNumber(num: number): boolean {
  // 基础数字
  if (num >= 0 && num <= 10) return true;

  // 常见小数字
  if ([12, 15, 16, 20, 24, 25, 30, 32, 40, 42, 45, 49, 50].includes(num))
    return true;

  // 百分比相关
  if ([60, 65, 70, 75, 80, 85, 90, 95, 99, 100].includes(num)) return true;

  // 尺寸和像素
  if ([120, 128, 150, 160, 190, 250, 256, 300, 360, 365].includes(num))
    return true;

  // 数据大小
  if ([512, 640, 700, 750, 768, 800, 900].includes(num)) return true;

  // 大数字和时间
  if ([1000, 1024, 1200, 1280, 1500, 1536, 1600, 1800, 1920].includes(num))
    return true;
  if (
    [
      2000, 2048, 2500, 3000, 4000, 4096, 5000, 6000, 7000, 8000, 8192, 9000,
    ].includes(num)
  )
    return true;
  if ([10000, 12000, 15000, 30000, 45000, 50000, 60000, 65536].includes(num))
    return true;
  if ([100000, 120000, 125000, 170000, 200000, 300000, 500000].includes(num))
    return true;

  return false;
}

/**
 * 判断是否为测试数据
 */
function isTestData(num: number): boolean {
  return (
    [42, 999, 1234, 12345, 996, 997, 998].includes(num) ||
    (num >= 131000 && num <= 131100)
  ); // WhatsApp错误码范围
}

/**
 * 判断是否为配置数字（端口、超时等）
 */
function isConfigNumber(num: number): boolean {
  // 端口号
  if ([8888, 8900].includes(num)) return true;

  // HTTP状态码（低频）
  if ([403, 429, 503].includes(num)) return true;

  return false;
}

/**
 * 模块化导入处理 - 支持多模块导入
 * 根据映射信息将常量导入到对应的模块
 */
export function mergeAndAliasImports(
  sourceFile: SourceFile,
  constantsWithModules: Array<{ constant: string; module: string }>,
  log: { imports: { added: string[]; aliased: Record<string, string> } },
): void {
  if (constantsWithModules.length === 0) return;

  // 按模块分组常量
  const moduleGroups = new Map<string, string[]>();
  constantsWithModules.forEach(({ constant, module }) => {
    if (!moduleGroups.has(module)) {
      moduleGroups.set(module, []);
    }
    moduleGroups.get(module)!.push(constant);
  });

  // 处理每个模块的导入
  moduleGroups.forEach((constants, module) => {
    processModuleImports(sourceFile, module, constants, log);
  });
}

/**
 * 处理单个模块的导入
 */
function processModuleImports(
  sourceFile: SourceFile,
  module: string,
  newConstants: string[],
  log: { imports: { added: string[]; aliased: Record<string, string> } },
): void {
  // 获取现有的导入声明
  const existingImports = sourceFile
    .getImportDeclarations()
    .filter((imp) => imp.getModuleSpecifierValue() === module);

  // 收集现有的导入名称
  const existingNames = new Set<string>();
  existingImports.forEach((imp) => {
    const namedImports = imp.getNamedImports();
    namedImports.forEach((namedImport) => {
      existingNames.add(namedImport.getName());
    });
  });

  // 检查本地作用域中的标识符冲突（排除我们刚刚添加的常量）
  const localIdentifiers = new Set<string>();
  const newConstantNames = new Set(newConstants);

  sourceFile
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .forEach((identifier) => {
      const identifierText = identifier.getText();
      // 排除我们刚刚添加的常量名，避免误判为冲突
      if (!newConstantNames.has(identifierText)) {
        localIdentifiers.add(identifierText);
      }
    });

  // 处理新常量，生成别名如果需要
  const finalImports: string[] = [];
  const aliasMap: Record<string, string> = {};

  [...existingNames, ...newConstants].forEach((constName) => {
    if (localIdentifiers.has(constName) && !existingNames.has(constName)) {
      // 需要别名
      const aliasName = `${constName}_CONST`;
      finalImports.push(`${constName} as ${aliasName}`);
      aliasMap[constName] = aliasName;
      log.imports.aliased[constName] = aliasName;
    } else {
      finalImports.push(constName);
      if (!existingNames.has(constName)) {
        log.imports.added.push(constName);
      }
    }
  });

  // 移除所有现有的导入
  existingImports.forEach((imp) => imp.remove());

  // 添加新的合并导入
  if (finalImports.length > 0) {
    const sortedImports = [...new Set(finalImports)].sort();
    sourceFile.addImportDeclaration({
      moduleSpecifier: module,
      namedImports: sortedImports,
    });
  }

  // 如果有别名，需要替换对应的引用
  Object.entries(aliasMap).forEach(([original, alias]) => {
    sourceFile
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .filter((identifier) => identifier.getText() === original)
      .forEach((identifier) => {
        identifier.replaceWithText(alias);
      });
  });

  // 组织导入
  sourceFile.organizeImports();
}
