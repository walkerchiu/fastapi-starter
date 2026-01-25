import type { Meta, StoryObj } from '@storybook/react';
import { FormActions } from './FormActions';
import { FormSection } from './FormSection';
import { Box, Button, TextField } from '@mui/material';

const meta: Meta<typeof FormActions> = {
  title: 'Dashboard/Forms/FormActions',
  component: FormActions,
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
type Story = StoryObj<typeof FormActions>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained">Save</Button>
      </>
    ),
  },
};

export const AlignLeft: Story = {
  args: {
    align: 'left',
    children: (
      <>
        <Button variant="contained">Submit</Button>
        <Button variant="outlined">Cancel</Button>
      </>
    ),
  },
};

export const AlignCenter: Story = {
  args: {
    align: 'center',
    children: (
      <>
        <Button variant="outlined">Back</Button>
        <Button variant="contained">Continue</Button>
      </>
    ),
  },
};

export const AlignRight: Story = {
  args: {
    align: 'right',
    children: (
      <>
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained">Save Changes</Button>
      </>
    ),
  },
};

export const SingleButton: Story = {
  args: {
    children: <Button variant="contained">Submit</Button>,
  },
};

export const MultipleButtons: Story = {
  args: {
    children: (
      <>
        <Button variant="text" color="error">
          Delete
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained">Save</Button>
      </>
    ),
  },
};

export const WithFormSection: Story = {
  render: () => (
    <Box>
      <FormSection
        title="Profile Settings"
        description="Update your profile information."
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" fullWidth />
          <TextField label="Email" type="email" fullWidth />
          <TextField label="Bio" multiline rows={3} fullWidth />
        </Box>
      </FormSection>
      <Box sx={{ mt: 4 }}>
        <FormActions>
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </FormActions>
      </Box>
    </Box>
  ),
};

export const CompleteForm: Story = {
  render: () => (
    <Box>
      <FormSection title="Personal Information">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Full Name" fullWidth />
          <TextField label="Email" type="email" fullWidth />
        </Box>
      </FormSection>

      <Box sx={{ mt: 4 }}>
        <FormSection title="Security">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Current Password" type="password" fullWidth />
            <TextField label="New Password" type="password" fullWidth />
          </Box>
        </FormSection>
      </Box>

      <Box sx={{ mt: 4 }}>
        <FormActions>
          <Button variant="text" color="error">
            Delete Account
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained">Save All</Button>
        </FormActions>
      </Box>
    </Box>
  ),
};

export const StickyActions: Story = {
  render: () => (
    <Box sx={{ height: 400, overflow: 'auto', position: 'relative' }}>
      <FormSection title="Long Form">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <TextField key={i} label={`Field ${i + 1}`} fullWidth />
          ))}
        </Box>
      </FormSection>
      <Box sx={{ mt: 4 }}>
        <FormActions sticky>
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained">Save</Button>
        </FormActions>
      </Box>
    </Box>
  ),
};

export const DestructiveAction: Story = {
  args: {
    align: 'left',
    children: (
      <>
        <Button variant="contained" color="error">
          Delete Account
        </Button>
      </>
    ),
  },
};
