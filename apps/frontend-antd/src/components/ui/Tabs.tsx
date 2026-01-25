import { type ReactNode } from 'react';
import { Tabs as AntTabs } from 'antd';

export interface TabItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  type?: 'line' | 'card' | 'editable-card';
  size?: 'small' | 'middle' | 'large';
  centered?: boolean;
  className?: string;
}

export function Tabs({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  type = 'line',
  size = 'middle',
  centered = false,
  className,
}: TabsProps) {
  const tabItems = items.map((item) => ({
    key: item.key,
    label: item.label,
    children: item.children,
    disabled: item.disabled,
    icon: item.icon,
  }));

  return (
    <AntTabs
      items={tabItems}
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      onChange={onChange}
      type={type}
      size={size}
      centered={centered}
      className={className}
    />
  );
}
