import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MessageFieldProps {
  t: (_key: string) => string;
  isPending: boolean;
}

export function MessageField({ t, isPending }: MessageFieldProps) {
  return (
    <div className='space-y-2'>
      <Label
        htmlFor='message'
        className="after:ml-0.5 after:text-red-500 after:content-['*']"
      >
        {t('message')}
      </Label>
      <Textarea
        id='message'
        name='message'
        placeholder={t('messagePlaceholder')}
        disabled={isPending}
        required
        rows={4}
        aria-describedby='message-error'
      />
    </div>
  );
}
