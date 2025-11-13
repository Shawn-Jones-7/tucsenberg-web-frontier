import { Mail, Settings, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';

interface ResponsiveShowcaseProps {
  t: (_key: string) => string;
}

export function ResponsiveShowcase({ t }: ResponsiveShowcaseProps) {
  return (
    <TabsContent
      value='responsive'
      className='space-y-6'
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('responsive.title')}</CardTitle>
          <CardDescription>{t('responsive.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='space-y-2'>
              <User className='text-primary h-8 w-8' />
              <h3 className='font-medium'>{t('responsive.mobile.title')}</h3>
              <p className='text-muted-foreground text-sm'>
                {t('responsive.mobile.description')}
              </p>
            </div>
            <div className='space-y-2'>
              <Mail className='text-primary h-8 w-8' />
              <h3 className='font-medium'>{t('responsive.tablet.title')}</h3>
              <p className='text-muted-foreground text-sm'>
                {t('responsive.tablet.description')}
              </p>
            </div>
            <div className='space-y-2'>
              <Settings className='text-primary h-8 w-8' />
              <h3 className='font-medium'>{t('responsive.desktop.title')}</h3>
              <p className='text-muted-foreground text-sm'>
                {t('responsive.desktop.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
