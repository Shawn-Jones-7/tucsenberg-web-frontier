import { NextResponse } from 'next/server';
import { getAllPages, getAllPosts, getContentStats } from '@/lib/content';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Helper function to safely extract content example
function getContentExample<
  T extends {
    metadata: { title?: string; slug?: string; publishedAt?: string };
  },
>(items: T[]): { title: string; slug: string; publishedAt?: string } | null {
  if (items.length === 0) return null;

  const [item] = items;
  if (!item?.metadata) return null;

  return {
    title: item.metadata.title ?? 'Untitled',
    slug: item.metadata.slug ?? '',
    publishedAt: item.metadata.publishedAt ?? '',
  };
}

// Helper function to safely extract page example
function getPageExample<
  T extends { metadata: { title?: string; slug?: string } },
>(items: T[]): { title: string; slug: string } | null {
  if (items.length === 0) return null;

  const [item] = items;
  if (!item?.metadata) return null;

  return {
    title: item.metadata.title ?? 'Untitled',
    slug: item.metadata.slug ?? '',
  };
}

export function GET() {
  try {
    // Test content management system
    const enPosts = getAllPosts('en');
    const zhPosts = getAllPosts('zh');
    const enPages = getAllPages('en');
    const zhPages = getAllPages('zh');
    const stats = getContentStats();

    const result = {
      success: true,
      message: 'Content management system is working!',
      data: {
        posts: {
          en: enPosts.length,
          zh: zhPosts.length,
          total: enPosts.length + zhPosts.length,
          examples: {
            en: getContentExample(enPosts),
            zh: getContentExample(zhPosts),
          },
        },
        pages: {
          en: enPages.length,
          zh: zhPages.length,
          total: enPages.length + zhPages.length,
          examples: {
            en: getPageExample(enPages),
            zh: getPageExample(zhPages),
          },
        },
        stats,
        features: {
          mdxParsing: true,
          frontmatterValidation: true,
          multiLanguageSupport: true,
          typeScriptTypes: true,
          contentValidation: true,
          gitBasedWorkflow: true,
        },
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Content management system test failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Content management system test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
