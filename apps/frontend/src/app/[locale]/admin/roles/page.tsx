'use client';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';

const roles = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full access to all system features',
    usersCount: 2,
    permissions: 20,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Administrative access with limited system settings',
    usersCount: 5,
    permissions: 15,
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Editor',
    description: 'Can create and edit content',
    usersCount: 12,
    permissions: 8,
    createdAt: '2024-01-15',
  },
  {
    id: '4',
    name: 'User',
    description: 'Basic access to the system',
    usersCount: 156,
    permissions: 3,
    createdAt: '2024-01-01',
  },
];

export default function RolesPage() {
  return (
    <>
      <PageHeader
        title="Roles"
        description="Manage user roles and their permissions"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'User Management', href: '/admin/users' },
          { label: 'Roles' },
        ]}
        actions={
          <Button variant="primary">
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Role
          </Button>
        }
      />
      <PageContent>
        <PageSection>
          <Card>
            <CardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Users</TableHead>
                    <TableHead className="text-center">Permissions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium">{role.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400">
                        {role.description}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="neutral">{role.usersCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="info">{role.permissions}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400">
                        {role.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
