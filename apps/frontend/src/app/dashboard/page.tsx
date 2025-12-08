'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';

import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  StatCard,
} from '@/components/ui';
import {
  MeDocument,
  UsersDocument,
  type UserType,
} from '@/graphql/generated/graphql';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiType, setApiType] = useState<'graphql' | 'rest'>('graphql');

  const [usersResult] = useQuery({
    query: UsersDocument,
    variables: { limit: 10 },
    pause: status !== 'authenticated',
  });

  const [meResult] = useQuery({
    query: MeDocument,
    pause: status !== 'authenticated',
  });

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

  const users: Pick<UserType, 'id' | 'email' | 'name' | 'isActive'>[] =
    usersResult.data?.users.items ?? [];
  const total = usersResult.data?.users.total ?? 0;
  const loading = usersResult.fetching;
  const error = usersResult.error?.message ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {session?.user?.name || session?.user?.email}!
        </p>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">API Type:</span>
        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setApiType('graphql')}
            className={`rounded-l-md px-4 py-2 text-sm font-medium ${
              apiType === 'graphql'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            GraphQL
          </button>
          <button
            type="button"
            onClick={() => setApiType('rest')}
            className={`rounded-r-md px-4 py-2 text-sm font-medium ${
              apiType === 'rest'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-l-0 border-gray-300`}
          >
            REST
          </button>
        </div>
        {apiType === 'graphql' && (
          <Badge variant="success">Using urql + Strawberry</Badge>
        )}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Users" value={total} />
        <StatCard
          title="Your Email"
          value={meResult.data?.me?.email ?? session?.user?.email}
          valueClassName="truncate text-lg font-medium text-gray-900"
        />
        <StatCard
          title="Status"
          value={meResult.data?.me?.isActive ? 'Active' : 'Inactive'}
          valueClassName="text-lg font-medium text-green-600"
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">
            Users {apiType === 'graphql' && '(via GraphQL)'}
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-red-500">{error}</p>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                        {user.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant={user.isActive ? 'success' : 'error'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
