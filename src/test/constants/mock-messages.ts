/**
 * 集中测试 Mock 消息
 *
 * 此文件提供统一的测试消息源,按命名空间组织,减少重复定义和维护成本。
 * 消息内容基于 messages/en.json 和 messages/en/critical.json 提取。
 *
 * @usage
 * ```typescript
 * // 导入全部消息
 * import { combinedMessages } from '@/test/constants/mock-messages';
 *
 * // 导入特定命名空间
 * import { navigationMessages, commonMessages } from '@/test/constants/mock-messages';
 *
 * // 在测试中使用
 * renderWithIntl(<Component />, 'en', combinedMessages);
 * ```
 *
 * @see docs/test-mock-inventory.md - 完整盘点报告
 */

/**
 * Common 命名空间 - 通用消息
 * 包含常见的 UI 动作、状态文本
 */
export const commonMessages = {
  loading: 'Loading...',
  error: 'An error occurred',
  success: 'Success',
  cancel: 'Cancel',
  confirm: 'Confirm',
  save: 'Save',
  edit: 'Edit',
  delete: 'Delete',
  search: 'Search',
  filter: 'Filter',
  sort: 'Sort',
  next: 'Next',
  previous: 'Previous',
  close: 'Close',
  open: 'Open',
  toast: {
    form: {
      contact: {
        success: 'Message sent successfully!',
        successDescription:
          "Thank you for your message. We'll get back to you soon.",
        error: 'Failed to send message',
        errorDescription: 'Please try again later or contact us directly.',
        loading: 'Sending message...',
      },
      newsletter: {
        success: 'Successfully subscribed!',
        successDescription: 'Thank you for subscribing to our newsletter.',
        error: 'Subscription failed',
        errorDescription: 'Please check your email and try again.',
        loading: 'Subscribing...',
      },
      feedback: {
        success: 'Feedback submitted!',
        successDescription: 'Thank you for your valuable feedback.',
        error: 'Failed to submit feedback',
        errorDescription: 'Please try again later.',
        loading: 'Submitting feedback...',
      },
    },
  },
} as const;

/**
 * Navigation 命名空间 - 导航相关消息
 * 包含主导航、移动导航的所有链接文本和描述
 */
export const navigationMessages = {
  home: 'Home',
  about: 'About',
  contact: 'Contact',
  contactSales: 'Contact Sales',
  services: 'Services',
  products: 'Products',
  solutions: 'Solutions',
  resources: 'Resources',
  enterprise: 'Enterprise',
  docs: 'Docs',
  pricing: 'Pricing',
  blog: 'Blog',
  login: 'Login',
  logout: 'Logout',
  profile: 'Profile',
  settings: 'Settings',
  frameworks: 'Frameworks',
  infrastructure: 'Infrastructure',
  security: 'Security',
  aiApps: 'AI Apps',
  webApps: 'Web Apps',
  ecommerce: 'Ecommerce',
  guides: 'Guides',
  frameworksDescription: 'Build with the best frameworks',
  infrastructureDescription: 'Scalable and reliable infrastructure',
  securityDescription: 'Enterprise-grade security',
  aiAppsDescription: 'Deploy AI applications at scale',
  webAppsDescription: 'Modern web application platform',
  ecommerceDescription: 'Power your online store',
  docsDescription: 'Complete documentation and guides',
  guidesDescription: 'Step-by-step tutorials',
  blogDescription: 'Latest updates and insights',
  menu: 'Menu',
  close: 'Close',
} as const;

/**
 * Accessibility 命名空间 - 无障碍访问消息
 * 用于屏幕阅读器、键盘导航等无障碍功能
 */
export const accessibilityMessages = {
  skipToContent: 'Skip to main content',
  openMenu: 'Open navigation menu',
  closeMenu: 'Close navigation menu',
  loading: 'Content is loading',
  error: 'An error has occurred',
  languageSelector: 'Select language',
  themeSelector: 'Select theme',
} as const;

/**
 * Theme 命名空间 - 主题切换相��消息
 * 包含主题选择器、主题模式文本
 */
export const themeMessages = {
  toggle: 'Toggle theme',
  toggleLabel: 'Theme toggle',
  light: 'Light',
  dark: 'Dark',
  system: 'System',
  selectTheme: 'Select display theme',
  selectDisplayTheme: 'Select a display theme:',
  switchToLight: 'Switch to light theme',
  switchToDark: 'Switch to dark theme',
  switchToSystem: 'Switch to system theme',
} as const;

/**
 * Language 命名空间 - 语言切换相关消息
 * 包含语言选择器、切换状态、检测信息
 */
export const languageMessages = {
  toggle: 'Toggle language',
  selectLanguage: 'Select Language',
  english: 'English',
  chinese: '中文',
  switching: 'Switching language...',
  switchSuccess: 'Language switched successfully',
  switchError: 'Failed to switch language',
  fallbackWarning:
    'Some content may not be available in your selected language',
  detectionInfo: 'Detection Info',
  source: 'Source',
  confidence: 'Confidence',
  userPreference: 'User preference saved',
  detector: {
    title: 'Detection Info',
    source: 'Source',
    confidence: 'Confidence',
    userSaved: '✓ User preference saved',
    sources: {
      browser: 'Browser',
      cookie: 'Cookie',
      url: 'URL',
      header: 'Header',
      default: 'Default',
      user: 'User',
      stored: 'Stored',
      geo: 'Geo',
      timezone: 'Timezone',
    },
  },
} as const;

/**
 * ErrorBoundary 命名空间 - 错误边界组件消息
 * 用于全局错误处理组件
 */
export const errorBoundaryMessages = {
  title: 'An error occurred',
  description: 'Something went wrong. Please try refreshing the page.',
  tryAgain: 'Try Again',
} as const;

/**
 * SEO 命名空间 - SEO 相关元数据
 * 用于测试 metadata 生成和 SEO 组件
 */
export const seoMessages = {
  title: 'Tucsenberg Web Frontier',
  description:
    'Modern B2B Enterprise Web Platform with Next.js 15, React 19, and TypeScript',
  siteName: 'Tucsenberg Web Frontier',
  keywords: 'Next.js, React, TypeScript, B2B, Enterprise, Web Platform',
  pages: {
    home: {
      title: 'Tucsenberg Web Frontier - Modern B2B Enterprise Platform',
      description:
        'Build modern B2B applications with Next.js 15, React 19, TypeScript, and enterprise-grade features.',
    },
    about: {
      title: 'About Us - Tucsenberg Web Frontier',
      description:
        'Learn about our mission to provide cutting-edge B2B enterprise web solutions.',
    },
    contact: {
      title: 'Contact Us - Tucsenberg Web Frontier',
      description:
        'Get in touch with our team for enterprise solutions and support.',
    },
    products: {
      title: 'Products - Tucsenberg Web Frontier',
      description:
        'Discover our enterprise-grade products and solutions for modern businesses.',
    },
    blog: {
      title: 'Blog - Tucsenberg Web Frontier',
      description:
        'Latest insights, tutorials, and updates from our development team.',
    },
  },
} as const;

/**
 * Footer 命名空间 - 页脚相关消息
 * 包含页脚导航、社交链接等
 */
export const footerMessages = {
  sections: {
    product: {
      title: 'Product',
      home: 'Home',
      enterprise: 'Enterprise',
      pricing: 'Pricing',
    },
    company: {
      title: 'Company',
      terms: 'Terms',
      aiPolicy: 'AI Policy',
      privacy: 'Privacy',
    },
    resources: {
      title: 'Resources',
      faqs: 'FAQs',
      docs: 'Docs',
      ambassadors: 'Ambassadors',
      community: 'Vercel Community',
      vercel: 'Vercel',
    },
    social: {
      title: 'Social',
    },
  },
  vercel: {
    products: {
      title: 'Products',
      ai: 'AI',
      enterprise: 'Enterprise',
      fluidCompute: 'Fluid Compute',
      nextjs: 'Next.js',
      observability: 'Observability',
      previews: 'Previews',
      rendering: 'Rendering',
      security: 'Security',
      turbo: 'Turbo',
      domains: 'Domains',
      v0: 'v0',
    },
    resources: {
      title: 'Resources',
      community: 'Community',
      docs: 'Docs',
      guides: 'Guides',
      academy: 'Academy',
      help: 'Help',
      integrations: 'Integrations',
      pricing: 'Pricing',
      resources: 'Resources',
      solutionPartners: 'Solution Partners',
      startups: 'Startups',
      templates: 'Templates',
      sdks: 'SDKs by Vercel',
    },
    company: {
      title: 'Company',
      about: 'About',
      blog: 'Blog',
      careers: 'Careers',
      changelog: 'Changelog',
      contact: 'Contact Us',
      customers: 'Customers',
      events: 'Events',
      partners: 'Partners',
      shipped: 'Shipped',
      privacy: 'Privacy Policy',
      legal: 'Legal',
    },
    social: {
      title: 'Social',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      twitter: 'Twitter',
      youtube: 'YouTube',
    },
  },
} as const;

/**
 * Under Construction 命名空间 - 施工中页面消息
 * 用于测试未完成页面的占位组件
 */
export const underConstructionMessages = {
  title: 'Under Construction',
  subtitle: "We're working hard to bring you something amazing",
  description:
    "This page is currently under development. We're building something great and will have it ready soon.",
  backToHome: 'Back to Home',
  comingSoon: 'Coming Soon',
  expectedCompletion: 'Expected completion: {date}',
  expectedLaunch: 'Expected launch: {date}',
  stayTuned: 'Stay tuned for updates',
  contactUs: 'Contact us for more information',
  pages: {
    contact: {
      title: 'Contact Us',
      description:
        'Get in touch with our team for inquiries, support, or partnership opportunities.',
      features: 'Multiple ways to reach us and get the support you need',
    },
  },
} as const;

/**
 * 合并所有命名空间的完整消息对象
 * 默认导出供 renderWithIntl 等工具使用
 */
export const combinedMessages = {
  common: commonMessages,
  navigation: navigationMessages,
  accessibility: accessibilityMessages,
  theme: themeMessages,
  language: languageMessages,
  errorBoundary: errorBoundaryMessages,
  seo: seoMessages,
  footer: footerMessages,
  underConstruction: underConstructionMessages,
} as const;

/**
 * 类型导出 - 供 TypeScript 类型检查使用
 */
export type MockMessages = typeof combinedMessages;
export type CommonMessages = typeof commonMessages;
export type NavigationMessages = typeof navigationMessages;
export type AccessibilityMessages = typeof accessibilityMessages;
export type ThemeMessages = typeof themeMessages;
export type LanguageMessages = typeof languageMessages;
export type ErrorBoundaryMessages = typeof errorBoundaryMessages;
export type SeoMessages = typeof seoMessages;
export type FooterMessages = typeof footerMessages;
export type UnderConstructionMessages = typeof underConstructionMessages;

/**
 * 默认导出合并消息
 */
export default combinedMessages;
