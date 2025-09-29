'use client';

/**
 * useOptimistic Hook使用示例
 * 展示如何在表单中使用乐观更新提升用户体验
 *
 * @version 1.0.0
 * @author React 19架构升级项目
 */
import {
  memo,
  useActionState,
  useOptimistic,
  useState,
  useTransition,
} from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * 消息类型定义
 */
interface Message {
  id: string;
  text: string;
  timestamp: Date;
  pending?: boolean;
  error?: boolean;
}

/**
 * 表单状态类型
 */
interface FormState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message?: string;
}

/**
 * 模拟Server Action - 消息提交
 */
async function submitMessageAction(
  _prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const text = formData.get('message') as string;

  if (!text || text.trim().length === 0) {
    return {
      status: 'error',
      message: 'Message cannot be empty',
    };
  }

  try {
    // 模拟网络延迟
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000),
    );

    // 模拟随机失败（20%概率）
    const FAILURE_PROBABILITY = 0.2;
    if (Math.random() < FAILURE_PROBABILITY) {
      throw new Error('Network error occurred');
    }

    logger.info('Message submitted successfully', { text });

    return {
      status: 'success',
      message: 'Message sent successfully!',
    };
  } catch (error) {
    logger.error('Message submission failed:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 消息列表组件
 */
interface MessageListProps {
  messages: Message[];
}

const MessageList = memo(({ messages }: MessageListProps) => {
  return (
    <div className='max-h-96 space-y-3 overflow-y-auto'>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`rounded-lg border p-3 ${
            message.pending
              ? 'border-blue-200 bg-blue-50 opacity-70 dark:border-blue-800 dark:bg-blue-900/20'
              : message.error
                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
          }`}
        >
          <div className='flex items-start justify-between'>
            <p
              className={`text-sm ${
                message.pending
                  ? 'text-blue-700 dark:text-blue-300'
                  : message.error
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {message.text}
            </p>
            <div className='ml-4 flex items-center space-x-2'>
              {message.pending && (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
              )}
              {message.error && (
                <span className='text-xs text-red-500'>Failed</span>
              )}
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

MessageList.displayName = 'MessageList';

/**
 * 表单状态消息组件
 */
interface FormStatusMessageProps {
  formState: FormState | null;
}

const FormStatusMessage = memo(({ formState }: FormStatusMessageProps) => {
  if (!formState || formState.status === 'idle') return null;

  return (
    <div
      className={`rounded-md border p-3 ${
        formState.status === 'success'
          ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200'
          : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200'
      }`}
    >
      <p className='text-sm font-medium'>{formState.message}</p>
    </div>
  );
});

FormStatusMessage.displayName = 'FormStatusMessage';

/**
 * 消息输入表单组件
 */
interface MessageFormProps {
  onSubmit: (formData: FormData) => void;
  pending: boolean;
}

const MessageForm = memo(({ onSubmit, pending }: MessageFormProps) => {
  return (
    <form
      action={onSubmit}
      className='space-y-4'
    >
      <div>
        <Label htmlFor='message'>Your Message</Label>
        <Input
          id='message'
          name='message'
          placeholder='Type your message here...'
          disabled={pending}
          className='mt-1'
        />
      </div>

      <Button
        type='submit'
        disabled={pending}
        className='w-full'
      >
        {pending ? (
          <div className='flex items-center space-x-2'>
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
            <span>Sending...</span>
          </div>
        ) : (
          'Send Message'
        )}
      </Button>
    </form>
  );
});

MessageForm.displayName = 'MessageForm';

/**
 * 乐观更新表单示例组件
 */
export function OptimisticFormExample() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to the optimistic form example!',
      timestamp: new Date(Date.now() - 60000),
    },
  ]);

  const [isPending, startTransition] = useTransition();

  // useActionState for form submission
  const [formState, formAction, isActionPending] = useActionState(
    submitMessageAction,
    null,
  );

  // useOptimistic for immediate UI updates
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: Message) => [...state, newMessage],
  );

  // 处理提交成功的逻辑
  const handleSubmitSuccess = (
    text: string,
    optimisticMessage: Message,
  ): void => {
    const realMessage: Message = {
      id: `msg-${Date.now()}`,
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [
      ...prev.filter((msg) => msg.id !== optimisticMessage.id),
      realMessage,
    ]);
  };

  // 处理提交失败的逻辑
  const handleSubmitError = (optimisticMessage: Message): void => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === optimisticMessage.id
          ? { ...msg, error: true, pending: false }
          : msg,
      ),
    );
  };

  const handleSubmit = (formData: FormData) => {
    const text = formData.get('message') as string;

    if (!text || text.trim().length === 0) {
      return;
    }

    // 创建乐观消息
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      text: text.trim(),
      timestamp: new Date(),
      pending: true,
    };

    // 立即添加乐观消息
    addOptimisticMessage(optimisticMessage);

    // 清空输入框
    const form = document.querySelector('form') as HTMLFormElement;
    form?.reset();

    // 异步提交表单
    startTransition(async () => {
      try {
        await formAction(formData);

        // 根据表单状态处理结果
        if (formState?.status === 'success') {
          handleSubmitSuccess(text, optimisticMessage);
        } else if (formState?.status === 'error') {
          handleSubmitError(optimisticMessage);
        }
      } catch {
        handleSubmitError(optimisticMessage);
      }
    });
  };

  const pending = isPending || isActionPending;

  return (
    <div className='mx-auto max-w-2xl space-y-6'>
      <Card className='p-6'>
        <div className='space-y-4'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
              useOptimistic Hook Example
            </h2>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>
              This example demonstrates optimistic updates with React 19&apos;s
              useOptimistic Hook. Messages appear immediately while being
              submitted in the background.
            </p>
          </div>

          <MessageList messages={optimisticMessages} />
          <FormStatusMessage formState={formState} />
          <MessageForm
            onSubmit={handleSubmit}
            pending={pending}
          />

          {/* 使用说明 */}
          <div className='mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800'>
            <h3 className='mb-2 font-semibold text-gray-900 dark:text-gray-100'>
              How it works:
            </h3>
            <ul className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
              <li>
                • Messages appear immediately when you submit (optimistic
                update)
              </li>
              <li>• A spinner shows the message is being processed</li>
              <li>• If successful, the message becomes permanent</li>
              <li>• If failed, the message is marked with an error state</li>
              <li>
                • 20% chance of simulated network failure for demonstration
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * 使用示例的关键代码片段
 */
export const OPTIMISTIC_EXAMPLE_CODE = `
// 1. 设置乐观状态
const [optimisticMessages, addOptimisticMessage] = useOptimistic(
  messages,
  (state, newMessage) => [...state, newMessage]
);

// 2. 立即更新UI
const handleSubmit = (formData) => {
  const optimisticMessage = {
    id: 'temp-' + Date.now(),
    text: formData.get('message'),
    pending: true,
  };

  // 立即显示
  addOptimisticMessage(optimisticMessage);

  // 异步提交
  startTransition(async () => {
    await submitAction(formData);
    // React自动同步真实状态
  });
};
`;

export default OptimisticFormExample;
