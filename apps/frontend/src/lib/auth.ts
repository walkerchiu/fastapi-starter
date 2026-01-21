import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { JWT } from 'next-auth/jwt';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const API_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000';

// Access token expires in 30 minutes, refresh 5 minutes before expiry
const ACCESS_TOKEN_EXPIRE_MS = 30 * 60 * 1000;
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Refresh the access token using the refresh token.
 * Returns updated token data or marks the token with an error.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();

    return {
      ...token,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRE_MS,
      error: undefined,
    };
  } catch {
    // Return the token with an error flag
    return {
      ...token,
      error: 'RefreshTokenError',
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        try {
          const response = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            return null;
          }

          const tokens = await response.json();

          const userResponse = await fetch(`${API_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });

          if (!userResponse.ok) {
            return null;
          }

          const user = await userResponse.json();

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRE_MS,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in - store user data in token
      if (user) {
        return {
          ...token,
          id: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      // Return previous token if not expired
      const shouldRefresh =
        token.accessTokenExpires &&
        Date.now() > token.accessTokenExpires - REFRESH_BUFFER_MS;

      if (!shouldRefresh) {
        return token;
      }

      // Access token has expired (or will soon), try to refresh
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
        session.error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
