'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';

import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  Spinner,
} from '@/components/ui';
import { ChangePasswordModal, EditProfileModal } from '@/components/profile';
import { env } from '@/config/env';
import { MeDocument } from '@/graphql/generated/graphql';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [meResult, reexecuteQuery] = useQuery({
    query: MeDocument,
    pause: status !== 'authenticated',
  });

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 2FA disable modal state
  const [isDisable2FAModalOpen, setIsDisable2FAModalOpen] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState('');
  const [disable2FAError, setDisable2FAError] = useState('');
  const [isDisable2FALoading, setIsDisable2FALoading] = useState(false);

  // Backup codes modal state
  const [isBackupCodesModalOpen, setIsBackupCodesModalOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupCodesError, setBackupCodesError] = useState('');
  const [isBackupCodesLoading, setIsBackupCodesLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  }, [status, router]);

  const handleEditSuccess = () => {
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisable2FAError('');
    setIsDisable2FALoading(true);

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/disable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ password: disable2FAPassword }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to disable 2FA');
      }

      setIsDisable2FAModalOpen(false);
      setDisable2FAPassword('');
      reexecuteQuery({ requestPolicy: 'network-only' });
    } catch (err) {
      if (err instanceof Error) {
        setDisable2FAError(err.message);
      } else {
        setDisable2FAError('An error occurred. Please try again.');
      }
    } finally {
      setIsDisable2FALoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setBackupCodesError('');
    setIsBackupCodesLoading(true);

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
        throw new Error(data.detail || 'Failed to regenerate backup codes');
      }

      const data = await response.json();
      setBackupCodes(data.backup_codes);
      setIsBackupCodesModalOpen(true);
    } catch (err) {
      if (err instanceof Error) {
        setBackupCodesError(err.message);
      } else {
        setBackupCodesError('An error occurred. Please try again.');
      }
    } finally {
      setIsBackupCodesLoading(false);
    }
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  const openDisable2FAModal = () => {
    setDisable2FAPassword('');
    setDisable2FAError('');
    setIsDisable2FAModalOpen(true);
  };

  if (status === 'loading' || meResult.fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const user = meResult.data?.me;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Manage your account settings</p>
      </div>

      {meResult.error && (
        <Alert variant="error" className="mb-6">
          {meResult.error.message}
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Account Information
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <dl className="divide-y divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {user?.name || '-'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {user?.email}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 sm:col-span-2 sm:mt-0">
                <Badge variant={user?.isActive ? 'success' : 'error'}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : '-'}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Security</h2>
        </CardHeader>
        <CardBody>
          <div className="divide-y divide-gray-200">
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Password</h3>
                <p className="text-sm text-gray-500">
                  Change your account password
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Change
              </Button>
            </div>

            <div className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      Two-Factor Authentication
                    </h3>
                    <Badge
                      variant={user?.isTwoFactorEnabled ? 'success' : 'neutral'}
                    >
                      {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                {user?.isTwoFactorEnabled ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openDisable2FAModal}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push('/2fa/setup')}
                  >
                    Enable
                  </Button>
                )}
              </div>

              {user?.isTwoFactorEnabled && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Backup Codes
                      </h4>
                      <p className="text-sm text-gray-500">
                        Generate new backup codes if you have lost access to
                        your existing ones
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRegenerateBackupCodes}
                      isLoading={isBackupCodesLoading}
                    >
                      Regenerate
                    </Button>
                  </div>
                  {backupCodesError && (
                    <Alert variant="error" className="mt-2">
                      {backupCodesError}
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={user?.name || ''}
        onSuccess={handleEditSuccess}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Disable 2FA Modal */}
      <Modal
        isOpen={isDisable2FAModalOpen}
        onClose={() => setIsDisable2FAModalOpen(false)}
        title="Disable Two-Factor Authentication"
      >
        <form onSubmit={handleDisable2FA}>
          <p className="mb-4 text-sm text-gray-600">
            Enter your password to confirm disabling two-factor authentication.
            This will make your account less secure.
          </p>
          {disable2FAError && (
            <Alert variant="error" className="mb-4">
              {disable2FAError}
            </Alert>
          )}
          <div className="mb-4">
            <label
              htmlFor="disable2FAPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="disable2FAPassword"
              value={disable2FAPassword}
              onChange={(e) => setDisable2FAPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDisable2FAModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isDisable2FALoading}>
              Disable 2FA
            </Button>
          </div>
        </form>
      </Modal>

      {/* Backup Codes Modal */}
      <Modal
        isOpen={isBackupCodesModalOpen}
        onClose={() => setIsBackupCodesModalOpen(false)}
        title="New Backup Codes"
      >
        <div className="space-y-4">
          <Alert variant="warning">
            Your previous backup codes have been invalidated. Save these new
            codes in a secure location.
          </Alert>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <code
                key={index}
                className="rounded bg-gray-100 px-3 py-2 text-center text-sm font-mono"
              >
                {code}
              </code>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleCopyBackupCodes}>
              Copy All
            </Button>
            <Button onClick={() => setIsBackupCodesModalOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
