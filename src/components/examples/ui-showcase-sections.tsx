'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Prose } from '@/components/ui/prose';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

interface ToastDemoProps {
  onToastDemo: (_type: 'success' | 'error' | 'info' | 'warning') => void;
  onFormToastDemo: () => void;
}

/**
 * Toast notification demo section
 */
export function ToastDemoSection({ onToastDemo, onFormToastDemo }: ToastDemoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🔔 Sonner Toast Notifications</CardTitle>
        <CardDescription>
          Elegant toast notifications with theme integration and internationalization support
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => onToastDemo('success')}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            Success Toast
          </Button>
          <Button
            onClick={() => onToastDemo('error')}
            variant="destructive"
          >
            Error Toast
          </Button>
          <Button
            onClick={() => onToastDemo('info')}
            variant="secondary"
          >
            Info Toast
          </Button>
          <Button
            onClick={() => onToastDemo('warning')}
            variant="outline"
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          >
            Warning Toast
          </Button>
        </div>
        <div className="mt-4">
          <Button onClick={onFormToastDemo} variant="outline">
            Form Success Toast (i18n)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Typography demo section
 */
export function TypographyDemoSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📝 @tailwindcss/typography</CardTitle>
        <CardDescription>
          Beautiful typography for content-rich pages with theme integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Prose>
          <h2>Sample Article Content</h2>
          <p>
            This is a demonstration of the <code>@tailwindcss/typography</code> plugin
            integrated with our theme system. The typography automatically adapts to
            light and dark themes.
          </p>
          <blockquote>
            &ldquo;Typography is the craft of endowing human language with a durable visual form.&rdquo;
            — Robert Bringhurst
          </blockquote>
          <ul>
            <li>Automatic theme adaptation</li>
            <li>Responsive typography scales</li>
            <li>Optimized for readability</li>
            <li>Support for both English and Chinese content</li>
          </ul>
          <p>
            The prose component ensures consistent styling across all content areas
            while maintaining excellent readability and accessibility standards.
          </p>
        </Prose>
      </CardContent>
    </Card>
  );
}

/**
 * Carousel demo section
 */
export function CarouselDemoSection() {
  const carouselItems = [
    {
      title: "Slide 1",
      content: "This is the first slide of the carousel component.",
      color: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "Slide 2",
      content: "The carousel supports keyboard navigation and accessibility.",
      color: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "Slide 3",
      content: "Built with embla-carousel-react for smooth performance.",
      color: "bg-purple-100 dark:bg-purple-900"
    },
    {
      title: "Slide 4",
      content: "Fully responsive and touch-friendly on mobile devices.",
      color: "bg-orange-100 dark:bg-orange-900"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎠 Embla Carousel</CardTitle>
        <CardDescription>
          Smooth, accessible carousel component with keyboard navigation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full max-w-xs mx-auto">
          <CarouselContent>
            {carouselItems.map((item, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className={`flex aspect-square items-center justify-center p-6 ${item.color}`}>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.content}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Use arrow keys or click the navigation buttons to browse slides
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Progress bar demo section
 */
export function ProgressBarDemoSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 @bprogress/next Progress Bar</CardTitle>
        <CardDescription>
          Global navigation progress indicator with theme integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          The navigation progress bar is active globally. Navigate between pages
          to see the progress indicator at the top of the screen.
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/">Navigate to Home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
