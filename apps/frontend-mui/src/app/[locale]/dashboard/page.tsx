'use client';

import {
  Box,
  ButtonGroup,
  Container,
  Button as MuiButton,
  Typography,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useQuery } from 'urql';

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
import { useRouter } from '@/i18n/routing';
import { useUsers, useMe } from '@/hooks';

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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner />
      </Box>
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {t('welcome', { name: userName })}
        </Typography>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" fontWeight="medium" color="text.secondary">
          {t('apiType')}
        </Typography>
        <ButtonGroup size="small" variant="outlined">
          <MuiButton
            onClick={() => setApiType('graphql')}
            variant={apiType === 'graphql' ? 'contained' : 'outlined'}
          >
            GraphQL
          </MuiButton>
          <MuiButton
            onClick={() => setApiType('rest')}
            variant={apiType === 'rest' ? 'contained' : 'outlined'}
          >
            REST
          </MuiButton>
        </ButtonGroup>
        {apiType === 'graphql' ? (
          <Badge variant="success">{t('usingGraphQL')}</Badge>
        ) : (
          <Badge variant="info">{t('usingREST')}</Badge>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard title={t('totalUsers')} value={total} />
        <StatCard
          title={t('yourEmail')}
          value={meData?.email ?? session?.user?.email}
        />
        <StatCard
          title={t('status')}
          value={meData?.isActive ? t('active') : t('inactive')}
        />
      </Box>

      <Card>
        <CardHeader>
          <Typography variant="h6" color="text.primary">
            {apiType === 'graphql' ? t('usersViaGraphQL') : t('usersTitle')}
          </Typography>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Spinner />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
              {error}
            </Typography>
          ) : users.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{ textAlign: 'center', py: 4 }}
            >
              {t('noUsersFound')}
            </Typography>
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
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
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
    </Container>
  );
}
