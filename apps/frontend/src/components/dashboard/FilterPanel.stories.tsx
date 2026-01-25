import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterPanel, type FilterConfig } from './FilterPanel';

const meta: Meta<typeof FilterPanel> = {
  title: 'Dashboard/Data/FilterPanel',
  component: FilterPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof FilterPanel>;

const userFilters: FilterConfig[] = [
  {
    key: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search by name or email...',
  },
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
      { value: 'guest', label: 'Guest' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ],
  },
  {
    key: 'verified',
    label: 'Email verified only',
    type: 'boolean',
  },
];

export const Default: Story = {
  args: {
    filters: userFilters,
    values: {},
    onChange: () => {},
  },
};

export const WithValues: Story = {
  args: {
    filters: userFilters,
    values: {
      search: 'john',
      role: 'admin',
      status: 'active',
    },
    onChange: () => {},
    onReset: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, unknown>>({});

    const handleChange = (key: string, value: unknown) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
      setValues({});
    };

    return (
      <div className="space-y-4">
        <FilterPanel
          filters={userFilters}
          values={values}
          onChange={handleChange}
          onReset={handleReset}
        />
        <div className="rounded-md bg-gray-100 p-4 dark:bg-gray-800">
          <h4 className="mb-2 font-medium">Current Filter Values:</h4>
          <pre className="text-sm">{JSON.stringify(values, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

export const DateFilters: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, unknown>>({});

    const dateFilters: FilterConfig[] = [
      {
        key: 'startDate',
        label: 'Start Date',
        type: 'date',
      },
      {
        key: 'endDate',
        label: 'End Date',
        type: 'date',
      },
      {
        key: 'type',
        label: 'Event Type',
        type: 'select',
        options: [
          { value: 'login', label: 'Login' },
          { value: 'logout', label: 'Logout' },
          { value: 'update', label: 'Update' },
          { value: 'delete', label: 'Delete' },
        ],
      },
    ];

    return (
      <FilterPanel
        filters={dateFilters}
        values={values}
        onChange={(key, value) =>
          setValues((prev) => ({ ...prev, [key]: value }))
        }
        onReset={() => setValues({})}
      />
    );
  },
};

export const SimpleSearch: Story = {
  args: {
    filters: [
      {
        key: 'query',
        label: 'Search',
        type: 'search',
        placeholder: 'Search files...',
      },
    ],
    values: {},
    onChange: () => {},
  },
};
