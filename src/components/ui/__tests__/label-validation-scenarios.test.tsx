/**
 * @vitest-environment jsdom
 */

/**
 * Label Validation Scenarios Tests
 *
 * Tests for Label component validation scenarios including:
 * - Form validation integration
 * - Error state handling
 * - Custom validation logic
 * - Form library integration patterns
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Validation Scenarios Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Validation Integration', () => {
    it('handles form state management', async () => {
      const FormWithState = () => {
        const [values, setValues] = React.useState({
          name: '',
          email: '',
        });

        const handleChange =
          (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setValues((prev) => ({ ...prev, [field]: e.target.value }));
          };

        return (
          <form>
            <div>
              <Label htmlFor='state-name'>Name: {values.name}</Label>
              <input
                id='state-name'
                type='text'
                value={values.name}
                onChange={handleChange('name')}
              />
            </div>
            <div>
              <Label htmlFor='state-email'>Email: {values.email}</Label>
              <input
                id='state-email'
                type='email'
                value={values.email}
                onChange={handleChange('email')}
              />
            </div>
          </form>
        );
      };

      render(<FormWithState />);

      const nameInput = screen.getByLabelText(/Name:/);
      const emailInput = screen.getByLabelText(/Email:/);

      await user.type(nameInput, 'John');
      expect(screen.getByText('Name: John')).toBeInTheDocument();

      await user.type(emailInput, 'john@test.com');
      expect(screen.getByText('Email: john@test.com')).toBeInTheDocument();
    });

    it('works with form libraries integration', async () => {
      // Simulate integration with form validation libraries
      const FormWithLibrary = () => {
        const [errors, setErrors] = React.useState<Record<string, string>>({});

        const validate = (field: string, value: string) => {
          if (!value) {
            setErrors((prev) => ({
              ...prev,
              [field]: 'This field is required',
            }));
          } else {
            setErrors((prev) => {
              const { [field]: _, ...newErrors } = prev;
              return newErrors;
            });
          }
        };

        return (
          <form>
            <div>
              <Label
                htmlFor='lib-name'
                className={errors.name ? 'text-red-500' : ''}
              >
                Name {errors.name && <span>({errors.name})</span>}
              </Label>
              <input
                id='lib-name'
                type='text'
                onBlur={(e) => validate('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
            </div>
          </form>
        );
      };

      render(<FormWithLibrary />);

      const nameInput = screen.getByLabelText(/Name/);

      // Trigger validation
      nameInput.focus();
      nameInput.blur();

      // Wait for validation to trigger and error to appear
      await waitFor(() => {
        expect(screen.getByText(/This field is required/)).toBeInTheDocument();
      });
    });

    it('handles complex validation scenarios', async () => {
      const ComplexValidationForm = () => {
        const [values, setValues] = React.useState({
          password: '',
          confirmPassword: '',
        });
        const [errors, setErrors] = React.useState<Record<string, string>>({});

        const validatePassword = (password: string) => {
          const errors: string[] = [];
          if (password.length < 8) errors.push('at least 8 characters');
          if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
          if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
          if (!/[0-9]/.test(password)) errors.push('one number');
          return errors;
        };

        const handlePasswordChange = (
          e: React.ChangeEvent<HTMLInputElement>,
        ) => {
          const password = e.target.value;
          setValues((prev) => ({ ...prev, password }));

          const validationErrors = validatePassword(password);
          if (validationErrors.length > 0) {
            setErrors((prev) => ({
              ...prev,
              password: `Password must contain ${validationErrors.join(', ')}`,
            }));
          } else {
            setErrors((prev) => {
              const { password: _, ...newErrors } = prev;
              return newErrors;
            });
          }
        };

        const handleConfirmPasswordChange = (
          e: React.ChangeEvent<HTMLInputElement>,
        ) => {
          const confirmPassword = e.target.value;
          setValues((prev) => ({ ...prev, confirmPassword }));

          if (confirmPassword !== values.password) {
            setErrors((prev) => ({
              ...prev,
              confirmPassword: 'Passwords do not match',
            }));
          } else {
            setErrors((prev) => {
              const { confirmPassword: _, ...newErrors } = prev;
              return newErrors;
            });
          }
        };

        return (
          <form>
            <div>
              <Label
                htmlFor='complex-password'
                className={errors.password ? 'text-red-500' : ''}
              >
                Password
              </Label>
              <input
                id='complex-password'
                type='password'
                value={values.password}
                onChange={handlePasswordChange}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <div className='error-message'>{errors.password}</div>
              )}
            </div>
            <div>
              <Label
                htmlFor='complex-confirm'
                className={errors.confirmPassword ? 'text-red-500' : ''}
              >
                Confirm Password
              </Label>
              <input
                id='complex-confirm'
                type='password'
                value={values.confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <div className='error-message'>{errors.confirmPassword}</div>
              )}
            </div>
          </form>
        );
      };

      render(<ComplexValidationForm />);

      const passwordInput = screen.getByLabelText('Password');
      const confirmInput = screen.getByLabelText('Confirm Password');

      // Test weak password
      await user.type(passwordInput, 'weak');
      expect(screen.getByText(/Password must contain/)).toBeInTheDocument();

      // Test strong password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'StrongPass123');
      expect(
        screen.queryByText(/Password must contain/),
      ).not.toBeInTheDocument();

      // Test password mismatch
      await user.type(confirmInput, 'DifferentPass123');
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();

      // Test password match
      await user.clear(confirmInput);
      await user.type(confirmInput, 'StrongPass123');
      expect(
        screen.queryByText('Passwords do not match'),
      ).not.toBeInTheDocument();
    });

    it('handles async validation', async () => {
      const AsyncValidationForm = () => {
        const [email, setEmail] = React.useState('');
        const [isValidating, setIsValidating] = React.useState(false);
        const [error, _setError] = React.useState('');

        const validateEmail = async (emailValue: string) => {
          if (!emailValue) return;

          setIsValidating(true);
          _setError('');

          // Simulate async validation
          await new Promise((resolve) => setTimeout(resolve, 500));

          if (emailValue === 'taken@example.com') {
            _setError('This email is already taken');
          }

          setIsValidating(false);
        };

        const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          setEmail(value);
          validateEmail(value);
        };

        return (
          <form>
            <div>
              <Label
                htmlFor='async-email'
                className={error ? 'text-red-500' : ''}
              >
                Email {isValidating && '(Checking...)'}
              </Label>
              <input
                id='async-email'
                type='email'
                value={email}
                onChange={handleEmailChange}
                className={error ? 'border-red-500' : ''}
              />
              {error && <div className='error-message'>{error}</div>}
            </div>
          </form>
        );
      };

      render(<AsyncValidationForm />);

      const emailInput = screen.getByLabelText(/Email/);

      // Test taken email
      await user.type(emailInput, 'taken@example.com');

      // Wait for validation
      expect(screen.getByText(/Checking/)).toBeInTheDocument();

      // Wait for validation to complete
      await screen.findByText('This email is already taken');
      expect(
        screen.getByText('This email is already taken'),
      ).toBeInTheDocument();
    });

    it('handles conditional validation', async () => {
      const ConditionalValidationForm = () => {
        const [userType, setUserType] = React.useState('');
        const [companyName, setCompanyName] = React.useState('');
        const [error, _setError] = React.useState('');

        const validateCompanyName = (
          value: string,
          currentUserType?: string,
        ) => {
          const typeToCheck = currentUserType || userType;
          if (typeToCheck === 'business' && !value) {
            _setError('Company name is required for business accounts');
          } else {
            _setError('');
          }
        };

        return (
          <form>
            <div>
              <Label htmlFor='user-type'>User Type</Label>
              <select
                id='user-type'
                value={userType}
                onChange={(e) => {
                  const newUserType = e.target.value;
                  setUserType(newUserType);
                  validateCompanyName(companyName, newUserType);
                }}
              >
                <option value=''>Select type</option>
                <option value='personal'>Personal</option>
                <option value='business'>Business</option>
              </select>
            </div>
            {userType === 'business' && (
              <div>
                <Label
                  htmlFor='company-name'
                  className={error ? 'text-red-500' : ''}
                >
                  Company Name *
                </Label>
                <input
                  id='company-name'
                  type='text'
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    validateCompanyName(e.target.value);
                  }}
                  className={error ? 'border-red-500' : ''}
                />
                {error && <div className='error-message'>{error}</div>}
              </div>
            )}
          </form>
        );
      };

      render(<ConditionalValidationForm />);

      const userTypeSelect = screen.getByLabelText('User Type');

      // Select business type
      await user.selectOptions(userTypeSelect, 'business');

      // Company name field should appear
      expect(screen.getByLabelText('Company Name *')).toBeInTheDocument();

      // Wait for validation error to appear
      await waitFor(() => {
        expect(
          screen.getByText('Company name is required for business accounts'),
        ).toBeInTheDocument();
      });

      // Fill company name
      const companyInput = screen.getByLabelText('Company Name *');
      await user.type(companyInput, 'Test Company');

      // Error should disappear
      expect(
        screen.queryByText('Company name is required for business accounts'),
      ).not.toBeInTheDocument();

      // Switch to personal
      await user.selectOptions(userTypeSelect, 'personal');

      // Company name field should disappear
      expect(screen.queryByLabelText('Company Name *')).not.toBeInTheDocument();
    });
  });
});
