'use client';

import { useState, type ReactNode, type FormEvent } from 'react';
import { Layout, Input, Button } from 'antd';
import { MenuOutlined, SearchOutlined } from '@ant-design/icons';

const { Header } = Layout;

export interface DashboardHeaderProps {
  logo?: ReactNode;
  title?: string;
  showMenuToggle?: boolean;
  onMenuToggle?: () => void;
  actions?: ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  sticky?: boolean;
  className?: string;
}

export function DashboardHeader({
  logo,
  title,
  showMenuToggle = true,
  onMenuToggle,
  actions,
  searchPlaceholder = 'Search...',
  onSearch,
  showSearch = false,
  sticky = true,
  className,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <Header
      className={className}
      style={{
        position: sticky ? 'sticky' : 'relative',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: '#fff',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        height: 64,
      }}
    >
      {/* Left section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {showMenuToggle && onMenuToggle && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          />
        )}

        {logo && (
          <div style={{ display: 'flex', alignItems: 'center' }}>{logo}</div>
        )}

        {title && (
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h1>
        )}
      </div>

      {/* Center section - Search */}
      {showSearch && (
        <form
          onSubmit={handleSearchSubmit}
          style={{
            flex: 1,
            maxWidth: 400,
            margin: '0 32px',
            display: 'none',
          }}
          className="md-show"
        >
          <Input
            prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: '100%' }}
          />
          <style jsx global>{`
            @media (min-width: 768px) {
              .md-show {
                display: block !important;
              }
            }
          `}</style>
        </form>
      )}

      {/* Right section - Actions */}
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {actions}
        </div>
      )}
    </Header>
  );
}
