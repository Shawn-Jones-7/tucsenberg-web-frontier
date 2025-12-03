/**
 * Footer 数据与样式基线（Vercel 抓取参考）
 *
 * 目标：为后续 Footer 组件提供可复用的数据结构、主题配色/间距/字体 token 与 hover 方案。
 * 采样来源：docs/vercel-style-capture.md（视口 1512px，dark/light 双主题）。
 */
import {
  FOOTER_STYLE_TOKENS,
  WHATSAPP_STYLE_TOKENS,
} from '@/config/footer-style-tokens';

export { FOOTER_STYLE_TOKENS, WHATSAPP_STYLE_TOKENS };

export interface FooterLinkItem {
  key: string;
  label: string;
  href: string;
  external?: boolean;
  /** 是否显示外链箭头图标，默认 false */
  showExternalIcon?: boolean;
  translationKey: string;
}

export interface FooterColumnConfig {
  key: string;
  title: string;
  translationKey: string;
  links: FooterLinkItem[];
}

export interface FooterLayoutTokens {
  /** 容器最大宽度（接近 Vercel 抓取的 1080px） */
  maxWidthPx: number;
  /** 左右留白：clamp(24px, 12vw, 184px) 对齐抓取数据 */
  marginXClamp: string;
  /** 内边距（与现有 layout 的 px-4/6/8 协调） */
  paddingX: {
    basePx: number;
    mdPx: number;
    lgPx: number;
  };
  /** 垂直内边距，用于保持顶部/底部留白一致 */
  paddingY: {
    basePx: number;
    mdPx: number;
    lgPx: number;
  };
  /** 网格间距 */
  gapPx: {
    column: number;
    row: number;
  };
  /** 单列最小宽度，避免窄屏拥挤 */
  minColumnWidthPx: number;
}

export interface FooterTypographyTokens {
  title: {
    fontSizePx: number;
    lineHeightPx: number;
    fontWeight: number;
    letterSpacing?: string;
  };
  link: {
    fontSizePx: number;
    lineHeightPx: number;
    fontWeight: number;
  };
  fontFamily: string;
}

export interface FooterColorTokens {
  light: {
    text: string;
    hoverText: string;
  };
  dark: {
    text: string;
    hoverText: string;
  };
  selection: {
    light: { background: string; foreground: string };
    dark: { background: string; foreground: string };
  };
}

export interface FooterHoverTokens {
  description: string;
  transition: string;
  light: {
    text: string;
    underline: boolean;
  };
  dark: {
    text: string;
    underline: boolean;
  };
}

export interface FooterStyleTokens {
  layout: FooterLayoutTokens;
  typography: FooterTypographyTokens;
  colors: FooterColorTokens;
  hover: FooterHoverTokens;
}

interface ThemedSurfaceTokens {
  background: string;
  foreground: string;
  border: string;
  hoverBackground: string;
  hoverBorder: string;
  hoverForeground: string;
  shadow: string;
}

export interface WhatsAppStyleTokens {
  sizePx: number;
  iconSizePx: number;
  borderRadiusPx: number;
  borderWidthPx: number;
  transition: string;
  focusRing: string;
  tooltip: {
    background: string;
    text: string;
  };
  pulse: {
    background: string;
    overlay: string;
  };
  light: ThemedSurfaceTokens;
  dark: ThemedSurfaceTokens;
}

export const FOOTER_COLUMNS: FooterColumnConfig[] = [
  {
    key: 'products',
    title: 'Products',
    translationKey: 'footer.vercel.products.title',
    links: [
      {
        key: 'ai',
        label: 'AI',
        href: 'https://vercel.com/ai',
        external: true,
        translationKey: 'footer.vercel.products.ai',
      },
      {
        key: 'enterprise',
        label: 'Enterprise',
        href: 'https://vercel.com/enterprise',
        external: true,
        translationKey: 'footer.vercel.products.enterprise',
      },
      {
        key: 'fluid-compute',
        label: 'Fluid Compute',
        href: 'https://vercel.com/fluid-compute',
        external: true,
        translationKey: 'footer.vercel.products.fluidCompute',
      },
      {
        key: 'nextjs',
        label: 'Next.js',
        href: 'https://nextjs.org',
        external: true,
        translationKey: 'footer.vercel.products.nextjs',
      },
      {
        key: 'observability',
        label: 'Observability',
        href: 'https://vercel.com/observability',
        external: true,
        translationKey: 'footer.vercel.products.observability',
      },
      {
        key: 'previews',
        label: 'Previews',
        href: 'https://vercel.com/previews',
        external: true,
        translationKey: 'footer.vercel.products.previews',
      },
      {
        key: 'rendering',
        label: 'Rendering',
        href: 'https://vercel.com/rendering',
        external: true,
        translationKey: 'footer.vercel.products.rendering',
      },
      {
        key: 'security',
        label: 'Security',
        href: 'https://vercel.com/security',
        external: true,
        translationKey: 'footer.vercel.products.security',
      },
      {
        key: 'turbo',
        label: 'Turbo',
        href: 'https://turbo.build',
        external: true,
        translationKey: 'footer.vercel.products.turbo',
      },
      {
        key: 'domains',
        label: 'Domains',
        href: 'https://vercel.com/domains',
        external: true,
        translationKey: 'footer.vercel.products.domains',
      },
      {
        key: 'v0',
        label: 'v0',
        href: 'https://v0.dev',
        external: true,
        showExternalIcon: true,
        translationKey: 'footer.vercel.products.v0',
      },
    ],
  },
  {
    key: 'support',
    title: 'Support',
    translationKey: 'footer.sections.support.title',
    links: [
      {
        key: 'faq',
        label: 'FAQs',
        href: '/faq',
        external: false,
        translationKey: 'footer.sections.support.faq',
      },
      {
        key: 'privacy',
        label: 'Privacy Policy',
        href: '/privacy',
        external: false,
        translationKey: 'footer.sections.support.privacy',
      },
    ],
  },
  {
    key: 'resources',
    title: 'Resources',
    translationKey: 'footer.vercel.resources.title',
    links: [
      {
        key: 'community',
        label: 'Community',
        href: 'https://community.vercel.com',
        external: true,
        showExternalIcon: true,
        translationKey: 'footer.vercel.resources.community',
      },
      {
        key: 'docs',
        label: 'Docs',
        href: 'https://vercel.com/docs',
        external: true,
        translationKey: 'footer.vercel.resources.docs',
      },
      {
        key: 'guides',
        label: 'Guides',
        href: 'https://vercel.com/guides',
        external: true,
        translationKey: 'footer.vercel.resources.guides',
      },
      {
        key: 'academy',
        label: 'Academy',
        href: 'https://vercel.com/academy',
        external: true,
        translationKey: 'footer.vercel.resources.academy',
      },
      {
        key: 'help',
        label: 'Help',
        href: 'https://vercel.com/help',
        external: true,
        translationKey: 'footer.vercel.resources.help',
      },
      {
        key: 'integrations',
        label: 'Integrations',
        href: 'https://vercel.com/integrations',
        external: true,
        translationKey: 'footer.vercel.resources.integrations',
      },
      {
        key: 'pricing',
        label: 'Pricing',
        href: 'https://vercel.com/pricing',
        external: true,
        translationKey: 'footer.vercel.resources.pricing',
      },
      {
        key: 'resources',
        label: 'Resources',
        href: 'https://vercel.com/resources',
        external: true,
        translationKey: 'footer.vercel.resources.resources',
      },
      {
        key: 'solution-partners',
        label: 'Solution Partners',
        href: 'https://vercel.com/partners/solution-partners',
        external: true,
        translationKey: 'footer.vercel.resources.solutionPartners',
      },
      {
        key: 'startups',
        label: 'Startups',
        href: 'https://vercel.com/startups',
        external: true,
        translationKey: 'footer.vercel.resources.startups',
      },
      {
        key: 'templates',
        label: 'Templates',
        href: 'https://vercel.com/templates',
        external: true,
        translationKey: 'footer.vercel.resources.templates',
      },
      {
        key: 'sdks',
        label: 'SDKs by Vercel',
        href: 'https://vercel.com/sdk',
        external: true,
        translationKey: 'footer.vercel.resources.sdks',
      },
    ],
  },
  {
    key: 'company',
    title: 'Company',
    translationKey: 'footer.vercel.company.title',
    links: [
      {
        key: 'about',
        label: 'About',
        href: 'https://vercel.com/about',
        external: true,
        translationKey: 'footer.vercel.company.about',
      },
      {
        key: 'blog',
        label: 'Blog',
        href: 'https://vercel.com/blog',
        external: true,
        translationKey: 'footer.vercel.company.blog',
      },
      {
        key: 'careers',
        label: 'Careers',
        href: 'https://vercel.com/careers',
        external: true,
        translationKey: 'footer.vercel.company.careers',
      },
      {
        key: 'changelog',
        label: 'Changelog',
        href: 'https://vercel.com/changelog',
        external: true,
        translationKey: 'footer.vercel.company.changelog',
      },
      {
        key: 'contact',
        label: 'Contact Us',
        href: 'https://vercel.com/contact',
        external: true,
        translationKey: 'footer.vercel.company.contact',
      },
      {
        key: 'customers',
        label: 'Customers',
        href: 'https://vercel.com/customers',
        external: true,
        translationKey: 'footer.vercel.company.customers',
      },
      {
        key: 'events',
        label: 'Events',
        href: 'https://vercel.com/events',
        external: true,
        translationKey: 'footer.vercel.company.events',
      },
      {
        key: 'partners',
        label: 'Partners',
        href: 'https://vercel.com/partners',
        external: true,
        translationKey: 'footer.vercel.company.partners',
      },
      {
        key: 'shipped',
        label: 'Shipped',
        href: 'https://vercel.com/changelog/shipped',
        external: true,
        translationKey: 'footer.vercel.company.shipped',
      },
      {
        key: 'privacy',
        label: 'Privacy Policy',
        href: 'https://vercel.com/legal/privacy-policy',
        external: true,
        translationKey: 'footer.vercel.company.privacy',
      },
      {
        key: 'legal',
        label: 'Legal',
        href: 'https://vercel.com/legal',
        external: true,
        translationKey: 'footer.vercel.company.legal',
      },
    ],
  },
  {
    key: 'social',
    title: 'Social',
    translationKey: 'footer.vercel.social.title',
    links: [
      {
        key: 'github',
        label: 'GitHub',
        href: 'https://github.com/vercel',
        external: true,
        translationKey: 'footer.vercel.social.github',
      },
      {
        key: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/vercel',
        external: true,
        translationKey: 'footer.vercel.social.linkedin',
      },
      {
        key: 'twitter',
        label: 'Twitter',
        href: 'https://x.com/vercel',
        external: true,
        translationKey: 'footer.vercel.social.twitter',
      },
      {
        key: 'youtube',
        label: 'YouTube',
        href: 'https://www.youtube.com/@VercelHQ',
        external: true,
        translationKey: 'footer.vercel.social.youtube',
      },
    ],
  },
];

export type FooterTokens = typeof FOOTER_STYLE_TOKENS;
