'use client';

import { Box, Container, Typography } from '@mui/material';
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
            <Alert variant="error">{error}</Alert>
            <Box sx={{ mt: 3 }}>
              <Button variant="ghost" onClick={() => router.push('/login')}>
                Return to login
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

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
          <Spinner />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Completing sign-in...
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default function TwoFactorCallbackPage() {
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
      <TwoFactorCallbackContent />
    </Suspense>
  );
}
