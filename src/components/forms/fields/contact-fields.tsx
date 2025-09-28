import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Contact fields component - React 19 Native Form Version
 * 使用原生HTML表单属性，配合Server Actions进行表单处理
 */
interface ContactFieldsProps {
  /** 国际化翻译函数 */
  t: (_key: string) => string;
  /** 表单提交状态（来自useActionState的isPending） */
  isPending: boolean;
}

export function ContactFields({ t, isPending }: ContactFieldsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div className='space-y-2'>
        <Label
          htmlFor='email'
          className="after:ml-0.5 after:text-red-500 after:content-['*']"
        >
          {t('email')}
        </Label>
        <Input
          id='email'
          name='email'
          type='email'
          placeholder={t('emailPlaceholder')}
          disabled={isPending}
          required
          aria-describedby='email-error'
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='company'
          className="after:ml-0.5 after:text-red-500 after:content-['*']"
        >
          {t('company')}
        </Label>
        <Input
          id='company'
          name='company'
          type='text'
          placeholder={t('companyPlaceholder')}
          disabled={isPending}
          required
          aria-describedby='company-error'
        />
      </div>
    </div>
  );
}
