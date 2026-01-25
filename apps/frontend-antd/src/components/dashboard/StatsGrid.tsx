'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { Card, Statistic, Row, Col, Skeleton, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

export interface StatItem {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  href?: string;
}

export interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  className?: string;
}

function StatCard({ stat }: { stat: StatItem }) {
  const changeColor = stat.change?.trend === 'up' ? '#52c41a' : '#f5222d';
  const ChangeIcon =
    stat.change?.trend === 'up' ? ArrowUpOutlined : ArrowDownOutlined;

  const content = (
    <Card
      hoverable={!!stat.href}
      styles={{
        body: { padding: 24 },
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1 }}>
          <Statistic
            title={stat.title}
            value={stat.value}
            valueStyle={{ fontSize: 28, fontWeight: 600 }}
          />
          {stat.change && (
            <Space size={4} style={{ marginTop: 8 }}>
              <span
                style={{ color: changeColor, fontWeight: 500, fontSize: 14 }}
              >
                {stat.change.trend === 'up' ? '+' : '-'}
                {Math.abs(stat.change.value)}%
              </span>
              <ChangeIcon style={{ color: changeColor, fontSize: 14 }} />
            </Space>
          )}
        </div>
        {stat.icon && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: 'rgba(24, 144, 255, 0.1)',
              color: '#1890ff',
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            {stat.icon}
          </div>
        )}
      </div>
    </Card>
  );

  if (stat.href) {
    return <Link href={stat.href}>{content}</Link>;
  }

  return content;
}

function StatCardSkeleton() {
  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1 }}>
          <Skeleton.Input
            active
            size="small"
            style={{ width: 100, marginBottom: 8 }}
          />
          <Skeleton.Input active size="large" style={{ width: 80 }} />
          <Skeleton.Input
            active
            size="small"
            style={{ width: 60, marginTop: 8 }}
          />
        </div>
        <Skeleton.Avatar active shape="square" size={48} />
      </div>
    </Card>
  );
}

export function StatsGrid({
  stats,
  columns = 4,
  loading = false,
  className,
}: StatsGridProps) {
  const span = 24 / columns;

  if (loading) {
    return (
      <Row gutter={[16, 16]} className={className}>
        {Array.from({ length: columns }).map((_, index) => (
          <Col key={index} xs={24} sm={12} lg={span}>
            <StatCardSkeleton />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]} className={className}>
      {stats.map((stat, index) => (
        <Col key={stat.title + index} xs={24} sm={12} lg={span}>
          <StatCard stat={stat} />
        </Col>
      ))}
    </Row>
  );
}
