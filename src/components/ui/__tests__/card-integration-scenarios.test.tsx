/**
 * @vitest-environment jsdom
 */

/**
 * Card Integration Scenarios Tests
 *
 * Tests for Card component integration scenarios including:
 * - Form elements integration
 * - Other UI components integration
 * - Responsive design support
 * - Complex interaction patterns
 * - Real-world usage scenarios
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

describe('Card Integration Scenarios Tests', () => {
  describe('Component Integration', () => {
    it('works with form elements', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Form Card</CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <label htmlFor='name'>Name:</label>
              <input
                id='name'
                type='text'
              />
              <label htmlFor='email'>Email:</label>
              <input
                id='email'
                type='email'
              />
            </form>
          </CardContent>
          <CardFooter>
            <button type='submit'>Submit</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByLabelText('Name:')).toBeInTheDocument();
      expect(screen.getByLabelText('Email:')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Submit' }),
      ).toBeInTheDocument();
    });

    it('integrates with other UI components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Component Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='option1'
                />
                <label htmlFor='option1'>Option 1</label>
              </div>
              <div className='flex items-center space-x-2'>
                <input
                  type='radio'
                  id='radio1'
                  name='group'
                />
                <label htmlFor='radio1'>Radio 1</label>
              </div>
            </div>
          </CardContent>
        </Card>,
      );

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Radio 1')).toBeInTheDocument();
    });

    it('supports responsive design', () => {
      render(
        <Card className='mx-auto w-full max-w-md'>
          <CardHeader className='text-center sm:text-left'>
            <CardTitle className='text-lg sm:text-xl'>
              Responsive Card
            </CardTitle>
          </CardHeader>
          <CardContent className='px-4 sm:px-6'>
            <p className='text-sm sm:text-base'>Responsive content</p>
          </CardContent>
        </Card>,
      );

      const card = screen.getByText('Responsive Card').closest('.w-full');
      const title = screen.getByText('Responsive Card');
      const content = screen.getByText('Responsive content');

      expect(card).toHaveClass('max-w-md', 'mx-auto');
      expect(title).toHaveClass('text-lg', 'sm:text-xl');
      expect(content).toHaveClass('text-sm', 'sm:text-base');
    });

    it('works with data visualization components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Chart Card</CardTitle>
            <CardDescription>Data visualization example</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='chart-container'>
              <svg
                width='200'
                height='100'
                data-testid='chart'
              >
                <rect
                  x='10'
                  y='10'
                  width='50'
                  height='80'
                  fill='blue'
                />
                <rect
                  x='70'
                  y='30'
                  width='50'
                  height='60'
                  fill='red'
                />
                <rect
                  x='130'
                  y='20'
                  width='50'
                  height='70'
                  fill='green'
                />
              </svg>
            </div>
          </CardContent>
          <CardFooter>
            <button>Export Chart</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByTestId('chart')).toBeInTheDocument();
      expect(screen.getByText('Export Chart')).toBeInTheDocument();
    });

    it('integrates with navigation components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Navigation Card</CardTitle>
          </CardHeader>
          <CardContent>
            <nav>
              <ul>
                <li>
                  <a href='/home'>Home</a>
                </li>
                <li>
                  <a href='/about'>About</a>
                </li>
                <li>
                  <a href='/contact'>Contact</a>
                </li>
              </ul>
            </nav>
          </CardContent>
        </Card>,
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    });

    it('supports media content integration', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Media Card</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='media-container'>
              <video
                controls
                width='300'
                data-testid='video'
              >
                <source
                  src='/sample-video.mp4'
                  type='video/mp4'
                />
                Your browser does not support the video tag.
              </video>
              <audio
                controls
                data-testid='audio'
              >
                <source
                  src='/sample-audio.mp3'
                  type='audio/mpeg'
                />
                Your browser does not support the audio element.
              </audio>
            </div>
          </CardContent>
        </Card>,
      );

      expect(screen.getByTestId('video')).toBeInTheDocument();
      expect(screen.getByTestId('audio')).toBeInTheDocument();
    });

    it('works with table components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Data Table Card</CardTitle>
          </CardHeader>
          <CardContent>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>City</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td>30</td>
                  <td>New York</td>
                </tr>
                <tr>
                  <td>Jane Smith</td>
                  <td>25</td>
                  <td>Los Angeles</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>,
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Name' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('cell', { name: 'John Doe' }),
      ).toBeInTheDocument();
    });

    it('integrates with modal and dialog components', () => {
      render(
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Modal Trigger Card</CardTitle>
            </CardHeader>
            <CardContent>
              <button data-modal-target='example-modal'>Open Modal</button>
            </CardContent>
          </Card>
          <div
            id='example-modal'
            role='dialog'
            aria-hidden='true'
          >
            <Card>
              <CardHeader>
                <CardTitle>Modal Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card is inside a modal</p>
              </CardContent>
              <CardFooter>
                <button>Close</button>
              </CardFooter>
            </Card>
          </div>
        </div>,
      );

      expect(screen.getByText('Open Modal')).toBeInTheDocument();
      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument(); // dialog has aria-hidden="true"
      expect(screen.getByText('Modal Card')).toBeInTheDocument();
    });

    it('supports accordion-style interactions', () => {
      const AccordionCard = () => {
        const [isExpanded, setIsExpanded] = React.useState(false);

        return (
          <Card>
            <CardHeader>
              <CardTitle>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-expanded={isExpanded}
                >
                  Expandable Card {isExpanded ? '▼' : '▶'}
                </button>
              </CardTitle>
            </CardHeader>
            {isExpanded && (
              <CardContent>
                <p>This content is conditionally rendered</p>
              </CardContent>
            )}
          </Card>
        );
      };

      render(<AccordionCard />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(
        screen.queryByText('This content is conditionally rendered'),
      ).not.toBeInTheDocument();
    });

    it('works with drag and drop interfaces', () => {
      render(
        <Card
          draggable
          data-testid='draggable-card'
        >
          <CardHeader>
            <CardTitle>Draggable Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This card can be dragged and dropped</p>
            <div
              className='drag-handle'
              data-testid='drag-handle'
            >
              ⋮⋮
            </div>
          </CardContent>
        </Card>,
      );

      const card = screen.getByTestId('draggable-card');
      const dragHandle = screen.getByTestId('drag-handle');

      expect(card).toHaveAttribute('draggable', 'true');
      expect(dragHandle).toBeInTheDocument();
    });

    it('integrates with search and filter components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <div className='search-controls'>
              <input
                type='search'
                placeholder='Search...'
              />
              <select>
                <option value='all'>All Categories</option>
                <option value='tech'>Technology</option>
                <option value='design'>Design</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className='results'>
              <p>Search result 1</p>
              <p>Search result 2</p>
            </div>
          </CardContent>
        </Card>,
      );

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
      expect(screen.getByText('Search result 1')).toBeInTheDocument();
    });

    it('supports notification and alert patterns', () => {
      render(
        <Card
          className='alert-card'
          role='alert'
        >
          <CardHeader>
            <CardTitle>⚠️ Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is an important notification</p>
          </CardContent>
          <CardFooter>
            <button>Dismiss</button>
            <button>Learn More</button>
          </CardFooter>
        </Card>,
      );

      const alertCard = screen.getByRole('alert');
      expect(alertCard).toHaveClass('alert-card');
      expect(screen.getByText('⚠️ Warning')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('works with loading and skeleton states', () => {
      const LoadingCard = ({ isLoading }: { isLoading: boolean }) => (
        <Card>
          <CardHeader>
            <CardTitle>
              {isLoading ? (
                <div
                  className='skeleton-title'
                  data-testid='skeleton'
                >
                  Loading...
                </div>
              ) : (
                'Loaded Content'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div
                className='skeleton-content'
                data-testid='skeleton-content'
              >
                <div className='skeleton-line'></div>
                <div className='skeleton-line'></div>
              </div>
            ) : (
              <p>Actual content here</p>
            )}
          </CardContent>
        </Card>
      );

      const { rerender } = render(<LoadingCard isLoading={true} />);

      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-content')).toBeInTheDocument();

      rerender(<LoadingCard isLoading={false} />);

      expect(screen.getByText('Loaded Content')).toBeInTheDocument();
      expect(screen.getByText('Actual content here')).toBeInTheDocument();
    });

    it('integrates with pagination components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Paginated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='content-list'>
              <p>Item 1</p>
              <p>Item 2</p>
              <p>Item 3</p>
            </div>
          </CardContent>
          <CardFooter>
            <nav aria-label='Pagination'>
              <button disabled>Previous</button>
              <span>Page 1 of 5</span>
              <button>Next</button>
            </nav>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeDisabled();
      expect(screen.getByText('Next')).toBeEnabled();
    });
  });
});
