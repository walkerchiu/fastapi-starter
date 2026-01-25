'use client';

import { useSession } from 'next-auth/react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your personal information"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Account', href: '/member/profile' },
          { label: 'Profile' },
        ]}
      />
      <PageContent>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <PageSection title="Personal Information">
              <Card>
                <CardContent>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Full Name"
                          defaultValue={session?.user?.name || ''}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email Address"
                          type="email"
                          defaultValue={session?.user?.email || ''}
                          disabled
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      label="Phone Number"
                      placeholder="+1 (555) 000-0000"
                      fullWidth
                    />
                    <TextField
                      label="Bio"
                      placeholder="Tell us about yourself..."
                      multiline
                      rows={3}
                      fullWidth
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="contained" color="success">
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </PageSection>
          </Grid>

          <Grid item xs={12} lg={4}>
            <PageSection title="Profile Photo">
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={session?.user?.image || undefined}
                    sx={{
                      width: 96,
                      height: 96,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'success.light',
                      color: 'success.dark',
                    }}
                  >
                    {!session?.user?.image && (
                      <PersonIcon sx={{ fontSize: 48 }} />
                    )}
                  </Avatar>
                  <Button variant="outlined" size="small">
                    Change Photo
                  </Button>
                </CardContent>
              </Card>
            </PageSection>
          </Grid>
        </Grid>
      </PageContent>
    </>
  );
}
