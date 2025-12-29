/**
 * @vitest-environment jsdom
 * Tests for PostGrid component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PostSummary } from '@/types/content.types';
import { PostGrid } from '../post-grid';

// Mock PostCard component
vi.mock('@/components/blog/post-card', () => ({
  PostCard: ({
    post,
    linkPrefix,
    showCoverImage,
    showTags,
    showReadingTime,
  }: {
    post: PostSummary;
    linkPrefix?: string;
    showCoverImage?: boolean;
    showTags?: boolean;
    showReadingTime?: boolean;
  }) => (
    <div
      data-testid={`post-card-${post.slug}`}
      data-link-prefix={linkPrefix}
      data-show-cover-image={String(showCoverImage ?? true)}
      data-show-tags={String(showTags ?? true)}
      data-show-reading-time={String(showReadingTime ?? true)}
    >
      {post.title}
    </div>
  ),
}));

/**
 * Creates a mock PostSummary for testing
 */
function createMockPost(overrides: Partial<PostSummary> = {}): PostSummary {
  return {
    slug: 'test-post',
    locale: 'en',
    title: 'Test Post',
    description: 'Test description',
    publishedAt: '2024-06-15T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Creates an array of mock posts for testing
 */
function createMockPosts(count: number): PostSummary[] {
  return Array.from({ length: count }, (_, i) =>
    createMockPost({
      slug: `post-${i + 1}`,
      title: `Post ${i + 1}`,
    }),
  );
}

describe('PostGrid', () => {
  describe('basic rendering', () => {
    it('renders all posts as cards', () => {
      const posts = createMockPosts(3);
      render(<PostGrid posts={posts} />);

      expect(screen.getByTestId('post-card-post-1')).toBeInTheDocument();
      expect(screen.getByTestId('post-card-post-2')).toBeInTheDocument();
      expect(screen.getByTestId('post-card-post-3')).toBeInTheDocument();
    });

    it('renders grid container', () => {
      const posts = createMockPosts(2);
      const { container } = render(<PostGrid posts={posts} />);

      expect(container.firstChild).toHaveClass('grid');
    });

    it('returns null when posts array is empty', () => {
      const { container } = render(<PostGrid posts={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('renders emptyState when posts array is empty', () => {
      render(
        <PostGrid
          posts={[]}
          emptyState={<div data-testid='empty-state'>No posts found</div>}
        />,
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No posts found')).toBeInTheDocument();
    });

    it('renders single post', () => {
      const posts = createMockPosts(1);
      render(<PostGrid posts={posts} />);

      expect(screen.getByTestId('post-card-post-1')).toBeInTheDocument();
    });
  });

  describe('grid column classes', () => {
    it('applies default column classes', () => {
      const posts = createMockPosts(2);
      const { container } = render(<PostGrid posts={posts} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('applies sm=2 column class', () => {
      const posts = createMockPosts(2);
      const { container } = render(
        <PostGrid
          posts={posts}
          columns={{ sm: 2 }}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('sm:grid-cols-2');
    });

    it('applies md=1 column class', () => {
      const posts = createMockPosts(2);
      const { container } = render(
        <PostGrid
          posts={posts}
          columns={{ md: 1 }}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('md:grid-cols-1');
    });

    it('applies md=3 column class', () => {
      const posts = createMockPosts(2);
      const { container } = render(
        <PostGrid
          posts={posts}
          columns={{ md: 3 }}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('md:grid-cols-3');
    });

    it('applies lg=4 column class', () => {
      const posts = createMockPosts(2);
      const { container } = render(
        <PostGrid
          posts={posts}
          columns={{ lg: 4 }}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('lg:grid-cols-4');
    });

    it('applies lg=2 column class', () => {
      const posts = createMockPosts(2);
      const { container } = render(
        <PostGrid
          posts={posts}
          columns={{ lg: 2 }}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('lg:grid-cols-2');
    });

    it('applies lg=1 column class', () => {
      const posts = createMockPosts(2);
      const { container } = render(
        <PostGrid
          posts={posts}
          columns={{ lg: 1 }}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('lg:grid-cols-1');
    });
  });

  describe('gap classes', () => {
    it('applies default gap-6', () => {
      const posts = createMockPosts(2);
      const { container } = render(<PostGrid posts={posts} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-6');
    });

    it('applies gap-4 when gap=4', () => {
      const posts = createMockPosts(2);
      const { container } = render(
        <PostGrid
          posts={posts}
          gap={4}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-4');
    });

    it('applies gap-8 when gap=8', () => {
      const posts = createMockPosts(2);
      const { container } = render(
        <PostGrid
          posts={posts}
          gap={8}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-8');
    });
  });

  describe('custom className', () => {
    it('applies custom className to grid', () => {
      const posts = createMockPosts(2);
      const { container } = render(
        <PostGrid
          posts={posts}
          className='custom-grid-class'
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('custom-grid-class');
    });

    it('preserves default classes with custom className', () => {
      const posts = createMockPosts(2);
      const { container } = render(
        <PostGrid
          posts={posts}
          className='my-custom'
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('gap-6');
      expect(grid).toHaveClass('my-custom');
    });
  });

  describe('props passed to PostCard', () => {
    it('passes default linkPrefix to cards', () => {
      const posts = createMockPosts(1);
      render(<PostGrid posts={posts} />);

      const card = screen.getByTestId('post-card-post-1');
      expect(card).toHaveAttribute('data-link-prefix', '/blog');
    });

    it('passes custom linkPrefix to cards', () => {
      const posts = createMockPosts(1);
      render(
        <PostGrid
          posts={posts}
          linkPrefix='/zh/blog'
        />,
      );

      const card = screen.getByTestId('post-card-post-1');
      expect(card).toHaveAttribute('data-link-prefix', '/zh/blog');
    });

    it('passes cardProps to cards', () => {
      const posts = createMockPosts(1);
      render(
        <PostGrid
          posts={posts}
          cardProps={{
            showCoverImage: false,
            showTags: false,
            showReadingTime: false,
          }}
        />,
      );

      const card = screen.getByTestId('post-card-post-1');
      expect(card).toHaveAttribute('data-show-cover-image', 'false');
      expect(card).toHaveAttribute('data-show-tags', 'false');
      expect(card).toHaveAttribute('data-show-reading-time', 'false');
    });

    it('passes default cardProps values', () => {
      const posts = createMockPosts(1);
      render(<PostGrid posts={posts} />);

      const card = screen.getByTestId('post-card-post-1');
      expect(card).toHaveAttribute('data-show-cover-image', 'true');
      expect(card).toHaveAttribute('data-show-tags', 'true');
      expect(card).toHaveAttribute('data-show-reading-time', 'true');
    });
  });

  describe('post key uniqueness', () => {
    it('uses post slug as key', () => {
      const posts = createMockPosts(3);
      render(<PostGrid posts={posts} />);

      // All cards should render without key warnings
      expect(screen.getAllByTestId(/^post-card-/)).toHaveLength(3);
    });
  });

  describe('edge cases', () => {
    it('handles large number of posts', () => {
      const posts = createMockPosts(50);
      render(<PostGrid posts={posts} />);

      expect(screen.getAllByTestId(/^post-card-/)).toHaveLength(50);
    });

    it('renders correctly with all props combined', () => {
      const posts = createMockPosts(4);
      const { container } = render(
        <PostGrid
          posts={posts}
          linkPrefix='/en/blog'
          columns={{ sm: 2, md: 3, lg: 4 }}
          gap={8}
          className='custom-class'
          cardProps={{ showCoverImage: false }}
        />,
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('md:grid-cols-3');
      expect(grid).toHaveClass('lg:grid-cols-4');
      expect(grid).toHaveClass('gap-8');
      expect(grid).toHaveClass('custom-class');

      const card = screen.getByTestId('post-card-post-1');
      expect(card).toHaveAttribute('data-link-prefix', '/en/blog');
      expect(card).toHaveAttribute('data-show-cover-image', 'false');
    });
  });
});
