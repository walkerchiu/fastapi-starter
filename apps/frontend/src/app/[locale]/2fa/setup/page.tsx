'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

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

type SetupStep = 'loading' | 'scan' | 'verify' | 'complete' | 'error';

interface SetupData {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

export default function TwoFactorSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('auth.twoFactor');

  const [step, setStep] = useState<SetupStep>('loading');
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/2fa/setup');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && step === 'loading') {
      initializeSetup();
    }
  }, [status, step]);

  const initializeSetup = async () => {
    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/setup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t('setupFailed'));
      }

      const data = await response.json();
      setSetupData({
        secret: data.secret,
        qrCode: data.qr_code,
        manualEntryKey: data.manual_entry_key,
      });
      setStep('scan');
    } catch (err) {
      setStep('error');
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('setupFailed'));
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/enable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ code: verificationCode }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t('invalidCode'));
      }

      const data = await response.json();
      setBackupCodes(data.backup_codes);
      setStep('complete');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('enableFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  if (status === 'loading' || step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('setupTitle')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('setupDescription')}
        </p>
      </div>

      {step === 'error' && (
        <Card>
          <CardBody>
            <Alert variant="error">{error}</Alert>
            <div className="mt-4 flex gap-3">
              <Button onClick={initializeSetup}>{t('tryAgain')}</Button>
              <Link href="/profile">
                <Button variant="secondary">{t('backToProfile')}</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 'scan' && setupData && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('step1Title')}
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">
                {t('step1Description')}
              </p>

              <div className="flex justify-center">
                <div className="rounded-lg border bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
                  <Image
                    src={setupData.qrCode}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                    className="h-48 w-48"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('manualEntry')}
                </p>
                <code className="mt-2 block break-all rounded bg-gray-100 p-2 text-sm dark:bg-gray-700 dark:text-gray-200">
                  {setupData.manualEntryKey}
                </code>
              </div>

              <Button onClick={() => setStep('verify')} fullWidth>
                {t('continueToVerify')}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 'verify' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('step2Title')}
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleVerify} className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">
                {t('step2Description')}
              </p>

              {error && <Alert variant="error">{error}</Alert>}

              <Input
                type="text"
                id="code"
                label={t('verificationCode')}
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, '').slice(0, 6),
                  )
                }
                placeholder="000000"
                className="text-center text-2xl tracking-widest"
                maxLength={6}
                required
                autoFocus
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep('scan')}
                >
                  {t('back')}
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={verificationCode.length !== 6}
                  fullWidth
                >
                  {t('enable2FA')}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {step === 'complete' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
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
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('enabledTitle')}
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <Alert variant="success">{t('enabledMessage')}</Alert>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  {t('saveBackupCodes')}
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  {t('backupCodesDescription')}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code
                      key={index}
                      className="rounded bg-white px-3 py-1 text-center font-mono text-sm dark:bg-gray-800 dark:text-gray-200"
                    >
                      {code}
                    </code>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={handleCopyBackupCodes}
                >
                  {t('copyAllCodes')}
                </Button>
              </div>

              <Link href="/profile">
                <Button fullWidth>{t('returnToProfile')}</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
