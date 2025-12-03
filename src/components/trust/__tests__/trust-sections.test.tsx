/** @vitest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  CertificationBadges,
  PartnerLogos,
  TestimonialCard,
  TestimonialsSection,
  type Certification,
  type Partner,
  type Testimonial,
} from '@/components/trust';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    alt: string;
  }) => (
    // 简化版 next/image，便于在 jsdom 中断言
    <img
      src={src}
      alt={alt}
      {...props}
    />
  ),
}));

vi.mock('lucide-react', () => ({
  Quote: ({ className, ...props }: React.ComponentProps<'svg'>) => (
    <svg
      data-testid='quote-icon'
      className={className}
      {...props}
    />
  ),
}));

describe('Trust section components', () => {
  it('PartnerLogos 在 partners 为空时返回 null', () => {
    const { container } = render(
      <PartnerLogos
        title='Trusted partners'
        subtitle={undefined}
        partners={[]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('PartnerLogos 渲染带链接和纯展示的 logo', () => {
    const partners: Partner[] = [
      {
        id: 'p1',
        name: 'Alpha Steel',
        logo: '/logos/alpha.png',
        website: 'https://alpha.example.com',
      },
      {
        id: 'p2',
        name: 'Beta Metals',
        logo: '/logos/beta.png',
        website: undefined,
      },
    ];

    render(
      <PartnerLogos
        title='Trusted partners'
        subtitle='Global clients'
        partners={partners}
      />,
    );

    const link = screen.getByRole('link', { name: 'Alpha Steel' });
    expect(link).toHaveAttribute('href', 'https://alpha.example.com');

    const staticItem = screen.getByTitle('Beta Metals');
    expect(staticItem.tagName.toLowerCase()).toBe('div');

    expect(screen.getByAltText('Alpha Steel')).toBeInTheDocument();
    expect(screen.getByAltText('Beta Metals')).toBeInTheDocument();
  });

  it('CertificationBadges 在 certifications 为空时返回 null', () => {
    const { container } = render(
      <CertificationBadges
        title='Quality certifications'
        subtitle={undefined}
        certifications={[]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('CertificationBadges 渲染带徽章和占位符的认证信息', () => {
    const certifications: Certification[] = [
      {
        id: 'iso-9001',
        name: 'ISO 9001',
        description: 'Quality management system',
        badge: '/certs/iso-9001.png',
        issuer: 'ISO',
      },
      {
        id: 'zeta',
        name: 'Zeta Seal',
        description: undefined,
        badge: undefined,
        issuer: undefined,
      },
    ];

    render(
      <CertificationBadges
        title='Quality certifications'
        subtitle='Independent verification for your buyers'
        certifications={certifications}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Quality certifications' }),
    ).toBeInTheDocument();

    expect(screen.getByAltText('ISO 9001')).toBeInTheDocument();
    expect(screen.getByText('ISO')).toBeInTheDocument();

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1);
    expect(screen.getByText('Zeta Seal')).toBeInTheDocument();
  });

  it('TestimonialsSection 在 testimonials 为空时返回 null', () => {
    const { container } = render(
      <TestimonialsSection
        title='Client stories'
        subtitle='Real feedback'
        testimonials={[]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('TestimonialsSection 渲染 testimonial 网格', () => {
    const testimonials: Testimonial[] = [
      {
        id: 't1',
        name: 'Alice Chen',
        role: 'Procurement Manager',
        company: 'Global Steel Inc.',
        content: 'Great communication and on-time delivery.',
        avatar: '/avatars/alice.png',
        rating: 5,
      },
    ];

    render(
      <TestimonialsSection
        title='Client stories'
        subtitle='What our buyers say'
        testimonials={testimonials}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Client stories' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Great communication and on-time delivery.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Alice Chen')).toBeInTheDocument();
  });

  it('TestimonialCard 在缺少头像和评分时使用首字母占位符', () => {
    const testimonial: Testimonial = {
      id: 't2',
      name: 'John Doe',
      role: 'Buyer',
      company: 'Acme Trading',
      content: 'Stable quality and fast response.',
      avatar: undefined,
      rating: undefined,
    };

    const { container } = render(<TestimonialCard testimonial={testimonial} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('Buyer, Acme Trading')).toBeInTheDocument();

    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(1);
  });

  it('TestimonialCard 渲染带头像和评分的推荐内容', () => {
    const testimonial: Testimonial = {
      id: 't3',
      name: 'Emily Zhang',
      role: 'Sourcing Director',
      company: 'Pacific Imports',
      content: 'They helped us standardize SKUs across regions.',
      avatar: '/avatars/emily.png',
      rating: 4,
    };

    const { container } = render(<TestimonialCard testimonial={testimonial} />);

    expect(screen.getByAltText('Emily Zhang')).toBeInTheDocument();
    expect(
      screen.getByText('They helped us standardize SKUs across regions.'),
    ).toBeInTheDocument();

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });
});
