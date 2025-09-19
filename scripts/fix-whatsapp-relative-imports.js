#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 修复WhatsApp类型文件中的相对路径导入问题
 * 将 './whatsapp-xxx' 替换为 '@/types/whatsapp-xxx'
 */

const filesToFix = [
  'src/types/whatsapp-service-types.ts',
  'src/types/whatsapp-webhook-events.ts',
  'src/types/whatsapp-webhook-types.ts',
  'src/types/whatsapp-api-requests/api-types.ts',
  'src/types/whatsapp-api-config.ts',
  'src/types/whatsapp-webhook-utils.ts',
  'src/types/__tests__/index.test.ts',
  'src/types/whatsapp.ts',
  'src/types/index.ts',
  'src/types/whatsapp-service-interface.ts',
  'src/types/whatsapp-webhook-utils/webhook-utils.ts',
];

function fixRelativeImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let changeCount = 0;

  // 修复相对路径导入
  // 将 './whatsapp-xxx' 替换为 '@/types/whatsapp-xxx'
  modifiedContent = modifiedContent.replace(
    /from\s+['"]\.\/whatsapp-([^'"]+)['"]/g,
    (match, moduleName) => {
      changeCount++;
      return `from '@/types/whatsapp-${moduleName}'`;
    },
  );

  // 修复相对路径导入 - 处理子目录情况
  // 将 './whatsapp-xxx/yyy' 替换为 '@/types/whatsapp-xxx/yyy'
  modifiedContent = modifiedContent.replace(
    /from\s+['"]\.\/whatsapp-([^'"]+\/[^'"]+)['"]/g,
    (match, modulePath) => {
      changeCount++;
      return `from '@/types/whatsapp-${modulePath}'`;
    },
  );

  // 修复其他相对路径导入
  // 将 './interfaces' 等替换为 '@/types/whatsapp-webhook-utils/interfaces'
  if (filePath.includes('whatsapp-webhook-utils')) {
    modifiedContent = modifiedContent.replace(
      /from\s+['"]\.\/interfaces['"]/g,
      () => {
        changeCount++;
        return `from '@/types/whatsapp-webhook-utils/interfaces'`;
      },
    );

    modifiedContent = modifiedContent.replace(
      /from\s+['"]\.\/functions['"]/g,
      () => {
        changeCount++;
        return `from '@/types/whatsapp-webhook-utils/functions'`;
      },
    );
  }

  // 修复上级目录的相对路径导入
  // 将 '../whatsapp-xxx' 替换为 '@/types/whatsapp-xxx'
  modifiedContent = modifiedContent.replace(
    /from\s+['"]\.\.\/whatsapp-([^'"]+)['"]/g,
    (match, moduleName) => {
      changeCount++;
      return `from '@/types/whatsapp-${moduleName}'`;
    },
  );

  if (changeCount > 0) {
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    console.log(`✅ 修复 ${filePath}: ${changeCount} 个导入路径`);
  } else {
    console.log(`⏭️  跳过 ${filePath}: 无需修复`);
  }
}

function main() {
  console.log('🔧 开始修复WhatsApp类型文件的相对路径导入...\n');

  let totalFixed = 0;

  filesToFix.forEach((filePath) => {
    try {
      fixRelativeImports(filePath);
      totalFixed++;
    } catch (error) {
      console.error(`❌ 修复失败 ${filePath}:`, error.message);
    }
  });

  console.log(`\n🎉 修复完成! 处理了 ${totalFixed} 个文件`);
}

if (require.main === module) {
  main();
}

module.exports = { fixRelativeImports };
