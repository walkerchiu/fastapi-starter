'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from '@/components/ui';
import { env } from '@/config/env';

function TwoFactorVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [code, setCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <Alert variant="error">
            Invalid request. Please try logging in again.
          </Alert>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: parseInt(userId, 10),
            code: code.replace(/\s/g, ''),
            is_backup_code: isBackupCode,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Invalid verification code');
      }

      const data = await response.json();

      // Store tokens in session storage temporarily for NextAuth to pick up
      sessionStorage.setItem(
        '2fa_tokens',
        JSON.stringify({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        }),
      );

      // Redirect to callback page that will complete the sign-in
      router.push(
        `/2fa-callback?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to verify 2FA code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <svg
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Two-Factor Authentication
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {isBackupCode
                  ? 'Enter one of your backup codes'
                  : 'Enter the code from your authenticator app'}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="error">{error}</Alert>}

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  {isBackupCode ? 'Backup Code' : 'Verification Code'}
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => {
                    if (isBackupCode) {
                      setCode(e.target.value);
                    } else {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    }
                  }}
                  placeholder={isBackupCode ? 'Enter backup code' : '000000'}
                  className="mt-1 block w-full rounded-md border-0 py-3 text-center text-xl tracking-widest text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                  maxLength={isBackupCode ? 20 : 6}
                  required
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isBackupCode ? code.length === 0 : code.length !== 6}
                fullWidth
              >
                Verify
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsBackupCode(!isBackupCode);
                    setCode('');
                    setError('');
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {isBackupCode
                    ? 'Use authenticator app instead'
                    : 'Use a backup code instead'}
                </button>
              </div>

              <div className="border-t pt-4 text-center">
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel and return to login
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function TwoFactorVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <TwoFactorVerifyContent />
    </Suspense>
  );
}
