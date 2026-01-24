'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';

import { useRouter } from '@/i18n/routing';
import { useUsers, useMe } from '@/hooks';

import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  MeDocument,
  UsersDocument,
  type User,
} from '@/graphql/generated/graphql';

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
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Select data source based on API type
  const restData = restUsersQuery.data as RestUserListResponse | undefined;
  const users: Pick<User, 'id' | 'email' | 'name' | 'isActive'>[] =
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('welcome', { name: userName })}
        </p>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('apiType')}
        </span>
        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setApiType('graphql')}
            className={`rounded-l-md px-4 py-2 text-sm font-medium ${
              apiType === 'graphql'
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            } border border-gray-300 dark:border-gray-600`}
          >
            GraphQL
          </button>
          <button
            type="button"
            onClick={() => setApiType('rest')}
            className={`rounded-r-md px-4 py-2 text-sm font-medium ${
              apiType === 'rest'
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            } border border-l-0 border-gray-300 dark:border-gray-600`}
          >
            REST
          </button>
        </div>
        {apiType === 'graphql' ? (
          <Badge variant="success">{t('usingGraphQL')}</Badge>
        ) : (
          <Badge variant="info">{t('usingREST')}</Badge>
        )}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title={t('totalUsers')} value={total} />
        <StatCard
          title={t('yourEmail')}
          value={meData?.email ?? session?.user?.email}
          valueClassName="truncate text-lg font-medium text-gray-900 dark:text-gray-100"
        />
        <StatCard
          title={t('status')}
          value={meData?.isActive ? t('active') : t('inactive')}
          valueClassName="text-lg font-medium text-green-600 dark:text-green-400"
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {apiType === 'graphql' ? t('usersViaGraphQL') : t('usersTitle')}
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-red-500 dark:text-red-400">
              {error}
            </p>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              {t('noUsersFound')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tableId')}</TableHead>
                  <TableHead>{t('tableName')}</TableHead>
                  <TableHead>{t('tableEmail')}</TableHead>
                  <TableHead>{t('tableStatus')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'success' : 'error'}>
                        {user.isActive ? t('active') : t('inactive')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
