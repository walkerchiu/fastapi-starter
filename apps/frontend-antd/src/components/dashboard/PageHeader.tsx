import { type ReactNode } from 'react';
import Link from 'next/link';
import { Breadcrumb, Typography, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  backHref,
  onBack,
  className,
}: PageHeaderProps) {
  const showBack = backHref || onBack;

  const breadcrumbItems = breadcrumbs?.map((item) => ({
    key: item.label,
    title: item.href ? <Link href={item.href}>{item.label}</Link> : item.label,
  }));

  return (
    <div className={className} style={{ marginBottom: 24 }}>
      {/* Breadcrumbs */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
      )}

      {/* Header Content */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Back Button */}
          {showBack &&
            (backHref ? (
              <Link href={backHref}>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  aria-label="Go back"
                />
              </Link>
            ) : (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                aria-label="Go back"
              />
            ))}

          {/* Title and Description */}
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {title}
            </Title>
            {description && (
              <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
                {description}
              </Text>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && <Space>{actions}</Space>}
      </div>
    </div>
  );
}
