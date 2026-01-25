import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';
import { FormField } from './FormField';

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
];

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
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    options,
    placeholder: 'Select a framework',
  },
};

export const WithFormField: Story = {
  render: () => (
    <FormField label="Framework">
      <Select options={options} placeholder="Select a framework" />
    </FormField>
  ),
};

export const WithValue: Story = {
  render: () => (
    <FormField label="Framework">
      <Select options={options} value="react" />
    </FormField>
  ),
};

export const Disabled: Story = {
  args: {
    options,
    placeholder: 'Select a framework',
    disabled: true,
  },
};

export const WithError: Story = {
  render: () => (
    <FormField label="Framework" error="Please select a framework">
      <Select options={options} placeholder="Select a framework" />
    </FormField>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6">
      <FormField label="Default">
        <Select options={options} placeholder="Select..." />
      </FormField>
      <FormField label="With Error" error="This field is required">
        <Select options={options} placeholder="Select..." />
      </FormField>
      <FormField label="Disabled">
        <Select options={options} placeholder="Select..." disabled />
      </FormField>
    </div>
  ),
};
