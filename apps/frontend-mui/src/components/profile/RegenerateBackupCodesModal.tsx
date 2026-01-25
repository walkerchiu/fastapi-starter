'use client';

import { Box, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Alert, Button, Modal } from '@/components/ui';
import { env } from '@/config/env';

interface RegenerateBackupCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegenerateBackupCodesModal({
  isOpen,
  onClose,
}: RegenerateBackupCodesModalProps) {
  const t = useTranslations('auth.twoFactor.manage.regenerateModal');
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRegenerate = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/backup-codes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t('genericError'));
      }

      const data = await response.json();
      setBackupCodes(data.backup_codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!backupCodes) return;

    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = backupCodes.join('\n');
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setError(null);
    setBackupCodes(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('title')} size="md">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!backupCodes ? (
          <>
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

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.5,
                pt: 2,
              }}
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
                type="button"
                variant="primary"
                onClick={handleRegenerate}
                loading={isLoading}
              >
                {isLoading ? t('submitting') : t('submit')}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'success.light',
              }}
            >
              <Typography
                variant="body2"
                fontWeight="medium"
                color="success.dark"
              >
                {t('newCodesTitle')}
              </Typography>
              <Typography variant="body2" color="success.dark" sx={{ mt: 0.5 }}>
                {t('newCodesDescription')}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
                p: 2,
                borderRadius: 1,
                bgcolor: 'grey.100',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}
            >
              {backupCodes.map((code, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: 'center',
                    color: 'text.primary',
                  }}
                >
                  {code}
                </Box>
              ))}
            </Box>

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}
            >
              <Button type="button" variant="outline" onClick={handleCopy}>
                {copied ? t('copied') : t('copyAll')}
              </Button>
              <Button type="button" variant="primary" onClick={handleClose}>
                {t('done')}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}
