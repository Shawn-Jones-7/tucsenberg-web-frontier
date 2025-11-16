import React from 'react';
import { Github, Twitter } from 'lucide-react';

interface SocialLink {
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  label: string;
}

export function SocialLinks() {
  const socialLinks: SocialLink[] = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ];

  return (
    <div className='flex justify-center space-x-6'>
      {socialLinks.map((link) => {
        const IconComponent = link.icon;
        return (
          <a
            key={link.label}
            href={link.href}
            className='text-muted-foreground transition-colors hover:text-foreground'
            aria-label={link.label}
          >
            <IconComponent className='h-6 w-6' />
          </a>
        );
      })}
    </div>
  );
}
