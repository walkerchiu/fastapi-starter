'use client';

import { useState } from 'react';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Badge, Button, Card, CardBody, Input } from '@/components/ui';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const mockSessions: Session[] = [
  {
    id: '1',
    device: 'Desktop',
    browser: 'Chrome on macOS',
    location: 'San Francisco, CA',
    lastActive: 'Now',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'Mobile',
    browser: 'Safari on iPhone',
    location: 'San Francisco, CA',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'Tablet',
    browser: 'Chrome on iPad',
    location: 'New York, NY',
    lastActive: '1 day ago',
    isCurrent: false,
  },
];

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState(mockSessions);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
  };

  const handleRevokeAllSessions = () => {
    setSessions(sessions.filter((s) => s.isCurrent));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsChangingPassword(false);
    setShowPasswordForm(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const getDeviceIcon = (device: string) => {
    if (device === 'Mobile') {
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (device === 'Tablet') {
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }
    return (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );
  };

  return (
    <>
      <PageHeader
        title="Security Settings"
        description="Manage your account security and authentication"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Settings', href: '/member/settings' },
          { label: 'Security' },
        ]}
      />
      <PageContent>
        <div className="space-y-6">
          {/* Password Section */}
          <PageSection title="Password">
            <Card>
              <CardBody>
                {!showPasswordForm ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Password
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last changed 30 days ago
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Password
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Password
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Must be at least 8 characters with a mix of letters and
                        numbers.
                      </p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardBody>
            </Card>
          </PageSection>

          {/* Two-Factor Authentication */}
          <PageSection title="Two-Factor Authentication">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          Two-Factor Authentication
                        </h3>
                        <Badge variant={is2FAEnabled ? 'success' : 'warning'}>
                          {is2FAEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {is2FAEnabled
                          ? 'Your account is protected with 2FA'
                          : 'Add an extra layer of security to your account'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={is2FAEnabled ? 'outline' : 'primary'}
                    onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  >
                    {is2FAEnabled ? 'Manage' : 'Enable'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </PageSection>

          {/* Active Sessions */}
          <PageSection
            title="Active Sessions"
            actions={
              sessions.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={handleRevokeAllSessions}
                >
                  Revoke All Other Sessions
                </Button>
              )
            }
          >
            <Card>
              <CardBody>
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between ${
                        index !== sessions.length - 1
                          ? 'border-b border-gray-200 pb-4 dark:border-gray-700'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          {getDeviceIcon(session.device)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {session.browser}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {session.isCurrent
                              ? 'Current session'
                              : `Last active ${session.lastActive}`}{' '}
                            • {session.location}
                          </p>
                        </div>
                      </div>
                      {session.isCurrent ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </PageSection>

          {/* Danger Zone */}
          <PageSection title="Danger Zone">
            <Card className="border-red-200 dark:border-red-900/50">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-600 dark:text-red-400">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete Account
                  </Button>
                </div>
              </CardBody>
            </Card>
          </PageSection>
        </div>
      </PageContent>
    </>
  );
}
