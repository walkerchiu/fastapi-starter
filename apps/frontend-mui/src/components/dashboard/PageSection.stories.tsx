import type { Meta, StoryObj } from '@storybook/react';
import { PageSection } from './PageSection';
import { Button } from '../ui/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

const meta: Meta<typeof PageSection> = {
  title: 'Dashboard/PageSection',
  component: PageSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SampleContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Typography variant="body2" color="text.secondary">
      This is the main content of the section. It can contain any type of
      content including text, forms, tables, or other components.
    </Typography>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2,
      }}
    >
      <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="body1" fontWeight="medium">
          Item 1
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Description for item 1
        </Typography>
      </Box>
      <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="body1" fontWeight="medium">
          Item 2
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Description for item 2
        </Typography>
      </Box>
    </Box>
  </Box>
);

export const Default: Story = {
  args: {
    children: <SampleContent />,
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Section Title',
    children: <SampleContent />,
  },
};

export const WithTitleAndDescription: Story = {
  args: {
    title: 'Profile Information',
    description: 'Update your personal information and preferences.',
    children: <SampleContent />,
  },
};

export const WithActions: Story = {
  args: {
    title: 'Team Members',
    description: 'Manage your team members and their roles.',
    actions: (
      <>
        <Button variant="outline" size="sm">
          Export
        </Button>
        <Button variant="primary" size="sm">
          Add Member
        </Button>
      </>
    ),
    children: <SampleContent />,
  },
};

export const Collapsible: Story = {
  args: {
    title: 'Advanced Settings',
    description: 'Configure advanced options for your account.',
    collapsible: true,
    children: <SampleContent />,
  },
};

export const CollapsibleDefaultClosed: Story = {
  args: {
    title: 'Hidden by Default',
    description: 'This section is collapsed by default.',
    collapsible: true,
    defaultCollapsed: true,
    children: <SampleContent />,
  },
};

export const CollapsibleWithActions: Story = {
  args: {
    title: 'Notifications',
    description: 'Configure how you receive notifications.',
    collapsible: true,
    actions: (
      <Button variant="outline" size="sm">
        Reset to Default
      </Button>
    ),
    children: <SampleContent />,
  },
};

export const NoHeader: Story = {
  args: {
    children: <SampleContent />,
  },
};

export const LongContent: Story = {
  args: {
    title: 'Activity Log',
    description: 'Recent activity in your account.',
    children: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              pb: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              '&:last-child': { borderBottom: 0 },
            }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>{i}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                Activity {i}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {i} hours ago
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    ),
  },
};
