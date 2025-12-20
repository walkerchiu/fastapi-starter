'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Button, Spinner } from '@/components/ui';

function UnauthorizedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptedPath = searchParams.get('from');

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
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
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You do not have permission to access this page.
          </p>
          {attemptedPath && (
            <p className="mt-2 text-center text-xs text-gray-500">
              Attempted to access:{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 font-mono">
                {attemptedPath}
              </code>
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="secondary" onClick={handleGoBack}>
            Go Back
          </Button>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
