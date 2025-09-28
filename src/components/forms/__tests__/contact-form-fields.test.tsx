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

describe('Contact Form Fields - React 19 Native Form Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NameFields Component', () => {
    it('should render first name and last name fields', () => {
      render(<NameFields {...defaultProps} />);

      expect(screen.getByLabelText(/firstName/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lastName/i)).toBeInTheDocument();
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

      expect(screen.getByLabelText(/firstName/i)).toBeDisabled();
      expect(screen.getByLabelText(/lastName/i)).toBeDisabled();
    });
  });

  describe('ContactFields Component', () => {
    it('should render email and company fields', () => {
      render(<ContactFields {...defaultProps} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    });

    it('should have correct input attributes', () => {
      render(<ContactFields {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      const companyInput = screen.getByLabelText(/company/i);

      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
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

      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/company/i)).toBeDisabled();
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
    });

    it('should disable inputs when isPending is true', () => {
      render(
        <AdditionalFields
          {...defaultProps}
          isPending={true}
        />,
      );

      expect(screen.getByLabelText(/phone/i)).toBeDisabled();
      expect(screen.getByLabelText(/subject/i)).toBeDisabled();
    });
  });

  describe('CheckboxFields Component', () => {
    it('should render privacy policy and marketing consent checkboxes', () => {
      render(<CheckboxFields {...defaultProps} />);

      expect(screen.getByLabelText(/acceptPrivacy/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/marketingConsent/i)).toBeInTheDocument();
    });

    it('should have correct checkbox attributes', () => {
      render(<CheckboxFields {...defaultProps} />);

      const privacyCheckbox = screen.getByLabelText(/acceptPrivacy/i);
      const marketingCheckbox = screen.getByLabelText(/marketingConsent/i);

      expect(privacyCheckbox).toHaveAttribute('required');
      expect(privacyCheckbox).toHaveAttribute('name', 'acceptPrivacy');
      expect(marketingCheckbox).toHaveAttribute('name', 'marketingConsent');
    });

    it('should handle checkbox interactions', async () => {
      const user = userEvent.setup();
      render(<CheckboxFields {...defaultProps} />);

      const privacyCheckbox = screen.getByLabelText(/acceptPrivacy/i);
      const marketingCheckbox = screen.getByLabelText(/marketingConsent/i);

      expect(privacyCheckbox).not.toBeChecked();
      expect(marketingCheckbox).not.toBeChecked();

      await user.click(privacyCheckbox);
      await user.click(marketingCheckbox);

      expect(privacyCheckbox).toBeChecked();
      expect(marketingCheckbox).toBeChecked();
    });

    it('should disable checkboxes when isPending is true', () => {
      render(
        <CheckboxFields
          {...defaultProps}
          isPending={true}
        />,
      );

      expect(screen.getByLabelText(/acceptPrivacy/i)).toBeDisabled();
      expect(screen.getByLabelText(/marketingConsent/i)).toBeDisabled();
    });
  });

  describe('Translation Integration', () => {
    it('should call translation function for all labels', () => {
      render(
        <div>
          <NameFields {...defaultProps} />
          <ContactFields {...defaultProps} />
          <AdditionalFields {...defaultProps} />
          <CheckboxFields {...defaultProps} />
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
