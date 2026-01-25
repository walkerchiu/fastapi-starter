import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { FormField } from './FormField';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium (default)" />
      <Input size="lg" placeholder="Large" />
    </div>
  ),
};

export const WithPrefix: Story = {
  args: {
    placeholder: 'Enter amount',
    prefix: '$',
  },
};

export const WithSuffix: Story = {
  args: {
    placeholder: 'Enter weight',
    suffix: 'kg',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Cannot edit',
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const WithFormField: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <FormField label="Email Address">
        <Input type="email" placeholder="you@example.com" />
      </FormField>
      <FormField label="Password" description="Must be at least 8 characters">
        <Input type="password" placeholder="Enter password" />
      </FormField>
      <FormField label="Email" error="Please enter a valid email">
        <Input
          type="email"
          placeholder="you@example.com"
          defaultValue="invalid"
        />
      </FormField>
      <FormField label="Disabled">
        <Input placeholder="Cannot edit" disabled />
      </FormField>
    </div>
  ),
};
