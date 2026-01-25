'use client';

import {
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

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';

const orders = [
  {
    id: '#1234',
    customer: 'John Doe',
    amount: '$299.00',
    status: 'Pending',
    date: '2024-01-15',
  },
  {
    id: '#1235',
    customer: 'Jane Smith',
    amount: '$149.00',
    status: 'Processing',
    date: '2024-01-15',
  },
  {
    id: '#1236',
    customer: 'Bob Wilson',
    amount: '$599.00',
    status: 'Completed',
    date: '2024-01-14',
  },
  {
    id: '#1237',
    customer: 'Alice Brown',
    amount: '$89.00',
    status: 'Pending',
    date: '2024-01-14',
  },
];

export default function OrdersPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
      case 'Completed':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <>
      <PageHeader
        title="All Orders"
        description="View and manage all orders"
        breadcrumbs={[
          { label: 'Console', href: '/console' },
          { label: 'Order Management', href: '/console/orders' },
          { label: 'All Orders' },
        ]}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined">Export</Button>
            <Button variant="contained" color="warning">
              New Order
            </Button>
          </Box>
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
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={
                          getStatusColor(order.status) as
                            | 'warning'
                            | 'info'
                            | 'success'
                            | 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell align="right">
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
