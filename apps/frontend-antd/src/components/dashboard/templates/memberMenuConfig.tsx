import {
  HomeOutlined,
  UserOutlined,
  SafetyOutlined,
  BellOutlined,
  HistoryOutlined,
  DesktopOutlined,
  ShoppingOutlined,
  HeartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { type SidebarNavItem } from '../DashboardSidebar';

export const defaultMemberMenuItems: SidebarNavItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <HomeOutlined />,
    href: '/member',
  },
  {
    key: 'account-group',
    label: 'Account',
    items: [
      {
        key: 'profile',
        label: 'Profile',
        icon: <UserOutlined />,
        href: '/member/profile',
      },
      {
        key: 'security',
        label: 'Security',
        icon: <SafetyOutlined />,
        href: '/member/security',
      },
      {
        key: 'notifications',
        label: 'Notifications',
        icon: <BellOutlined />,
        href: '/member/notifications',
        badge: 3,
      },
    ],
  },
  {
    key: 'shopping-group',
    label: 'Shopping',
    items: [
      {
        key: 'orders',
        label: 'My Orders',
        icon: <ShoppingOutlined />,
        href: '/member/orders',
      },
      {
        key: 'favorites',
        label: 'Favorites',
        icon: <HeartOutlined />,
        href: '/member/favorites',
      },
    ],
  },
  {
    key: 'activity-group',
    label: 'Activity',
    items: [
      {
        key: 'activity',
        label: 'Activity Log',
        icon: <HistoryOutlined />,
        href: '/member/activity',
      },
      {
        key: 'sessions',
        label: 'Active Sessions',
        icon: <DesktopOutlined />,
        href: '/member/sessions',
      },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingOutlined />,
    href: '/member/settings',
  },
];

export const memberMenuIcons = {
  HomeOutlined,
  UserOutlined,
  SafetyOutlined,
  BellOutlined,
  HistoryOutlined,
  DesktopOutlined,
  ShoppingOutlined,
  HeartOutlined,
  SettingOutlined,
};
