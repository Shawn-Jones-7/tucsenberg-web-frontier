/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

describe('Tabs Integration and Edge Cases', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Integration', () => {
    it('works with complex tab structure', async () => {
      render(
        <Tabs
          defaultValue='overview'
          data-testid='main-tabs'
        >
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics'>Analytics</TabsTrigger>
            <TabsTrigger value='reports'>Reports</TabsTrigger>
            <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value='overview'>
            <div>
              <h2>Overview Dashboard</h2>
              <p>Welcome to the overview section</p>
            </div>
          </TabsContent>
          <TabsContent value='analytics'>
            <div>
              <h2>Analytics</h2>
              <Tabs
                defaultValue='traffic'
                data-testid='nested-tabs'
              >
                <TabsList>
                  <TabsTrigger value='traffic'>Traffic</TabsTrigger>
                  <TabsTrigger value='conversions'>Conversions</TabsTrigger>
                </TabsList>
                <TabsContent value='traffic'>Traffic data</TabsContent>
                <TabsContent value='conversions'>Conversion data</TabsContent>
              </Tabs>
            </div>
          </TabsContent>
          <TabsContent value='reports'>
            <div>
              <h2>Reports</h2>
              <button>Generate Report</button>
            </div>
          </TabsContent>
          <TabsContent value='notifications'>
            <div>
              <h2>Notifications</h2>
              <ul>
                <li>Notification 1</li>
                <li>Notification 2</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>,
      );

      // Check initial state
      expect(screen.getByText('Overview Dashboard')).toBeInTheDocument();

      // Navigate to analytics
      await user.click(screen.getByRole('tab', { name: 'Analytics' }));
      expect(screen.getByText('Traffic data')).toBeInTheDocument();

      // Test nested tabs
      await user.click(screen.getByText('Conversions'));
      expect(screen.getByText('Conversion data')).toBeInTheDocument();

      // Navigate to reports
      await user.click(screen.getByText('Reports'));
      expect(screen.getByText('Generate Report')).toBeInTheDocument();
    });

    it('handles form interactions within tabs', async () => {
      const TestForm = () => {
        const [formData, setFormData] = React.useState({
          name: '',
          email: '',
          message: '',
        });

        return (
          <Tabs defaultValue='personal'>
            <TabsList>
              <TabsTrigger value='personal'>Personal Info</TabsTrigger>
              <TabsTrigger value='contact'>Contact</TabsTrigger>
            </TabsList>
            <TabsContent value='personal'>
              <input
                data-testid='name-input'
                placeholder='Name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                data-testid='email-input'
                placeholder='Email'
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </TabsContent>
            <TabsContent value='contact'>
              <textarea
                data-testid='message-input'
                placeholder='Message'
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
              <div data-testid='form-summary'>
                Name: {formData.name}, Email: {formData.email}, Message:{' '}
                {formData.message}
              </div>
            </TabsContent>
          </Tabs>
        );
      };

      render(<TestForm />);

      // Fill personal info
      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');

      // Switch to contact tab
      await user.click(screen.getByText('Contact'));

      // Fill message
      const messageInput = screen.getByTestId('message-input');
      await user.type(messageInput, 'Hello World');

      // Check form summary
      const summary = screen.getByTestId('form-summary');
      expect(summary).toHaveTextContent(
        'Name: John Doe, Email: john@example.com, Message: Hello World',
      );

      // Switch back to personal tab
      await user.click(screen.getByText('Personal Info'));

      // Values should be preserved
      const nameInput2 = screen.getByTestId('name-input');
      const emailInput2 = screen.getByTestId('email-input');
      expect(nameInput2).toHaveValue('John Doe');
      expect(emailInput2).toHaveValue('john@example.com');
    });
  });

  describe('Edge Cases', () => {
    it('handles tabs without content', () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
          {/* No content for tab2 */}
        </Tabs>,
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      // Switch to tab2 (no content)
      // This should not cause errors
      expect(() => {
        screen.getByText('Tab 2').click();
      }).not.toThrow();
    });

    it('handles tabs with only whitespace content', () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'> </TabsContent>
        </Tabs>,
      );

      const content = screen.getByRole('tabpanel');
      expect(content).toBeInTheDocument();
      expect(content.textContent?.trim()).toBe('');
    });

    it('handles rapid tab switching', async () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
            <TabsTrigger value='tab3'>Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Content 1</TabsContent>
          <TabsContent value='tab2'>Content 2</TabsContent>
          <TabsContent value='tab3'>Content 3</TabsContent>
        </Tabs>,
      );

      // Rapidly switch between tabs
      await user.click(screen.getByText('Tab 2'));
      await user.click(screen.getByText('Tab 3'));
      await user.click(screen.getByText('Tab 1'));
      await user.click(screen.getByText('Tab 2'));

      // Should end up on tab 2
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });

    it('handles tabs with identical content', () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList>
            <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
            <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value='tab1'>Same Content</TabsContent>
          <TabsContent value='tab2'>Same Content</TabsContent>
        </Tabs>,
      );

      // Both tabs have same content, but only one should be visible
      const contents = screen.getAllByText('Same Content');
      expect(contents).toHaveLength(1);
    });

    it('handles single tab', () => {
      render(
        <Tabs defaultValue='only-tab'>
          <TabsList>
            <TabsTrigger value='only-tab'>Only Tab</TabsTrigger>
          </TabsList>
          <TabsContent value='only-tab'>Only Content</TabsContent>
        </Tabs>,
      );

      expect(screen.getByText('Only Tab')).toBeInTheDocument();
      expect(screen.getByText('Only Content')).toBeInTheDocument();

      const trigger = screen.getByText('Only Tab');
      expect(trigger).toHaveAttribute('aria-selected', 'true');
    });

    it('handles empty tabs list', () => {
      render(
        <Tabs defaultValue='tab1'>
          <TabsList />
          <TabsContent value='tab1'>Content 1</TabsContent>
        </Tabs>,
      );

      // Should render without errors
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toBeInTheDocument();
      expect(tabsList).toBeEmptyDOMElement();
    });
  });
});
