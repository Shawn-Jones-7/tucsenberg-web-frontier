import { Label } from '@/components/ui/label';

/**
 * Checkbox fields component - React 19 Native Form Version
 * 使用原生HTML表单属性，配合Server Actions进行表单处理
 */
interface CheckboxFieldsProps {
  /** 国际化翻译函数 */
  t: (_key: string) => string;
  /** 表单提交状态（来自useActionState的isPending） */
  isPending: boolean;
}

export function CheckboxFields({ t, isPending }: CheckboxFieldsProps) {
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <div className='flex items-center space-x-2'>
          <input
            id='acceptPrivacy'
            name='acceptPrivacy'
            type='checkbox'
            disabled={isPending}
            required
            className='border-input h-4 w-4 rounded border'
          />
          <Label
            htmlFor='acceptPrivacy'
            className="text-sm after:ml-0.5 after:text-red-500 after:content-['*']"
          >
            {t('acceptPrivacy')}
          </Label>
        </div>
      </div>

      <div className='space-y-2'>
        <div className='flex items-center space-x-2'>
          <input
            id='marketingConsent'
            name='marketingConsent'
            type='checkbox'
            disabled={isPending}
            className='border-input h-4 w-4 rounded border'
          />
          <Label
            htmlFor='marketingConsent'
            className='text-sm'
          >
            {t('marketingConsent')}
          </Label>
        </div>
      </div>
    </div>
  );
}
