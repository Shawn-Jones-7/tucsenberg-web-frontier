import { Download, Heart, Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface InteractiveShowcaseProps {
  t: (_key: string) => string;
  likeCount: number;
  isLiked: boolean;
  handleLike: () => void;
}

export function InteractiveShowcase({
  t,
  likeCount,
  isLiked,
  handleLike,
}: InteractiveShowcaseProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('components.interactive.title')}</CardTitle>
        <CardDescription>
          {t('components.interactive.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span>{t('components.interactive.likes')}</span>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleLike}
              className={isLiked ? 'text-red-500' : ''}
              aria-label={t('components.interactive.likes')}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className='sr-only'>
                {t('components.interactive.likes')}
              </span>
            </Button>
            <span className='text-sm text-muted-foreground'>{likeCount}</span>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
          >
            <Star className='mr-1 h-4 w-4' />
            {t('components.interactive.star')}
          </Button>
          <Button
            variant='outline'
            size='sm'
          >
            <Download className='mr-1 h-4 w-4' />
            {t('components.interactive.download')}
          </Button>
          <Button
            variant='outline'
            size='sm'
          >
            <Share2 className='mr-1 h-4 w-4' />
            {t('components.interactive.share')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
