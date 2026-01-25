import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DataTableToolbar } from './DataTableToolbar';
import { Button } from '../ui/Button';

const meta: Meta<typeof DataTableToolbar> = {
  title: 'Dashboard/Data/DataTableToolbar',
  component: DataTableToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DataTableToolbar>;

const PlusIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

export const Default: Story = {
  args: {
    searchValue: '',
    onSearchChange: () => {},
    searchPlaceholder: 'Search users...',
  },
};

export const WithActions: Story = {
  args: {
    searchValue: '',
    onSearchChange: () => {},
    searchPlaceholder: 'Search users...',
    actions: (
      <>
        <Button variant="outline">
          <DownloadIcon />
          <span className="ml-1.5">Export</span>
        </Button>
        <Button>
          <PlusIcon />
          <span className="ml-1.5">Add User</span>
        </Button>
      </>
    ),
  },
};

export const WithSelection: Story = {
  args: {
    searchValue: '',
    onSearchChange: () => {},
    searchPlaceholder: 'Search users...',
    selectedCount: 5,
    bulkActions: [
      {
        key: 'delete',
        label: 'Delete',
        icon: <TrashIcon />,
        variant: 'danger',
        onClick: () => alert('Delete clicked'),
      },
      {
        key: 'export',
        label: 'Export',
        icon: <DownloadIcon />,
        onClick: () => alert('Export clicked'),
      },
    ],
    actions: (
      <Button>
        <PlusIcon />
        <span className="ml-1.5">Add User</span>
      </Button>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(0);

    return (
      <div className="space-y-4">
        <DataTableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search users..."
          selectedCount={selected}
          bulkActions={[
            {
              key: 'delete',
              label: 'Delete',
              icon: <TrashIcon />,
              variant: 'danger',
              onClick: () => {
                alert(`Deleting ${selected} items`);
                setSelected(0);
              },
            },
          ]}
          actions={
            <Button>
              <PlusIcon />
              <span className="ml-1.5">Add User</span>
            </Button>
          }
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelected((s) => s + 1)}
          >
            Select +1
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelected(0)}>
            Clear Selection
          </Button>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Search: &quot;{search}&quot; | Selected: {selected}
        </div>
      </div>
    );
  },
};

export const SearchOnly: Story = {
  render: () => {
    const [search, setSearch] = useState('');

    return (
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter files..."
      />
    );
  },
};

export const ActionsOnly: Story = {
  args: {
    actions: (
      <>
        <Button variant="outline">
          <DownloadIcon />
          <span className="ml-1.5">Export</span>
        </Button>
        <Button>
          <PlusIcon />
          <span className="ml-1.5">Create New</span>
        </Button>
      </>
    ),
  },
};
