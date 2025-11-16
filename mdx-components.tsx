import React from 'react';
import Image, { type ImageProps } from 'next/image';
import type { MDXComponents } from 'mdx/types';

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

const headingComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className='mb-6 text-4xl font-bold text-gray-900 dark:text-gray-100'>
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className='mb-4 text-3xl font-semibold text-gray-800 dark:text-gray-200'>
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className='mb-3 text-2xl font-medium text-gray-700 dark:text-gray-300'>
      {children}
    </h3>
  ),
};

const textComponents = {
  p: ({ children }: { children: React.ReactNode }) => (
    <p className='mb-4 leading-relaxed text-gray-600 dark:text-gray-400'>
      {children}
    </p>
  ),
  a: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a
      href={href}
      className='text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className='mb-4 border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300'>
      {children}
    </blockquote>
  ),
};

const listComponents = {
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className='mb-4 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-400'>
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className='mb-4 list-inside list-decimal space-y-2 text-gray-600 dark:text-gray-400'>
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className='text-gray-600 dark:text-gray-400'>{children}</li>
  ),
};

const codeComponents = {
  code: ({ children }: { children: React.ReactNode }) => (
    <code className='rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200'>
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className='mb-4 overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
      {children}
    </pre>
  ),
};

const mediaComponents = {
  img: (props: ImageProps) => {
    // 安全地处理 props，确保关键属性不被覆盖
    const { alt, className, style, ...safeProps } = props;

    return (
      <Image
        sizes='100vw'
        style={{ width: '100%', height: 'auto', ...style }}
        className={`rounded-lg shadow-md ${className || ''}`}
        {...safeProps}
        alt={alt || ''} // 确保 alt 属性始终存在且不能被覆盖
      />
    );
  },
  hr: () => <hr className='my-8 border-gray-300 dark:border-gray-700' />,
};

const tableComponents = {
  table: ({ children }: { children: React.ReactNode }) => (
    <div className='mb-4 overflow-x-auto'>
      <table className='min-w-full border-collapse border border-gray-300 dark:border-gray-700'>
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className='border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold dark:border-gray-700 dark:bg-gray-800'>
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className='border border-gray-300 px-4 py-2 dark:border-gray-700'>
      {children}
    </td>
  ),
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...headingComponents,
    ...textComponents,
    ...listComponents,
    ...codeComponents,
    ...mediaComponents,
    ...tableComponents,
    ...components,
  };
}
