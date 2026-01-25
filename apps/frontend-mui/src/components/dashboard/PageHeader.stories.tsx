import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './PageHeader';
import { Button } from '../ui/Button';

const meta: Meta<typeof PageHeader> = {
  title: 'Dashboard/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Page Title',
  },
};

export const WithDescription: Story = {
  args: {
    title: 'User Management',
    description: 'Manage your team members and their account permissions here.',
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: 'User Details',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Users', href: '/users' },
      { label: 'John Doe' },
    ],
  },
};

export const WithActions: Story = {
  args: {
    title: 'Products',
    description: 'A list of all products in your store.',
    actions: (
      <>
        <Button variant="outline" size="sm">
          Export
        </Button>
        <Button variant="primary" size="sm">
          Add Product
        </Button>
      </>
    ),
  },
};

export const WithBackButton: Story = {
  args: {
    title: 'Edit User',
    backHref: '/users',
  },
};

export const WithBackCallback: Story = {
  args: {
    title: 'Edit User',
    onBack: () => console.log('Back clicked'),
  },
};

export const FullFeatured: Story = {
  args: {
    title: 'Invoice Details',
    description: 'View and manage invoice #INV-2024-001',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Invoices', href: '/invoices' },
      { label: 'INV-2024-001' },
    ],
    backHref: '/invoices',
    actions: (
      <>
        <Button variant="outline" size="sm">
          Download PDF
        </Button>
        <Button variant="outline" size="sm">
          Send
        </Button>
        <Button variant="primary" size="sm">
          Edit
        </Button>
      </>
    ),
  },
};

export const LongTitle: Story = {
  args: {
    title: 'This Is a Very Long Page Title That Might Wrap on Smaller Screens',
    description:
      'This is also a longer description that provides more context about what this page does and why it exists in the application.',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Category', href: '/category' },
      { label: 'Subcategory', href: '/category/subcategory' },
      { label: 'Current Page' },
    ],
    actions: (
      <Button variant="primary" size="sm">
        Action
      </Button>
    ),
  },
};
