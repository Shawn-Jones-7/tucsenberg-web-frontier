/**
 * CODEX分层治理：魔法数字常量库 - 叶子常量聚合模式
 *
 * 🎯 设计原则：仅聚合无依赖的叶子常量模块，避免循环导入
 * 📊 优化效果：通过re-export模式，聚合基础常量，保持单一入口
 * 🔄 配合ESLint规则豁免和单位工具库，实现分层治理
 *
 * ⚠️  重要：此文件仅聚合叶子常量模块，不可re-export任何会依赖本文件的模块
 * 📝 叶子常量分布：
 *     - 时间相关：./time
 *     - 十六进制：./hex
 *     - 计数相关：./count
 *     - 小数相关：./decimal
 *
 * 更新时间: 2025-09-17T16:52:11.363Z
 * 聚合模式: Leaf Constants Aggregation Pattern
 */

// ============================================================================
// 🔄 叶子常量聚合 - 仅聚合无依赖的基础常量模块
// ============================================================================

// 基础领域常量文件 - 无循环依赖
export * from './time';
export * from './hex';
export * from './count';
export * from './decimal';

// ============================================================================
// 🔴 核心业务常量 - 保留在此文件的高频核心常量
// ============================================================================

// 基础数值常量 - 高频使用
export const ZERO = 0;
export const ONE = 1;

// HTTP状态码 - API交互核心常量
export const HTTP_OK = 200;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED = 401;

// HTTP状态码别名 (兼容历史命名)
export const HTTP_OK_CONST = HTTP_OK;
export const HTTP_BAD_REQUEST_CONST = HTTP_BAD_REQUEST;

// 响应式断点 - 移动端适配核心 (像素)
export const BREAKPOINT_SM = 640;
export const BREAKPOINT_MD = 768;
export const BREAKPOINT_XL = 1280;
export const BREAKPOINT_FULL_HD = 1920;

// 动画持续时间 - 用户体验相关 (毫秒)
export const ANIMATION_DURATION_NORMAL = 300;
export const ANIMATION_DURATION_SLOW = 500;
export const ANIMATION_DURATION_VERY_SLOW = 1000;

// 数据大小 - 性能和存储相关 (字节)
export const BYTES_PER_KB = 1024;

// 角度常量 - 图形和动画相关 (度)
export const ANGLE_90_DEG = 90;
export const ANGLE_360_DEG = 360;

// ============================================================================
// 📝 Facade聚合模式使用指南
// ============================================================================

/**
 * 常量使用方式：
 *
 * 1. 统一导入入口：
 *    import { MAGIC_36, DAYS_PER_WEEK, HEX_BYTE_MAX } from '@/constants/magic-numbers';
 *
 * 2. 按领域导入（可选）：
 *    import { DAYS_PER_WEEK } from '@/constants/time';
 *    import { HEX_BYTE_MAX } from '@/constants/hex';
 *
 * 3. 时间相关 → 优先使用领域常量或单位工具库
 *    import { seconds, minutes } from '@/lib/units';
 *    setTimeout(callback, seconds(5));  // 替代 5000
 *
 * 4. 测试文件 → ESLint规则豁免
 *    测试文件中的数字通过ESLint配置自动豁免
 *
 * 5. 配置文件 → 环境变量或配置集中化
 *    端口、超时等配置值迁移到 .env 或 src/config/app.ts
 *
 * 6. 低频数字 → 局部常量
 *    const RETRY_COUNT = 3;  // 文件内局部常量
 */
