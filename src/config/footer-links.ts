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
import { SITE_CONFIG } from '@/config/paths/site-config';

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
    key: 'navigation',
    title: 'Navigation',
    translationKey: 'footer.sections.navigation.title',
    links: [
      {
        key: 'home',
        label: 'Home',
        href: '/',
        external: false,
        translationKey: 'footer.sections.navigation.home',
      },
      {
        key: 'about',
        label: 'About',
        href: '/about',
        external: false,
        translationKey: 'footer.sections.navigation.about',
      },
      {
        key: 'products',
        label: 'Products',
        href: '/products',
        external: false,
        translationKey: 'footer.sections.navigation.products',
      },
      {
        key: 'blog',
        label: 'Blog',
        href: '/blog',
        external: false,
        translationKey: 'footer.sections.navigation.blog',
      },
      {
        key: 'contact',
        label: 'Contact',
        href: '/contact',
        external: false,
        translationKey: 'footer.sections.navigation.contact',
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
      {
        key: 'terms',
        label: 'Terms of Service',
        href: '/terms',
        external: false,
        translationKey: 'footer.sections.support.terms',
      },
    ],
  },
  {
    key: 'social',
    title: 'Social',
    translationKey: 'footer.sections.social.title',
    links: [
      {
        key: 'twitter',
        label: 'Twitter',
        href: SITE_CONFIG.social.twitter,
        external: true,
        translationKey: 'footer.sections.social.twitter',
      },
      {
        key: 'linkedin',
        label: 'LinkedIn',
        href: SITE_CONFIG.social.linkedin,
        external: true,
        translationKey: 'footer.sections.social.linkedin',
      },
      {
        key: 'github',
        label: 'GitHub',
        href: SITE_CONFIG.social.github,
        external: true,
        translationKey: 'footer.sections.social.github',
      },
    ],
  },
];

export type FooterTokens = typeof FOOTER_STYLE_TOKENS;
