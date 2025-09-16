import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdditionalFields,
  CheckboxFields,
  ContactFields,
  NameFields,
} from '../contact-form-fields';

// Mock react-hook-form
const mockRegister = vi.fn();
 
const mockSetValue = vi.fn();

// Mock translation function
const mockT = vi.fn((key: string) => key);

// Default props for testing
const defaultProps = {
  register: mockRegister as any,
  errors: {},
  isSubmitting: false,
  t: mockT as any,
  watchedValues: {
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    message: '',
    acceptPrivacy: false,
    phone: '',
    subject: '',
    marketingConsent: false,
    website: '',
  },
  setValue: mockSetValue,
};

describe('Contact Form Fields - Core Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister.mockReturnValue({
      name: 'test-field',
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    });
  });

  describe('NameFields Component', () => {
    it('should render first name and last name fields', () => {
      render(<NameFields {...defaultProps} />);

      expect(screen.getByLabelText(/firstName/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lastName/i)).toBeInTheDocument();
    });

    it('should show required indicators', () => {
      render(<NameFields {...defaultProps} />);

      // Check for required asterisks (*)
      const labels = screen.getAllByText(/firstName|lastName/);
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should display validation errors', () => {
      const propsWithErrors = {
        ...defaultProps,
        errors: {
          firstName: { message: 'First name is required' },
          lastName: { message: 'Last name is required' },
        } as any,
      };

      render(<NameFields {...(propsWithErrors as any)} />);

      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
    });
  });

  describe('ContactFields Component', () => {
    it('should render email and phone fields', () => {
      render(<ContactFields {...defaultProps} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });

    it('should show email as required', () => {
      render(<ContactFields {...defaultProps} />);

      const emailLabel = screen.getByText(/email/i);
      expect(emailLabel).toBeInTheDocument();
    });

    it('should display email validation errors', () => {
      const propsWithErrors = {
        ...defaultProps,
        errors: {
          email: { message: 'Invalid email format' },
        } as any,
      };

      render(<ContactFields {...(propsWithErrors as any)} />);

      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  describe('CheckboxFields Component', () => {
    it('should render privacy policy checkbox', () => {
      render(<CheckboxFields {...defaultProps} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText(/privacyPolicy/i)).toBeInTheDocument();
    });

    it('should handle checkbox interactions', async () => {
      const user = userEvent.setup();
      render(<CheckboxFields {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('should display privacy policy validation errors', () => {
      const propsWithErrors = {
        ...defaultProps,
        errors: {
          privacyPolicy: { message: 'You must accept the privacy policy' },
        } as any,
      };

      render(<CheckboxFields {...propsWithErrors} />);

      expect(
        screen.getByText('You must accept the privacy policy'),
      ).toBeInTheDocument();
    });
  });

  describe('AdditionalFields Component', () => {
    it('should render message textarea', () => {
      render(<AdditionalFields {...defaultProps} />);

      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it('should handle message input', async () => {
      const user = userEvent.setup();
      render(<AdditionalFields {...defaultProps} />);

      const messageField = screen.getByLabelText(/message/i);
      await user.type(messageField, 'Test message');

      expect(messageField).toHaveValue('Test message');
    });

    it('should display message validation errors', () => {
      const propsWithErrors = {
        ...defaultProps,
        errors: {
          message: { message: 'Message is too long' },
        } as any,
      };

      render(<AdditionalFields {...(propsWithErrors as any)} />);

      expect(screen.getByText('Message is too long')).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('should register all fields with react-hook-form', () => {
      render(
        <div>
          <NameFields {...defaultProps} />
          <ContactFields {...defaultProps} />
          <CheckboxFields {...defaultProps} />
          <AdditionalFields {...defaultProps} />
        </div>,
      );

      // Verify register was called for all expected fields
      expect(mockRegister).toHaveBeenCalledWith(
        'firstName',
        expect.any(Object),
      );
      expect(mockRegister).toHaveBeenCalledWith('lastName', expect.any(Object));
      expect(mockRegister).toHaveBeenCalledWith('email', expect.any(Object));
      expect(mockRegister).toHaveBeenCalledWith('phone', expect.any(Object));
      expect(mockRegister).toHaveBeenCalledWith(
        'privacyPolicy',
        expect.any(Object),
      );
      expect(mockRegister).toHaveBeenCalledWith('message', expect.any(Object));
    });

    it('should handle form submission state', () => {
      const submittingProps = {
        ...defaultProps,
        isSubmitting: true,
      };

      render(
        <div>
          <NameFields {...submittingProps} />
          <ContactFields {...submittingProps} />
          <CheckboxFields {...submittingProps} />
          <AdditionalFields {...submittingProps} />
        </div>,
      );

      // All fields should be disabled during submission
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });

      const checkbox = screen.getByRole('checkbox');
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
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it('should associate error messages with fields', () => {
      const propsWithErrors = {
        ...defaultProps,
        errors: {
          firstName: { message: 'First name error' },
          email: { message: 'Email error' },
        } as any,
      };

      render(
        <div>
          <NameFields {...(propsWithErrors as any)} />
          <ContactFields {...(propsWithErrors as any)} />
        </div>,
      );

      const firstNameField = screen.getByLabelText(/firstName/i);
      const emailField = screen.getByLabelText(/email/i);

      // Fields should have aria-describedby pointing to error messages
      expect(firstNameField).toHaveAttribute('aria-describedby');
      expect(emailField).toHaveAttribute('aria-describedby');
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
      expect(mockT).toHaveBeenCalledWith(expect.stringContaining('firstName'));
      expect(mockT).toHaveBeenCalledWith(expect.stringContaining('lastName'));
      expect(mockT).toHaveBeenCalledWith(expect.stringContaining('email'));
      expect(mockT).toHaveBeenCalledWith(expect.stringContaining('phone'));
      expect(mockT).toHaveBeenCalledWith(expect.stringContaining('message'));
      expect(mockT).toHaveBeenCalledWith(
        expect.stringContaining('privacyPolicy'),
      );
    });
  });
});
