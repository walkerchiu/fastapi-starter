import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    children: 'Accept terms and conditions',
  },
};

export const Checked: Story = {
  args: {
    children: 'Checked checkbox',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled checkbox',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    children: 'Disabled checked',
    disabled: true,
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    children: 'Indeterminate state',
    indeterminate: true,
  },
};

export const WithoutLabel: Story = {
  args: {},
};
