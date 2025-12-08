import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Comments',
    description: 'Get notified when someone comments on your posting.',
  },
};

export const WithError: Story = {
  args: {
    label: 'I agree to the terms',
    error: 'You must accept the terms to continue',
  },
};

export const Checked: Story = {
  args: {
    label: 'Remember me',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled checked',
    disabled: true,
    defaultChecked: true,
  },
};

export const CheckboxGroup: Story = {
  render: () => (
    <fieldset>
      <legend className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Notifications
      </legend>
      <div className="space-y-3">
        <Checkbox
          label="Email"
          description="Receive notifications via email"
          defaultChecked
        />
        <Checkbox
          label="SMS"
          description="Receive notifications via text message"
        />
        <Checkbox
          label="Push"
          description="Receive push notifications on your device"
          defaultChecked
        />
      </div>
    </fieldset>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Checkbox label="Default checkbox" />
      <Checkbox label="Checked checkbox" defaultChecked />
      <Checkbox label="With description" description="Additional information" />
      <Checkbox label="With error" error="This field is required" />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </div>
  ),
};
