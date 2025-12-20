'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Alert, Button, Spinner } from '@/components/ui';

function TwoFactorCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [error, setError] = useState('');

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        const tokensJson = sessionStorage.getItem('2fa_tokens');
        if (!tokensJson) {
          setError('No tokens found. Please try logging in again.');
          return;
        }

        const tokens = JSON.parse(tokensJson);
        sessionStorage.removeItem('2fa_tokens');

        const result = await signIn('credentials', {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          redirect: false,
        });

        if (result?.error) {
          setError('Failed to complete sign-in. Please try again.');
          return;
        }

        router.push(callbackUrl);
        router.refresh();
      } catch {
        setError('An error occurred. Please try again.');
      }
    };

    completeSignIn();
  }, [callbackUrl, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <Alert variant="error">{error}</Alert>
          <Button variant="ghost" onClick={() => router.push('/login')}>
            Return to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <Spinner />
        <p className="text-gray-600 dark:text-gray-400">
          Completing sign-in...
        </p>
      </div>
    </div>
  );
}

export default function TwoFactorCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <TwoFactorCallbackContent />
    </Suspense>
  );
}
