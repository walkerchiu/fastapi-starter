'use client';

import {
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

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const pendingOrders = [
  {
    id: '#1234',
    customer: 'John Doe',
    amount: '$299.00',
    items: 3,
    created: '2 hours ago',
  },
  {
    id: '#1237',
    customer: 'Alice Brown',
    amount: '$89.00',
    items: 1,
    created: '4 hours ago',
  },
  {
    id: '#1238',
    customer: 'Charlie Davis',
    amount: '$450.00',
    items: 5,
    created: '6 hours ago',
  },
];

export default function PendingOrdersPage() {
  return (
    <>
      <PageHeader
        title="Pending Orders"
        description="Orders awaiting processing"
        breadcrumbs={[
          { label: 'Console', href: '/console' },
          { label: 'Orders', href: '/console/orders' },
          { label: 'Pending' },
        ]}
        actions={
          <Button variant="contained" color="warning">
            Process All
          </Button>
        }
      />
      <PageContent>
        <PageSection>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Chip label={`${order.items} items`} size="small" />
                    </TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>{order.created}</TableCell>
                    <TableCell align="right">
                      <Button size="small" color="warning" sx={{ mr: 1 }}>
                        Process
                      </Button>
                      <Button size="small">View</Button>
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
