'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from '@/components/ui';
import { env } from '@/config/env';

type SetupStep = 'loading' | 'scan' | 'verify' | 'complete' | 'error';

interface SetupData {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

export default function TwoFactorSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
        throw new Error(data.detail || 'Failed to initialize 2FA setup');
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
        setError('Failed to initialize 2FA setup');
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
        throw new Error(data.detail || 'Invalid verification code');
      }

      const data = await response.json();
      setBackupCodes(data.backup_codes);
      setStep('complete');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to enable 2FA');
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Set Up Two-Factor Authentication
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add an extra layer of security to your account
        </p>
      </div>

      {step === 'error' && (
        <Card>
          <CardBody>
            <Alert variant="error">{error}</Alert>
            <div className="mt-4 flex gap-3">
              <Button onClick={initializeSetup}>Try Again</Button>
              <Link href="/profile">
                <Button variant="secondary">Back to Profile</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 'scan' && setupData && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Step 1: Scan QR Code
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, Microsoft Authenticator, etc.)
              </p>

              <div className="flex justify-center">
                <div className="rounded-lg border bg-white p-4 dark:border-gray-600">
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
                  Can&apos;t scan? Enter this code manually:
                </p>
                <code className="mt-2 block break-all rounded bg-gray-100 p-2 text-sm dark:bg-gray-700 dark:text-gray-200">
                  {setupData.manualEntryKey}
                </code>
              </div>

              <Button onClick={() => setStep('verify')} fullWidth>
                Continue to Verification
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {step === 'verify' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Step 2: Verify Setup
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleVerify} className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">
                Enter the 6-digit code from your authenticator app to verify the
                setup.
              </p>

              {error && <Alert variant="error">{error}</Alert>}

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, '').slice(0, 6),
                    )
                  }
                  placeholder="000000"
                  className="mt-1 block w-full rounded-md border-0 py-3 text-center text-2xl tracking-widest text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep('scan')}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={verificationCode.length !== 6}
                  fullWidth
                >
                  Enable 2FA
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
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Two-Factor Authentication Enabled
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <Alert variant="success">
                Two-factor authentication has been successfully enabled for your
                account.
              </Alert>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/30">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Save Your Backup Codes
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  Store these backup codes in a safe place. You can use them to
                  access your account if you lose your authenticator device.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code
                      key={index}
                      className="rounded bg-white px-3 py-1 text-center text-sm font-mono dark:bg-gray-800 dark:text-gray-200"
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
                  Copy All Codes
                </Button>
              </div>

              <Link href="/profile">
                <Button fullWidth>Return to Profile</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
