'use client';

import { useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { Tooltip } from '../ui/Tooltip';
import { Badge } from '../ui/Badge';

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

  const baseClasses = `
    flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
    transition-colors duration-150
    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${isActive || isChildActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}
  `;

  const content = (
    <>
      {item.icon && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          {item.icon}
        </span>
      )}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && (
            <Badge variant="info">{item.badge}</Badge>
          )}
          {hasChildren && (
            <svg
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </>
      )}
    </>
  );

  const menuItem =
    item.href && !hasChildren ? (
      <Link
        href={item.disabled ? '#' : item.href}
        className={baseClasses}
        onClick={(e) => {
          if (item.disabled) e.preventDefault();
          handleClick();
        }}
        style={{ paddingLeft: collapsed ? undefined : `${12 + level * 16}px` }}
      >
        {content}
      </Link>
    ) : (
      <button
        type="button"
        className={`w-full ${baseClasses}`}
        onClick={handleClick}
        disabled={item.disabled}
        style={{ paddingLeft: collapsed ? undefined : `${12 + level * 16}px` }}
      >
        {content}
      </button>
    );

  if (collapsed && !hasChildren) {
    return (
      <Tooltip content={item.label} position="right">
        {menuItem}
      </Tooltip>
    );
  }

  return (
    <div>
      {menuItem}
      {hasChildren && !collapsed && expanded && (
        <div className="mt-1 space-y-1">
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
        </div>
      )}
    </div>
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
  className = '',
}: DashboardSidebarProps) {
  const sidebarWidth = collapsed ? collapsedWidth : width;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-900 ${className}`}
      style={{ width: sidebarWidth }}
    >
      {/* Header */}
      {header && (
        <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-4 dark:border-gray-700">
          {header}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          if (isMenuGroup(item)) {
            return (
              <div key={item.key} className="pt-4 first:pt-0">
                {!collapsed && (
                  <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {item.label}
                  </div>
                )}
                {collapsed && (
                  <div className="mx-auto mb-2 h-px w-8 bg-gray-200 dark:bg-gray-700" />
                )}
                <div className="space-y-1">
                  {item.items.map((menuItem) => (
                    <MenuItemComponent
                      key={menuItem.key}
                      item={menuItem}
                      collapsed={collapsed}
                      activeKey={activeKey}
                      onItemClick={onItemClick}
                    />
                  ))}
                </div>
              </div>
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
      </nav>

      {/* Footer */}
      {footer && (
        <div className="shrink-0 border-t border-gray-200 p-3 dark:border-gray-700">
          {footer}
        </div>
      )}

      {/* Collapse Button */}
      {onCollapse && (
        <button
          type="button"
          onClick={() => onCollapse(!collapsed)}
          className="flex h-10 items-center justify-center border-t border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`h-5 w-5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      )}
    </aside>
  );
}
