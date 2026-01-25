import {
  HomeOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  SyncOutlined,
  MessageOutlined,
  CustomerServiceOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { type SidebarNavItem } from '../DashboardSidebar';

export const defaultConsoleMenuItems: SidebarNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <HomeOutlined />,
    href: '/console',
  },
  {
    key: 'orders-group',
    label: 'Order Management',
    items: [
      {
        key: 'orders',
        label: 'All Orders',
        icon: <ShoppingCartOutlined />,
        href: '/console/orders',
      },
      {
        key: 'pending',
        label: 'Pending Orders',
        icon: <UnorderedListOutlined />,
        href: '/console/orders/pending',
        badge: 12,
      },
      {
        key: 'returns',
        label: 'Returns & Refunds',
        icon: <SyncOutlined />,
        href: '/console/orders/returns',
        badge: 3,
      },
    ],
  },
  {
    key: 'support-group',
    label: 'Customer Support',
    items: [
      {
        key: 'tickets',
        label: 'Support Tickets',
        icon: <CustomerServiceOutlined />,
        href: '/console/support/tickets',
        badge: 8,
      },
      {
        key: 'chat',
        label: 'Live Chat',
        icon: <MessageOutlined />,
        href: '/console/support/chat',
      },
    ],
  },
  {
    key: 'review-group',
    label: 'Content Review',
    items: [
      {
        key: 'pending-review',
        label: 'Pending Review',
        icon: <FileSearchOutlined />,
        href: '/console/review/pending',
        badge: 5,
      },
      {
        key: 'approved',
        label: 'Approved',
        icon: <CheckCircleOutlined />,
        href: '/console/review/approved',
      },
    ],
  },
  {
    key: 'reports-group',
    label: 'Reports',
    items: [
      {
        key: 'sales',
        label: 'Sales Report',
        icon: <BarChartOutlined />,
        href: '/console/reports/sales',
      },
      {
        key: 'analytics',
        label: 'Analytics',
        icon: <RiseOutlined />,
        href: '/console/reports/analytics',
      },
    ],
  },
];

export const consoleMenuIcons = {
  HomeOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  SyncOutlined,
  MessageOutlined,
  CustomerServiceOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  RiseOutlined,
};
