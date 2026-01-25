'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Avatar,
  Stack,
  Chip,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CancelIcon from '@mui/icons-material/Cancel';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  website: string;
  location: string;
  avatar: string | null;
  accountStatus: 'active' | 'inactive' | 'suspended';
}

export default function EditProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    bio: 'Software developer passionate about building great products.',
    website: 'https://johndoe.com',
    location: 'San Francisco, CA',
    avatar: null,
    accountStatus: 'active',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProfileData((prev) => ({
      ...prev,
      avatar: null,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In real app, upload selectedFile with profile data
    console.log('Saving profile with avatar:', selectedFile?.name);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  const handleCancel = () => {
    // Reset form
    setProfileData({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 234 567 8900',
      bio: 'Software developer passionate about building great products.',
      website: 'https://johndoe.com',
      location: 'San Francisco, CA',
      avatar: null,
      accountStatus: 'active',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const getStatusColor = (status: string): 'success' | 'default' | 'error' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <PageHeader
        title="Edit Profile"
        description="Update your personal information"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Profile', href: '/member/profile' },
          { label: 'Edit' },
        ]}
      />
      <PageContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Profile Picture */}
          <PageSection title="Profile Picture">
            <Card>
              <CardContent>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    src={previewUrl || profileData.avatar || undefined}
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: '3rem',
                    }}
                  >
                    {!previewUrl && !profileData.avatar
                      ? `${profileData.firstName[0]}${profileData.lastName[0]}`
                      : null}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Upload a new avatar. For best results, use an image at
                      least 400x400 pixels.
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<PhotoCameraIcon />}
                      >
                        Upload Photo
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </Button>
                      {(previewUrl || profileData.avatar) && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={handleRemoveAvatar}
                        >
                          Remove
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </PageSection>

          {/* Personal Information */}
          <PageSection title="Personal Information">
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) =>
                        handleInputChange('firstName', e.target.value)
                      }
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) =>
                        handleInputChange('lastName', e.target.value)
                      }
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      value={profileData.email}
                      fullWidth
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleInputChange('phone', e.target.value)
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      multiline
                      rows={4}
                      fullWidth
                      helperText={`${profileData.bio.length}/500 characters`}
                      inputProps={{ maxLength: 500 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Website"
                      value={profileData.website}
                      onChange={(e) =>
                        handleInputChange('website', e.target.value)
                      }
                      fullWidth
                      placeholder="https://example.com"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Location"
                      value={profileData.location}
                      onChange={(e) =>
                        handleInputChange('location', e.target.value)
                      }
                      fullWidth
                      placeholder="City, Country"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </PageSection>

          {/* Account Status */}
          <PageSection title="Account Status">
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
                    <Typography fontWeight="medium">Current Status</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your account is currently {profileData.accountStatus}
                    </Typography>
                  </Box>
                  <Chip
                    label={profileData.accountStatus.toUpperCase()}
                    color={getStatusColor(profileData.accountStatus)}
                    sx={{ fontWeight: 'medium' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </PageSection>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </PageContent>
    </>
  );
}
