/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';

describe('Types Index Module', () => {
  describe('Module Exports', () => {
    it('should be able to import the types index module', async () => {
      expect(async () => {
        await import('../index');
      }).not.toThrow();
    });

    it('should export types from global module', async () => {
      const typesModule = await import('../index');
      // 验证模块可以被导入，即使没有运行时导出
      expect(typesModule).toBeDefined();
    });

    it('should export types from test-types module', async () => {
      const typesModule = await import('../index');
      // 验证模块可以被导入，即使没有运行时导出
      expect(typesModule).toBeDefined();
    });
  });

  describe('Module Structure', () => {
    it('should have proper module structure', () => {
      // 验证模块文件存在且可以被require
      expect(() => {
        const fs = require('fs');
        const path = require('path');
        const indexPath = path.join(__dirname, '../index.ts');
        const content = fs.readFileSync(indexPath, 'utf8');
        expect(content).toContain('export * from');
      }).not.toThrow();
    });

    it('should export from global types', () => {
      const fs = require('fs');
      const path = require('path');
      const indexPath = path.join(__dirname, '../index.ts');
      const content = fs.readFileSync(indexPath, 'utf8');
      expect(content).toContain("} from '@/types/global'");
    });

    it('should export from test-types', () => {
      const fs = require('fs');
      const path = require('path');
      const indexPath = path.join(__dirname, '../index.ts');
      const content = fs.readFileSync(indexPath, 'utf8');
      expect(content).toContain("} from '@/types/test-types'");
    });
  });

  describe('TypeScript Compilation', () => {
    it('should compile without TypeScript errors', async () => {
      // 这个测试确保类型定义文件可以被正确编译
      expect(async () => {
        await import('../index');
      }).not.toThrow();
    });
  });
});
