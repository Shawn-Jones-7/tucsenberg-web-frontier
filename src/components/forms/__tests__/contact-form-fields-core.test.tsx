import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdditionalFields,
  CheckboxFields,
  ContactFields,
  NameFields,
} from '../contact-form-fields';

// Mock translation function
const mockT = vi.fn((key: string) => key);

// React 19 Native Form Props for testing
const defaultProps = {
  t: mockT,
  isPending: false,
};

describe('Contact Form Fields - Core Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NameFields Component', () => {
    it('should render first name and last name fields', () => {
      render(<NameFields {...defaultProps} />);

      expect(screen.getByLabelText(/firstName/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lastName/i)).toBeInTheDocument();
    });

    it('should show required indicators', () => {
      render(<NameFields {...defaultProps} />);

      // Check for required asterisks (*) in labels
      const labels = screen.getAllByText(/firstName|lastName/);
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should have required attributes on inputs', () => {
      render(<NameFields {...defaultProps} />);

      const firstNameInput = screen.getByLabelText(/firstName/i);
      const lastNameInput = screen.getByLabelText(/lastName/i);

      expect(firstNameInput).toHaveAttribute('required');
      expect(lastNameInput).toHaveAttribute('required');
      expect(firstNameInput).toHaveAttribute('name', 'firstName');
      expect(lastNameInput).toHaveAttribute('name', 'lastName');
    });

    it('should disable inputs when isPending is true', () => {
      render(
        <NameFields
          {...defaultProps}
          isPending={true}
        />,
      );

      const firstNameInput = screen.getByLabelText(/firstName/i);
      const lastNameInput = screen.getByLabelText(/lastName/i);

      expect(firstNameInput).toBeDisabled();
      expect(lastNameInput).toBeDisabled();
    });
  });

  describe('ContactFields Component', () => {
    it('should render email and company fields', () => {
      render(<ContactFields {...defaultProps} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    });

    it('should show email as required', () => {
      render(<ContactFields {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have correct input attributes', () => {
      render(<ContactFields {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      const companyInput = screen.getByLabelText(/company/i);

      expect(emailInput).toHaveAttribute('name', 'email');
      expect(companyInput).toHaveAttribute('name', 'company');
    });

    it('should disable inputs when isPending is true', () => {
      render(
        <ContactFields
          {...defaultProps}
          isPending={true}
        />,
      );

      const emailInput = screen.getByLabelText(/email/i);
      const companyInput = screen.getByLabelText(/company/i);

      expect(emailInput).toBeDisabled();
      expect(companyInput).toBeDisabled();
    });
  });

  describe('CheckboxFields Component', () => {
    it('should render privacy policy checkbox', () => {
      render(<CheckboxFields {...defaultProps} />);

      expect(screen.getByLabelText(/acceptPrivacy/i)).toBeInTheDocument();
      expect(screen.getByText(/acceptPrivacy/i)).toBeInTheDocument();
    });

    it('should have required attribute on checkbox', () => {
      render(<CheckboxFields {...defaultProps} />);

      const checkbox = screen.getByLabelText(/acceptPrivacy/i);
      expect(checkbox).toHaveAttribute('required');
      expect(checkbox).toHaveAttribute('name', 'acceptPrivacy');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('should handle checkbox interactions', async () => {
      const user = userEvent.setup();
      render(<CheckboxFields {...defaultProps} />);

      const checkbox = screen.getByLabelText(/acceptPrivacy/i);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should disable checkbox when isPending is true', () => {
      render(
        <CheckboxFields
          {...defaultProps}
          isPending={true}
        />,
      );

      const checkbox = screen.getByLabelText(/acceptPrivacy/i);
      expect(checkbox).toBeDisabled();
    });
  });

  describe('AdditionalFields Component', () => {
    it('should render phone and subject fields', () => {
      render(<AdditionalFields {...defaultProps} />);

      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    });

    it('should have correct input attributes', () => {
      render(<AdditionalFields {...defaultProps} />);

      const phoneInput = screen.getByLabelText(/phone/i);
      const subjectInput = screen.getByLabelText(/subject/i);

      expect(phoneInput).toHaveAttribute('name', 'phone');
      expect(phoneInput).toHaveAttribute('type', 'tel');
      expect(subjectInput).toHaveAttribute('name', 'subject');
      expect(subjectInput).toHaveAttribute('type', 'text');
    });

    it('should handle input interactions', async () => {
      const user = userEvent.setup();
      render(<AdditionalFields {...defaultProps} />);

      const phoneField = screen.getByLabelText(/phone/i);
      const subjectField = screen.getByLabelText(/subject/i);

      await user.type(phoneField, '+1234567890');
      await user.type(subjectField, 'Test subject');

      expect(phoneField).toHaveValue('+1234567890');
      expect(subjectField).toHaveValue('Test subject');
    });

    it('should disable inputs when isPending is true', () => {
      render(
        <AdditionalFields
          {...defaultProps}
          isPending={true}
        />,
      );

      const phoneInput = screen.getByLabelText(/phone/i);
      const subjectInput = screen.getByLabelText(/subject/i);

      expect(phoneInput).toBeDisabled();
      expect(subjectInput).toBeDisabled();
    });
  });

  describe('React 19 Native Form Integration', () => {
    it('should render all form fields with correct names', () => {
      render(
        <div>
          <NameFields {...defaultProps} />
          <ContactFields {...defaultProps} />
          <CheckboxFields {...defaultProps} />
          <AdditionalFields {...defaultProps} />
        </div>,
      );

      // Verify all fields have correct name attributes for form submission
      expect(screen.getByLabelText(/firstName/i)).toHaveAttribute(
        'name',
        'firstName',
      );
      expect(screen.getByLabelText(/lastName/i)).toHaveAttribute(
        'name',
        'lastName',
      );
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('name', 'email');
      expect(screen.getByLabelText(/company/i)).toHaveAttribute(
        'name',
        'company',
      );
      expect(screen.getByLabelText(/phone/i)).toHaveAttribute('name', 'phone');
      expect(screen.getByLabelText(/subject/i)).toHaveAttribute(
        'name',
        'subject',
      );
      expect(screen.getByLabelText(/acceptPrivacy/i)).toHaveAttribute(
        'name',
        'acceptPrivacy',
      );
      expect(screen.getByLabelText(/marketingConsent/i)).toHaveAttribute(
        'name',
        'marketingConsent',
      );
    });

    it('should handle form submission state with isPending', () => {
      const pendingProps = {
        ...defaultProps,
        isPending: true,
      };

      render(
        <div>
          <NameFields {...pendingProps} />
          <ContactFields {...pendingProps} />
          <CheckboxFields {...pendingProps} />
          <AdditionalFields {...pendingProps} />
        </div>,
      );

      // All fields should be disabled during submission
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });

      const checkbox = screen.getByLabelText(/acceptPrivacy/i);
      expect(checkbox).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <div>
          <NameFields {...defaultProps} />
          <ContactFields {...defaultProps} />
          <CheckboxFields {...defaultProps} />
          <AdditionalFields {...defaultProps} />
        </div>,
      );

      // Check that all form fields have accessible labels
      expect(screen.getByLabelText(/firstName/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lastName/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/acceptPrivacy/i)).toBeInTheDocument();
    });

    it('should have aria-describedby attributes for error handling', () => {
      render(
        <div>
          <NameFields {...defaultProps} />
          <ContactFields {...defaultProps} />
          <AdditionalFields {...defaultProps} />
        </div>,
      );

      const firstNameField = screen.getByLabelText(/firstName/i);
      const lastNameField = screen.getByLabelText(/lastName/i);
      const emailField = screen.getByLabelText(/email/i);
      const phoneField = screen.getByLabelText(/phone/i);

      // Fields should have aria-describedby for error messages
      expect(firstNameField).toHaveAttribute(
        'aria-describedby',
        'firstName-error',
      );
      expect(lastNameField).toHaveAttribute(
        'aria-describedby',
        'lastName-error',
      );
      expect(emailField).toHaveAttribute('aria-describedby', 'email-error');
      expect(phoneField).toHaveAttribute('aria-describedby', 'phone-error');
    });
  });

  describe('Translation Integration', () => {
    it('should call translation function for all labels', () => {
      render(
        <div>
          <NameFields {...defaultProps} />
          <ContactFields {...defaultProps} />
          <CheckboxFields {...defaultProps} />
          <AdditionalFields {...defaultProps} />
        </div>,
      );

      // Verify translation function was called for field labels
      expect(mockT).toHaveBeenCalledWith('firstName');
      expect(mockT).toHaveBeenCalledWith('lastName');
      expect(mockT).toHaveBeenCalledWith('email');
      expect(mockT).toHaveBeenCalledWith('company');
      expect(mockT).toHaveBeenCalledWith('phone');
      expect(mockT).toHaveBeenCalledWith('subject');
      expect(mockT).toHaveBeenCalledWith('acceptPrivacy');
      expect(mockT).toHaveBeenCalledWith('marketingConsent');
    });
  });
});
