import { type ReactNode } from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';

export type DropdownMenuItem =
  | {
      type?: never;
      key: string;
      label: ReactNode;
      icon?: ReactNode;
      disabled?: boolean;
      danger?: boolean;
      onClick?: () => void;
    }
  | {
      type: 'divider';
      key?: string;
    };

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  placement?:
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight'
    | 'topLeft'
    | 'topCenter'
    | 'topRight';
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  placement = 'bottomRight',
  className,
}: DropdownMenuProps) {
  const menuItems: MenuProps['items'] = items.map((item, index) => {
    if (item.type === 'divider') {
      return { type: 'divider' as const, key: item.key ?? `divider-${index}` };
    }
    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
      disabled: item.disabled,
      danger: item.danger,
      onClick: item.onClick,
    };
  });

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement={placement}
      trigger={['click']}
      className={className}
    >
      <span style={{ cursor: 'pointer' }}>{trigger}</span>
    </Dropdown>
  );
}
