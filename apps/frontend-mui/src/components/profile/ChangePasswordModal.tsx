'use client';

import { Box, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button, Input, Modal } from '@/components/ui';
import { env } from '@/config/env';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const t = useTranslations('profile');
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t('changePasswordFailed'));
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('changePassword')}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {error && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'error.light',
            }}
          >
            <Typography variant="body2" color="error.dark">
              {error}
            </Typography>
          </Box>
        )}

        {success && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'success.light',
            }}
          >
            <Typography variant="body2" color="success.dark">
              {t('changePasswordSuccess')}
            </Typography>
          </Box>
        )}

        <Box>
          <Typography
            component="label"
            htmlFor="currentPassword"
            variant="body2"
            fontWeight="medium"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
            {t('currentPassword')}
          </Typography>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </Box>

        <Box>
          <Typography
            component="label"
            htmlFor="newPassword"
            variant="body2"
            fontWeight="medium"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
            {t('newPassword')}
          </Typography>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </Box>

        <Box>
          <Typography
            component="label"
            htmlFor="confirmPassword"
            variant="body2"
            fontWeight="medium"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
            {t('confirmPassword')}
          </Typography>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </Box>

        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 2 }}
        >
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" loading={isLoading} disabled={success}>
            {t('changePassword')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
