/**
 * 网站配置常量
 * 集中管理所有硬编码的数值和配置
 */

import { SITE_CONFIG } from '@/config/paths/site-config';

// 项目统计数据
export const PROJECT_STATS = {
  // 技术栈统计
  techStack: {
    totalTechnologies: 22,
    categories: 14,
    modernScore: '100%',
    qualityGrade: 'A+',
  },

  // 性能指标
  performance: {
    grade: 'A+',
    securityScore: '100%',
    languages: 2,
    themes: 'Multiple',
    typescriptVersion: 'TS 5.9.3',
    deployment: 'Vercel',
  },

  // 社区数据
  community: {
    initialLikeCount: 42,
    githubStars: '1.2k+',
    contributors: '10+',
    downloads: '5k+',
  },
} as const;

// 项目链接
export const PROJECT_LINKS = {
  github: SITE_CONFIG.social.github,
  documentation: '/docs',
  demo: '/demo',
  discussions: `${SITE_CONFIG.social.github}/discussions`,
} as const;

// 技术架构配置
export const TECH_ARCHITECTURE = {
  frontend: {
    title: 'Frontend',
    technologies: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS'],
    color: 'blue',
  },
  ui: {
    title: 'UI System',
    technologies: ['shadcn/ui', 'Radix UI', 'Lucide Icons', 'CSS Variables'],
    color: 'green',
  },
  tooling: {
    title: 'Development',
    technologies: ['ESLint', 'Prettier', 'Lefthook', 'Vitest'],
    color: 'purple',
  },
} as const;

// 响应式断点配置
export const RESPONSIVE_BREAKPOINTS = {
  mobile: {
    title: 'Mobile First',
    description: '移动端优先的响应式设计',
    icon: 'User',
  },
  tablet: {
    title: 'Tablet Optimized',
    description: '平板设备优化体验',
    icon: 'Mail',
  },
  desktop: {
    title: 'Desktop Enhanced',
    description: '桌面端增强功能',
    icon: 'Settings',
  },
} as const;

// 主题配置
export const THEME_CONFIG = {
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    muted: 'hsl(var(--muted))',
    accent: 'hsl(var(--accent))',
  },
  typography: {
    weights: ['bold', 'medium', 'normal', 'muted'],
  },
} as const;

// 动画配置
export const ANIMATION_CONFIG = {
  intersection: {
    threshold: 0.2,
    triggerOnce: true,
  },
  transitions: {
    duration: 700,
    easing: 'ease-out',
  },
} as const;
