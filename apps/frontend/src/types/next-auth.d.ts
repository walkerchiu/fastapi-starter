import type { DefaultSession } from 'next-auth';
import 'next-auth';
import 'next-auth/jwt';

export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: Permission[];
}

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    roles?: Role[];
  }

  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string;
      roles?: Role[];
    };
    accessToken: string;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    roles?: Role[];
    error?: string;
  }
}
