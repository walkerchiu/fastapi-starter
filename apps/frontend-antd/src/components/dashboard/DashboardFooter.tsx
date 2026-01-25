import { type ReactNode } from 'react';
import Link from 'next/link';
import { Layout, Typography, Space } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

export interface DashboardFooterProps {
  children?: ReactNode;
  copyright?: string;
  links?: Array<{ label: string; href: string }>;
  className?: string;
}

export function DashboardFooter({
  children,
  copyright,
  links,
  className,
}: DashboardFooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} Company. All rights reserved.`;

  if (children) {
    return (
      <Footer
        className={className}
        style={{
          padding: '16px',
          background: '#fff',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        {children}
      </Footer>
    );
  }

  return (
    <Footer
      className={className}
      style={{
        padding: '16px',
        background: '#fff',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Text type="secondary">{copyright || defaultCopyright}</Text>
        {links && links.length > 0 && (
          <Space
            split={<span style={{ color: 'rgba(0, 0, 0, 0.25)' }}>|</span>}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: 'rgba(0, 0, 0, 0.45)', textDecoration: 'none' }}
              >
                {link.label}
              </Link>
            ))}
          </Space>
        )}
      </div>
    </Footer>
  );
}
