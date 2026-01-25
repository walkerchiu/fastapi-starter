import type { Meta, StoryObj } from '@storybook/react';
import { FormSection } from './FormSection';
import { Box, TextField, FormControlLabel, Switch, Grid } from '@mui/material';

const meta: Meta<typeof FormSection> = {
  title: 'Dashboard/Forms/FormSection',
  component: FormSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 600 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FormSection>;

export const Default: Story = {
  args: {
    title: 'Personal Information',
    description: 'Update your personal details here.',
    children: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Full Name" fullWidth />
        <TextField label="Email" type="email" fullWidth />
        <TextField label="Phone" type="tel" fullWidth />
      </Box>
    ),
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'Account Settings',
    children: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Username" fullWidth />
        <TextField label="Password" type="password" fullWidth />
      </Box>
    ),
  },
};

export const WithSwitches: Story = {
  args: {
    title: 'Notifications',
    description: 'Manage your notification preferences.',
    children: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Email notifications"
        />
        <FormControlLabel control={<Switch />} label="SMS notifications" />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Push notifications"
        />
      </Box>
    ),
  },
};

export const WithGrid: Story = {
  args: {
    title: 'Address',
    description: 'Your shipping and billing address.',
    children: (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="Street Address" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="City" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="State" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Zip Code" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Country" fullWidth />
        </Grid>
      </Grid>
    ),
  },
};

export const MultipleSections: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FormSection title="Profile" description="Basic profile information.">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Display Name" fullWidth />
          <TextField label="Bio" multiline rows={3} fullWidth />
        </Box>
      </FormSection>

      <FormSection
        title="Security"
        description="Manage your security settings."
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Current Password" type="password" fullWidth />
          <TextField label="New Password" type="password" fullWidth />
          <TextField label="Confirm Password" type="password" fullWidth />
        </Box>
      </FormSection>

      <FormSection title="Preferences" description="Customize your experience.">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Dark mode"
          />
          <FormControlLabel control={<Switch />} label="Compact view" />
        </Box>
      </FormSection>
    </Box>
  ),
};

export const DenseContent: Story = {
  args: {
    title: 'API Settings',
    description: 'Configure your API integration.',
    children: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="API Key" fullWidth size="small" />
        <TextField label="Webhook URL" fullWidth size="small" />
        <TextField label="Secret Key" type="password" fullWidth size="small" />
      </Box>
    ),
  },
};
