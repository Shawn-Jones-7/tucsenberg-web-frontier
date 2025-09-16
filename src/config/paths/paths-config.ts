/**
 * 核心路径配置
 */

import type { LocalizedPath, PageType } from '@/config/paths/types';

// 核心路径配置 - 使用标准路径方案
export const PATHS_CONFIG = Object.freeze({
  // 基础路径
  home: Object.freeze({
    en: '/',
    zh: '/',
  }),

  // 主要页面路径 - 统一使用标准路径
  about: Object.freeze({
    en: '/about',
    zh: '/about',
  }),

  contact: Object.freeze({
    en: '/contact',
    zh: '/contact',
  }),

  blog: Object.freeze({
    en: '/blog',
    zh: '/blog',
  }),

  products: Object.freeze({
    en: '/products',
    zh: '/products',
  }),

  diagnostics: Object.freeze({
    en: '/diagnostics',
    zh: '/diagnostics',
  }),

  services: Object.freeze({
    en: '/services',
    zh: '/services',
  }),

  pricing: Object.freeze({
    en: '/pricing',
    zh: '/pricing',
  }),

  support: Object.freeze({
    en: '/support',
    zh: '/support',
  }),

  // 法律页面 - 统一使用标准路径
  privacy: Object.freeze({
    en: '/privacy',
    zh: '/privacy',
  }),

  terms: Object.freeze({
    en: '/terms',
    zh: '/terms',
  }),
} as const satisfies Record<PageType, LocalizedPath>);

export type PathsConfig = typeof PATHS_CONFIG;
