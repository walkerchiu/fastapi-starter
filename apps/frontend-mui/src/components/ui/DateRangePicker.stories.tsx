import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DateRangePicker, type DateRange } from './DateRangePicker';

const meta: Meta<typeof DateRangePicker> = {
  title: 'UI/DateRangePicker',
  component: DateRangePicker,
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
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Select date range',
  },
};

export const Controlled: Story = {
  render: function ControlledDateRangePicker() {
    const [range, setRange] = useState<DateRange>({
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return (
      <div className="space-y-4">
        <DateRangePicker
          value={range}
          onChange={setRange}
          placeholder="Select date range"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Start: {range.startDate?.toLocaleDateString() || 'None'}
          <br />
          End: {range.endDate?.toLocaleDateString() || 'None'}
        </p>
      </div>
    );
  },
};

export const WithMinMax: Story = {
  render: function MinMaxDateRangePicker() {
    const [range, setRange] = useState<DateRange>({
      startDate: null,
      endDate: null,
    });
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return (
      <div className="space-y-4">
        <DateRangePicker
          value={range}
          onChange={setRange}
          minDate={minDate}
          maxDate={maxDate}
          placeholder="Select within this month"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Available range: {minDate.toLocaleDateString()} -{' '}
          {maxDate.toLocaleDateString()}
        </p>
      </div>
    );
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Travel Dates',
    placeholder: 'Select check-in and check-out',
    hint: 'Select your travel period',
  },
};

export const WithError: Story = {
  args: {
    label: 'Required Range',
    placeholder: 'Select date range',
    error: 'Please select a date range',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Range',
    value: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    disabled: true,
  },
};
