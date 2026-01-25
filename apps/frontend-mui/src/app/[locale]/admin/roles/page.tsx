'use client';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShieldIcon from '@mui/icons-material/Shield';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

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
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Role
          </Button>
        }
      />
      <PageContent>
        <PageSection>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Users</TableCell>
                  <TableCell align="center">Permissions</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                          }}
                        >
                          <ShieldIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <span style={{ fontWeight: 500 }}>{role.name}</span>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {role.description}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={role.usersCount} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={role.permissions}
                        size="small"
                        color="info"
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {role.createdAt}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </PageSection>
      </PageContent>
    </>
  );
}
