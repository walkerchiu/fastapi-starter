import 'next-auth';

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
}

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    roles: Role[];
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      roles?: Role[];
    };
    accessToken: string;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    roles?: Role[];
    error?: string;
  }
}
