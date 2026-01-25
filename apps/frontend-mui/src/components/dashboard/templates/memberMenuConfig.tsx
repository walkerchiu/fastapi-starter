import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HistoryIcon from '@mui/icons-material/History';
import DevicesIcon from '@mui/icons-material/Devices';
import { type SidebarNavItem } from '../DashboardSidebar';

export const defaultMemberMenuItems: SidebarNavItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <HomeIcon />,
    href: '/member',
  },
  {
    key: 'account-group',
    label: 'Account',
    items: [
      {
        key: 'profile',
        label: 'Profile',
        icon: <PersonIcon />,
        href: '/member/profile',
      },
      {
        key: 'security',
        label: 'Security',
        icon: <SecurityIcon />,
        href: '/member/security',
      },
      {
        key: 'notifications',
        label: 'Notifications',
        icon: <NotificationsIcon />,
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
        icon: <HistoryIcon />,
        href: '/member/activity',
      },
      {
        key: 'sessions',
        label: 'Active Sessions',
        icon: <DevicesIcon />,
        href: '/member/sessions',
      },
    ],
  },
];

export const memberMenuIcons = {
  HomeIcon,
  PersonIcon,
  SecurityIcon,
  NotificationsIcon,
  HistoryIcon,
  DevicesIcon,
};
