import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import { type SidebarNavItem } from '../DashboardSidebar';

export const defaultAdminMenuItems: SidebarNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon />,
    href: '/admin',
  },
  {
    key: 'users-group',
    label: 'User Management',
    items: [
      {
        key: 'users',
        label: 'Users',
        icon: <GroupIcon />,
        href: '/admin/users',
      },
      {
        key: 'roles',
        label: 'Roles',
        icon: <SecurityIcon />,
        href: '/admin/roles',
      },
      {
        key: 'permissions',
        label: 'Permissions',
        icon: <VpnKeyIcon />,
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
        icon: <FolderIcon />,
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
        icon: <SettingsIcon />,
        href: '/admin/settings',
      },
      {
        key: 'logs',
        label: 'Audit Logs',
        icon: <DescriptionIcon />,
        href: '/admin/logs',
      },
    ],
  },
];

export const adminMenuIcons = {
  HomeIcon,
  GroupIcon,
  SecurityIcon,
  VpnKeyIcon,
  FolderIcon,
  SettingsIcon,
  DescriptionIcon,
};
