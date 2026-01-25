import type { Meta, StoryObj } from '@storybook/react';
import { Timeline, type TimelineItem } from './Timeline';
import { Box, Card, CardContent, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';

const meta: Meta<typeof Timeline> = {
  title: 'Dashboard/Display/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

const basicItems: TimelineItem[] = [
  {
    id: '1',
    title: 'Account created',
    description: 'Your account was successfully created.',
    timestamp: new Date(Date.now() - 86400000 * 7), // 7 days ago
    status: 'success',
  },
  {
    id: '2',
    title: 'Profile updated',
    description: 'You updated your profile information.',
    timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
    status: 'info',
  },
  {
    id: '3',
    title: 'Password changed',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    status: 'warning',
  },
  {
    id: '4',
    title: 'Login from new device',
    description: 'A new login was detected from Chrome on Windows.',
    timestamp: new Date(),
    status: 'error',
  },
];

export const Default: Story = {
  args: {
    items: basicItems,
  },
};

const itemsWithIcons: TimelineItem[] = [
  {
    id: '1',
    title: 'Account created',
    description: 'Your account was successfully created.',
    timestamp: new Date(Date.now() - 86400000 * 7),
    icon: <PersonIcon />,
    status: 'success',
  },
  {
    id: '2',
    title: 'Email verified',
    description: 'Your email address has been verified.',
    timestamp: new Date(Date.now() - 86400000 * 5),
    icon: <EmailIcon />,
    status: 'success',
  },
  {
    id: '3',
    title: 'Two-factor authentication enabled',
    description: 'You enabled 2FA for extra security.',
    timestamp: new Date(Date.now() - 86400000 * 2),
    icon: <SecurityIcon />,
    status: 'info',
  },
  {
    id: '4',
    title: 'Settings updated',
    timestamp: new Date(),
    icon: <SettingsIcon />,
  },
];

export const WithIcons: Story = {
  args: {
    items: itemsWithIcons,
  },
};

const statusItems: TimelineItem[] = [
  {
    id: '1',
    title: 'Deployment successful',
    description: 'Version 2.0.0 deployed to production.',
    timestamp: new Date(),
    icon: <CheckCircleIcon />,
    status: 'success',
  },
  {
    id: '2',
    title: 'Build failed',
    description: 'The build process encountered an error.',
    timestamp: new Date(Date.now() - 3600000),
    icon: <ErrorIcon />,
    status: 'error',
  },
  {
    id: '3',
    title: 'Performance warning',
    description: 'CPU usage exceeded 80% threshold.',
    timestamp: new Date(Date.now() - 7200000),
    icon: <WarningIcon />,
    status: 'warning',
  },
  {
    id: '4',
    title: 'New feature released',
    description: 'Dark mode is now available.',
    timestamp: new Date(Date.now() - 86400000),
    icon: <InfoIcon />,
    status: 'info',
  },
];

export const AllStatuses: Story = {
  args: {
    items: statusItems,
  },
};

export const SingleItem: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Only one event',
        description: 'This timeline has only one item.',
        timestamp: new Date(),
        status: 'info',
      },
    ],
  },
};

export const WithoutStatus: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Regular event',
        description: 'No status assigned.',
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        id: '2',
        title: 'Another event',
        timestamp: new Date(),
      },
    ],
  },
};

export const InCard: Story = {
  decorators: [
    (Story) => (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activity Timeline
          </Typography>
          <Story />
        </CardContent>
      </Card>
    ),
  ],
  args: {
    items: itemsWithIcons,
  },
};
