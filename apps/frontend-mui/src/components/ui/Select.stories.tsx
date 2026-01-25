import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'jp', label: 'Japan' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
];

export const Default: Story = {
  args: {
    options: countryOptions,
    placeholder: 'Select a country',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    placeholder: 'Select a country',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Status',
    options: statusOptions,
    placeholder: 'Select status',
    hint: 'Choose the current status of the item',
  },
};

export const WithError: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    placeholder: 'Select a country',
    error: 'Please select a country',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    placeholder: 'Select a country',
    disabled: true,
  },
};

export const WithDisabledOptions: Story = {
  args: {
    label: 'Subscription Plan',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'basic', label: 'Basic' },
      { value: 'pro', label: 'Pro', disabled: true },
      { value: 'enterprise', label: 'Enterprise', disabled: true },
    ],
    placeholder: 'Select a plan',
    hint: 'Pro and Enterprise plans are coming soon',
  },
};

export const WithPreselectedValue: Story = {
  args: {
    label: 'Country',
    options: countryOptions,
    value: 'us',
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6">
      <Select
        label="Default"
        options={countryOptions}
        placeholder="Select a country"
      />
      <Select
        label="With Hint"
        options={countryOptions}
        placeholder="Select a country"
        hint="Choose your country of residence"
      />
      <Select
        label="With Error"
        options={countryOptions}
        placeholder="Select a country"
        error="This field is required"
      />
      <Select
        label="Disabled"
        options={countryOptions}
        placeholder="Select a country"
        disabled
      />
    </div>
  ),
};
