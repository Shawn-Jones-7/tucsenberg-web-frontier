/**
 * Resend邮件模板生成器
 * Resend email template generator
 */

import { ResendUtils } from '@/lib/resend-utils';
import type {
  EmailTemplateData,
  ProductInquiryEmailData,
} from '@/lib/validations';

/**
 * 邮件模板生成器类
 * Email template generator class
 */
export class ResendTemplates {
  /**
   * 生成联系表单邮件HTML内容
   * Generate contact form email HTML content
   */
  static generateContactEmailHtml(data: EmailTemplateData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007ee6; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Form Submission</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name:</div>
        <div class="value">${data.firstName} ${data.lastName}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value">${data.email}</div>
      </div>
      <div class="field">
        <div class="label">Company:</div>
        <div class="value">${data.company}</div>
      </div>
      ${
        data.phone
          ? `
      <div class="field">
        <div class="label">Phone:</div>
        <div class="value">${data.phone}</div>
      </div>
      `
          : ''
      }
      ${
        data.subject
          ? `
      <div class="field">
        <div class="label">Subject:</div>
        <div class="value">${data.subject}</div>
      </div>
      `
          : ''
      }
      <div class="field">
        <div class="label">Message:</div>
        <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
      </div>
      <div class="field">
        <div class="label">Submitted At:</div>
        <div class="value">${ResendUtils.formatDateTime(data.submittedAt)}</div>
      </div>
      ${
        data.marketingConsent
          ? `
      <div class="field">
        <div class="label">Marketing Consent:</div>
        <div class="value">Yes, agreed to receive marketing communications</div>
      </div>
      `
          : ''
      }
    </div>
    <div class="footer">
      <p>This email was sent from the [PROJECT_NAME] website contact form.</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 生成联系表单邮件文本内容
   * Generate contact form email text content
   */
  static generateContactEmailText(data: EmailTemplateData): string {
    return `
New Contact Form Submission

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Company: ${data.company}
${data.phone ? `Phone: ${data.phone}` : ''}
${data.subject ? `Subject: ${data.subject}` : ''}

Message:
${data.message}

Submitted At: ${ResendUtils.formatDateTime(data.submittedAt)}
${data.marketingConsent ? 'Marketing Consent: Yes' : ''}

---
This email was sent from the [PROJECT_NAME] website contact form.
`;
  }

  /**
   * 生成确认邮件HTML内容
   * Generate confirmation email HTML content
   */
  static generateConfirmationEmailHtml(data: EmailTemplateData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting us</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007ee6; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Contacting Us</h1>
    </div>
    <div class="content">
      <p>Dear ${data.firstName},</p>
      <p>Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.</p>
      <p>Here's a summary of your submission:</p>
      <ul>
        <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
        <li><strong>Company:</strong> ${data.company}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        ${data.subject ? `<li><strong>Subject:</strong> ${data.subject}</li>` : ''}
        <li><strong>Submitted:</strong> ${ResendUtils.formatDateTime(data.submittedAt)}</li>
      </ul>
      <p>If you have any urgent questions, please don't hesitate to contact us directly.</p>
      <p>Best regards,<br>The [TEAM_NAME] Team</p>
    </div>
    <div class="footer">
      <p>© 2024 [PROJECT_NAME]. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 生成确认邮件文本内容
   * Generate confirmation email text content
   */
  static generateConfirmationEmailText(data: EmailTemplateData): string {
    return `
Thank You for Contacting Us

Dear ${data.firstName},

Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.

Here's a summary of your submission:
- Name: ${data.firstName} ${data.lastName}
- Company: ${data.company}
- Email: ${data.email}
${data.subject ? `- Subject: ${data.subject}` : ''}
- Submitted: ${ResendUtils.formatDateTime(data.submittedAt)}

If you have any urgent questions, please don't hesitate to contact us directly.

Best regards,
The [TEAM_NAME] Team

---
© 2024 [PROJECT_NAME]. All rights reserved.
`;
  }

  /**
   * Generate product inquiry email HTML content
   */
  static generateProductInquiryEmailHtml(
    data: ProductInquiryEmailData,
  ): string {
    const quantity =
      typeof data.quantity === 'number'
        ? data.quantity.toString()
        : data.quantity;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Product Inquiry</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
    .product-highlight { background: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin-bottom: 20px; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 New Product Inquiry</h1>
    </div>
    <div class="content">
      <div class="product-highlight">
        <div class="label">Product:</div>
        <div class="value" style="font-size: 18px; font-weight: bold;">${data.productName}</div>
        <div style="margin-top: 10px;">
          <span class="label">Quantity:</span>
          <span style="font-size: 16px; color: #059669; font-weight: bold;">${quantity}</span>
        </div>
      </div>
      <div class="field">
        <div class="label">Contact Name:</div>
        <div class="value">${data.firstName} ${data.lastName}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value">${data.email}</div>
      </div>
      ${
        data.company
          ? `
      <div class="field">
        <div class="label">Company:</div>
        <div class="value">${data.company}</div>
      </div>
      `
          : ''
      }
      ${
        data.requirements
          ? `
      <div class="field">
        <div class="label">Requirements:</div>
        <div class="value">${data.requirements.replace(/\n/g, '<br>')}</div>
      </div>
      `
          : ''
      }
      ${
        data.marketingConsent
          ? `
      <div class="field">
        <div class="label">Marketing Consent:</div>
        <div class="value">Yes, agreed to receive marketing communications</div>
      </div>
      `
          : ''
      }
    </div>
    <div class="footer">
      <p>This inquiry was submitted from the product page: ${data.productSlug}</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Generate product inquiry email text content
   */
  static generateProductInquiryEmailText(
    data: ProductInquiryEmailData,
  ): string {
    const quantity =
      typeof data.quantity === 'number'
        ? data.quantity.toString()
        : data.quantity;

    return `
🛒 New Product Inquiry

PRODUCT: ${data.productName}
QUANTITY: ${quantity}

Contact Information:
- Name: ${data.firstName} ${data.lastName}
- Email: ${data.email}
${data.company ? `- Company: ${data.company}` : ''}

${data.requirements ? `Requirements:\n${data.requirements}` : ''}

${data.marketingConsent ? 'Marketing Consent: Yes' : ''}

---
This inquiry was submitted from the product page: ${data.productSlug}
`;
  }
}
