import type { FC } from 'react';

/**
 * Footer Test Page
 *
 * Simple test page to verify footer component functionality.
 */

export const revalidate = 86400;

const TestFooterPage: FC = () => {
  return (
    <div className='flex min-h-screen flex-col'>
      <div className='container mx-auto flex-1 px-4 py-8'>
        <h1 className='mb-6 text-3xl font-bold'>Footer Test Page</h1>
        <div className='space-y-4'>
          <p className='text-lg'>
            This page is used to test the footer component implementation.
          </p>
          <p>
            The footer should appear at the bottom of this page with the
            following sections:
          </p>
          <ul className='list-inside list-disc space-y-2'>
            <li>Company logo on the left</li>
            <li>Product section with Home, Enterprise, Pricing links</li>
            <li>Company section with Terms, AI Policy, Privacy links</li>
            <li>
              Resources section with FAQs, Docs, Ambassadors, Community, Vercel
              links
            </li>
            <li>Social section with Twitter and LinkedIn icons</li>
            <li>Copyright notice at the bottom</li>
          </ul>
          <div className='mt-8 rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
            <h2 className='mb-2 text-xl font-semibold'>Footer Features:</h2>
            <ul className='list-inside list-disc space-y-1'>
              <li>Responsive design (mobile and desktop)</li>
              <li>Dark mode support</li>
              <li>Internationalization (English/Chinese)</li>
              <li>External link indicators</li>
              <li>Social media icons</li>
              <li>Clean, professional styling</li>
            </ul>
          </div>
          <div className='mt-8 space-y-4'>
            <h2 className='text-xl font-semibold'>
              Content to push footer down
            </h2>
            {Array.from({ length: 10 }, (_, i) => (
              <p
                key={i}
                className='text-gray-600 dark:text-gray-400'
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFooterPage;
