/**
 * ProductInquiryEmail Component Tests
 */

import { render } from '@react-email/render';
import { describe, expect, it } from 'vitest';
import type { ProductInquiryEmailData } from '@/lib/validations';
import { ProductInquiryEmail } from '@/components/emails/ProductInquiryEmail';

const baseData: ProductInquiryEmailData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  productName: 'Hydraulic Pump Station',
  productSlug: 'hydraulic-pump-station',
  quantity: 10,
};

describe('ProductInquiryEmail', () => {
  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const html = render(<ProductInquiryEmail {...baseData} />);
      expect(html).toBeDefined();
      expect(typeof html).toBe('string');
    });

    it('should include product name', () => {
      const html = render(<ProductInquiryEmail {...baseData} />);
      expect(html).toContain('Hydraulic Pump Station');
    });

    it('should include quantity', () => {
      const html = render(<ProductInquiryEmail {...baseData} />);
      expect(html).toContain('10');
    });

    it('should include contact name', () => {
      const html = render(<ProductInquiryEmail {...baseData} />);
      expect(html).toContain('John Doe');
    });

    it('should include email', () => {
      const html = render(<ProductInquiryEmail {...baseData} />);
      expect(html).toContain('john.doe@example.com');
    });

    it('should include product slug in footer', () => {
      const html = render(<ProductInquiryEmail {...baseData} />);
      expect(html).toContain('hydraulic-pump-station');
    });
  });

  describe('Quantity Handling', () => {
    it('should handle numeric quantity', () => {
      const html = render(
        <ProductInquiryEmail
          {...baseData}
          quantity={25}
        />,
      );
      expect(html).toContain('25');
    });

    it('should handle string quantity', () => {
      const data = { ...baseData, quantity: '50' as unknown as number };
      const html = render(<ProductInquiryEmail {...data} />);
      expect(html).toContain('50');
    });
  });

  describe('Optional Fields', () => {
    it('should render company when provided', () => {
      const data = { ...baseData, company: 'Acme Corp' };
      const html = render(<ProductInquiryEmail {...data} />);
      expect(html).toContain('Acme Corp');
      expect(html).toContain('Company');
    });

    it('should not render company section when not provided', () => {
      const html = render(<ProductInquiryEmail {...baseData} />);
      // Company label should not appear when company is not provided
      // The word "Company" might appear in other contexts, but the Company field section shouldn't
      expect(html).not.toContain('>Company<');
    });

    it('should render requirements when provided', () => {
      const data = { ...baseData, requirements: 'Need urgent delivery' };
      const html = render(<ProductInquiryEmail {...data} />);
      expect(html).toContain('Need urgent delivery');
      expect(html).toContain('Requirements');
    });

    it('should handle multi-line requirements', () => {
      const data = {
        ...baseData,
        requirements: 'Line 1\nLine 2\nLine 3',
      };
      const html = render(<ProductInquiryEmail {...data} />);
      expect(html).toContain('Line 1');
      expect(html).toContain('Line 2');
      expect(html).toContain('Line 3');
    });

    it('should handle empty lines in requirements', () => {
      const data = {
        ...baseData,
        requirements: 'Line 1\n\nLine 3',
      };
      const html = render(<ProductInquiryEmail {...data} />);
      expect(html).toContain('Line 1');
      expect(html).toContain('Line 3');
    });

    it('should not render requirements section when not provided', () => {
      const html = render(<ProductInquiryEmail {...baseData} />);
      expect(html).not.toContain('>Requirements<');
    });

    it('should render marketing consent when true', () => {
      const data = { ...baseData, marketingConsent: true };
      const html = render(<ProductInquiryEmail {...data} />);
      expect(html).toContain('Marketing Consent');
      expect(html).toContain('agreed to receive marketing communications');
    });

    it('should not render marketing consent when false', () => {
      const data = { ...baseData, marketingConsent: false };
      const html = render(<ProductInquiryEmail {...data} />);
      expect(html).not.toContain('Marketing Consent');
    });

    it('should not render marketing consent when undefined', () => {
      const html = render(<ProductInquiryEmail {...baseData} />);
      expect(html).not.toContain('Marketing Consent');
    });
  });

  describe('Full Data Rendering', () => {
    it('should render all fields when provided', () => {
      const fullData: ProductInquiryEmailData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        productName: 'Industrial Valve',
        productSlug: 'industrial-valve',
        quantity: 100,
        company: 'Smith Industries',
        requirements: 'Custom specifications needed\nUrgent delivery required',
        marketingConsent: true,
      };

      const html = render(<ProductInquiryEmail {...fullData} />);

      expect(html).toContain('Jane Smith');
      expect(html).toContain('jane.smith@company.com');
      expect(html).toContain('Industrial Valve');
      expect(html).toContain('100');
      expect(html).toContain('Smith Industries');
      expect(html).toContain('Custom specifications needed');
      expect(html).toContain('Urgent delivery required');
      expect(html).toContain('Marketing Consent');
    });
  });

  describe('Plain Text Rendering', () => {
    it('should render as plain text', async () => {
      const text = await render(<ProductInquiryEmail {...baseData} />, {
        plainText: true,
      });
      expect(text).toBeDefined();
      expect(typeof text).toBe('string');
      expect(text).toContain('John Doe');
      expect(text).toContain('Hydraulic Pump Station');
    });
  });
});
