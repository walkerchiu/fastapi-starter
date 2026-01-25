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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <FilterPanel
          filters={userFilters}
          values={values}
          onChange={handleChange}
          onReset={handleReset}
        />
        <div
          style={{
            padding: 16,
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
          }}
        >
          <h4 style={{ marginBottom: 8, fontWeight: 500 }}>
            Current Filter Values:
          </h4>
          <pre style={{ fontSize: 14, margin: 0 }}>
            {JSON.stringify(values, null, 2)}
          </pre>
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
