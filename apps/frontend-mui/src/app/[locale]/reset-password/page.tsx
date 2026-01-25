'use client';

import { Box, Container, Paper, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { Alert, Button, Input, Spinner } from '@/components/ui';
import { env } from '@/config/env';
import { Link, useRouter } from '@/i18n/routing';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, new_password: password }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
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
            <Alert variant="error">
              Invalid or missing reset token. Please request a new password
              reset link.
            </Alert>
            <Box sx={{ mt: 3 }}>
              <Link
                href="/forgot-password"
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
                  Request new reset link
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
              Reset your password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter your new password below.
            </Typography>
          </Box>

          {success ? (
            <Box>
              <Alert variant="success">
                Your password has been reset successfully. Redirecting to
                login...
              </Alert>
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
                    Go to login
                  </Typography>
                </Link>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Box sx={{ mb: 3 }}>
                  <Alert variant="error">{error}</Alert>
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  label="New password"
                />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  label="Confirm new password"
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button type="submit" loading={isLoading} fullWidth>
                  {isLoading ? 'Resetting...' : 'Reset password'}
                </Button>
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
                    Back to login
                  </Typography>
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}
