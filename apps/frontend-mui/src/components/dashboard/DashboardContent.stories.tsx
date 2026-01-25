import type { Meta, StoryObj } from '@storybook/react';
import { DashboardContent } from './DashboardContent';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const meta: Meta<typeof DashboardContent> = {
  title: 'Dashboard/DashboardContent',
  component: DashboardContent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SampleContent = () => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Sample Content
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This is a sample content area. The DashboardContent component provides
        consistent padding and max-width constraints for your page content.
      </Typography>
    </CardContent>
  </Card>
);

export const Default: Story = {
  args: {
    children: <SampleContent />,
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: <SampleContent />,
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: <SampleContent />,
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: <SampleContent />,
  },
};

export const MaxWidthSmall: Story = {
  args: {
    maxWidth: 'sm',
    children: <SampleContent />,
  },
};

export const MaxWidthMedium: Story = {
  args: {
    maxWidth: 'md',
    children: <SampleContent />,
  },
};

export const MaxWidthLarge: Story = {
  args: {
    maxWidth: 'lg',
    children: <SampleContent />,
  },
};

export const AllPaddings: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
        <Box key={padding}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: 'block' }}
          >
            padding=&quot;{padding}&quot;
          </Typography>
          <Box sx={{ bgcolor: 'grey.100' }}>
            <DashboardContent padding={padding}>
              <SampleContent />
            </DashboardContent>
          </Box>
        </Box>
      ))}
    </Box>
  ),
};

export const AllMaxWidths: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((maxWidth) => (
        <Box key={maxWidth}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: 'block' }}
          >
            maxWidth=&quot;{maxWidth}&quot;
          </Typography>
          <Box sx={{ bgcolor: 'grey.100' }}>
            <DashboardContent maxWidth={maxWidth}>
              <SampleContent />
            </DashboardContent>
          </Box>
        </Box>
      ))}
    </Box>
  ),
};
