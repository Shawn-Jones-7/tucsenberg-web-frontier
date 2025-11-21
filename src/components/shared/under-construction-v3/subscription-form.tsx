'use client';

import { ArrowRight, CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SubscriptionFormProps {
  email: string;
  setEmail: (email: string) => void;
  isSubscribed: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  tPage: (key: string) => string;
}

export function SubscriptionForm({
  email,
  setEmail,
  isSubscribed,
  isSubmitting,
  onSubmit,
  tPage: _tPage,
}: SubscriptionFormProps) {
  if (isSubscribed) {
    return (
      <Card className='mx-auto max-w-md'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center space-x-3 text-green-600'>
            <CheckCircle className='h-6 w-6' />
            <span className='font-medium'>订阅成功！</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='mx-auto max-w-md'>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          <div className='flex items-center justify-center space-x-2 text-muted-foreground'>
            <Mail className='h-5 w-5' />
            <span className='text-sm font-medium'>邮件订阅</span>
          </div>

          <form
            onSubmit={onSubmit}
            className='space-y-3'
          >
            <Input
              type='email'
              placeholder='请输入您的邮箱地址'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className='w-full'
              required
            />
            <Button
              type='submit'
              disabled={isSubmitting || !email}
              className='w-full'
              size='sm'
            >
              {isSubmitting ? (
                '订阅中...'
              ) : (
                <>
                  订阅更新
                  <ArrowRight className='ml-2 h-4 w-4' />
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
