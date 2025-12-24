'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

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
        throw new Error(data.message || t('genericError'));
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
      <div className="space-y-4">
        {!backupCodes ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('description')}
            </p>

            <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                {t('warning')}
              </p>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <div className="flex justify-end gap-3 pt-4">
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
            </div>
          </>
        ) : (
          <>
            <div className="rounded-md bg-green-50 p-3 dark:bg-green-900/20">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                {t('newCodesTitle')}
              </h3>
              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                {t('newCodesDescription')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-md bg-gray-100 p-4 font-mono text-sm dark:bg-gray-800">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="text-center text-gray-900 dark:text-gray-100"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? t('copied') : t('copyAll')}
              </Button>
              <Button type="button" variant="primary" onClick={handleClose}>
                {t('done')}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
