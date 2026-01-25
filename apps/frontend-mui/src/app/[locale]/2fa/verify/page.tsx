'use client';

import LockIcon from '@mui/icons-material/Lock';
import { Box, Container, Divider, Typography } from '@mui/material';
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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          px: 2,
          py: 6,
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <Alert variant="error">{t('invalidRequest')}</Alert>
            <Box sx={{ mt: 3 }}>
              <Link href="/login">
                <Button>{t('goToLogin')}</Button>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
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
        throw new Error(data.detail || t('invalidCode'));
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Card>
          <CardHeader>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <LockIcon sx={{ color: 'primary.main' }} />
              </Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.primary"
                sx={{ mt: 2 }}
              >
                {t('verifyTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {isBackupCode ? t('enterBackupCode') : t('enterAuthCode')}
              </Typography>
            </Box>
          </CardHeader>
          <CardBody>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
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

              <Box sx={{ textAlign: 'center' }}>
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
              </Box>

              <Divider />

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  href="/login"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'text.primary' },
                      cursor: 'pointer',
                    }}
                  >
                    {t('cancelAndReturn')}
                  </Typography>
                </Link>
              </Box>
            </Box>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}

export default function TwoFactorVerifyPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <TwoFactorVerifyContent />
    </Suspense>
  );
}
