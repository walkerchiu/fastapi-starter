import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    children: 'This is an informational message.',
    variant: 'info',
  },
};

export const Success: Story = {
  args: {
    children: 'Operation completed successfully!',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Please review before proceeding.',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'An error occurred. Please try again.',
    variant: 'error',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert variant="info">This is an informational message.</Alert>
      <Alert variant="success">Operation completed successfully!</Alert>
      <Alert variant="warning">Please review before proceeding.</Alert>
      <Alert variant="error">An error occurred. Please try again.</Alert>
    </div>
  ),
};
