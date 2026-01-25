import type { Meta, StoryObj } from '@storybook/react';
import { App, Button } from 'antd';
import { Toast, useToast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Operation completed successfully!',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'An error occurred. Please try again.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Please review your input.',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational message.',
  },
};

// Interactive example using the hook
function ToastDemo() {
  const toast = useToast();

  return (
    <div className="flex gap-2">
      <Button onClick={() => toast.success('Success!')}>Success</Button>
      <Button onClick={() => toast.error('Error!')}>Error</Button>
      <Button onClick={() => toast.warning('Warning!')}>Warning</Button>
      <Button onClick={() => toast.info('Info!')}>Info</Button>
    </div>
  );
}

export const Interactive: Story = {
  render: () => (
    <App>
      <ToastDemo />
    </App>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-2">
      <Toast variant="success">Success message</Toast>
      <Toast variant="error">Error message</Toast>
      <Toast variant="warning">Warning message</Toast>
      <Toast variant="info">Info message</Toast>
    </div>
  ),
};
