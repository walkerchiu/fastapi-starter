'use client';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Container, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

import { Alert, Button, Spinner } from '@/components/ui';
import { env } from '@/config/env';
import { Link, useRouter } from '@/i18n/routing';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const t = useTranslations('auth.verifyEmail');

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
          throw new Error(data.detail || t('verificationFailed'));
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
          setErrorMessage(t('genericError'));
        }
      }
    },
    [router, t],
  );

  useEffect(() => {
    if (token && status === 'loading') {
      verifyEmail(token);
    }
  }, [token, status, verifyEmail]);

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
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <Spinner />
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.primary"
                sx={{ mt: 3 }}
              >
                {t('verifyingTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('verifyingMessage')}
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <CheckIcon sx={{ fontSize: 32, color: 'success.main' }} />
              </Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.primary"
                sx={{ mt: 3 }}
              >
                {t('successTitle')}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Alert variant="success">{t('successMessage')}</Alert>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Link href="/login">
                  <Button>{t('goToLogin')}</Button>
                </Link>
              </Box>
            </>
          )}

          {status === 'error' && (
            <>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'error.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <CloseIcon sx={{ fontSize: 32, color: 'error.main' }} />
              </Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.primary"
                sx={{ mt: 3 }}
              >
                {t('errorTitle')}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Alert variant="error">{errorMessage}</Alert>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {t('errorDescription')}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Link href="/login">
                  <Button fullWidth>{t('goToLogin')}</Button>
                </Link>
              </Box>
            </>
          )}

          {status === 'no-token' && (
            <>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'warning.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <WarningIcon sx={{ fontSize: 32, color: 'warning.main' }} />
              </Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.primary"
                sx={{ mt: 3 }}
              >
                {t('invalidLinkTitle')}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Alert variant="warning">{t('noTokenMessage')}</Alert>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {t('checkEmailMessage')}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Link href="/login">
                  <Button>{t('goToLogin')}</Button>
                </Link>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}
