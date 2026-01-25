import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Drawer } from './Drawer';
import { Button } from './Button';

const meta: Meta<typeof Drawer> = {
  title: 'UI/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    showCloseButton: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Drawer Title"
        >
          <p className="text-gray-600 dark:text-gray-400">
            This is the drawer content. You can put anything here.
          </p>
        </Drawer>
      </div>
    );
  },
};

export const AllPositions: Story = {
  render: function AllPositionsDrawer() {
    const [position, setPosition] = useState<
      'left' | 'right' | 'top' | 'bottom' | null
    >(null);
    return (
      <div className="flex flex-wrap gap-4 p-8">
        <Button onClick={() => setPosition('left')}>Left</Button>
        <Button onClick={() => setPosition('right')}>Right</Button>
        <Button onClick={() => setPosition('top')}>Top</Button>
        <Button onClick={() => setPosition('bottom')}>Bottom</Button>
        {position && (
          <Drawer
            isOpen={true}
            onClose={() => setPosition(null)}
            position={position}
            title={`${position.charAt(0).toUpperCase() + position.slice(1)} Drawer`}
          >
            <p className="text-gray-600 dark:text-gray-400">
              This drawer slides from the {position}.
            </p>
          </Drawer>
        )}
      </div>
    );
  },
};

export const AllSizes: Story = {
  render: function AllSizesDrawer() {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(
      null,
    );
    return (
      <div className="flex flex-wrap gap-4 p-8">
        <Button onClick={() => setSize('sm')}>Small</Button>
        <Button onClick={() => setSize('md')}>Medium</Button>
        <Button onClick={() => setSize('lg')}>Large</Button>
        <Button onClick={() => setSize('xl')}>Extra Large</Button>
        <Button onClick={() => setSize('full')}>Full</Button>
        {size && (
          <Drawer
            isOpen={true}
            onClose={() => setSize(null)}
            size={size}
            title={`${size.toUpperCase()} Drawer`}
          >
            <p className="text-gray-600 dark:text-gray-400">
              This is a {size} sized drawer.
            </p>
          </Drawer>
        )}
      </div>
    );
  },
};

export const WithTitle: Story = {
  render: function WithTitleDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Settings"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Configure your preferences here.
            </p>
          </div>
        </Drawer>
      </div>
    );
  },
};

export const WithoutCloseButton: Story = {
  render: function WithoutCloseButtonDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="No Close Button"
          showCloseButton={false}
        >
          <p className="text-gray-600 dark:text-gray-400">
            This drawer has no close button. Click outside or press Escape to
            close.
          </p>
        </Drawer>
      </div>
    );
  },
};

export const LeftPosition: Story = {
  render: function LeftPositionDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>Open Left Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          position="left"
          title="Left Drawer"
        >
          <p className="text-gray-600 dark:text-gray-400">
            This drawer slides from the left.
          </p>
        </Drawer>
      </div>
    );
  },
};

export const TopPosition: Story = {
  render: function TopPositionDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>Open Top Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          position="top"
          title="Top Drawer"
        >
          <p className="text-gray-600 dark:text-gray-400">
            This drawer slides from the top.
          </p>
        </Drawer>
      </div>
    );
  },
};

export const BottomPosition: Story = {
  render: function BottomPositionDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="p-8">
        <Button onClick={() => setIsOpen(true)}>Open Bottom Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          position="bottom"
          title="Bottom Drawer"
        >
          <p className="text-gray-600 dark:text-gray-400">
            This drawer slides from the bottom.
          </p>
        </Drawer>
      </div>
    );
  },
};
