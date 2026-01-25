import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    closable: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational alert.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'This is a success alert.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'This is a warning alert.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'This is an error alert.',
  },
};

export const WithTitle: Story = {
  args: {
    variant: 'info',
    title: 'Alert Title',
    children: 'This is the alert description.',
  },
};

export const Closable: Story = {
  args: {
    variant: 'info',
    closable: true,
    children: 'This alert can be closed.',
  },
};
