import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DataTablePagination } from './DataTablePagination';
import { Box, Typography } from '@mui/material';

const meta: Meta<typeof DataTablePagination> = {
  title: 'Dashboard/DataDisplay/DataTablePagination',
  component: DataTablePagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DataTablePagination>;

function PaginationDemo({
  initialPage = 1,
  initialPageSize = 10,
  total = 100,
}: {
  initialPage?: number;
  initialPageSize?: number;
  total?: number;
}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return (
    <Box>
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Current page: {page}, Page size: {pageSize}, Total: {total}
        </Typography>
      </Box>
    </Box>
  );
}

export const Default: Story = {
  render: () => <PaginationDemo />,
};

export const FewPages: Story = {
  render: () => <PaginationDemo total={30} />,
};

export const ManyPages: Story = {
  render: () => <PaginationDemo total={500} initialPage={25} />,
};

export const FirstPage: Story = {
  render: () => <PaginationDemo total={200} initialPage={1} />,
};

export const LastPage: Story = {
  render: () => <PaginationDemo total={200} initialPage={20} />,
};

export const MiddlePage: Story = {
  render: () => <PaginationDemo total={200} initialPage={10} />,
};

export const CustomPageSizes: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    return (
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={250}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[25, 50, 75, 100]}
      />
    );
  },
};

export const NoPageSizeSelector: Story = {
  render: () => {
    const [page, setPage] = useState(1);

    return (
      <DataTablePagination
        page={page}
        pageSize={10}
        total={100}
        onPageChange={setPage}
      />
    );
  },
};

export const SinglePage: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    return (
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={5}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    );
  },
};

export const EmptyData: Story = {
  args: {
    page: 1,
    pageSize: 10,
    total: 0,
    onPageChange: () => {},
  },
};

export const LargeDataset: Story = {
  render: () => <PaginationDemo total={10000} initialPage={500} />,
};
