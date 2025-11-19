import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { SendMessageRequest, TemplateComponent } from '@/types/whatsapp';
import { logger } from '@/lib/logger';
import { sendWhatsAppMessage } from '@/lib/whatsapp-service';

/**
 * WhatsApp 消息发送 API 端点
 * 支持发送文本消息和模板消息
 */

// 请求体验证 schema
const SendMessageSchema = z.object({
  to: z.string().min(1, 'Recipient phone number is required'),
  type: z.enum(['text', 'template'], {
    message: 'Message type must be "text" or "template"',
  }),
  content: z.object({
    body: z.string().optional(),
    templateName: z.string().optional(),
    languageCode: z.string().default('en'),
    components: z
      .array(
        z.object({
          type: z.enum(['header', 'body', 'footer', 'button']),
          sub_type: z.enum(['quick_reply', 'url', 'phone_number']).optional(),
          index: z.number().optional(),
          parameters: z
            .array(
              z.object({
                type: z.enum([
                  'text',
                  'currency',
                  'date_time',
                  'image',
                  'document',
                  'video',
                ]),
                text: z.string().optional(),
                currency: z
                  .object({
                    fallback_value: z.string(),
                    code: z.string(),
                    amount_1000: z.number(),
                  })
                  .optional(),
                date_time: z
                  .object({
                    fallback_value: z.string(),
                  })
                  .optional(),
                image: z
                  .object({
                    id: z.string().optional(),
                    link: z.string().url().optional(),
                  })
                  .optional(),
                document: z
                  .object({
                    id: z.string().optional(),
                    link: z.string().url().optional(),
                    filename: z.string().optional(),
                  })
                  .optional(),
                video: z
                  .object({
                    id: z.string().optional(),
                    link: z.string().url().optional(),
                  })
                  .optional(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
  }),
});

/**
 * 验证消息内容
 */
function validateMessageContent(
  type: string,
  content: Record<string, unknown>,
): NextResponse | null {
  if (type === 'text' && !content.body) {
    return NextResponse.json(
      { _error: 'Text message requires "body" in content' },
      { status: 400 },
    );
  }

  if (type === 'template' && !content.templateName) {
    return NextResponse.json(
      { _error: 'Template message requires "templateName" in content' },
      { status: 400 },
    );
  }

  return null;
}

/**
 * 构建WhatsApp消息对象
 */
function buildWhatsAppMessage(
  to: string,
  type: string,
  content: Record<string, unknown>,
): SendMessageRequest {
  if (type === 'text') {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        body: content.body as string,
      },
    };
  }

  if (type === 'template') {
    const templateMessage: SendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: content.templateName as string,
        language: {
          code: (content.languageCode as string) || 'en',
          policy: 'deterministic',
        },
      },
    };

    // 只有当 components 存在时才添加，避免 exactOptionalPropertyTypes 问题
    if (content.components) {
      templateMessage.template!.components =
        content.components as TemplateComponent[];
    }

    return templateMessage;
  }

  throw new Error(`Unsupported message type: ${type}`);
}

interface ParsedRequest {
  to: string;
  type: string;
  content: Record<string, unknown>;
}

async function parseSendMessageRequest(
  request: NextRequest,
): Promise<{ error?: NextResponse; data?: ParsedRequest }> {
  const body = await request.json();
  const validationResult = SendMessageSchema.safeParse(body);
  if (!validationResult.success) {
    return {
      error: NextResponse.json(
        {
          _error: 'Invalid request body',
          details: validationResult.error.issues,
        },
        { status: 400 },
      ),
    };
  }

  const { to, type, content } = validationResult.data;
  const contentValidationError = validateMessageContent(type, content);
  if (contentValidationError) {
    return { error: contentValidationError };
  }

  return { data: { to, type, content } };
}

function extractMessageId(
  result: Awaited<ReturnType<typeof sendWhatsAppMessage>>,
) {
  const messages = Array.isArray(result.data?.messages)
    ? result.data.messages
    : [];
  return messages.at(0)?.id;
}

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseSendMessageRequest(request);
    if (parsed.error) {
      return parsed.error;
    }
    const { to, type, content } = parsed.data!;

    const message = buildWhatsAppMessage(to, type, content);
    const result = await sendWhatsAppMessage(message);

    if (!result.success) {
      throw new Error(result.error || 'Failed to send message');
    }

    const messageId = extractMessageId(result);

    return NextResponse.json(
      {
        success: true,
        messageId,
        data: result,
      },
      { status: 200 },
    );
  } catch (_error) {
    // 忽略错误变量
    logger.error(
      'WhatsApp send message _error',
      {},
      _error instanceof Error ? _error : new Error(String(_error)),
    );

    // 根据错误类型返回不同的响应
    if (_error instanceof Error) {
      if (_error.message.includes('WHATSAPP_ACCESS_TOKEN')) {
        return NextResponse.json(
          { _error: 'WhatsApp service not configured' },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(
      { _error: 'Failed to send message' },
      { status: 500 },
    );
  }
}

// GET 请求返回 API 使用说明
export function GET() {
  return NextResponse.json({
    message: 'WhatsApp Send Message API',
    usage: {
      method: 'POST',
      endpoint: '/api/whatsapp/send',
      body: {
        to: 'string (phone number with country code)',
        type: '"text" | "template"',
        content: {
          body: 'string (required for text messages)',
          templateName: 'string (required for template messages)',
          languageCode: 'string (optional, default: "en")',
          components: 'array (optional, for template parameters)',
        },
      },
    },
    examples: {
      textMessage: {
        to: '+1234567890',
        type: 'text',
        content: {
          body: 'Hello from our service!',
        },
      },
      templateMessage: {
        to: '+1234567890',
        type: 'template',
        content: {
          templateName: 'welcome_message',
          languageCode: 'en',
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: 'John Doe',
                },
              ],
            },
          ],
        },
      },
    },
  });
}
