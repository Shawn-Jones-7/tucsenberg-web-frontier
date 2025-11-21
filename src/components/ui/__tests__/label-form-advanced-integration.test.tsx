/**
 * @vitest-environment jsdom
 */

/**
 * Label Form Advanced Integration Special Tests
 *
 * 特殊高级表单集成测试，专注于复杂场景：
 * - 表单验证与错误消息
 * - 文件输入支持
 * - 特殊表单交互
 * 基础功能测试请参考 label-form-advanced-integration-core.test.tsx
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label Form Advanced Integration Special Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('特殊表单集成', () => {
    it('handles form validation with custom error messages', async () => {
      const CustomValidationForm = () => {
        const [errors, setErrors] = React.useState<Record<string, string>>({});

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const newErrors: Record<string, string> = {};

          const email = formData.get('email') as string;
          const password = formData.get('password') as string;

          if (!email) {
            newErrors.email = 'Email is required';
          } else if (!email.includes('@')) {
            newErrors.email = 'Email must be valid';
          }

          if (!password) {
            newErrors.password = 'Password is required';
          } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
          }

          setErrors(newErrors);
        };

        return (
          <form onSubmit={handleSubmit}>
            <div>
              <Label htmlFor='validation-email'>Email</Label>
              <input
                id='validation-email'
                name='email'
                type='email'
              />
              {errors.email && (
                <div
                  data-testid='email-error'
                  role='alert'
                >
                  {errors.email}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor='validation-password'>Password</Label>
              <input
                id='validation-password'
                name='password'
                type='password'
              />
              {errors.password && (
                <div
                  data-testid='password-error'
                  role='alert'
                >
                  {errors.password}
                </div>
              )}
            </div>
            <button type='submit'>Submit</button>
          </form>
        );
      };

      render(<CustomValidationForm />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Submit empty form
      await user.click(submitButton);

      expect(screen.getByTestId('email-error')).toHaveTextContent(
        'Email is required',
      );
      expect(screen.getByTestId('password-error')).toHaveTextContent(
        'Password is required',
      );

      // Fill with invalid data
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, '123');
      await user.click(submitButton);

      expect(screen.getByTestId('email-error')).toHaveTextContent(
        'Email is required',
      );
      expect(screen.getByTestId('password-error')).toHaveTextContent(
        'Password is required',
      );
    });

    it('supports form with file inputs', async () => {
      render(
        <form>
          <div>
            <Label htmlFor='file-input'>Upload File</Label>
            <input
              id='file-input'
              type='file'
              accept='.jpg,.png,.pdf'
            />
          </div>
          <div>
            <Label htmlFor='multiple-files'>Upload Multiple Files</Label>
            <input
              id='multiple-files'
              type='file'
              multiple
            />
          </div>
        </form>,
      );

      const fileInput = screen.getByLabelText('Upload File');
      const multipleFilesInput = screen.getByLabelText('Upload Multiple Files');

      expect(fileInput).toBeInTheDocument();
      expect(multipleFilesInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', '.jpg,.png,.pdf');
      expect(multipleFilesInput).toHaveAttribute('multiple');

      // Test label clicking focuses file inputs
      const fileLabel = screen.getByText('Upload File');
      await user.click(fileLabel);
      expect(fileInput).toHaveFocus();

      const multipleLabel = screen.getByText('Upload Multiple Files');
      await user.click(multipleLabel);
      expect(multipleFilesInput).toHaveFocus();
    });
  });
});
