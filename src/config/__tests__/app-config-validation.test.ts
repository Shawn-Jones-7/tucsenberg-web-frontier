import { describe, expect, it } from 'vitest';
import { getAppConfig, validateAppConfig } from '@/config/app';

describe('应用配置验证（validateAppConfig）', () => {
  it('对 getAppConfig 生成的默认配置返回 true', () => {
    // 使用当前环境变量构建应用配置
    const appConfig = getAppConfig();

    // 基本校验：所有关键数值应在合理区间内（>0 / 0-1 之间）
    const isValid = validateAppConfig(appConfig);

    expect(isValid).toBe(true);
  });
});
