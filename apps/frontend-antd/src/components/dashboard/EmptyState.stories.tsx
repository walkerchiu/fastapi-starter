import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { Button } from '../ui/Button';
import {
  FolderOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

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

export const Default: Story = {
  args: {
    title: 'No data found',
    description: 'There are no items to display at the moment.',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <FolderOutlined style={{ fontSize: 48, color: '#999' }} />,
    title: 'No files',
    description: 'Upload your first file to get started.',
  },
};

export const WithAction: Story = {
  args: {
    icon: <TeamOutlined style={{ fontSize: 48, color: '#999' }} />,
    title: 'No users',
    description: 'Get started by creating a new user.',
    action: <Button>Create User</Button>,
  },
};

export const NoDescription: Story = {
  args: {
    icon: <FolderOutlined style={{ fontSize: 48, color: '#999' }} />,
    title: 'Empty folder',
  },
};

export const FullExample: Story = {
  args: {
    icon: <FileTextOutlined style={{ fontSize: 48, color: '#999' }} />,
    title: 'No tasks yet',
    description:
      'Start by creating your first scheduled task. Tasks can run on a schedule or be triggered manually.',
    action: (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <Button variant="outline">Learn More</Button>
        <Button>Create Task</Button>
      </div>
    ),
  },
};
