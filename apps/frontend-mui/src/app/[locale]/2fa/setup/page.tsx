'use client';

import CheckIcon from '@mui/icons-material/Check';
import { Box, Container, Paper, Typography } from '@mui/material';
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
        throw new Error(data.detail || t('setupFailed'));
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
        throw new Error(data.detail || t('invalidCode'));
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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          {t('setupTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {t('setupDescription')}
        </Typography>
      </Box>

      {step === 'error' && (
        <Card>
          <CardBody>
            <Alert variant="error">{error}</Alert>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button onClick={initializeSetup}>{t('tryAgain')}</Button>
              <Link href="/profile">
                <Button variant="secondary">{t('backToProfile')}</Button>
              </Link>
            </Box>
          </CardBody>
        </Card>
      )}

      {step === 'scan' && setupData && (
        <Card>
          <CardHeader>
            <Typography variant="h6" color="text.primary">
              {t('step1Title')}
            </Typography>
          </CardHeader>
          <CardBody>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('step1Description')}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, bgcolor: 'background.paper' }}
                >
                  <Image
                    src={setupData.qrCode}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                    style={{ width: 192, height: 192 }}
                  />
                </Paper>
              </Box>

              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'action.hover',
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color="text.secondary"
                >
                  {t('manualEntry')}
                </Typography>
                <Box
                  component="code"
                  sx={{
                    display: 'block',
                    mt: 1,
                    p: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    wordBreak: 'break-all',
                  }}
                >
                  {setupData.manualEntryKey}
                </Box>
              </Paper>

              <Button onClick={() => setStep('verify')} fullWidth>
                {t('continueToVerify')}
              </Button>
            </Box>
          </CardBody>
        </Card>
      )}

      {step === 'verify' && (
        <Card>
          <CardHeader>
            <Typography variant="h6" color="text.primary">
              {t('step2Title')}
            </Typography>
          </CardHeader>
          <CardBody>
            <Box
              component="form"
              onSubmit={handleVerify}
              sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              <Typography variant="body2" color="text.secondary">
                {t('step2Description')}
              </Typography>

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
                maxLength={6}
                required
                autoFocus
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
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
              </Box>
            </Box>
          </CardBody>
        </Card>
      )}

      {step === 'complete' && (
        <Card>
          <CardHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckIcon sx={{ color: 'success.main' }} />
              </Box>
              <Typography variant="h6" color="text.primary">
                {t('enabledTitle')}
              </Typography>
            </Box>
          </CardHeader>
          <CardBody>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Alert variant="success">{t('enabledMessage')}</Alert>

              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'warning.light',
                  border: '1px solid',
                  borderColor: 'warning.main',
                }}
              >
                <Typography variant="subtitle2" color="warning.dark">
                  {t('saveBackupCodes')}
                </Typography>
                <Typography
                  variant="body2"
                  color="warning.dark"
                  sx={{ mt: 0.5 }}
                >
                  {t('backupCodesDescription')}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1,
                    mt: 2,
                  }}
                >
                  {backupCodes.map((code, index) => (
                    <Box key={index}>
                      <Box
                        component="code"
                        sx={{
                          display: 'block',
                          textAlign: 'center',
                          p: 1,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                        }}
                      >
                        {code}
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyBackupCodes}
                  >
                    {t('copyAllCodes')}
                  </Button>
                </Box>
              </Paper>

              <Link href="/profile">
                <Button fullWidth>{t('returnToProfile')}</Button>
              </Link>
            </Box>
          </CardBody>
        </Card>
      )}
    </Container>
  );
}
