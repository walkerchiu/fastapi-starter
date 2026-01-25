'use client';

import { useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  children?: SidebarMenuItem[];
  badge?: string | number;
  disabled?: boolean;
}

export interface SidebarMenuGroup {
  key: string;
  label: string;
  items: SidebarMenuItem[];
}

export type SidebarNavItem = SidebarMenuItem | SidebarMenuGroup;

function isMenuGroup(item: SidebarNavItem): item is SidebarMenuGroup {
  return 'items' in item;
}

export interface DashboardSidebarProps {
  items: SidebarNavItem[];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  header?: ReactNode;
  footer?: ReactNode;
  activeKey?: string;
  onItemClick?: (key: string, item: SidebarMenuItem) => void;
  width?: number;
  collapsedWidth?: number;
  className?: string;
}

interface MenuItemComponentProps {
  item: SidebarMenuItem;
  collapsed: boolean;
  activeKey?: string;
  onItemClick?: (key: string, item: SidebarMenuItem) => void;
  level?: number;
}

function MenuItemComponent({
  item,
  collapsed,
  activeKey,
  onItemClick,
  level = 0,
}: MenuItemComponentProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeKey === item.key;
  const isChildActive = item.children?.some((child) => child.key === activeKey);

  const handleClick = useCallback(() => {
    if (item.disabled) return;
    if (hasChildren) {
      setExpanded(!expanded);
    } else {
      item.onClick?.();
      onItemClick?.(item.key, item);
    }
  }, [item, hasChildren, expanded, onItemClick]);

  const buttonContent = (
    <ListItemButton
      onClick={handleClick}
      disabled={item.disabled}
      selected={isActive || isChildActive}
      sx={{
        pl: collapsed ? 2 : 2 + level * 2,
        borderRadius: 1,
        mx: 1,
        '&.Mui-selected': {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
          '& .MuiListItemIcon-root': {
            color: 'inherit',
          },
        },
      }}
    >
      {item.icon && (
        <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40 }}>
          {item.badge !== undefined ? (
            <Badge badgeContent={item.badge} color="error" max={99}>
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )}
        </ListItemIcon>
      )}
      {!collapsed && (
        <>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{ noWrap: true }}
          />
          {item.badge !== undefined && !item.icon && (
            <Badge badgeContent={item.badge} color="error" max={99} />
          )}
          {hasChildren && (expanded ? <ExpandLess /> : <ExpandMore />)}
        </>
      )}
    </ListItemButton>
  );

  const menuItem =
    item.href && !hasChildren ? (
      <ListItem disablePadding>
        <Link
          href={item.disabled ? '#' : item.href}
          style={{ width: '100%', textDecoration: 'none', color: 'inherit' }}
        >
          {buttonContent}
        </Link>
      </ListItem>
    ) : (
      <ListItem disablePadding>{buttonContent}</ListItem>
    );

  if (collapsed && !hasChildren) {
    return (
      <Tooltip title={item.label} placement="right">
        {menuItem}
      </Tooltip>
    );
  }

  return (
    <>
      {collapsed ? (
        <Tooltip title={item.label} placement="right">
          {menuItem}
        </Tooltip>
      ) : (
        menuItem
      )}
      {hasChildren && !collapsed && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children!.map((child) => (
              <MenuItemComponent
                key={child.key}
                item={child}
                collapsed={collapsed}
                activeKey={activeKey}
                onItemClick={onItemClick}
                level={level + 1}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export function DashboardSidebar({
  items,
  collapsed = false,
  onCollapse,
  header,
  footer,
  activeKey,
  onItemClick,
  width = 256,
  collapsedWidth = 64,
  className,
}: DashboardSidebarProps) {
  const sidebarWidth = collapsed ? collapsedWidth : width;

  return (
    <Box
      component="aside"
      className={className}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: sidebarWidth,
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'width 0.3s ease',
        zIndex: 30,
      }}
    >
      {/* Header */}
      {header && (
        <Box
          sx={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            px: 2,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          {header}
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {items.map((item) => {
            if (isMenuGroup(item)) {
              return (
                <Box
                  key={item.key}
                  sx={{ pt: 2, '&:first-of-type': { pt: 0 } }}
                >
                  {!collapsed && (
                    <Typography
                      variant="overline"
                      sx={{
                        px: 3,
                        display: 'block',
                        color: 'text.secondary',
                        mb: 1,
                      }}
                    >
                      {item.label}
                    </Typography>
                  )}
                  {collapsed && <Divider sx={{ mx: 2, my: 1 }} />}
                  {item.items.map((menuItem) => (
                    <MenuItemComponent
                      key={menuItem.key}
                      item={menuItem}
                      collapsed={collapsed}
                      activeKey={activeKey}
                      onItemClick={onItemClick}
                    />
                  ))}
                </Box>
              );
            }
            return (
              <MenuItemComponent
                key={item.key}
                item={item}
                collapsed={collapsed}
                activeKey={activeKey}
                onItemClick={onItemClick}
              />
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      {footer && (
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            p: 1.5,
            flexShrink: 0,
          }}
        >
          {footer}
        </Box>
      )}

      {/* Collapse Button */}
      {onCollapse && (
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'center',
            py: 1,
          }}
        >
          <IconButton
            onClick={() => onCollapse(!collapsed)}
            size="small"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
