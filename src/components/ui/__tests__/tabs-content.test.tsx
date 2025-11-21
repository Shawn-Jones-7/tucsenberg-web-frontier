/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

describe('TabsContent Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders tabs content', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent
          value='tab1'
          data-testid='tab-content'
        >
          Content 1
        </TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
      </Tabs>,
    );

    const tabContent = screen.getByTestId('tab-content');
    expect(tabContent).toBeInTheDocument();
    expect(tabContent).toHaveAttribute('role', 'tabpanel');
    expect(tabContent).toHaveAttribute('data-state', 'active');
  });

  it('applies correct CSS classes', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent
          value='tab1'
          data-testid='tab-content'
        >
          Content 1
        </TabsContent>
      </Tabs>,
    );

    const tabContent = screen.getByTestId('tab-content');
    expect(tabContent).toHaveClass('flex-1', 'outline-none');
  });

  it('accepts custom className', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent
          value='tab1'
          className='custom-content'
          data-testid='tab-content'
        >
          Content 1
        </TabsContent>
      </Tabs>,
    );

    const tabContent = screen.getByTestId('tab-content');
    expect(tabContent).toHaveClass('custom-content');
  });

  it('shows and hides content based on active tab', async () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
      </Tabs>,
    );

    // Initially tab1 content should be visible
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

    // Click tab2
    await user.click(screen.getByText('Tab 2'));

    // Now tab2 content should be visible
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('supports complex content', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>
          <div>
            <h2>Complex Content</h2>
            <p>This is a paragraph</p>
            <button>Action Button</button>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>,
    );

    expect(screen.getByText('Complex Content')).toBeInTheDocument();
    expect(screen.getByText('This is a paragraph')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
    expect(screen.getByText('List item 1')).toBeInTheDocument();
    expect(screen.getByText('List item 2')).toBeInTheDocument();
  });

  it('maintains content state when switching tabs', async () => {
    const TestComponent = () => {
      const [inputValue, setInputValue] = React.useState('');

      return (
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>
            <input
              data-testid='tab1-input'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Type something...'
            />
          </TabsContent>
          <TabsContent value='tab2'>
            <div>Tab 2 Content</div>
          </TabsContent>
        </Tabs>
      );
    };

    render(<TestComponent />);

    const input = screen.getByTestId('tab1-input');

    // Type in the input
    await user.type(input, 'Hello');
    expect(input).toHaveValue('Hello');

    // Switch to tab2
    await user.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Tab 2 Content')).toBeInTheDocument();

    // Switch back to tab1
    await user.click(screen.getByText('Tab 1'));

    // Input value should be preserved
    expect(screen.getByTestId('tab1-input')).toHaveValue('Hello');
  });

  it('supports focusable content', async () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>
          <button data-testid='content-button'>Click me</button>
          <input
            data-testid='content-input'
            placeholder='Focus me'
          />
        </TabsContent>
      </Tabs>,
    );

    const button = screen.getByTestId('content-button');
    const input = screen.getByTestId('content-input');

    // Focus and interact with button
    await user.click(button);
    expect(button).toHaveFocus();

    // Tab to input
    await user.tab();
    expect(input).toHaveFocus();

    // Type in input
    await user.type(input, 'test');
    expect(input).toHaveValue('test');
  });

  it('handles empty content gracefully', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent
          value='tab1'
          data-testid='empty-content'
        />
      </Tabs>,
    );

    const content = screen.getByTestId('empty-content');
    expect(content).toBeInTheDocument();
    expect(content).toBeEmptyDOMElement();
  });
});
