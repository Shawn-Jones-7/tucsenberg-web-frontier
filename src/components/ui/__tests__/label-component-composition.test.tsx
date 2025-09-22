/**
 * @vitest-environment jsdom
 */

/**
 * Label Component Composition Tests
 *
 * Tests for Label component composition with other UI components including:
 * - Integration with other UI components
 * - Modal/dialog contexts
 * - Nested component structures
 * - Conditional rendering scenarios
 * - Dynamic content handling
 */

import { Label } from '@/components/ui/label';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Label Component Composition Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Component Composition', () => {
    it('works with other UI components', () => {
      const Card = ({ children }: { children: React.ReactNode }) => (
        <div className='card'>{children}</div>
      );

      const Button = ({
        children,
        ...props
      }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button
          className='btn'
          {...props}
        >
          {children}
        </button>
      );

      render(
        <Card>
          <form>
            <div>
              <Label htmlFor='card-input'>Card Input</Label>
              <input
                id='card-input'
                type='text'
              />
            </div>
            <Button type='submit'>Submit</Button>
          </form>
        </Card>,
      );

      expect(screen.getByText('Card Input')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toHaveClass('btn');
    });

    it('works in modal/dialog contexts', () => {
      const Modal = ({ children }: { children: React.ReactNode }) => (
        <div
          role='dialog'
          aria-modal='true'
          className='modal'
        >
          {children}
        </div>
      );

      render(
        <Modal>
          <form>
            <Label htmlFor='modal-input'>Modal Input</Label>
            <input
              id='modal-input'
              type='text'
            />
          </form>
        </Modal>,
      );

      const dialog = screen.getByRole('dialog');
      const label = screen.getByText('Modal Input');

      expect(dialog).toContainElement(label);
    });

    it('handles nested component structures', () => {
      const FieldGroup = ({ children }: { children: React.ReactNode }) => (
        <div className='field-group'>{children}</div>
      );

      const FieldWrapper = ({ children }: { children: React.ReactNode }) => (
        <div className='field-wrapper'>{children}</div>
      );

      render(
        <FieldGroup>
          <FieldWrapper>
            <Label htmlFor='nested-input'>Nested Input</Label>
            <input
              id='nested-input'
              type='text'
            />
          </FieldWrapper>
        </FieldGroup>,
      );

      const label = screen.getByText('Nested Input');
      expect(label.closest('.field-group')).toBeInTheDocument();
      expect(label.closest('.field-wrapper')).toBeInTheDocument();
    });

    it('works with conditional rendering', () => {
      const ConditionalForm = ({ showEmail }: { showEmail: boolean }) => (
        <form>
          <div>
            <Label htmlFor='always-name'>Name</Label>
            <input
              id='always-name'
              type='text'
            />
          </div>
          {showEmail && (
            <div>
              <Label htmlFor='conditional-email'>Email</Label>
              <input
                id='conditional-email'
                type='email'
              />
            </div>
          )}
        </form>
      );

      const { rerender } = render(<ConditionalForm showEmail={false} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.queryByText('Email')).not.toBeInTheDocument();

      rerender(<ConditionalForm showEmail={true} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('handles dynamic label content', () => {
      const DynamicLabel = ({ count }: { count: number }) => (
        <Label htmlFor='dynamic-input'>Items ({count})</Label>
      );

      const { rerender } = render(
        <div>
          <DynamicLabel count={0} />
          <input
            id='dynamic-input'
            type='number'
          />
        </div>,
      );

      expect(screen.getByText('Items (0)')).toBeInTheDocument();

      rerender(
        <div>
          <DynamicLabel count={5} />
          <input
            id='dynamic-input'
            type='number'
          />
        </div>,
      );

      expect(screen.getByText('Items (5)')).toBeInTheDocument();
    });

    it('works with complex form layouts', () => {
      const FormSection = ({
        title,
        children,
      }: {
        title: string;
        children: React.ReactNode;
      }) => (
        <section>
          <h3>{title}</h3>
          {children}
        </section>
      );

      const FormRow = ({ children }: { children: React.ReactNode }) => (
        <div className='form-row'>{children}</div>
      );

      const FormColumn = ({ children }: { children: React.ReactNode }) => (
        <div className='form-column'>{children}</div>
      );

      render(
        <form>
          <FormSection title='Personal Information'>
            <FormRow>
              <FormColumn>
                <Label htmlFor='first-name'>First Name</Label>
                <input
                  id='first-name'
                  type='text'
                />
              </FormColumn>
              <FormColumn>
                <Label htmlFor='last-name'>Last Name</Label>
                <input
                  id='last-name'
                  type='text'
                />
              </FormColumn>
            </FormRow>
          </FormSection>
          <FormSection title='Contact Information'>
            <FormRow>
              <FormColumn>
                <Label htmlFor='email'>Email</Label>
                <input
                  id='email'
                  type='email'
                />
              </FormColumn>
              <FormColumn>
                <Label htmlFor='phone'>Phone</Label>
                <input
                  id='phone'
                  type='tel'
                />
              </FormColumn>
            </FormRow>
          </FormSection>
        </form>,
      );

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    });

    it('works with custom form components', async () => {
      const CustomFormField = ({
        id,
        label,
        type = 'text',
      }: {
        id: string;
        label: string;
        type?: string;
      }) => (
        <div className='form-field'>
          <Label
            htmlFor={id}
            className='form-label'
          >
            {label}
          </Label>
          <input
            id={id}
            type={type}
            className='form-input'
          />
        </div>
      );

      render(
        <form>
          <CustomFormField
            id='custom1'
            label='Custom Field 1'
          />
          <CustomFormField
            id='custom2'
            label='Custom Field 2'
            type='email'
          />
        </form>,
      );

      const label1 = screen.getByText('Custom Field 1');
      const label2 = screen.getByText('Custom Field 2');

      expect(label1).toHaveClass('form-label');
      expect(label2).toHaveClass('form-label');

      await user.click(label1);
      expect(screen.getByLabelText('Custom Field 1')).toHaveFocus();
    });

    it('handles component composition with styling', () => {
      const StyledFormGroup = ({ children }: { children: React.ReactNode }) => (
        <div className='styled-form-group'>{children}</div>
      );

      render(
        <form>
          <StyledFormGroup>
            <Label
              htmlFor='styled-input'
              className='styled-label'
            >
              Styled Input
            </Label>
            <input
              id='styled-input'
              type='text'
              className='styled-input'
            />
          </StyledFormGroup>
        </form>,
      );

      const label = screen.getByText('Styled Input');
      expect(label).toHaveClass('styled-label');
      expect(label.closest('.styled-form-group')).toBeInTheDocument();
    });

    it('works with component libraries integration', () => {
      // Simulate integration with component libraries
      const LibraryCard = ({ children }: { children: React.ReactNode }) => (
        <div
          className='lib-card'
          data-testid='library-card'
        >
          {children}
        </div>
      );

      const LibraryInput = React.forwardRef<
        HTMLInputElement,
        React.InputHTMLAttributes<HTMLInputElement>
      >(({ className, ...props }, ref) => (
        <input
          ref={ref}
          className={`lib-input ${className || ''}`}
          {...props}
        />
      ));

      render(
        <LibraryCard>
          <form>
            <div>
              <Label htmlFor='lib-input'>Library Input</Label>
              <LibraryInput
                id='lib-input'
                type='text'
              />
            </div>
          </form>
        </LibraryCard>,
      );

      const card = screen.getByTestId('library-card');
      const label = screen.getByText('Library Input');
      const input = screen.getByLabelText('Library Input');

      expect(card).toContainElement(label);
      expect(input).toHaveClass('lib-input');
    });

    it('handles portal/teleport scenarios', () => {
      // Simulate portal rendering (like tooltips, dropdowns)
      const PortalContent = ({ children }: { children: React.ReactNode }) => (
        <div
          id='portal-root'
          data-testid='portal-content'
        >
          {children}
        </div>
      );

      render(
        <div>
          <form>
            <Label htmlFor='portal-trigger'>Portal Trigger</Label>
            <input
              id='portal-trigger'
              type='text'
            />
          </form>
          <PortalContent>
            <div>Portal content with label reference</div>
          </PortalContent>
        </div>,
      );

      const label = screen.getByText('Portal Trigger');
      const input = screen.getByLabelText('Portal Trigger');
      const portalContent = screen.getByTestId('portal-content');

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(portalContent).toBeInTheDocument();
    });

    it('works with error boundary contexts', () => {
      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        try {
          return <div className='error-boundary'>{children}</div>;
        } catch {
          return <div>Error occurred</div>;
        }
      };

      render(
        <ErrorBoundary>
          <form>
            <Label htmlFor='error-boundary-input'>Error Boundary Input</Label>
            <input
              id='error-boundary-input'
              type='text'
            />
          </form>
        </ErrorBoundary>,
      );

      const label = screen.getByText('Error Boundary Input');
      expect(label.closest('.error-boundary')).toBeInTheDocument();
    });

    it('handles theme provider contexts', () => {
      const ThemeProvider = ({
        theme,
        children,
      }: {
        theme: string;
        children: React.ReactNode;
      }) => (
        <div
          className={`theme-${theme}`}
          data-theme={theme}
        >
          {children}
        </div>
      );

      render(
        <ThemeProvider theme='dark'>
          <form>
            <Label htmlFor='themed-input'>Themed Input</Label>
            <input
              id='themed-input'
              type='text'
            />
          </form>
        </ThemeProvider>,
      );

      const label = screen.getByText('Themed Input');
      const themeContainer = label.closest('[data-theme]');

      expect(themeContainer).toHaveAttribute('data-theme', 'dark');
      expect(themeContainer).toHaveClass('theme-dark');
    });
  });
});
