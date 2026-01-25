import type { Meta, StoryObj } from '@storybook/react';
import { DashboardHeader } from './DashboardHeader';
import { Button } from '../ui/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Logo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1,
        bgcolor: 'primary.main',
      }}
    />
    <Typography variant="subtitle1" fontWeight="bold">
      Acme Inc
    </Typography>
  </Box>
);

const UserAvatar = () => <Avatar sx={{ width: 32, height: 32 }}>JD</Avatar>;

const meta: Meta<typeof DashboardHeader> = {
  title: 'Dashboard/DashboardHeader',
  component: DashboardHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Dashboard',
    onMenuToggle: () => {},
  },
};

export const WithLogo: Story = {
  args: {
    logo: <Logo />,
    onMenuToggle: () => {},
  },
};

export const WithSearch: Story = {
  args: {
    logo: <Logo />,
    showSearch: true,
    searchPlaceholder: 'Search...',
    onSearch: (query) => console.log('Search:', query),
    onMenuToggle: () => {},
  },
};

export const WithActions: Story = {
  args: {
    logo: <Logo />,
    onMenuToggle: () => {},
    actions: (
      <>
        <IconButton color="inherit">
          <Badge badgeContent={4} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <UserAvatar />
      </>
    ),
  },
};

export const FullFeatured: Story = {
  args: {
    logo: <Logo />,
    showSearch: true,
    searchPlaceholder: 'Search anything...',
    onSearch: (query) => console.log('Search:', query),
    onMenuToggle: () => {},
    actions: (
      <>
        <IconButton color="inherit">
          <Badge badgeContent={4} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Button size="sm" variant="primary">
          New Project
        </Button>
        <UserAvatar />
      </>
    ),
  },
};

export const NoMenuToggle: Story = {
  args: {
    logo: <Logo />,
    showMenuToggle: false,
    actions: <UserAvatar />,
  },
};

export const NotSticky: Story = {
  args: {
    logo: <Logo />,
    sticky: false,
    onMenuToggle: () => {},
  },
};
