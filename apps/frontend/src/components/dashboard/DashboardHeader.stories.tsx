import type { Meta, StoryObj } from '@storybook/react';
import { DashboardHeader } from './DashboardHeader';
import { Button } from '../ui/Button';

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="h-8 w-8 rounded-lg bg-indigo-600" />
    <span className="font-semibold text-gray-900 dark:text-gray-100">
      Acme Inc
    </span>
  </div>
);

const BellIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const UserAvatar = () => (
  <div className="flex items-center gap-2">
    <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
  </div>
);

const meta: Meta<typeof DashboardHeader> = {
  title: 'Dashboard/DashboardHeader',
  component: DashboardHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Dashboard',
    onMenuToggle: () => {},
  },
};

export const WithLogo: Story = {
  args: {
    logo: <Logo />,
    onMenuToggle: () => {},
  },
};

export const WithSearch: Story = {
  args: {
    logo: <Logo />,
    showSearch: true,
    searchPlaceholder: 'Search...',
    onSearch: (query) => console.log('Search:', query),
    onMenuToggle: () => {},
  },
};

export const WithActions: Story = {
  args: {
    logo: <Logo />,
    onMenuToggle: () => {},
    actions: (
      <>
        <button
          type="button"
          className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <BellIcon />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <UserAvatar />
      </>
    ),
  },
};

export const FullFeatured: Story = {
  args: {
    logo: <Logo />,
    showSearch: true,
    searchPlaceholder: 'Search anything...',
    onSearch: (query) => console.log('Search:', query),
    onMenuToggle: () => {},
    actions: (
      <>
        <button
          type="button"
          className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <BellIcon />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <Button size="sm" variant="primary">
          New Project
        </Button>
        <UserAvatar />
      </>
    ),
  },
};

export const NoMenuToggle: Story = {
  args: {
    logo: <Logo />,
    showMenuToggle: false,
    actions: <UserAvatar />,
  },
};

export const NotSticky: Story = {
  args: {
    logo: <Logo />,
    sticky: false,
    onMenuToggle: () => {},
  },
};
