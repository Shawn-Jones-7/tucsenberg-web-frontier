import { UIShowcase } from '@/components/examples/ui-showcase';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UI Enhancement Components Showcase',
  description: 'Demonstration of the newly implemented UI enhancement components',
};

export default function UIShowcasePage() {
  return <UIShowcase />;
}
