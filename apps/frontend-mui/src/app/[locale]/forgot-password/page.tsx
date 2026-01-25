'use client';

import { Box, Container, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Alert, Button, Input } from '@/components/ui';
import { Link } from '@/i18n/routing';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const apiUrl =
        process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || t('genericError'));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
            <Typography
              variant="h4"
              component="h2"
              fontWeight="bold"
              color="text.primary"
              sx={{ mb: 2 }}
            >
              {t('successTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('successDescription')}
            </Typography>
            <Alert variant="success">{t('successMessage')}</Alert>
            <Box sx={{ mt: 3 }}>
              <Link
                href="/login"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <Typography
                  component="span"
                  sx={{
                    color: 'primary.main',
                    '&:hover': { color: 'primary.dark' },
                    cursor: 'pointer',
                  }}
                >
                  {t('backToLogin')}
                </Typography>
              </Link>
            </Box>
          </Paper>
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
              {t('description')}
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Box sx={{ mb: 3 }}>
                <Alert variant="error">{error}</Alert>
              </Box>
            )}

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

            <Box sx={{ mt: 3 }}>
              <Button type="submit" loading={isLoading} fullWidth>
                {isLoading ? t('submitting') : t('submit')}
              </Button>
            </Box>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link
              href="/login"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <Typography
                component="span"
                sx={{
                  color: 'primary.main',
                  '&:hover': { color: 'primary.dark' },
                  cursor: 'pointer',
                }}
              >
                {t('backToLogin')}
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
