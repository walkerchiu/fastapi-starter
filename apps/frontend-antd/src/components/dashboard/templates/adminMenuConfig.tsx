import {
  HomeOutlined,
  TeamOutlined,
  SafetyOutlined,
  KeyOutlined,
  FolderOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { type SidebarNavItem } from '../DashboardSidebar';

export const defaultAdminMenuItems: SidebarNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <HomeOutlined />,
    href: '/admin',
  },
  {
    key: 'users-group',
    label: 'User Management',
    items: [
      {
        key: 'users',
        label: 'Users',
        icon: <TeamOutlined />,
        href: '/admin/users',
      },
      {
        key: 'roles',
        label: 'Roles',
        icon: <SafetyOutlined />,
        href: '/admin/roles',
      },
      {
        key: 'permissions',
        label: 'Permissions',
        icon: <KeyOutlined />,
        href: '/admin/permissions',
      },
    ],
  },
  {
    key: 'content-group',
    label: 'Content',
    items: [
      {
        key: 'files',
        label: 'Files',
        icon: <FolderOutlined />,
        href: '/admin/files',
      },
    ],
  },
  {
    key: 'system-group',
    label: 'System',
    items: [
      {
        key: 'settings',
        label: 'Settings',
        icon: <SettingOutlined />,
        href: '/admin/settings',
      },
      {
        key: 'logs',
        label: 'Audit Logs',
        icon: <FileTextOutlined />,
        href: '/admin/logs',
      },
    ],
  },
];

export const adminMenuIcons = {
  HomeOutlined,
  TeamOutlined,
  SafetyOutlined,
  KeyOutlined,
  FolderOutlined,
  SettingOutlined,
  FileTextOutlined,
};
