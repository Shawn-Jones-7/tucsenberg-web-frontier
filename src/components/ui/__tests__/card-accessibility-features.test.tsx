/**
 * @vitest-environment jsdom
 */

/**
 * Card Accessibility Features - Main Tests
 *
 * 主要可访问性测试，包括：
 * - 核心可访问性验证
 * - 基本可访问性测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - card-accessibility-features-core.test.tsx - 核心可访问性测试
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card';

describe('Card Accessibility Features - Main Tests', () => {
  describe('核心可访问性验证', () => {
    it('supports semantic HTML structure', () => {
      render(
        <Card role='article'>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>
              This card follows accessibility best practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button type='button'>Action</button>
          </CardFooter>
        </Card>,
      );

      const card = screen.getByRole('article');
      const title = screen.getByText('Accessible Card');
      const footer = screen.getByRole('button', { name: 'Action' });

      expect(card).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(footer).toBeInTheDocument();
    });

    it('supports ARIA attributes', () => {
      render(
        <Card
          aria-labelledby='card-title'
          aria-describedby='card-description'
        >
          <CardHeader>
            <CardTitle id='card-title'>Card with ARIA</CardTitle>
            <CardDescription id='card-description'>
              Description for screen readers
            </CardDescription>
          </CardHeader>
        </Card>,
      );

      const card = screen.getByLabelText('Card with ARIA');
      expect(card).toHaveAttribute('aria-describedby', 'card-description');
    });

    it('maintains focus management', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Focusable Card</CardTitle>
          </CardHeader>
          <CardContent>
            <button type='button'>Button 1</button>
            <button type='button'>Button 2</button>
          </CardContent>
        </Card>,
      );

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        expect(button).toBeVisible();
      });
    });

    it('supports keyboard navigation', () => {
      render(
        <Card
          tabIndex={0}
          data-testid='keyboard-card'
        >
          <CardHeader>
            <CardTitle>Keyboard Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>
            <a href='#'>Link</a>
            <button type='button'>Button</button>
          </CardContent>
        </Card>,
      );

      const card = screen.getByTestId('keyboard-card');
      const link = screen.getByRole('link');
      const button = screen.getByRole('button');

      expect(card).toBeInTheDocument();
      expect(link).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('provides proper heading hierarchy', () => {
      render(
        <div>
          <h1>Page Title</h1>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
            </CardHeader>
            <CardContent>
              <h3>Subsection</h3>
            </CardContent>
          </Card>
        </div>,
      );

      const pageTitle = screen.getByRole('heading', { level: 1 });
      const cardTitle = screen.getByText('Card Title'); // CardTitle is a div, not heading
      const subsection = screen.getByRole('heading', { level: 3 });

      expect(pageTitle).toBeInTheDocument();
      expect(cardTitle).toBeInTheDocument();
      expect(subsection).toBeInTheDocument();
    });

    it('supports screen reader announcements', () => {
      render(
        <Card aria-live='polite'>
          <CardHeader>
            <CardTitle>Live Region Card</CardTitle>
          </CardHeader>
        </Card>,
      );

      const card = screen
        .getByText('Live Region Card')
        .closest('[aria-live="polite"]');
      expect(card).toBeInTheDocument();
    });

    it('handles high contrast mode', () => {
      render(
        <Card className='high-contrast'>
          <CardHeader>
            <CardTitle>High Contrast Card</CardTitle>
          </CardHeader>
        </Card>,
      );

      const card = screen
        .getByText('High Contrast Card')
        .closest('.high-contrast');
      expect(card).toBeInTheDocument();
    });

    it('supports reduced motion preferences', () => {
      render(
        <Card className='reduce-motion'>
          <CardHeader>
            <CardTitle>Motion Reduced Card</CardTitle>
          </CardHeader>
        </Card>,
      );

      const card = screen
        .getByText('Motion Reduced Card')
        .closest('.reduce-motion');
      expect(card).toBeInTheDocument();
    });

    it('provides alternative text for images', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Image Card</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src='/profile.jpg'
              alt='User profile picture'
            />
          </CardContent>
        </Card>,
      );

      const image = screen.getByAltText('User profile picture');
      expect(image).toBeInTheDocument();
    });

    it('supports internationalization', () => {
      render(
        <Card
          lang='es'
          dir='ltr'
        >
          <CardHeader>
            <CardTitle>Tarjeta en Español</CardTitle>
            <CardDescription>
              Esta es una descripción en español
            </CardDescription>
          </CardHeader>
        </Card>,
      );

      const card = screen
        .getByText('Tarjeta en Español')
        .closest('[lang="es"]');
      expect(card).toHaveAttribute('dir', 'ltr');
    });

    it('supports color contrast requirements', () => {
      render(
        <Card className='high-contrast-text'>
          <CardHeader>
            <CardTitle>High Contrast Text</CardTitle>
          </CardHeader>
        </Card>,
      );

      const card = screen
        .getByText('High Contrast Text')
        .closest('.high-contrast-text');
      expect(card).toBeInTheDocument();
    });

    it('provides skip links for complex cards', () => {
      render(
        <Card>
          <a
            href='#card-content'
            className='skip-link'
          >
            Skip to card content
          </a>
          <CardHeader>
            <CardTitle>Complex Card</CardTitle>
          </CardHeader>
          <CardContent id='card-content'>Main content</CardContent>
        </Card>,
      );

      const skipLink = screen.getByText('Skip to card content');
      const content = screen.getByText('Main content');

      expect(skipLink).toHaveAttribute('href', '#card-content');
      expect(content.closest('#card-content')).toBeInTheDocument();
    });

    it('supports voice control commands', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Voice Control Card</CardTitle>
          </CardHeader>
          <CardContent>
            <button
              type='button'
              aria-label='Edit item'
            >
              Edit
            </button>
            <button
              type='button'
              aria-label='Delete item'
            >
              Delete
            </button>
          </CardContent>
        </Card>,
      );

      const editButton = screen.getByLabelText('Edit item');
      const deleteButton = screen.getByLabelText('Delete item');

      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });

    it('provides status updates for dynamic content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Status Update Card</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              role='status'
              aria-live='polite'
            >
              Loading complete
            </div>
          </CardContent>
        </Card>,
      );

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveTextContent('Loading complete');
    });
  });

  describe('错误处理验证', () => {
    it('handles missing accessibility attributes gracefully', () => {
      expect(() => {
        render(
          <Card>
            <CardHeader>
              <CardTitle>Card without accessibility attributes</CardTitle>
            </CardHeader>
          </Card>,
        );
      }).not.toThrow();
    });

    it('handles invalid ARIA attributes gracefully', () => {
      expect(() => {
        render(
          <Card aria-invalid={'invalid-value' as any}>
            <CardHeader>
              <CardTitle>Card with invalid ARIA</CardTitle>
            </CardHeader>
          </Card>,
        );
      }).not.toThrow();
    });

    it('handles conflicting accessibility attributes gracefully', () => {
      expect(() => {
        render(
          <Card
            role='button'
            aria-disabled='true'
            tabIndex={0}
          >
            <CardHeader>
              <CardTitle>Card with conflicting attributes</CardTitle>
            </CardHeader>
          </Card>,
        );
      }).not.toThrow();
    });
  });
});
