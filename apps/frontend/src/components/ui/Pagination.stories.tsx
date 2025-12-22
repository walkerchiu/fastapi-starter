import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
      description: 'Current active page',
    },
    totalPages: {
      control: { type: 'number', min: 1 },
      description: 'Total number of pages',
    },
    siblingCount: {
      control: { type: 'number', min: 0, max: 3 },
      description:
        'Number of page buttons to show on each side of current page',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the pagination buttons',
    },
    showFirstLast: {
      control: 'boolean',
      description: 'Show first/last page buttons',
    },
    onPageChange: {
      action: 'page changed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    siblingCount: 1,
    size: 'md',
    showFirstLast: true,
  },
};

export const WithEllipsis: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    siblingCount: 1,
    size: 'md',
  },
};

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    size: 'md',
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    size: 'md',
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 5,
    size: 'md',
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 50,
    totalPages: 100,
    siblingCount: 2,
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    size: 'lg',
  },
};

export const WithoutFirstLast: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    showFirstLast: false,
  },
};

function InteractiveExample() {
  const [page, setPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Page {page} of {totalPages}
      </p>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveExample />,
};
