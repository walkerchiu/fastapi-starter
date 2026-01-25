import {
  HomeOutlined,
  UserOutlined,
  SafetyOutlined,
  BellOutlined,
  HistoryOutlined,
  DesktopOutlined,
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
];

export const memberMenuIcons = {
  HomeOutlined,
  UserOutlined,
  SafetyOutlined,
  BellOutlined,
  HistoryOutlined,
  DesktopOutlined,
};
