'use client';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

export default function SecurityPage() {
  return (
    <>
      <PageHeader
        title="Security"
        description="Manage your account security settings"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Account', href: '/member/security' },
          { label: 'Security' },
        ]}
      />
      <PageContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <PageSection title="Password">
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
                    <Typography fontWeight="medium">Password</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last changed 30 days ago
                    </Typography>
                  </Box>
                  <Button variant="outlined">Change Password</Button>
                </Box>
              </CardContent>
            </Card>
          </PageSection>

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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{ bgcolor: 'success.light', color: 'success.dark' }}
                    >
                      <SecurityIcon />
                    </Avatar>
                    <Box>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography fontWeight="medium">
                          Two-Factor Authentication
                        </Typography>
                        <Chip label="Enabled" color="success" size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Your account is protected with 2FA
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="outlined">Manage</Button>
                </Box>
              </CardContent>
            </Card>
          </PageSection>

          <PageSection title="Active Sessions">
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'grey.100', color: 'grey.600' }}>
                        <ComputerIcon />
                      </Avatar>
                      <Box>
                        <Typography fontWeight="medium">
                          Chrome on macOS
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current session • San Francisco, CA
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label="Active" color="success" size="small" />
                  </Box>
                  <Divider />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pt: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'grey.100', color: 'grey.600' }}>
                        <PhoneIphoneIcon />
                      </Avatar>
                      <Box>
                        <Typography fontWeight="medium">
                          Safari on iPhone
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Last active 2 hours ago • San Francisco, CA
                        </Typography>
                      </Box>
                    </Box>
                    <Button size="small" color="error">
                      Revoke
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </PageSection>
        </Box>
      </PageContent>
    </>
  );
}
