import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeRegistry } from '@/theme';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Mock ThemeProvider wrapper for Storybook
function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {children}
      </Box>
    </ThemeRegistry>
  );
}

const meta: Meta<typeof ThemeToggle> = {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProviderWrapper>
        <Story />
      </ThemeProviderWrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: '',
  },
};

export const InNavbar: Story = {
  render: () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        p: 2,
        boxShadow: 1,
      }}
    >
      <Typography variant="body2" fontWeight={500} color="text.secondary">
        Settings
      </Typography>
      <ThemeToggle />
    </Box>
  ),
};

export const AllThemeStates: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Click the button to cycle through themes: Light → Dark → System
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ThemeToggle />
        <Typography variant="caption" color="text.secondary">
          The icon changes based on the current theme selection
        </Typography>
      </Box>
    </Box>
  ),
};
