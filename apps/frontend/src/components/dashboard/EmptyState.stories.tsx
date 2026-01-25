import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { Button } from '../ui/Button';

const meta: Meta<typeof EmptyState> = {
  title: 'Dashboard/Feedback/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

const FolderIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

export const Default: Story = {
  args: {
    title: 'No data found',
    description: 'There are no items to display at the moment.',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <FolderIcon />,
    title: 'No files',
    description: 'Upload your first file to get started.',
  },
};

export const WithAction: Story = {
  args: {
    icon: <UsersIcon />,
    title: 'No users',
    description: 'Get started by creating a new user.',
    action: <Button>Create User</Button>,
  },
};

export const NoDescription: Story = {
  args: {
    icon: <FolderIcon />,
    title: 'Empty folder',
  },
};

export const FullExample: Story = {
  args: {
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    title: 'No tasks yet',
    description:
      'Start by creating your first scheduled task. Tasks can run on a schedule or be triggered manually.',
    action: (
      <div className="flex gap-2">
        <Button variant="outline">Learn More</Button>
        <Button>Create Task</Button>
      </div>
    ),
  },
};
