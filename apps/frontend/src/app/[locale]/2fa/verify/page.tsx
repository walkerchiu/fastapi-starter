'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Spinner,
} from '@/components/ui';
import { env } from '@/config/env';
import { Link, useRouter } from '@/i18n/routing';

function TwoFactorVerifyContent() {
  const t = useTranslations('auth.twoFactor');
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <Alert variant="error">{t('invalidRequest')}</Alert>
          <Link href="/login">
            <Button>{t('goToLogin')}</Button>
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
        throw new Error(data.message || t('invalidCode'));
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
        setError(t('verifyFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <svg
                  className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
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
              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('verifyTitle')}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {isBackupCode ? t('enterBackupCode') : t('enterAuthCode')}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="error">{error}</Alert>}

              <Input
                type="text"
                id="code"
                label={isBackupCode ? t('backupCode') : t('verificationCode')}
                value={code}
                onChange={(e) => {
                  if (isBackupCode) {
                    setCode(e.target.value);
                  } else {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  }
                }}
                placeholder={
                  isBackupCode ? t('enterBackupCodePlaceholder') : '000000'
                }
                className="text-center text-xl tracking-widest"
                maxLength={isBackupCode ? 20 : 6}
                required
                autoFocus
                autoComplete="one-time-code"
              />

              <Button
                type="submit"
                loading={isLoading}
                disabled={isBackupCode ? code.length === 0 : code.length !== 6}
                fullWidth
              >
                {t('verify')}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsBackupCode(!isBackupCode);
                    setCode('');
                    setError('');
                  }}
                >
                  {isBackupCode ? t('useAuthApp') : t('useBackupCode')}
                </Button>
              </div>

              <div className="border-t pt-4 text-center dark:border-gray-700">
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {t('cancelAndReturn')}
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
