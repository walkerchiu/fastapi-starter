'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Form, Typography } from 'antd';

import { Alert, Button, Input, Modal } from '@/components/ui';
import { useModalStore } from '@/stores';
import { useRegenerateBackupCodes } from '@/hooks/api';

const { Text } = Typography;

export function RegenerateBackupCodesModal() {
  const t = useTranslations('profile.modals.regenerateBackupCodes');
  const { isOpen, closeModal } = useModalStore();
  const open = isOpen('regenerateBackupCodes');
  const regenerate = useRegenerateBackupCodes();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [newCodes, setNewCodes] = useState<string[] | null>(null);

  const handleSubmit = async () => {
    setError('');

    try {
      const result = await regenerate.mutateAsync({ code });
      setNewCodes(result.backup_codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    }
  };

  const handleClose = () => {
    closeModal('regenerateBackupCodes');
    setCode('');
    setError('');
    setNewCodes(null);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('title')}
      size="md"
      footer={
        newCodes ? (
          <Button variant="primary" onClick={handleClose}>
            {t('done')}
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={regenerate.isPending}
            >
              {t('regenerate')}
            </Button>
          </div>
        )
      }
    >
      {newCodes ? (
        <div>
          <Alert variant="warning" title={t('saveCodesWarning')}>
            {t('saveCodesMessage')}
          </Alert>
          <div
            style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
              }}
            >
              {newCodes.map((code, index) => (
                <Text key={index} code>
                  {code}
                </Text>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Form layout="vertical">
          <Alert variant="warning" title={t('warning')}>
            {t('warningMessage')}
          </Alert>

          {error && (
            <div style={{ marginTop: 16 }}>
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <Form.Item label={t('code')} required style={{ marginTop: 16 }}>
            <Input
              placeholder="000000"
              value={code}
              onChange={setCode}
              maxLength={6}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
