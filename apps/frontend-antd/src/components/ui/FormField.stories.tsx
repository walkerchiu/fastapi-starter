import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';
import { Input } from './Input';
import { Select } from './Select';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof FormField> = {
  title: 'UI/FormField',
  component: FormField,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: 'Email',
    children: <Input placeholder="you@example.com" />,
  },
};

export const Required: Story = {
  args: {
    label: 'Email',
    required: true,
    children: <Input placeholder="you@example.com" />,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Password',
    description: 'Must be at least 8 characters',
    children: <Input type="password" placeholder="Enter password" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Please enter a valid email address',
    children: <Input placeholder="you@example.com" defaultValue="invalid" />,
  },
};

export const WithSelect: Story = {
  args: {
    label: 'Country',
    children: (
      <Select
        options={[
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
        ]}
        placeholder="Select a country"
      />
    ),
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <FormField label="Full Name" required>
        <Input placeholder="John Doe" />
      </FormField>
      <FormField
        label="Email"
        required
        description="We'll never share your email"
      >
        <Input type="email" placeholder="you@example.com" />
      </FormField>
      <FormField label="Password" required>
        <Input type="password" placeholder="Enter password" />
      </FormField>
      <FormField>
        <Checkbox>I agree to the terms and conditions</Checkbox>
      </FormField>
    </div>
  ),
};
