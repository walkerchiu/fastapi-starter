import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup } from './Radio';

const options = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/Radio',
  component: RadioGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: {
    options,
  },
};

export const WithLabel: Story = {
  args: {
    options,
    label: 'Select size',
  },
};

export const WithValue: Story = {
  args: {
    options,
    label: 'Select size',
    value: 'medium',
  },
};

export const WithError: Story = {
  args: {
    options,
    label: 'Select size',
    error: 'Please select a size',
  },
};

export const Horizontal: Story = {
  args: {
    options,
    label: 'Select size',
    direction: 'horizontal',
  },
};

export const Vertical: Story = {
  args: {
    options,
    label: 'Select size',
    direction: 'vertical',
  },
};
