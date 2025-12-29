/**
 * @vitest-environment jsdom
 * Tests for PostCard component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PostSummary } from '@/types/content.types';
import { PostCard } from '../post-card';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    className,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid='cover-image'
    />
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a
      href={href}
      className={className}
      data-testid='post-link'
    >
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='calendar-icon'
      {...props}
    />
  ),
  Clock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid='clock-icon'
      {...props}
    />
  ),
}));

/**
 * Creates a mock PostSummary for testing
 */
function createMockPost(overrides: Partial<PostSummary> = {}): PostSummary {
  return {
    slug: 'test-post',
    locale: 'en',
    title: 'Test Post Title',
    description: 'Test post description',
    publishedAt: '2024-06-15T00:00:00.000Z',
    coverImage: '/images/test-cover.jpg',
    tags: ['TypeScript', 'React', 'Testing'],
    readingTime: 5,
    ...overrides,
  };
}

describe('PostCard', () => {
  describe('basic rendering', () => {
    it('renders post title', () => {
      const post = createMockPost({ title: 'My Amazing Post' });
      render(<PostCard post={post} />);

      expect(screen.getByText('My Amazing Post')).toBeInTheDocument();
    });

    it('renders post description', () => {
      const post = createMockPost({
        description: 'This is a great article about testing.',
      });
      render(<PostCard post={post} />);

      expect(
        screen.getByText('This is a great article about testing.'),
      ).toBeInTheDocument();
    });

    it('renders article element', () => {
      const post = createMockPost();
      const { container } = render(<PostCard post={post} />);

      expect(container.querySelector('article')).toBeInTheDocument();
    });

    it('renders link with correct href', () => {
      const post = createMockPost({ slug: 'my-slug' });
      render(<PostCard post={post} />);

      const link = screen.getByTestId('post-link');
      expect(link).toHaveAttribute('href', '/blog/my-slug');
    });

    it('renders link with custom linkPrefix', () => {
      const post = createMockPost({ slug: 'my-slug' });
      render(
        <PostCard
          post={post}
          linkPrefix='/zh/blog'
        />,
      );

      const link = screen.getByTestId('post-link');
      expect(link).toHaveAttribute('href', '/zh/blog/my-slug');
    });
  });

  describe('cover image', () => {
    it('renders cover image when showCoverImage is true', () => {
      const post = createMockPost({ coverImage: '/images/cover.jpg' });
      render(
        <PostCard
          post={post}
          showCoverImage={true}
        />,
      );

      expect(screen.getByTestId('cover-image')).toBeInTheDocument();
    });

    it('does not render cover image when showCoverImage is false', () => {
      const post = createMockPost({ coverImage: '/images/cover.jpg' });
      render(
        <PostCard
          post={post}
          showCoverImage={false}
        />,
      );

      expect(screen.queryByTestId('cover-image')).not.toBeInTheDocument();
    });

    it('does not render cover image when post has no coverImage', () => {
      const { coverImage: _coverImage, ...postWithoutCover } = createMockPost();
      const post: PostSummary = postWithoutCover;
      render(
        <PostCard
          post={post}
          showCoverImage={true}
        />,
      );

      expect(screen.queryByTestId('cover-image')).not.toBeInTheDocument();
    });

    it('uses title as alt text for cover image', () => {
      const post = createMockPost({
        title: 'My Post Title',
        coverImage: '/images/cover.jpg',
      });
      render(<PostCard post={post} />);

      const image = screen.getByTestId('cover-image');
      expect(image).toHaveAttribute('alt', 'My Post Title');
    });
  });

  describe('tags', () => {
    it('renders tags when showTags is true', () => {
      const post = createMockPost({ tags: ['React', 'TypeScript'] });
      render(
        <PostCard
          post={post}
          showTags={true}
        />,
      );

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('does not render tags when showTags is false', () => {
      const post = createMockPost({ tags: ['React', 'TypeScript'] });
      render(
        <PostCard
          post={post}
          showTags={false}
        />,
      );

      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });

    it('does not render tags when post has no tags', () => {
      const { tags: _tags, ...postWithoutTags } = createMockPost();
      const post: PostSummary = postWithoutTags;
      render(
        <PostCard
          post={post}
          showTags={true}
        />,
      );

      // Should not have any Badge elements for tags
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });

    it('limits tags to maxTags', () => {
      const post = createMockPost({
        tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5'],
      });
      render(
        <PostCard
          post={post}
          maxTags={3}
        />,
      );

      expect(screen.getByText('Tag1')).toBeInTheDocument();
      expect(screen.getByText('Tag2')).toBeInTheDocument();
      expect(screen.getByText('Tag3')).toBeInTheDocument();
      expect(screen.queryByText('Tag4')).not.toBeInTheDocument();
    });

    it('shows remaining tag count badge', () => {
      const post = createMockPost({
        tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5'],
      });
      render(
        <PostCard
          post={post}
          maxTags={3}
        />,
      );

      expect(screen.getByText('+2')).toBeInTheDocument();
    });
  });

  describe('reading time', () => {
    it('renders reading time when showReadingTime is true', () => {
      const post = createMockPost({ readingTime: 5 });
      render(
        <PostCard
          post={post}
          showReadingTime={true}
        />,
      );

      expect(screen.getByText('5 min read')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('does not render reading time when showReadingTime is false', () => {
      const post = createMockPost({ readingTime: 5 });
      render(
        <PostCard
          post={post}
          showReadingTime={false}
        />,
      );

      expect(screen.queryByText('5 min read')).not.toBeInTheDocument();
    });

    it('does not render reading time when undefined', () => {
      const { readingTime: _readingTime, ...postWithoutReadingTime } =
        createMockPost();
      const post: PostSummary = postWithoutReadingTime;
      render(
        <PostCard
          post={post}
          showReadingTime={true}
        />,
      );

      expect(screen.queryByTestId('clock-icon')).not.toBeInTheDocument();
    });

    it('uses custom readingTimeLabel', () => {
      const post = createMockPost({ readingTime: 10 });
      render(
        <PostCard
          post={post}
          readingTimeLabel='分钟阅读'
        />,
      );

      expect(screen.getByText('10 分钟阅读')).toBeInTheDocument();
    });
  });

  describe('publish date', () => {
    it('renders formatted publish date', () => {
      const post = createMockPost({ publishedAt: '2024-06-15T00:00:00.000Z' });
      render(<PostCard post={post} />);

      expect(screen.getByText('Jun 15, 2024')).toBeInTheDocument();
    });

    it('renders calendar icon', () => {
      const post = createMockPost();
      render(<PostCard post={post} />);

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('renders time element with dateTime attribute', () => {
      const post = createMockPost({ publishedAt: '2024-06-15T00:00:00.000Z' });
      const { container } = render(<PostCard post={post} />);

      const timeEl = container.querySelector('time');
      expect(timeEl).toHaveAttribute('dateTime', '2024-06-15T00:00:00.000Z');
    });
  });

  describe('excerpt fallback', () => {
    it('shows description when available', () => {
      const post = createMockPost({
        description: 'Description text',
        excerpt: 'Excerpt text',
      });
      render(<PostCard post={post} />);

      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('shows excerpt when description is undefined', () => {
      const { description: _description, ...postBase } = createMockPost();
      const post: PostSummary = {
        ...postBase,
        excerpt: 'Excerpt text',
      };
      render(<PostCard post={post} />);

      expect(screen.getByText('Excerpt text')).toBeInTheDocument();
    });

    it('shows nothing when both are undefined', () => {
      const {
        description: _desc,
        excerpt: _excerpt,
        ...postBase
      } = createMockPost();
      const post: PostSummary = postBase;
      render(<PostCard post={post} />);

      // Card content should not render description/excerpt section
      expect(screen.queryByText('Description text')).not.toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('applies custom className to Card', () => {
      const post = createMockPost();
      const { container } = render(
        <PostCard
          post={post}
          className='custom-card-class'
        />,
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('custom-card-class');
    });
  });

  describe('accessibility', () => {
    it('link has focus-visible ring classes', () => {
      const post = createMockPost();
      render(<PostCard post={post} />);

      const link = screen.getByTestId('post-link');
      expect(link).toHaveClass('focus-visible:ring-2');
    });

    it('icons have aria-hidden attribute', () => {
      const post = createMockPost({ readingTime: 5 });
      render(<PostCard post={post} />);

      const calendarIcon = screen.getByTestId('calendar-icon');
      expect(calendarIcon).toHaveAttribute('aria-hidden', 'true');

      const clockIcon = screen.getByTestId('clock-icon');
      expect(clockIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('edge cases', () => {
    it('handles empty tags array', () => {
      const post = createMockPost({ tags: [] });
      render(
        <PostCard
          post={post}
          showTags={true}
        />,
      );

      // Should not throw and should render without tags
      expect(screen.getByText(post.title)).toBeInTheDocument();
    });

    it('handles special characters in title', () => {
      const post = createMockPost({ title: 'Post <Title> & "Special"' });
      render(<PostCard post={post} />);

      expect(screen.getByText('Post <Title> & "Special"')).toBeInTheDocument();
    });

    it('handles long title with line-clamp', () => {
      const longTitle =
        'This is a very long title that should be clamped to two lines in the UI';
      const post = createMockPost({ title: longTitle });
      const { container } = render(<PostCard post={post} />);

      const titleEl = container.querySelector('[data-slot="card-title"]');
      expect(titleEl).toHaveClass('line-clamp-2');
    });
  });
});
