import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'success', 'warning', 'info'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

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
    children: 'Please review your input before proceeding.',
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
      <Alert variant="info">This is an info alert.</Alert>
      <Alert variant="success">This is a success alert.</Alert>
      <Alert variant="warning">This is a warning alert.</Alert>
      <Alert variant="error">This is an error alert.</Alert>
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    children:
      'This is a longer alert message that demonstrates how the component handles multi-line content. It should wrap nicely and maintain proper padding and styling throughout the entire message.',
    variant: 'info',
  },
};
