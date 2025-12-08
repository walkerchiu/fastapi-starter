import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    closeOnOverlayClick: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    showCloseButton: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <p className="text-gray-600 dark:text-gray-400">
            This is the modal content. You can put any content here.
          </p>
        </Modal>
      </>
    );
  },
  args: {
    title: 'Modal Title',
  },
};

export const Small: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Small Modal</Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <p className="text-gray-600 dark:text-gray-400">
            A compact modal for simple messages.
          </p>
        </Modal>
      </>
    );
  },
  args: {
    title: 'Small Modal',
    size: 'sm',
  },
};

export const Large: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Large Modal</Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <p className="text-gray-600 dark:text-gray-400">
            A larger modal for more complex content. This modal has more space
            for forms, tables, or detailed information.
          </p>
        </Modal>
      </>
    );
  },
  args: {
    title: 'Large Modal',
    size: 'lg',
  },
};

export const WithForm: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Edit Profile</Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
                placeholder="john@example.com"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Modal>
      </>
    );
  },
  args: {
    title: 'Edit Profile',
    size: 'md',
  },
};

export const ConfirmDialog: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Delete Item
        </Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this item? This action cannot be
            undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-500"
              onClick={() => setIsOpen(false)}
            >
              Delete
            </Button>
          </div>
        </Modal>
      </>
    );
  },
  args: {
    title: 'Confirm Deletion',
    size: 'sm',
  },
};

export const WithoutCloseButton: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <p className="text-gray-600 dark:text-gray-400">
            This modal has no close button. You must use the action buttons or
            press Escape.
          </p>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </Modal>
      </>
    );
  },
  args: {
    title: 'No Close Button',
    showCloseButton: false,
  },
};
