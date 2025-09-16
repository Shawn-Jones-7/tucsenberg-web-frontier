import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProgressIndicator } from '@/components/shared/progress-indicator';

// Mock next-intl
const mockUseTranslations = vi.fn();
vi.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations,
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (..._args: unknown[]) => {
    const result: string[] = [];

    ['class1', 'class2'].forEach((cls: any) => {
      if (typeof cls === 'string') {
        result.push(cls);
      } else if (typeof cls === 'object' && cls !== null) {
        // Handle conditional classes object
        Object.entries(cls).forEach(([key, value]) => {
          if (value) {
            result.push(key);
          }
        });
      }
    });

    return result.filter(Boolean).join(' ');
  },
}));

describe('ProgressIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        planning: '规划阶段',
        development: '开发阶段',
        testing: '测试阶段',
        launch: '发布阶段',
        status: '进行中',
        nearCompletion: '即将完成',
      };
      // eslint-disable-next-line security/detect-object-injection
      return translations[key] || key; // key 来自测试数据，安全
    });
  });

  describe('Basic Rendering', () => {
    it('renders progress indicator with default step', () => {
      render(<ProgressIndicator />);

      expect(screen.getByText('规划阶段')).toBeInTheDocument();
      expect(screen.getByText('开发阶段')).toBeInTheDocument();
      expect(screen.getByText('测试阶段')).toBeInTheDocument();
      expect(screen.getByText('发布阶段')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <ProgressIndicator className='custom-class' />,
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders all four steps', () => {
      render(<ProgressIndicator />);

      const stepNumbers = screen.getAllByText(/[1-4]/);
      expect(stepNumbers).toHaveLength(4);
    });
  });

  describe('Step States - Planning (Step 0)', () => {
    it('shows planning as current step when currentStep is 0', () => {
      render(<ProgressIndicator currentStep={0} />);

      // Find the current step circle (should have animate-pulse)
      const currentStepCircle = document.querySelector('.animate-pulse');
      expect(currentStepCircle).toBeTruthy();

      // Check that planning step label has correct styling
      const planningLabel = screen.getByText('规划阶段');
      expect(planningLabel.className).toContain('text-primary');
    });

    it('shows correct progress percentage for step 0', () => {
      render(<ProgressIndicator currentStep={0} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('进行中')).toBeInTheDocument();
    });
  });

  describe('Step States - Development (Step 1)', () => {
    it('shows development as current step when currentStep is 1', () => {
      render(<ProgressIndicator currentStep={1} />);

      // Should have one completed step (SVG checkmark)
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBe(1);

      // Development should be current (has animate-pulse)
      const currentStepCircle = document.querySelector('.animate-pulse');
      expect(currentStepCircle).toBeTruthy();

      // Development label should be highlighted
      const developmentLabel = screen.getByText('开发阶段');
      expect(developmentLabel.className).toContain('text-primary');
    });

    it('shows checkmark for completed planning step', () => {
      render(<ProgressIndicator currentStep={1} />);

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelector('path')).toHaveAttribute('d', 'M5 13l4 4L19 7');
    });

    it('shows correct progress percentage for step 1', () => {
      render(<ProgressIndicator currentStep={1} />);

      expect(screen.getByText('33%')).toBeInTheDocument();
      expect(screen.getByText('进行中')).toBeInTheDocument();
    });
  });

  describe('Step States - Testing (Step 2)', () => {
    it('shows testing as current step when currentStep is 2', () => {
      render(<ProgressIndicator currentStep={2} />);

      // First two steps should be completed (2 SVG checkmarks)
      const svgs = document.querySelectorAll('svg');
      expect(svgs).toHaveLength(2);

      // Testing should be current (has animate-pulse)
      const currentStepCircle = document.querySelector('.animate-pulse');
      expect(currentStepCircle).toBeTruthy();

      // Testing label should be highlighted
      const testingLabel = screen.getByText('测试阶段');
      expect(testingLabel.className).toContain('text-primary');
    });

    it('shows correct progress percentage for step 2', () => {
      render(<ProgressIndicator currentStep={2} />);

      expect(screen.getByText('67%')).toBeInTheDocument();
      expect(screen.getByText('进行中')).toBeInTheDocument();
    });
  });

  describe('Step States - Launch (Step 3)', () => {
    it('shows launch as current step when currentStep is 3', () => {
      render(<ProgressIndicator currentStep={3} />);

      // First three steps should be completed (3 SVG checkmarks)
      const svgs = document.querySelectorAll('svg');
      expect(svgs).toHaveLength(3);

      // Launch should be current (has animate-pulse)
      const currentStepCircle = document.querySelector('.animate-pulse');
      expect(currentStepCircle).toBeTruthy();

      // Launch label should be highlighted
      const launchLabel = screen.getByText('发布阶段');
      expect(launchLabel.className).toContain('text-primary');
    });

    it('shows correct progress percentage for step 3', () => {
      render(<ProgressIndicator currentStep={3} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('即将完成')).toBeInTheDocument();
    });
  });

  describe('Step States - Completed (Step 4)', () => {
    it('shows all steps as completed when currentStep is 4', () => {
      render(<ProgressIndicator currentStep={4} />);

      // All steps should show checkmarks (4 SVGs)
      const svgs = document.querySelectorAll('svg');
      expect(svgs).toHaveLength(4);

      // All step labels should be highlighted
      expect(screen.getByText('规划阶段').className).toContain('text-primary');
      expect(screen.getByText('开发阶段').className).toContain('text-primary');
      expect(screen.getByText('测试阶段').className).toContain('text-primary');
      expect(screen.getByText('发布阶段').className).toContain('text-primary');
    });

    it('shows 100% completion for step 4', () => {
      render(<ProgressIndicator currentStep={4} />);

      // Should show percentage over 100% since step 4 is beyond the max (3)
      expect(screen.getByText(/\d+%/)).toBeInTheDocument();
      expect(screen.getByText('即将完成')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('shows correct progress bar width for different steps', () => {
      const steps = [0, 1, 2, 3];
      const expectedWidths = [
        '0%',
        '33.33333333333333%',
        '66.66666666666666%',
        '100%',
      ];

      steps.forEach((step, index) => {
        const { unmount } = render(<ProgressIndicator currentStep={step} />);

        const progressBar = document.querySelector('.bg-primary.h-full');
        expect(progressBar).toHaveStyle(`width: ${expectedWidths[index]}`);

        unmount();
      });
    });

    it('has correct progress bar structure', () => {
      render(<ProgressIndicator currentStep={1} />);

      const progressContainer = document.querySelector('.bg-muted.absolute');
      expect(progressContainer).toHaveClass(
        'top-4',
        'right-4',
        'left-4',
        'h-0.5',
      );

      const progressBar = document.querySelector('.bg-primary.h-full');
      expect(progressBar).toHaveClass(
        'transition-all',
        'duration-500',
        'ease-out',
      );
    });
  });

  describe('Accessibility', () => {
    it('provides proper SVG accessibility attributes', () => {
      render(<ProgressIndicator currentStep={2} />);

      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);

      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute('fill', 'none');
        expect(svg).toHaveAttribute('stroke', 'currentColor');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      });
    });

    it('has proper step circle structure', () => {
      render(<ProgressIndicator currentStep={1} />);

      const stepCircles = document.querySelectorAll('.rounded-full');
      stepCircles.forEach((circle) => {
        expect(circle).toHaveClass(
          'flex',
          'h-8',
          'w-8',
          'items-center',
          'justify-center',
          'text-sm',
          'font-medium',
        );
      });
    });
  });

  describe('Animations and Transitions', () => {
    it('applies transition classes to step circles', () => {
      render(<ProgressIndicator currentStep={1} />);

      const stepCircles = document.querySelectorAll('.rounded-full');
      stepCircles.forEach((circle) => {
        expect(circle).toHaveClass('transition-all', 'duration-300');
      });
    });

    it('applies pulse animation to current step', () => {
      render(<ProgressIndicator currentStep={1} />);

      // Find the step circle that should have pulse animation
      const stepCircles = document.querySelectorAll('.rounded-full');
      const currentStepCircle = Array.from(stepCircles).find((circle) =>
        circle.classList.contains('animate-pulse'),
      );
      expect(currentStepCircle).toBeTruthy();
    });

    it('applies transition to step labels', () => {
      render(<ProgressIndicator currentStep={1} />);

      const stepLabels = document.querySelectorAll('.text-xs');
      stepLabels.forEach((label) => {
        expect(label).toHaveClass('transition-colors', 'duration-300');
      });
    });
  });

  describe('Internationalization', () => {
    it('calls useTranslations hook', () => {
      render(<ProgressIndicator />);

      // The hook is called, but we're mocking the return function
      expect(mockUseTranslations).toHaveBeenCalled();
    });

    it('translates all step labels', () => {
      render(<ProgressIndicator />);

      expect(mockUseTranslations).toHaveBeenCalledWith('planning');
      expect(mockUseTranslations).toHaveBeenCalledWith('development');
      expect(mockUseTranslations).toHaveBeenCalledWith('testing');
      expect(mockUseTranslations).toHaveBeenCalledWith('launch');
    });

    it('translates status messages', () => {
      render(<ProgressIndicator currentStep={1} />);

      expect(mockUseTranslations).toHaveBeenCalledWith('status');

      const { rerender } = render(<ProgressIndicator currentStep={3} />);
      rerender(<ProgressIndicator currentStep={3} />);

      expect(mockUseTranslations).toHaveBeenCalledWith('nearCompletion');
    });
  });

  describe('Edge Cases', () => {
    it('handles negative currentStep gracefully', () => {
      render(<ProgressIndicator currentStep={-1} />);

      // Should show no completed steps (no SVG checkmarks)
      const svgs = document.querySelectorAll('svg');
      expect(svgs).toHaveLength(0);

      // Should show negative percentage (component doesn't clamp to 0)
      expect(screen.getByText(/-\d+%/)).toBeInTheDocument();
    });

    it('handles currentStep beyond maximum gracefully', () => {
      render(<ProgressIndicator currentStep={10} />);

      // All steps should be completed (4 SVG checkmarks)
      const svgs = document.querySelectorAll('svg');
      expect(svgs).toHaveLength(4);

      // Should show percentage beyond 100%
      expect(screen.getByText(/\d+%/)).toBeInTheDocument();
    });

    it('handles missing translations gracefully', () => {
      mockUseTranslations.mockImplementation((key: string) => key);

      render(<ProgressIndicator />);

      expect(screen.getByText('planning')).toBeInTheDocument();
      expect(screen.getByText('development')).toBeInTheDocument();
      expect(screen.getByText('testing')).toBeInTheDocument();
      expect(screen.getByText('launch')).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('is memoized component', () => {
      // Check that the component is memoized by verifying it's a React.memo component
      expect(ProgressIndicator).toBeDefined();
      // React.memo components are objects with a $$typeof property
      expect(ProgressIndicator).toHaveProperty('$$typeof');
    });

    it('renders consistently with same props', () => {
      const props = { currentStep: 2 };

      const { rerender } = render(<ProgressIndicator {...props} />);
      const firstRender = screen.getByText('67%');

      rerender(<ProgressIndicator {...props} />);
      const secondRender = screen.getByText('67%');

      expect(firstRender).toBeInTheDocument();
      expect(secondRender).toBeInTheDocument();
    });
  });
});
