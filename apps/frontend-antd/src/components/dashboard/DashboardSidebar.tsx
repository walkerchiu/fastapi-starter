'use client';

import { useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { Layout, Menu, Badge, Button as AntButton } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

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

type MenuItem = Required<MenuProps>['items'][number];

function convertToAntdMenuItem(
  item: SidebarMenuItem,
  collapsed: boolean,
  onItemClick?: (key: string, item: SidebarMenuItem) => void,
): MenuItem {
  const hasChildren = item.children && item.children.length > 0;

  const labelContent =
    item.badge !== undefined ? (
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{item.label}</span>
        {!collapsed && <Badge count={item.badge} size="small" />}
      </span>
    ) : (
      item.label
    );

  const menuItem: MenuItem = {
    key: item.key,
    icon:
      item.badge !== undefined && collapsed ? (
        <Badge count={item.badge} size="small" offset={[6, 0]}>
          {item.icon}
        </Badge>
      ) : (
        item.icon
      ),
    label:
      item.href && !hasChildren ? (
        <Link
          href={item.disabled ? '#' : item.href}
          onClick={(e) => {
            if (item.disabled) {
              e.preventDefault();
              return;
            }
            item.onClick?.();
            onItemClick?.(item.key, item);
          }}
        >
          {labelContent}
        </Link>
      ) : (
        labelContent
      ),
    disabled: item.disabled,
    children: hasChildren
      ? item.children!.map((child) =>
          convertToAntdMenuItem(child, collapsed, onItemClick),
        )
      : undefined,
    onClick:
      !item.href && !hasChildren
        ? () => {
            if (!item.disabled) {
              item.onClick?.();
              onItemClick?.(item.key, item);
            }
          }
        : undefined,
  };

  return menuItem;
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
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const menuItems: MenuItem[] = items.flatMap((item) => {
    if (isMenuGroup(item)) {
      return [
        { type: 'group' as const, key: item.key, label: item.label },
        ...item.items.map((menuItem) =>
          convertToAntdMenuItem(menuItem, collapsed, onItemClick),
        ),
      ];
    }
    return convertToAntdMenuItem(item, collapsed, onItemClick);
  });

  const handleOpenChange = useCallback((keys: string[]) => {
    setOpenKeys(keys);
  }, []);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={width}
      collapsedWidth={collapsedWidth}
      className={className}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 30,
        overflow: 'auto',
      }}
    >
      {/* Header */}
      {header && (
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 12px' : '0 16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
          }}
        >
          {header}
        </div>
      )}

      {/* Navigation */}
      <Menu
        mode="inline"
        selectedKeys={activeKey ? [activeKey] : []}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={handleOpenChange}
        items={menuItems}
        style={{ borderRight: 0, flex: 1 }}
      />

      {/* Footer */}
      {footer && (
        <div
          style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            padding: 12,
          }}
        >
          {footer}
        </div>
      )}

      {/* Collapse Button */}
      {onCollapse && (
        <div
          style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            justifyContent: 'center',
            padding: 8,
          }}
        >
          <AntButton
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => onCollapse(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          />
        </div>
      )}
    </Sider>
  );
}
