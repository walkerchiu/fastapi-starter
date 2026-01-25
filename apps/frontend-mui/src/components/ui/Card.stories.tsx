import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardBody } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <CardBody>
        <p>This is a simple card with some content inside.</p>
      </CardBody>
    ),
  },
};

export const WithHeader: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Card Title
          </h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600 dark:text-gray-400">
            This is the card body content. It can contain any kind of content
            like text, images, or other components.
          </p>
        </CardBody>
      </>
    ),
  },
};

export const WithActions: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Card with Actions
            </h3>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600 dark:text-gray-400">
            This card has action buttons in the header.
          </p>
        </CardBody>
      </>
    ),
  },
};

export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Card with Footer
        </h3>
      </CardHeader>
      <CardBody>
        <p className="text-gray-600 dark:text-gray-400">
          This card has a footer with action buttons.
        </p>
      </CardBody>
      <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Save</Button>
        </div>
      </div>
    </Card>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Card 1
          </h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600 dark:text-gray-400">First card content</p>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Card 2
          </h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600 dark:text-gray-400">
            Second card content
          </p>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Card 3
          </h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600 dark:text-gray-400">Third card content</p>
        </CardBody>
      </Card>
    </div>
  ),
};
