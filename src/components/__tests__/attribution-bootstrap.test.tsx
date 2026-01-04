import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockStoreAttributionData } = vi.hoisted(() => ({
  mockStoreAttributionData: vi.fn(),
}));

vi.mock('@/lib/utm', () => ({
  storeAttributionData: mockStoreAttributionData,
}));

describe('AttributionBootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls storeAttributionData on mount', async () => {
    const { AttributionBootstrap } = await import('../attribution-bootstrap');
    render(<AttributionBootstrap />);

    expect(mockStoreAttributionData).toHaveBeenCalledTimes(1);
  });

  it('renders nothing (returns null)', async () => {
    const { AttributionBootstrap } = await import('../attribution-bootstrap');
    const { container } = render(<AttributionBootstrap />);

    expect(container).toBeEmptyDOMElement();
  });

  it('only calls storeAttributionData once even on re-render', async () => {
    const { AttributionBootstrap } = await import('../attribution-bootstrap');
    const { rerender } = render(<AttributionBootstrap />);

    rerender(<AttributionBootstrap />);
    rerender(<AttributionBootstrap />);

    // useEffect with [] deps should only run once
    expect(mockStoreAttributionData).toHaveBeenCalledTimes(1);
  });
});
