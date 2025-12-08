import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio, RadioGroup } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/Radio',
  component: RadioGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const paymentOptions = [
  {
    value: 'card',
    label: 'Credit Card',
    description: 'Pay with Visa or Mastercard',
  },
  {
    value: 'paypal',
    label: 'PayPal',
    description: 'Pay with your PayPal account',
  },
  {
    value: 'bank',
    label: 'Bank Transfer',
    description: 'Direct bank transfer',
  },
];

const sizeOptions = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

export const Default: Story = {
  args: {
    name: 'size',
    label: 'Select Size',
    options: sizeOptions,
  },
};

export const WithDescriptions: Story = {
  args: {
    name: 'payment',
    label: 'Payment Method',
    options: paymentOptions,
  },
};

export const WithPreselectedValue: Story = {
  args: {
    name: 'size-preselected',
    label: 'Select Size',
    options: sizeOptions,
    value: 'md',
  },
};

export const WithError: Story = {
  args: {
    name: 'required-choice',
    label: 'Required Selection',
    options: sizeOptions,
    error: 'Please select an option',
  },
};

export const WithDisabledOption: Story = {
  args: {
    name: 'with-disabled',
    label: 'Available Options',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2', disabled: true },
      { value: 'option3', label: 'Option 3' },
    ],
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('md');
    return (
      <div className="space-y-4">
        <RadioGroup
          name="controlled"
          label="Controlled Radio Group"
          options={sizeOptions}
          value={value}
          onChange={setValue}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selected: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};

export const SingleRadio: Story = {
  render: () => (
    <div className="space-y-3">
      <Radio name="single" label="Option A" value="a" />
      <Radio name="single" label="Option B" value="b" />
      <Radio
        name="single"
        label="Option C"
        value="c"
        description="This option has a description"
      />
    </div>
  ),
};
