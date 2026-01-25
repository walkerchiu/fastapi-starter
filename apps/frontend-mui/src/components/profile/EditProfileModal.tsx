'use client';

import { Box, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button, Input, Modal } from '@/components/ui';
import { env } from '@/config/env';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSuccess?: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentName,
  onSuccess,
}: EditProfileModalProps) {
  const t = useTranslations('profile');
  const { data: session } = useSession();
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/profile`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ name }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t('updateProfileFailed'));
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName(currentName);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('editProfile')}>
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

        <Box>
          <Typography
            component="label"
            htmlFor="name"
            variant="body2"
            fontWeight="medium"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
            {t('name')}
          </Typography>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
        </Box>

        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 2 }}
        >
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" loading={isLoading}>
            {t('save')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
