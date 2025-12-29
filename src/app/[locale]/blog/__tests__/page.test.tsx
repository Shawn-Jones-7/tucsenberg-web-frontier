import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BlogPage, { generateMetadata, generateStaticParams } from '../page';

// Mock dependencies using vi.hoisted
const { mockGetTranslations, mockSetRequestLocale, mockGetAllPostsCached } =
  vi.hoisted(() => ({
    mockGetTranslations: vi.fn(),
    mockSetRequestLocale: vi.fn(),
    mockGetAllPostsCached: vi.fn(),
  }));

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: mockSetRequestLocale,
}));

vi.mock('@/app/[locale]/generate-static-params', () => ({
  generateLocaleStaticParams: () => [{ locale: 'en' }, { locale: 'zh' }],
}));

vi.mock('@/lib/content/blog', () => ({
  getAllPostsCached: mockGetAllPostsCached,
}));

// Mock PostGrid component
vi.mock('@/components/blog', () => ({
  PostGrid: ({
    posts,
    linkPrefix,
    cardProps,
    emptyState,
  }: {
    posts: unknown[];
    linkPrefix: string;
    cardProps: { readingTimeLabel: string };
    emptyState: React.ReactNode;
  }) => (
    <div
      data-testid='post-grid'
      data-link-prefix={linkPrefix}
      data-reading-time-label={cardProps.readingTimeLabel}
    >
      {posts.length === 0 ? (
        emptyState
      ) : (
        <div data-testid='posts-container'>
          {(posts as { slug: string; title: string }[]).map((post) => (
            <div
              key={post.slug}
              data-testid={`post-${post.slug}`}
            >
              {post.title}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}));

describe('BlogPage', () => {
  const mockTranslations = {
    pageTitle: 'Blog',
    pageDescription: 'Read our latest articles and updates',
    readingTime: 'min read',
    emptyState: 'No posts found',
  } as const;

  const mockPosts = [
    {
      slug: 'post-1',
      title: 'First Post',
      publishedAt: '2024-06-01',
      description: 'First post description',
    },
    {
      slug: 'post-2',
      title: 'Second Post',
      publishedAt: '2024-05-15',
      description: 'Second post description',
    },
  ];

  const mockParams = { locale: 'en' };

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        mockTranslations[key as keyof typeof mockTranslations] || key,
    );
    mockGetAllPostsCached.mockResolvedValue(mockPosts);
  });

  describe('generateStaticParams', () => {
    it('should return params for all locales', () => {
      const params = generateStaticParams();

      expect(params).toEqual([{ locale: 'en' }, { locale: 'zh' }]);
    });
  });

  describe('generateMetadata', () => {
    it('should return correct metadata', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata).toMatchObject({
        title: 'Blog',
        description: 'Read our latest articles and updates',
      });
    });

    it('should call getTranslations with correct namespace', async () => {
      await generateMetadata({ params: Promise.resolve(mockParams) });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'blog',
      });
    });

    it('should handle different locales', async () => {
      await generateMetadata({ params: Promise.resolve({ locale: 'zh' }) });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh',
        namespace: 'blog',
      });
    });
  });

  describe('BlogPage component', () => {
    it('should render page header with title', async () => {
      const BlogPageComponent = await BlogPage({
        params: Promise.resolve(mockParams),
      });

      render(BlogPageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Blog',
      );
    });

    it('should render page description', async () => {
      const BlogPageComponent = await BlogPage({
        params: Promise.resolve(mockParams),
      });

      render(BlogPageComponent);

      expect(
        screen.getByText('Read our latest articles and updates'),
      ).toBeInTheDocument();
    });

    it('should render PostGrid with posts', async () => {
      const BlogPageComponent = await BlogPage({
        params: Promise.resolve(mockParams),
      });

      render(BlogPageComponent);

      expect(screen.getByTestId('post-grid')).toBeInTheDocument();
      expect(screen.getByTestId('posts-container')).toBeInTheDocument();
    });

    it('should pass correct linkPrefix to PostGrid', async () => {
      const BlogPageComponent = await BlogPage({
        params: Promise.resolve(mockParams),
      });

      render(BlogPageComponent);

      const postGrid = screen.getByTestId('post-grid');
      expect(postGrid).toHaveAttribute('data-link-prefix', '/en/blog');
    });

    it('should pass correct linkPrefix for zh locale', async () => {
      const BlogPageComponent = await BlogPage({
        params: Promise.resolve({ locale: 'zh' }),
      });

      render(BlogPageComponent);

      const postGrid = screen.getByTestId('post-grid');
      expect(postGrid).toHaveAttribute('data-link-prefix', '/zh/blog');
    });

    it('should pass readingTimeLabel to PostGrid', async () => {
      const BlogPageComponent = await BlogPage({
        params: Promise.resolve(mockParams),
      });

      render(BlogPageComponent);

      const postGrid = screen.getByTestId('post-grid');
      expect(postGrid).toHaveAttribute('data-reading-time-label', 'min read');
    });

    it('should render posts from getAllPostsCached', async () => {
      const BlogPageComponent = await BlogPage({
        params: Promise.resolve(mockParams),
      });

      render(BlogPageComponent);

      expect(screen.getByTestId('post-post-1')).toBeInTheDocument();
      expect(screen.getByTestId('post-post-2')).toBeInTheDocument();
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
    });

    it('should render empty state when no posts', async () => {
      mockGetAllPostsCached.mockResolvedValue([]);

      const BlogPageComponent = await BlogPage({
        params: Promise.resolve(mockParams),
      });

      render(BlogPageComponent);

      expect(screen.getByText('No posts found')).toBeInTheDocument();
    });

    it('should call setRequestLocale with locale', async () => {
      await BlogPage({ params: Promise.resolve(mockParams) });

      expect(mockSetRequestLocale).toHaveBeenCalledWith('en');
    });

    it('should call getAllPostsCached with correct options', async () => {
      await BlogPage({ params: Promise.resolve(mockParams) });

      expect(mockGetAllPostsCached).toHaveBeenCalledWith('en', {
        sortBy: 'publishedAt',
        sortOrder: 'desc',
        draft: false,
      });
    });

    it('should render main element with correct classes', async () => {
      const BlogPageComponent = await BlogPage({
        params: Promise.resolve(mockParams),
      });

      render(BlogPageComponent);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
    });

    describe('async behavior', () => {
      it('should be an async server component', async () => {
        const result = BlogPage({ params: Promise.resolve(mockParams) });

        expect(result).toBeInstanceOf(Promise);
      });

      it('should handle delayed params resolution', async () => {
        const delayedParams = new Promise<{ locale: string }>((resolve) =>
          setTimeout(() => resolve(mockParams), 10),
        );

        const BlogPageComponent = await BlogPage({ params: delayedParams });

        expect(BlogPageComponent).toBeDefined();
      });
    });

    describe('error handling', () => {
      it('should propagate getTranslations errors', async () => {
        mockGetTranslations.mockRejectedValue(new Error('Translation error'));

        await expect(
          BlogPage({ params: Promise.resolve(mockParams) }),
        ).rejects.toThrow('Translation error');
      });

      it('should propagate getAllPostsCached errors', async () => {
        mockGetAllPostsCached.mockRejectedValue(
          new Error('Failed to fetch posts'),
        );

        await expect(
          BlogPage({ params: Promise.resolve(mockParams) }),
        ).rejects.toThrow('Failed to fetch posts');
      });

      it('should propagate params rejection', async () => {
        const rejectedParams = Promise.reject(new Error('Params error'));

        await expect(BlogPage({ params: rejectedParams })).rejects.toThrow(
          'Params error',
        );
      });
    });

    describe('i18n integration', () => {
      it('should handle zh locale correctly', async () => {
        await BlogPage({ params: Promise.resolve({ locale: 'zh' }) });

        expect(mockSetRequestLocale).toHaveBeenCalledWith('zh');
        expect(mockGetTranslations).toHaveBeenCalledWith({
          locale: 'zh',
          namespace: 'blog',
        });
        expect(mockGetAllPostsCached).toHaveBeenCalledWith('zh', {
          sortBy: 'publishedAt',
          sortOrder: 'desc',
          draft: false,
        });
      });
    });
  });
});
