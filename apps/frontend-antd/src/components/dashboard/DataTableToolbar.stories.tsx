import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DataTableToolbar } from './DataTableToolbar';
import { Button } from '../ui/Button';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

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
          <DownloadOutlined />
          <span style={{ marginLeft: 6 }}>Export</span>
        </Button>
        <Button>
          <PlusOutlined />
          <span style={{ marginLeft: 6 }}>Add User</span>
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
        icon: <DeleteOutlined />,
        variant: 'danger',
        onClick: () => alert('Delete clicked'),
      },
      {
        key: 'export',
        label: 'Export',
        icon: <DownloadOutlined />,
        onClick: () => alert('Export clicked'),
      },
    ],
    actions: (
      <Button>
        <PlusOutlined />
        <span style={{ marginLeft: 6 }}>Add User</span>
      </Button>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <DataTableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search users..."
          selectedCount={selected}
          bulkActions={[
            {
              key: 'delete',
              label: 'Delete',
              icon: <DeleteOutlined />,
              variant: 'danger',
              onClick: () => {
                alert(`Deleting ${selected} items`);
                setSelected(0);
              },
            },
          ]}
          actions={
            <Button>
              <PlusOutlined />
              <span style={{ marginLeft: 6 }}>Add User</span>
            </Button>
          }
        />
        <div style={{ display: 'flex', gap: 8 }}>
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
        <div style={{ fontSize: 14, color: '#666' }}>
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
          <DownloadOutlined />
          <span style={{ marginLeft: 6 }}>Export</span>
        </Button>
        <Button>
          <PlusOutlined />
          <span style={{ marginLeft: 6 }}>Create New</span>
        </Button>
      </>
    ),
  },
};
