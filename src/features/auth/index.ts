import { ZERO } from "@/constants/magic-numbers";

// Auth feature module
export const authConfig = {
  provider: 'oauth',
  redirectUrl: '/auth/callback',
};

export function authenticate(token: string): boolean {
  return token.length > ZERO;
}
