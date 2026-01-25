'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { Typography, Row, Col, Button, Space, Alert } from 'antd';

import { useRouter } from '@/i18n/routing';
import { useUsers, useMe } from '@/hooks';

import {
  Badge,
  Card,
  Spinner,
  StatCard,
  Table,
  type TableColumn,
} from '@/components/ui';
import {
  MeDocument,
  UsersDocument,
  type UserType,
} from '@/graphql/generated/graphql';

const { Title, Paragraph, Text } = Typography;

// REST API response types (until OpenAPI generates proper types)
interface RestUserListResponse {
  items: Array<{
    id: string;
    email: string;
    name: string;
    isActive: boolean;
  }>;
  total: number;
  hasMore: boolean;
}

interface RestMeResponse {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
}

interface UserTableRow {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiType, setApiType] = useState<'graphql' | 'rest'>('graphql');

  // GraphQL queries
  const [usersResult] = useQuery({
    query: UsersDocument,
    variables: { limit: 10 },
    pause: status !== 'authenticated' || apiType !== 'graphql',
  });

  const [meResult] = useQuery({
    query: MeDocument,
    pause: status !== 'authenticated' || apiType !== 'graphql',
  });

  // REST API queries (TanStack Query)
  const restUsersQuery = useUsers({ limit: 10 });
  const restMeQuery = useMe();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Select data source based on API type
  const restData = restUsersQuery.data as RestUserListResponse | undefined;
  const users: Pick<UserType, 'id' | 'email' | 'name' | 'isActive'>[] =
    apiType === 'graphql'
      ? (usersResult.data?.users.items ?? [])
      : (restData?.items ?? []);
  const total =
    apiType === 'graphql'
      ? (usersResult.data?.users.total ?? 0)
      : (restData?.total ?? 0);
  const loading =
    apiType === 'graphql' ? usersResult.fetching : restUsersQuery.isLoading;
  const error =
    apiType === 'graphql'
      ? (usersResult.error?.message ?? null)
      : (restUsersQuery.error?.message ?? null);

  const restMeData = restMeQuery.data as RestMeResponse | undefined;
  const meData = apiType === 'graphql' ? meResult.data?.me : restMeData;

  const userName = session?.user?.name || session?.user?.email || '';

  const columns: TableColumn<UserTableRow>[] = [
    {
      key: 'id',
      title: t('tableId'),
      dataIndex: 'id',
    },
    {
      key: 'name',
      title: t('tableName'),
      dataIndex: 'name',
    },
    {
      key: 'email',
      title: t('tableEmail'),
      dataIndex: 'email',
      render: (value) => <Text type="secondary">{value as string}</Text>,
    },
    {
      key: 'status',
      title: t('tableStatus'),
      dataIndex: 'isActive',
      render: (_, record) => (
        <Badge variant={record.isActive ? 'success' : 'error'}>
          {record.isActive ? t('active') : t('inactive')}
        </Badge>
      ),
    },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>{t('title')}</Title>
        <Paragraph type="secondary">
          {t('welcome', { name: userName })}
        </Paragraph>
      </div>

      <Space style={{ marginBottom: 16 }} align="center">
        <Text type="secondary">{t('apiType')}</Text>
        <Button.Group>
          <Button
            type={apiType === 'graphql' ? 'primary' : 'default'}
            onClick={() => setApiType('graphql')}
          >
            GraphQL
          </Button>
          <Button
            type={apiType === 'rest' ? 'primary' : 'default'}
            onClick={() => setApiType('rest')}
          >
            REST
          </Button>
        </Button.Group>
        {apiType === 'graphql' ? (
          <Badge variant="success">{t('usingGraphQL')}</Badge>
        ) : (
          <Badge variant="primary">{t('usingREST')}</Badge>
        )}
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title={t('totalUsers')} value={total} />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title={t('yourEmail')}
            value={meData?.email ?? session?.user?.email}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title={t('status')}
            value={meData?.isActive ? t('active') : t('inactive')}
          />
        </Col>
      </Row>

      <Card
        title={apiType === 'graphql' ? t('usersViaGraphQL') : t('usersTitle')}
      >
        {loading ? (
          <div
            style={{ display: 'flex', justifyContent: 'center', padding: 32 }}
          >
            <Spinner />
          </div>
        ) : error ? (
          <Alert message={error} type="error" style={{ margin: 16 }} />
        ) : users.length === 0 ? (
          <Paragraph
            type="secondary"
            style={{ textAlign: 'center', padding: 32 }}
          >
            {t('noUsersFound')}
          </Paragraph>
        ) : (
          <Table<UserTableRow>
            columns={columns}
            data={users.map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              isActive: user.isActive,
            }))}
            rowKey="id"
          />
        )}
      </Card>
    </div>
  );
}
