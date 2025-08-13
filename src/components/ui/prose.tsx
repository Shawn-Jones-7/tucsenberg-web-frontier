import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProseProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Prose component for MDX content styling
 * Integrates @tailwindcss/typography with the project's theme system
 */
export function Prose({ children, className }: ProseProps) {
  return (
    <div
      className={cn(
        // Base prose styles
        'prose prose-gray dark:prose-invert max-w-none',
        // Responsive sizing
        'prose-sm sm:prose-base lg:prose-lg',
        // Theme integration
        'prose-headings:text-foreground',
        'prose-p:text-muted-foreground',
        'prose-strong:text-foreground',
        'prose-code:text-foreground',
        'prose-pre:bg-muted',
        'prose-blockquote:border-l-border',
        'prose-blockquote:text-muted-foreground',
        // Links styling
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        // Code blocks
        'prose-pre:border prose-pre:border-border',
        'prose-code:before:content-none prose-code:after:content-none',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
        // Tables
        'prose-table:border-collapse',
        'prose-th:border prose-th:border-border prose-th:bg-muted',
        'prose-td:border prose-td:border-border',
        // Lists
        'prose-ul:text-muted-foreground prose-ol:text-muted-foreground',
        'prose-li:text-muted-foreground',
        // Images
        'prose-img:rounded-lg prose-img:border prose-img:border-border',
        className,
      )}
    >
      {children}
    </div>
  );
}
