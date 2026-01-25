'use client';

import { Box, Container, Paper, Typography } from '@mui/material';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Alert, Button, Input } from '@/components/ui';
import { Link, useRouter } from '@/i18n/routing';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl =
        process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 422) {
          setError(t('invalidInput'));
        } else if (response.status === 400 || response.status === 409) {
          setError(data.detail || t('emailExists'));
        } else {
          setError(t('registrationFailed'));
        }
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push('/login');
      } else {
        router.push('/');
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
        <Paper elevation={0} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              fontWeight="bold"
              color="text.primary"
            >
              {t('title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {tCommon('or')}{' '}
              <Link
                href="/login"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    '&:hover': { color: 'primary.dark' },
                    cursor: 'pointer',
                  }}
                >
                  {t('hasAccount')}
                </Typography>
              </Link>
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Box sx={{ mb: 3 }}>
                <Alert variant="error">{error}</Alert>
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('name')}
                label={t('name')}
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email')}
                label={t('email')}
              />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password')}
                label={t('password')}
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPassword')}
                label={t('confirmPassword')}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button type="submit" loading={isLoading} fullWidth>
                {isLoading ? t('submitting') : t('submit')}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
