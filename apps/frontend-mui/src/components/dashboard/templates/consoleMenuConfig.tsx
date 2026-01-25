import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChatIcon from '@mui/icons-material/Chat';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { type SidebarNavItem } from '../DashboardSidebar';

export const defaultConsoleMenuItems: SidebarNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon />,
    href: '/console',
  },
  {
    key: 'orders-group',
    label: 'Order Management',
    items: [
      {
        key: 'orders',
        label: 'All Orders',
        icon: <ShoppingCartIcon />,
        href: '/console/orders',
      },
      {
        key: 'pending',
        label: 'Pending Orders',
        icon: <AssignmentIcon />,
        href: '/console/orders/pending',
        badge: 12,
      },
      {
        key: 'returns',
        label: 'Returns & Refunds',
        icon: <RefreshIcon />,
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
        icon: <ConfirmationNumberIcon />,
        href: '/console/support/tickets',
        badge: 8,
      },
      {
        key: 'chat',
        label: 'Live Chat',
        icon: <ChatIcon />,
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
        icon: <FindInPageIcon />,
        href: '/console/review/pending',
        badge: 5,
      },
      {
        key: 'approved',
        label: 'Approved',
        icon: <CheckCircleIcon />,
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
        icon: <BarChartIcon />,
        href: '/console/reports/sales',
      },
      {
        key: 'analytics',
        label: 'Analytics',
        icon: <TrendingUpIcon />,
        href: '/console/reports/analytics',
      },
    ],
  },
];

export const consoleMenuIcons = {
  HomeIcon,
  ShoppingCartIcon,
  AssignmentIcon,
  RefreshIcon,
  ChatIcon,
  ConfirmationNumberIcon,
  FindInPageIcon,
  CheckCircleIcon,
  BarChartIcon,
  TrendingUpIcon,
};
