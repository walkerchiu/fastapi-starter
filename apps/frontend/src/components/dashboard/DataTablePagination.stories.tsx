import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DataTablePagination } from './DataTablePagination';

const meta: Meta<typeof DataTablePagination> = {
  title: 'Dashboard/Data/DataTablePagination',
  component: DataTablePagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DataTablePagination>;

export const Default: Story = {
  args: {
    page: 1,
    pageSize: 10,
    total: 100,
    onPageChange: () => {},
  },
};

export const WithPageSizeSelector: Story = {
  args: {
    page: 1,
    pageSize: 10,
    total: 100,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};

export const MiddlePage: Story = {
  args: {
    page: 5,
    pageSize: 10,
    total: 100,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};

export const LastPage: Story = {
  args: {
    page: 10,
    pageSize: 10,
    total: 100,
    onPageChange: () => {},
  },
};

export const FewPages: Story = {
  args: {
    page: 2,
    pageSize: 10,
    total: 35,
    onPageChange: () => {},
  },
};

export const SinglePage: Story = {
  args: {
    page: 1,
    pageSize: 10,
    total: 5,
    onPageChange: () => {},
  },
};

export const ManyPages: Story = {
  args: {
    page: 50,
    pageSize: 10,
    total: 1000,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const total = 253;

    return (
      <div className="space-y-4">
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Current page: {page} | Page size: {pageSize} | Total: {total}
        </div>
      </div>
    );
  },
};

export const CustomPageSizes: Story = {
  args: {
    page: 1,
    pageSize: 25,
    total: 500,
    onPageChange: () => {},
    onPageSizeChange: () => {},
    pageSizeOptions: [25, 50, 100, 250],
  },
};

export const Empty: Story = {
  args: {
    page: 1,
    pageSize: 10,
    total: 0,
    onPageChange: () => {},
  },
};
