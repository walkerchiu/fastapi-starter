import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from '../ui/Button';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Dashboard/Feedback/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed with this action?',
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const Danger: Story = {
  args: {
    open: true,
    title: 'Delete Item',
    description:
      'Are you sure you want to delete this item? This action cannot be undone.',
    variant: 'danger',
    confirmText: 'Delete',
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const Loading: Story = {
  args: {
    open: true,
    title: 'Processing',
    description: 'Please wait while we process your request.',
    loading: true,
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const CustomButtons: Story = {
  args: {
    open: true,
    title: 'Save Changes',
    description: 'Do you want to save the changes you made?',
    confirmText: 'Save',
    cancelText: 'Discard',
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 1500);
    };

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
          title="Confirm Submission"
          description="Are you sure you want to submit this form? Please review your information before confirming."
          confirmText="Submit"
          loading={loading}
        />
      </>
    );
  },
};

export const DangerInteractive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 1500);
    };

    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete User
        </Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
          title="Delete User"
          description="This will permanently delete the user and all associated data. This action cannot be undone."
          variant="danger"
          confirmText="Delete Forever"
          loading={loading}
        />
      </>
    );
  },
};
