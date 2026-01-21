import type { DefaultSession } from 'next-auth';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }

  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string;
    };
    accessToken: string;
    error?: 'RefreshTokenError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: 'RefreshTokenError';
  }
}
