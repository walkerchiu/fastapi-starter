'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

import { Alert, Button, Spinner } from '@/components/ui';
import { env } from '@/config/env';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>(
    token ? 'loading' : 'no-token',
  );
  const [errorMessage, setErrorMessage] = useState('');

  const verifyEmail = useCallback(
    async (verificationToken: string) => {
      try {
        const response = await fetch(
          `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: verificationToken }),
          },
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to verify email');
        }

        setStatus('success');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err) {
        setStatus('error');
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('An error occurred during verification.');
        }
      }
    },
    [router],
  );

  useEffect(() => {
    if (token && status === 'loading') {
      verifyEmail(token);
    }
  }, [token, status, verifyEmail]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        {status === 'loading' && (
          <>
            <Spinner />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Verifying your email...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Email Verified!
            </h2>
            <Alert variant="success">
              Your email has been verified successfully. Redirecting to login...
            </Alert>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Verification Failed
            </h2>
            <Alert variant="error">{errorMessage}</Alert>
            <p className="text-gray-600">
              The verification link may be expired or invalid.
            </p>
            <div className="mt-6 space-y-3">
              <Link href="/login">
                <Button fullWidth>Go to Login</Button>
              </Link>
            </div>
          </>
        )}

        {status === 'no-token' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Invalid Link
            </h2>
            <Alert variant="warning">
              No verification token found in the URL.
            </Alert>
            <p className="text-gray-600">
              Please check your email for the correct verification link.
            </p>
            <div className="mt-6">
              <Link href="/login">
                <Button>Go to Login</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
