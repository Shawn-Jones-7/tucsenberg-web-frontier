import { PERCENTAGE_FULL } from "@/constants/magic-numbers";

/**
 * 语言存储系统配置迁移
 * Locale Storage System Configuration Migrations
 */

/**
 * 配置迁移映射
 * Configuration migration mapping
 */
export interface ConfigMigration {
  fromVersion: string;
  toVersion: string;
  migrations: Array<{
    path: string;
    action: 'rename' | 'move' | 'transform' | 'delete' | 'add';
    from?: string;
    to?: string;
    transform?: (value: unknown) => unknown;
    defaultValue?: unknown;
  }>;
}

/**
 * 配置迁移历史
 * Configuration migration history
 */
export const CONFIG_MIGRATIONS: ConfigMigration[] = [
  {
    fromVersion: '1.0.0',
    toVersion: '1.1.0',
    migrations: [
      {
        path: 'enableMemoryCache',
        action: 'add',
        defaultValue: true,
      },
      {
        path: 'performance.throttleDelay',
        action: 'add',
        defaultValue: PERCENTAGE_FULL,
      },
    ],
  },
  {
    fromVersion: '1.1.0',
    toVersion: '2.0.0',
    migrations: [
      {
        path: 'maxEntries',
        action: 'move',
        to: 'performance.maxEntries',
      },
      {
        path: 'maxSize',
        action: 'move',
        to: 'performance.maxSize',
      },
      {
        path: 'compressionEnabled',
        action: 'transform',
        to: 'compression.enabled',
        transform: (value: unknown) => Boolean(value),
      },
    ],
  },
];
