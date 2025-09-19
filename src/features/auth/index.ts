import { ZERO } from '@/constants';

// Auth feature module
export const authConfig = {
  provider: 'oauth',
  redirectUrl: '/auth/callback',
};

export function authenticate(token: string): boolean {
  return token.length > ZERO;
}
