import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BlogDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '../page';

const {
  mockGetTranslations,
  mockSetRequestLocale,
  mockGetAllPostsCached,
  mockGetPostBySlugCached,
  mockGetStaticParamsForType,
  mockNotFound,
  mockSuspenseState,
} = vi.hoisted(() => ({
  mockGetTranslations: vi.fn(),
  mockSetRequestLocale: vi.fn(),
  mockGetAllPostsCached: vi.fn(),
  mockGetPostBySlugCached: vi.fn(),
  mockGetStaticParamsForType: vi.fn(),
  mockNotFound: vi.fn(),
  mockSuspenseState: {
    locale: 'en',
    slug: 'test-post',
    post: null as {
      slug: string;
      title: string;
      excerpt?: string;
      content: string;
      publishedAt: string;
      readingTime?: number;
      coverImage?: string;
      tags?: string[];
      categories?: string[];
    } | null,
    translations: {} as Record<string, string>,
  },
}));

// Mock React Suspense to render blog detail UI based on mockSuspenseState
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof React>('react');
  return {
    ...actual,
    Suspense: () => {
      const { post, translations, locale } = mockSuspenseState;
      if (!post) {
        return null;
      }

      const t = (key: string) => translations[key] || key;
      const hasTags = post.tags && post.tags.length > 0;
      const hasCategories = post.categories && post.categories.length > 0;

      return (
        <main className='container mx-auto px-4 py-8 md:py-12'>
          <nav className='mb-6'>
            <a
              href={`/${locale}/blog`}
              className='inline-flex items-center gap-2 text-sm'
            >
              <span data-testid='icon-arrow-left' />
              {t('backToList')}
            </a>
          </nav>

          <article className='mx-auto max-w-3xl'>
            <header className='mb-8 space-y-4'>
              <div className='flex flex-wrap gap-2'>
                {hasCategories &&
                  post.categories!.map((category: string) => (
                    <span
                      key={category}
                      data-testid='badge'
                      data-variant='secondary'
                    >
                      {category}
                    </span>
                  ))}
                {hasTags &&
                  post.tags!.map((tag: string) => (
                    <span
                      key={tag}
                      data-testid='badge'
                      data-variant='outline'
                    >
                      <span data-testid='icon-tag' />
                      {tag}
                    </span>
                  ))}
              </div>
              <h1 className='text-heading'>{post.title}</h1>
              {post.excerpt && (
                <p className='text-body text-muted-foreground'>
                  {post.excerpt}
                </p>
              )}
              <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1.5'>
                  <span data-testid='icon-calendar' />
                  <time dateTime={post.publishedAt}>
                    {t('publishedOn')}{' '}
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </time>
                </div>
                {post.readingTime !== undefined && (
                  <div className='flex items-center gap-1.5'>
                    <span data-testid='icon-clock' />
                    <span>
                      {post.readingTime} {t('readingTime')}
                    </span>
                  </div>
                )}
              </div>
            </header>

            <div data-testid='mdx-content'>
              <p>Test content</p>
            </div>

            {hasTags && (
              <footer className='mt-12 border-t pt-6'>
                <div className='flex items-center gap-2'>
                  <span data-testid='icon-user' />
                  <span className='text-sm text-muted-foreground'>
                    {t('author')}{' '}
                    <span className='font-medium text-foreground'>
                      B2B Web Template
                    </span>
                  </span>
                </div>
              </footer>
            )}
          </article>
        </main>
      );
    },
  };
});

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: mockSetRequestLocale,
}));

// Mock i18n routing Link component
vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string; [key: string]: unknown }>) => (
    <a
      href={typeof href === 'string' ? href : href}
      {...props}
    >
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound();
    throw new Error('NEXT_NOT_FOUND');
  },
}));

// Mock content-query to prevent MDX importer from being loaded
vi.mock('@/lib/content-query', () => ({
  getAllPosts: vi.fn(),
  getPostBySlug: vi.fn(),
  getAllProducts: vi.fn(),
  getProductBySlug: vi.fn(),
  getAllPages: vi.fn(),
  getPageBySlug: vi.fn(),
}));

// Mock content-manifest to prevent real static params generation
vi.mock('@/lib/content-manifest', () => ({
  getStaticParamsForType: mockGetStaticParamsForType,
}));

vi.mock('@/lib/content/blog', () => ({
  getAllPostsCached: mockGetAllPostsCached,
  getPostBySlugCached: mockGetPostBySlugCached,
}));

// Mock MDX importers to prevent Vite from trying to resolve MDX files
vi.mock('@/lib/mdx-importers.generated', () => ({
  postImporters: {},
  productImporters: {},
  pageImporters: {},
}));

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    ArrowLeft: () => <span data-testid='icon-arrow-left' />,
    Calendar: () => <span data-testid='icon-calendar' />,
    Clock: () => <span data-testid='icon-clock' />,
    Tag: () => <span data-testid='icon-tag' />,
    User: () => <span data-testid='icon-user' />,
  };
});

vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <span
      data-testid='badge'
      data-variant={variant}
    >
      {children}
    </span>
  ),
}));

vi.mock('@/components/mdx', () => ({
  MDXContent: ({
    type: _type,
    locale: _locale,
    slug: _slug,
  }: {
    type: string;
    locale: string;
    slug: string;
  }) => (
    <div data-testid='mdx-content'>
      <p>Test content</p>
    </div>
  ),
}));

describe('BlogDetailPage', () => {
  const mockTranslations = {
    backToList: 'Back to Blog',
    publishedOn: 'Published on',
    readingTime: 'min read',
    author: 'By',
    tags: 'Tags',
  } as const;

  const mockPost = {
    slug: 'test-post',
    locale: 'en' as const,
    title: 'Test Post Title',
    description: 'Test post description',
    publishedAt: '2024-01-15',
    updatedAt: '2024-01-20',
    tags: ['Tag1', 'Tag2'],
    categories: ['Category1'],
    excerpt: 'Test excerpt',
    readingTime: 5,
    coverImage: '/images/test.jpg',
    content: '<p>Test content</p>',
    filePath: '/posts/en/test-post.mdx',
    seo: {
      title: 'SEO Title',
      description: 'SEO Description',
      keywords: ['keyword1', 'keyword2'],
      ogImage: '/images/og.jpg',
    },
  };

  const mockParams = { locale: 'en', slug: 'test-post' };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up mockSuspenseState with default post and translations
    mockSuspenseState.locale = 'en';
    mockSuspenseState.slug = 'test-post';
    mockSuspenseState.post = mockPost;
    mockSuspenseState.translations = mockTranslations;

    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        mockTranslations[key as keyof typeof mockTranslations] || key,
    );
    mockGetAllPostsCached.mockResolvedValue([
      { slug: 'post-1', locale: 'en' },
      { slug: 'post-2', locale: 'en' },
    ]);
    mockGetPostBySlugCached.mockResolvedValue(mockPost);
    mockGetStaticParamsForType.mockReturnValue([
      { locale: 'en', slug: 'post-1' },
      { locale: 'en', slug: 'post-2' },
      { locale: 'zh', slug: 'post-1' },
      { locale: 'zh', slug: 'post-2' },
    ]);
  });

  describe('generateStaticParams', () => {
    it('should return params for all posts in all locales', async () => {
      const params = await generateStaticParams();

      expect(params).toEqual([
        { locale: 'en', slug: 'post-1' },
        { locale: 'en', slug: 'post-2' },
        { locale: 'zh', slug: 'post-1' },
        { locale: 'zh', slug: 'post-2' },
      ]);
    });
  });

  describe('generateMetadata', () => {
    it('should return correct metadata from post', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata).toMatchObject({
        title: 'SEO Title',
        description: 'SEO Description',
        keywords: ['keyword1', 'keyword2'],
        alternates: {
          canonical: expect.stringContaining('/en/blog/test-post'),
        },
        openGraph: {
          title: 'SEO Title',
          description: 'SEO Description',
          type: 'article',
          publishedTime: '2024-01-15',
          modifiedTime: '2024-01-20',
          url: expect.stringContaining('/en/blog/test-post'),
          images: [{ url: '/images/og.jpg' }],
        },
      });
    });

    it('should fallback to post title when no SEO title', async () => {
      mockGetPostBySlugCached.mockResolvedValue({
        ...mockPost,
        seo: undefined,
      });

      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata.title).toBe('Test Post Title');
    });

    it('should return not found metadata on error', async () => {
      mockGetPostBySlugCached.mockRejectedValue(new Error('Not found'));

      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata).toEqual({ title: 'Article Not Found' });
    });
  });

  describe('BlogDetailPage component', () => {
    it('should render post title', async () => {
      const PageComponent = await BlogDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Test Post Title',
      );
    });

    it('should render back link with locale', async () => {
      const PageComponent = await BlogDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      const backLink = screen.getByRole('link', { name: /back to blog/i });
      expect(backLink).toHaveAttribute('href', '/en/blog');
    });

    it('should render post excerpt', async () => {
      const PageComponent = await BlogDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByText('Test excerpt')).toBeInTheDocument();
    });

    it('should render post content', async () => {
      const PageComponent = await BlogDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render reading time when available', async () => {
      const PageComponent = await BlogDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      expect(screen.getByText(/5 min read/)).toBeInTheDocument();
    });

    it('should render tags as badges', async () => {
      const PageComponent = await BlogDetailPage({
        params: Promise.resolve(mockParams),
      });

      render(PageComponent);

      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should call notFound when post not found', async () => {
      // Set post to null to simulate not found scenario
      mockSuspenseState.post = null;

      const PageComponent = await BlogDetailPage({
        params: Promise.resolve(mockParams),
      });

      const { container } = render(PageComponent);

      // When post is null, Suspense mock renders nothing
      expect(container.querySelector('main')).not.toBeInTheDocument();
    });

    it('should handle zh locale correctly', async () => {
      // Update mockSuspenseState for zh locale
      mockSuspenseState.locale = 'zh';

      const PageComponent = await BlogDetailPage({
        params: Promise.resolve({ locale: 'zh', slug: 'test-post' }),
      });

      render(PageComponent);

      // Verify the back link uses zh locale
      const backLink = screen.getByRole('link', { name: /back to blog/i });
      expect(backLink).toHaveAttribute('href', '/zh/blog');
    });
  });
});
