'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LaptopIcon from '@mui/icons-material/Laptop';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import TabletIcon from '@mui/icons-material/Tablet';
import LogoutIcon from '@mui/icons-material/Logout';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

interface Session {
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export default function SecurityPage() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [sessions] = useState<Session[]>([
    {
      id: '1',
      deviceType: 'desktop',
      browser: 'Chrome 120 on macOS',
      location: 'San Francisco, CA',
      lastActive: '2 minutes ago',
      current: true,
    },
    {
      id: '2',
      deviceType: 'mobile',
      browser: 'Safari on iPhone',
      location: 'San Francisco, CA',
      lastActive: '1 hour ago',
      current: false,
    },
    {
      id: '3',
      deviceType: 'tablet',
      browser: 'Chrome on iPad',
      location: 'New York, NY',
      lastActive: '2 days ago',
      current: false,
    },
  ]);

  const handlePasswordChange = async () => {
    setIsChangingPassword(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordForm(false);
    setIsChangingPassword(false);
  };

  const handleToggle2FA = async () => {
    setIsToggling2FA(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIs2FAEnabled(!is2FAEnabled);
    setIsToggling2FA(false);
  };

  const handleRevokeSession = async (sessionId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Revoke session:', sessionId);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <LaptopIcon />;
      case 'mobile':
        return <PhoneAndroidIcon />;
      case 'tablet':
        return <TabletIcon />;
      default:
        return <LaptopIcon />;
    }
  };

  return (
    <>
      <PageHeader
        title="Security"
        description="Manage your account security settings"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Settings', href: '/member/settings' },
          { label: 'Security' },
        ]}
      />
      <PageContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Password Change */}
          <PageSection title="Password">
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: showPasswordForm ? 2 : 0,
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium">Change Password</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your password to keep your account secure
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    sx={{
                      bgcolor: showPasswordForm
                        ? 'action.selected'
                        : 'transparent',
                    }}
                  >
                    {showPasswordForm ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Collapse in={showPasswordForm}>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={3}>
                    <TextField
                      type="password"
                      label="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      fullWidth
                      required
                    />
                    <TextField
                      type="password"
                      label="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      fullWidth
                      required
                      helperText="Must be at least 8 characters with uppercase, lowercase, and numbers"
                    />
                    <TextField
                      type="password"
                      label="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      fullWidth
                      required
                      error={
                        passwordData.confirmPassword !== '' &&
                        passwordData.newPassword !==
                          passwordData.confirmPassword
                      }
                      helperText={
                        passwordData.confirmPassword !== '' &&
                        passwordData.newPassword !==
                          passwordData.confirmPassword
                          ? 'Passwords do not match'
                          : ''
                      }
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => setShowPasswordForm(false)}
                        disabled={isChangingPassword}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handlePasswordChange}
                        disabled={isChangingPassword}
                        startIcon={<LockIcon />}
                      >
                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                      </Button>
                    </Box>
                  </Stack>
                </Collapse>
              </CardContent>
            </Card>
          </PageSection>

          {/* Two-Factor Authentication */}
          <PageSection title="Two-Factor Authentication">
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography fontWeight="medium">2FA Status</Typography>
                      <Chip
                        label={is2FAEnabled ? 'ENABLED' : 'DISABLED'}
                        color={is2FAEnabled ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Add an extra layer of security to your account
                    </Typography>
                  </Box>
                  <Button
                    variant={is2FAEnabled ? 'outlined' : 'contained'}
                    color={is2FAEnabled ? 'error' : 'primary'}
                    onClick={handleToggle2FA}
                    disabled={isToggling2FA}
                    startIcon={<SecurityIcon />}
                  >
                    {isToggling2FA
                      ? 'Processing...'
                      : is2FAEnabled
                        ? 'Disable 2FA'
                        : 'Enable 2FA'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </PageSection>

          {/* Active Sessions */}
          <PageSection title="Active Sessions">
            <Card>
              <CardContent sx={{ py: 0 }}>
                <List disablePadding>
                  {sessions.map((session, index) => (
                    <Box key={session.id}>
                      <ListItem
                        sx={{
                          py: 2,
                          px: 0,
                        }}
                        secondaryAction={
                          !session.current && (
                            <IconButton
                              edge="end"
                              onClick={() => handleRevokeSession(session.id)}
                              color="error"
                            >
                              <LogoutIcon />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 56 }}>
                          {getDeviceIcon(session.deviceType)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography fontWeight="medium">
                                {session.browser}
                              </Typography>
                              {session.current && (
                                <Chip
                                  label="Current"
                                  size="small"
                                  color="primary"
                                  sx={{ height: 20 }}
                                />
                              )}
                            </Stack>
                          }
                          secondary={
                            <>
                              {session.location} • Last active{' '}
                              {session.lastActive}
                            </>
                          }
                        />
                      </ListItem>
                      {index < sessions.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          </PageSection>

          {/* Danger Zone */}
          <PageSection title="Danger Zone">
            <Card
              sx={{
                borderColor: 'error.main',
                borderWidth: 1,
                borderStyle: 'solid',
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: showDeleteConfirm ? 2 : 0,
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium" color="error">
                      Delete Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Permanently delete your account and all associated data
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    startIcon={<DeleteForeverIcon />}
                  >
                    Delete Account
                  </Button>
                </Box>

                <Collapse in={showDeleteConfirm}>
                  <Divider sx={{ mb: 2 }} />
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{ mb: 1 }}
                    >
                      Warning: This action cannot be undone!
                    </Typography>
                    <Typography variant="body2">
                      Deleting your account will permanently remove all your
                      data, including profile information, files, and activity
                      history. This action is irreversible.
                    </Typography>
                  </Alert>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteForeverIcon />}
                    >
                      Confirm Deletion
                    </Button>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </PageSection>
        </Box>
      </PageContent>
    </>
  );
}
