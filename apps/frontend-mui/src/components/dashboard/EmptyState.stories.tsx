import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { Button } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';

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
    icon: <FolderIcon />,
    title: 'No files',
    description: 'Upload your first file to get started.',
  },
};

export const WithAction: Story = {
  args: {
    icon: <PeopleIcon />,
    title: 'No users',
    description: 'Get started by creating a new user.',
    action: <Button variant="contained">Create User</Button>,
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
    icon: <AssignmentIcon />,
    title: 'No tasks yet',
    description:
      'Start by creating your first scheduled task. Tasks can run on a schedule or be triggered manually.',
    action: (
      <>
        <Button variant="outlined" sx={{ mr: 1 }}>
          Learn More
        </Button>
        <Button variant="contained">Create Task</Button>
      </>
    ),
  },
};
