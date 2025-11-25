import type {
  FooterStyleTokens,
  WhatsAppStyleTokens,
} from '@/config/footer-links';

/**
 * Footer 视觉 token：独立文件，避免 footer-links.ts 体积超过 max-lines 限制。
 */
export const FOOTER_STYLE_TOKENS: FooterStyleTokens = {
  layout: {
    maxWidthPx: 1080,
    marginXClamp: 'clamp(24px, 12vw, 184px)',
    paddingX: {
      basePx: 16,
      mdPx: 24,
      lgPx: 32,
    },
    paddingY: {
      basePx: 48,
      mdPx: 56,
      lgPx: 64,
    },
    gapPx: {
      column: 24,
      row: 24,
    },
    minColumnWidthPx: 176,
  },
  typography: {
    title: {
      fontSizePx: 14,
      lineHeightPx: 20,
      fontWeight: 500,
      letterSpacing: '0px',
    },
    link: {
      fontSizePx: 14,
      lineHeightPx: 20,
      fontWeight: 400,
    },
    fontFamily:
      'var(--font-geist-sans), var(--font-chinese-stack), system-ui, -apple-system, sans-serif',
  },
  colors: {
    light: {
      text: 'text-neutral-600',
      hoverText: 'hover:text-neutral-900',
    },
    dark: {
      text: 'dark:text-neutral-400',
      hoverText: 'dark:hover:text-neutral-100',
    },
    selection: {
      dark: {
        background: '#ededed',
        foreground: '#1a1a1a',
      },
      light: {
        background: '#171717',
        foreground: '#f2f2f2',
      },
    },
  },
  hover: {
    description:
      '提升文字亮度或轻度下划线，匹配 Vercel 90-100ms color/background 过渡。',
    transition: 'transition-colors duration-100 ease',
    light: {
      text: 'foreground',
      underline: false,
    },
    dark: {
      text: 'foreground',
      underline: false,
    },
  },
};

export const WHATSAPP_STYLE_TOKENS: WhatsAppStyleTokens = {
  sizePx: 52,
  iconSizePx: 22,
  borderRadiusPx: 16,
  borderWidthPx: 1,
  transition: 'transition-all duration-150 ease-out',
  focusRing:
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500/80',
  tooltip: {
    background: 'bg-neutral-950 dark:bg-neutral-900',
    text: 'text-white',
  },
  pulse: {
    background: 'bg-emerald-500/18',
    overlay: 'bg-emerald-500/28',
  },
  light: {
    background: 'bg-white/85 backdrop-blur-sm',
    foreground: 'text-emerald-600',
    border: 'border border-neutral-200',
    hoverBackground: 'hover:bg-white',
    hoverBorder: 'hover:border-neutral-300',
    hoverForeground: 'hover:text-emerald-700',
    shadow: 'shadow-[0_14px_40px_-12px_rgba(0,0,0,0.25)]',
  },
  dark: {
    background: 'dark:bg-neutral-900/85 dark:backdrop-blur-sm',
    foreground: 'dark:text-emerald-300',
    border: 'dark:border dark:border-neutral-700',
    hoverBackground: 'dark:hover:bg-neutral-900',
    hoverBorder: 'dark:hover:border-neutral-500',
    hoverForeground: 'dark:hover:text-emerald-200',
    shadow: 'dark:shadow-[0_14px_40px_-12px_rgba(0,0,0,0.55)]',
  },
};
