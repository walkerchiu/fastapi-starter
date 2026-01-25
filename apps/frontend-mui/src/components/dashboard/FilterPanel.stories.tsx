import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterPanel, type FilterConfig } from './FilterPanel';
import { Box, Typography } from '@mui/material';

const meta: Meta<typeof FilterPanel> = {
  title: 'Dashboard/Forms/FilterPanel',
  component: FilterPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof FilterPanel>;

const basicFilters: FilterConfig[] = [
  {
    key: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search users...',
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
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
      { value: 'guest', label: 'Guest' },
    ],
  },
];

function FilterPanelDemo({
  filters,
  initialValues = {},
}: {
  filters: FilterConfig[];
  initialValues?: Record<string, unknown>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);

  const handleChange = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setValues({});
  };

  return (
    <Box>
      <FilterPanel
        filters={filters}
        values={values}
        onChange={handleChange}
        onReset={handleReset}
      />
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Current values: {JSON.stringify(values)}
        </Typography>
      </Box>
    </Box>
  );
}

export const Default: Story = {
  render: () => <FilterPanelDemo filters={basicFilters} />,
};

export const WithInitialValues: Story = {
  render: () => (
    <FilterPanelDemo
      filters={basicFilters}
      initialValues={{ status: 'active', role: 'admin' }}
    />
  ),
};

const allFilterTypes: FilterConfig[] = [
  {
    key: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Type to search...',
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'clothing', label: 'Clothing' },
      { value: 'books', label: 'Books' },
    ],
  },
  {
    key: 'date',
    label: 'Date',
    type: 'date',
  },
  {
    key: 'inStock',
    label: 'In Stock Only',
    type: 'boolean',
  },
];

export const AllFilterTypes: Story = {
  render: () => <FilterPanelDemo filters={allFilterTypes} />,
};

const searchOnly: FilterConfig[] = [
  {
    key: 'query',
    label: 'Search',
    type: 'search',
    placeholder: 'Search by name, email, or ID...',
  },
];

export const SearchOnly: Story = {
  render: () => <FilterPanelDemo filters={searchOnly} />,
};

const multipleSelects: FilterConfig[] = [
  {
    key: 'department',
    label: 'Department',
    type: 'select',
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'design', label: 'Design' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'sales', label: 'Sales' },
    ],
  },
  {
    key: 'location',
    label: 'Location',
    type: 'select',
    options: [
      { value: 'new-york', label: 'New York' },
      { value: 'london', label: 'London' },
      { value: 'tokyo', label: 'Tokyo' },
      { value: 'remote', label: 'Remote' },
    ],
  },
  {
    key: 'level',
    label: 'Level',
    type: 'select',
    options: [
      { value: 'junior', label: 'Junior' },
      { value: 'mid', label: 'Mid' },
      { value: 'senior', label: 'Senior' },
      { value: 'lead', label: 'Lead' },
    ],
  },
];

export const MultipleSelects: Story = {
  render: () => <FilterPanelDemo filters={multipleSelects} />,
};

function NoResetDemo() {
  const [values, setValues] = useState<Record<string, unknown>>({});

  const handleChange = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <FilterPanel
      filters={basicFilters}
      values={values}
      onChange={handleChange}
    />
  );
}

export const WithoutReset: Story = {
  render: () => <NoResetDemo />,
};
