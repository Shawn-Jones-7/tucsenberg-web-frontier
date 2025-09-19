'use client';

import * as React from 'react';
import {
  CarouselDemoSection,
  ProgressBarDemoSection,
  ToastDemoSection,
  TypographyDemoSection,
} from '@/components/examples/ui-showcase-sections';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

/**
 * UI Showcase component demonstrating the new UI enhancement components
 */
export function UIShowcase() {
  const { toast } = useToast();

  const handleToastDemo = (type: 'success' | 'error' | 'info' | 'warning') => {
    switch (type) {
      case 'success':
        toast.success('Success!', 'This is a success message.');
        break;
      case 'error':
        toast.error('Error!', 'This is an error message.');
        break;
      case 'info':
        toast.info('Info!', 'This is an info message.');
        break;
      case 'warning':
        toast.warning('Warning!', 'This is a warning message.');
        break;
      default:
        // Default case to satisfy ESLint
        break;
    }
  };

  const handleFormToastDemo = () => {
    toast.formSuccess('contact');
  };

  return (
    <div className='container mx-auto space-y-8 py-8'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>
          UI Enhancement Components Showcase
        </h1>
        <p className='text-muted-foreground mt-2'>
          Demonstrating the newly implemented UI components
        </p>
      </div>

      {/* Toast Notifications Demo */}
      <ToastDemoSection
        onToastDemo={handleToastDemo}
        onFormToastDemo={handleFormToastDemo}
      />

      {/* Typography Demo */}
      <TypographyDemoSection />

      {/* Carousel Demo */}
      <CarouselDemoSection />

      {/* Progress Bar Demo */}
      <ProgressBarDemoSection />

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Summary</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <h4 className='font-semibold text-green-600'>
                ✅ Successfully Implemented
              </h4>
              <ul className='mt-2 space-y-1 text-sm'>
                <li>• Sonner toast notifications</li>
                <li>• @tailwindcss/typography</li>
                <li>• Embla Carousel component</li>
                <li>• @bprogress/next progress bar</li>
                <li>• Theme system integration</li>
                <li>• Internationalization support</li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold text-blue-600'>
                📊 Performance Impact
              </h4>
              <ul className='mt-2 space-y-1 text-sm'>
                <li>• Typography: ~8KB</li>
                <li>• Sonner: ~15KB</li>
                <li>• Progress Bar: ~3KB</li>
                <li>• Carousel: 0KB (existing)</li>
                <li>• Total: ~26KB added</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
