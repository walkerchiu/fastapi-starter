'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MuiButton from '@mui/material/Button';
import MuiLink from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';

import { Alert } from '@/components/ui';
import { env } from '@/config/env';
import { Link, useRouter } from '@/i18n/routing';

function LoginForm() {
  const t = useTranslations('auth.login');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // First, check with backend if 2FA is required
      const loginResponse = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!loginResponse.ok) {
        const data = await loginResponse.json();
        setError(data.detail || t('invalidCredentials'));
        return;
      }

      const loginData = await loginResponse.json();

      // Check if 2FA is required
      if (loginData.requires_two_factor) {
        // Redirect to 2FA verification page
        router.push(
          `/2fa/verify?user_id=${loginData.user_id}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
        return;
      }

      // No 2FA required, proceed with NextAuth signIn
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('invalidCredentials'));
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError(t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
        bgcolor: 'background.default',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography
          variant="h5"
          component="h1"
          textAlign="center"
          fontWeight={700}
          gutterBottom
        >
          {t('title')}
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {tCommon('or')}{' '}
          <MuiLink component={Link} href="/register" underline="hover">
            {t('noAccount')}
          </MuiLink>
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Box sx={{ mb: 2 }}>
              <Alert variant="error">{error}</Alert>
            </Box>
          )}

          <TextField
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            fullWidth
            label={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            fullWidth
            label={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <MuiLink
              component={Link}
              href="/forgot-password"
              variant="body2"
              underline="hover"
            >
              {t('forgotPassword')}
            </MuiLink>
          </Box>

          <MuiButton
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isLoading ? t('submitting') : t('submit')}
          </MuiButton>
        </Box>
      </Paper>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
