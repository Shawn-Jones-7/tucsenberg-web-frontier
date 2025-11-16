import { LanguageToggle } from '@/components/language-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

interface ThemeShowcaseProps {
  t: (_key: string) => string;
}

export function ThemeShowcase({ t }: ThemeShowcaseProps) {
  return (
    <TabsContent
      value='themes'
      className='space-y-6'
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('themes.title')}</CardTitle>
          <CardDescription>{t('themes.description')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center justify-between'>
            <span>{t('themes.toggle')}</span>
            <ThemeSwitcher />
          </div>
          <div className='flex items-center justify-between'>
            <span>{t('themes.language')}</span>
            <LanguageToggle />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <h3 className='font-medium'>{t('themes.colors.title')}</h3>
              <div className='grid grid-cols-4 gap-2'>
                <div className='h-8 rounded bg-primary'></div>
                <div className='h-8 rounded bg-secondary'></div>
                <div className='h-8 rounded bg-muted'></div>
                <div className='h-8 rounded bg-accent'></div>
              </div>
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium'>{t('themes.typography.title')}</h3>
              <div className='space-y-1 text-sm'>
                <p className='font-bold'>{t('themes.typography.bold')}</p>
                <p className='font-medium'>{t('themes.typography.medium')}</p>
                <p className='font-normal'>{t('themes.typography.normal')}</p>
                <p className='text-muted-foreground'>
                  {t('themes.typography.muted')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
