import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch size="sm" checked />
      <Switch size="md" checked />
      <Switch size="lg" checked />
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledSwitch() {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex flex-col items-center gap-4">
        <Switch checked={checked} onChange={setChecked} />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Value: {checked ? 'ON' : 'OFF'}
        </span>
      </div>
    );
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Enable notifications',
    checked: false,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Enable notifications',
    description: 'Get notified when someone mentions you.',
    checked: false,
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch disabled label="Disabled unchecked" />
      <Switch disabled checked label="Disabled checked" />
    </div>
  ),
};

export const AllVariations: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Switch size="sm" />
        <Switch size="md" />
        <Switch size="lg" />
      </div>
      <div className="flex items-center gap-4">
        <Switch size="sm" checked />
        <Switch size="md" checked />
        <Switch size="lg" checked />
      </div>
      <Switch label="With label" />
      <Switch
        label="With label and description"
        description="This is a description text."
      />
    </div>
  ),
};
