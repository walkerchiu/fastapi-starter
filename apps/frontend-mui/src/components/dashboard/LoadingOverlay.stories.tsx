import type { Meta, StoryObj } from '@storybook/react';
import { LoadingOverlay } from './LoadingOverlay';
import { Card, CardContent, Typography, Box } from '@mui/material';

const meta: Meta<typeof LoadingOverlay> = {
  title: 'Dashboard/Feedback/LoadingOverlay',
  component: LoadingOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

const SampleContent = () => (
  <Card sx={{ width: 320 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Sample Card
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This is some content that will be covered by the loading overlay.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </Typography>
    </CardContent>
  </Card>
);

export const Default: Story = {
  args: {
    loading: true,
    children: <SampleContent />,
  },
};

export const WithText: Story = {
  args: {
    loading: true,
    text: 'Loading data...',
    children: <SampleContent />,
  },
};

export const NoBlur: Story = {
  args: {
    loading: true,
    blur: false,
    children: <SampleContent />,
  },
};

export const NotLoading: Story = {
  args: {
    loading: false,
    children: <SampleContent />,
  },
};

export const LargeContent: Story = {
  args: {
    loading: true,
    text: 'Processing...',
    children: (
      <Box
        sx={{ width: 384, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">
              Section 1
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Content for section one.
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">
              Section 2
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Content for section two.
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">
              Section 3
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Content for section three.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    ),
  },
};
