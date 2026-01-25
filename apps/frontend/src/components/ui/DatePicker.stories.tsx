import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'UI/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Select a date',
  },
};

export const Controlled: Story = {
  render: function ControlledDatePicker() {
    const [date, setDate] = useState<Date | null>(new Date());
    return (
      <div className="space-y-4">
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="Select a date"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selected: {date ? date.toLocaleDateString() : 'None'}
        </p>
      </div>
    );
  },
};

export const WithMinMax: Story = {
  render: function MinMaxDatePicker() {
    const [date, setDate] = useState<Date | null>(null);
    const today = new Date();
    const minDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 7,
    );
    const maxDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7,
    );

    return (
      <div className="space-y-4">
        <DatePicker
          value={date}
          onChange={setDate}
          minDate={minDate}
          maxDate={maxDate}
          placeholder="Select within range"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Range: {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}
        </p>
      </div>
    );
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Birth Date',
    placeholder: 'Select your birth date',
    hint: 'Enter your date of birth',
  },
};

export const WithError: Story = {
  args: {
    label: 'Required Date',
    placeholder: 'Select a date',
    error: 'Please select a date',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Date',
    value: new Date(),
    disabled: true,
  },
};

export const CustomFormat: Story = {
  render: function CustomFormatDatePicker() {
    const [date, setDate] = useState<Date | null>(new Date());
    return (
      <div className="space-y-4">
        <DatePicker
          value={date}
          onChange={setDate}
          dateFormat="dd/MM/yyyy"
          label="Date (dd/MM/yyyy)"
        />
      </div>
    );
  },
};
