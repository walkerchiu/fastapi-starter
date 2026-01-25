'use client';

import { Box, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Alert, Button, Input, Modal } from '@/components/ui';
import { env } from '@/config/env';

interface Disable2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function Disable2FAModal({
  isOpen,
  onClose,
  onSuccess,
}: Disable2FAModalProps) {
  const t = useTranslations('auth.twoFactor.manage.disableModal');
  const { data: session } = useSession();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError(t('invalidPassword'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/disable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ password }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t('genericError'));
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('title')}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          {t('description')}
        </Typography>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'warning.light',
          }}
        >
          <Typography variant="body2" color="warning.dark">
            {t('warning')}
          </Typography>
        </Box>

        {error && <Alert variant="error">{error}</Alert>}

        {success && <Alert variant="success">{t('success')}</Alert>}

        <Box>
          <Typography
            component="label"
            htmlFor="password"
            variant="body2"
            fontWeight="medium"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
            {t('password')}
          </Typography>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={success}
          />
        </Box>

        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 2 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={success || !password}
          >
            {isLoading ? t('submitting') : t('submit')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
