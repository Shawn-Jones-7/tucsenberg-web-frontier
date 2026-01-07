import { ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SITE_CONFIG } from '@/config/paths/site-config';

interface CommunitySectionProps {
  t: (_key: string) => string;
}

export function CommunitySection({ t }: CommunitySectionProps) {
  return (
    <div className='mt-16 text-center'>
      <Card className='bg-muted/50'>
        <CardHeader>
          <CardTitle className='flex items-center justify-center gap-2'>
            <MessageCircle className='h-5 w-5' />
            {t('community.title')}
          </CardTitle>
          <CardDescription className='text-base'>
            {t('community.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <Button
              variant='outline'
              asChild
            >
              <a
                href={`${SITE_CONFIG.social.github}/discussions`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2'
              >
                {t('community.discussions')}
                <ExternalLink className='h-4 w-4' />
              </a>
            </Button>
            <Button
              variant='outline'
              asChild
            >
              <a
                href={`${SITE_CONFIG.social.github}/issues`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2'
              >
                {t('community.issues')}
                <ExternalLink className='h-4 w-4' />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
