/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WhatsAppFloatingButton } from '@/components/whatsapp/whatsapp-floating-button';

// 局部 Mock lucide-react，避免集中 Mock/真实包体在极端环境下的解析开销
vi.mock('lucide-react', () => ({
  Phone: ({ className, ...props }: React.ComponentProps<'svg'>) => (
    <svg
      data-testid='mock-phone-icon'
      className={className}
      {...props}
    >
      <circle
        cx='12'
        cy='12'
        r='10'
      />
    </svg>
  ),
}));

describe('WhatsAppFloatingButton', () => {
  it('renders link with normalized phone number', () => {
    render(<WhatsAppFloatingButton number='+1 (555) 123-4567' />);

    const button = screen.getByRole('link', {
      name: /chat with us on whatsapp/i,
    });
    expect(button).toHaveAttribute('href', 'https://wa.me/15551234567');
  });

  it('skips rendering when number is invalid', () => {
    render(<WhatsAppFloatingButton number='invalid' />);
    expect(
      screen.queryByRole('link', { name: /chat with us on whatsapp/i }),
    ).toBeNull();
  });
});
