import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DataTableToolbar, type BulkAction } from './DataTableToolbar';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';

const meta: Meta<typeof DataTableToolbar> = {
  title: 'Dashboard/DataDisplay/DataTableToolbar',
  component: DataTableToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DataTableToolbar>;

function SearchDemo() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <DataTableToolbar
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Search users..."
    />
  );
}

export const Default: Story = {
  render: () => <SearchDemo />,
};

export const WithActions: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');

    return (
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search..."
        actions={
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
            >
              Filters
            </Button>
            <Button variant="contained" size="small" startIcon={<AddIcon />}>
              Add User
            </Button>
          </>
        }
      />
    );
  },
};

const bulkActions: BulkAction[] = [
  {
    key: 'delete',
    label: 'Delete',
    icon: <DeleteIcon fontSize="small" />,
    variant: 'danger',
    onClick: () => console.log('Delete clicked'),
  },
  {
    key: 'archive',
    label: 'Archive',
    icon: <ArchiveIcon fontSize="small" />,
    variant: 'ghost',
    onClick: () => console.log('Archive clicked'),
  },
];

export const WithBulkActions: Story = {
  args: {
    searchValue: '',
    searchPlaceholder: 'Search...',
    selectedCount: 3,
    bulkActions,
  },
};

export const BulkActionsMultiple: Story = {
  args: {
    searchValue: '',
    searchPlaceholder: 'Search...',
    selectedCount: 5,
    bulkActions: [
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteIcon fontSize="small" />,
        variant: 'danger',
        onClick: () => console.log('Delete clicked'),
      },
      {
        key: 'archive',
        label: 'Archive',
        icon: <ArchiveIcon fontSize="small" />,
        variant: 'secondary',
        onClick: () => console.log('Archive clicked'),
      },
      {
        key: 'export',
        label: 'Export',
        icon: <FileDownloadIcon fontSize="small" />,
        variant: 'ghost',
        onClick: () => console.log('Export clicked'),
      },
    ],
    actions: (
      <Button variant="contained" size="small" startIcon={<AddIcon />}>
        Add User
      </Button>
    ),
  },
};

export const SearchWithPlaceholder: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');

    return (
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by name, email or ID..."
      />
    );
  },
};

export const NoSearch: Story = {
  args: {
    actions: (
      <>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownloadIcon />}
        >
          Export
        </Button>
        <Button variant="contained" size="small" startIcon={<AddIcon />}>
          Create
        </Button>
      </>
    ),
  },
};

export const FullExample: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const [selectedCount, setSelectedCount] = useState(0);

    return (
      <Box>
        <DataTableToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search users..."
          selectedCount={selectedCount}
          bulkActions={[
            {
              key: 'delete',
              label: 'Delete',
              icon: <DeleteIcon fontSize="small" />,
              variant: 'danger',
              onClick: () => {
                console.log('Delete clicked');
                setSelectedCount(0);
              },
            },
            {
              key: 'archive',
              label: 'Archive',
              icon: <ArchiveIcon fontSize="small" />,
              variant: 'ghost',
              onClick: () => {
                console.log('Archive clicked');
                setSelectedCount(0);
              },
            },
          ]}
          actions={
            <Button variant="contained" size="small" startIcon={<AddIcon />}>
              Add User
            </Button>
          }
        />
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Button
            size="small"
            onClick={() => setSelectedCount(selectedCount + 1)}
          >
            Select +1
          </Button>
          <Button
            size="small"
            onClick={() => setSelectedCount(Math.max(0, selectedCount - 1))}
            sx={{ ml: 1 }}
          >
            Deselect -1
          </Button>
        </Box>
      </Box>
    );
  },
};
