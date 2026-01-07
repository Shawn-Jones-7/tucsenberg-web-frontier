import type { CSSProperties } from 'react';
import { Text } from '@react-email/components';
import { ResendUtils } from '@/lib/resend-utils';
import type { EmailTemplateData } from '@/lib/validations';
import { EmailField } from '@/components/emails/EmailField';
import { EmailLayout } from '@/components/emails/EmailLayout';
import { COLORS, FONT_SIZES } from '@/components/emails/theme';
import { SITE_CONFIG } from '@/config/paths/site-config';

const ACCENT_COLOR = COLORS.primary;
const CONTENT_BACKGROUND = COLORS.contentBackground;
const PREVIEW_PREFIX = 'New contact form submission';
const FOOTER_TEXT = `This email was sent from the ${SITE_CONFIG.name} website contact form.`;

const valueTextStyle: CSSProperties = {
  margin: '0',
  lineHeight: '1.5',
};

const messageLineStyle: CSSProperties = {
  margin: '0 0 6px 0',
};

export function ContactFormEmail(data: EmailTemplateData) {
  const messageLines = data.message.split('\n');
  const submittedAt = ResendUtils.formatDateTime(data.submittedAt);

  return (
    <EmailLayout
      title='New Contact Form Submission'
      preview={`${PREVIEW_PREFIX} from ${data.firstName} ${data.lastName}`}
      accentColor={ACCENT_COLOR}
      footerText={FOOTER_TEXT}
      contentBackgroundColor={CONTENT_BACKGROUND}
    >
      <EmailField label='Name'>
        <Text
          style={valueTextStyle}
        >{`${data.firstName} ${data.lastName}`}</Text>
      </EmailField>
      <EmailField label='Email'>
        <Text style={valueTextStyle}>{data.email}</Text>
      </EmailField>
      <EmailField label='Company'>
        <Text style={valueTextStyle}>{data.company}</Text>
      </EmailField>
      {data.phone ? (
        <EmailField label='Phone'>
          <Text style={valueTextStyle}>{data.phone}</Text>
        </EmailField>
      ) : null}
      {data.subject ? (
        <EmailField label='Subject'>
          <Text style={valueTextStyle}>{data.subject}</Text>
        </EmailField>
      ) : null}
      <EmailField label='Message'>
        {messageLines.map((line, index) => (
          <Text
            key={`message-line-${index}`}
            style={messageLineStyle}
          >
            {line || ' '}
          </Text>
        ))}
      </EmailField>
      <EmailField label='Submitted At'>
        <Text style={valueTextStyle}>{submittedAt}</Text>
      </EmailField>
      {data.marketingConsent ? (
        <EmailField label='Marketing Consent'>
          {/* nosemgrep: object-injection-sink-spread-operator */}
          {/* Safe: valueTextStyle is a static CSSProperties object defined in this file */}
          <Text
            style={{
              ...valueTextStyle,
              color: COLORS.success,
              fontSize: FONT_SIZES.sm,
            }}
          >
            Yes, agreed to receive marketing communications
          </Text>
        </EmailField>
      ) : null}
    </EmailLayout>
  );
}

export default ContactFormEmail;
