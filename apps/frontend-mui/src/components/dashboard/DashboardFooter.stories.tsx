import type { Meta, StoryObj } from '@storybook/react';
import { DashboardFooter } from './DashboardFooter';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';

const meta: Meta<typeof DashboardFooter> = {
  title: 'Dashboard/DashboardFooter',
  component: DashboardFooter,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomCopyright: Story = {
  args: {
    copyright: '© 2025 My Company. All rights reserved.',
  },
};

export const WithLinks: Story = {
  args: {
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

export const FullFeatured: Story = {
  args: {
    copyright: '© 2025 Acme Inc. All rights reserved.',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
      { label: 'Help', href: '/help' },
    ],
  },
};

export const CustomContent: Story = {
  args: {
    children: (
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.main',
            }}
          />
          <Typography variant="subtitle2" fontWeight="bold">
            Acme Inc
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Made with love by the Acme team
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" color="inherit" aria-label="Twitter">
            <TwitterIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="inherit" aria-label="GitHub">
            <GitHubIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    ),
  },
};
