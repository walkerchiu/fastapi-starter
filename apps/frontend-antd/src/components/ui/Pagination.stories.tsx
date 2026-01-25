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
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    current: 1,
    total: 100,
    pageSize: 10,
  },
};

export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        current={page}
        total={100}
        pageSize={10}
        onChange={(newPage) => setPage(newPage)}
      />
    );
  },
};

export const FewPages: Story = {
  args: {
    current: 1,
    total: 30,
    pageSize: 10,
  },
};

export const ManyPages: Story = {
  args: {
    current: 1,
    total: 500,
    pageSize: 10,
  },
};

export const MiddlePage: Story = {
  args: {
    current: 5,
    total: 100,
    pageSize: 10,
  },
};

export const LastPage: Story = {
  args: {
    current: 10,
    total: 100,
    pageSize: 10,
  },
};
