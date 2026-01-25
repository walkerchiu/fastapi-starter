'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import {
  PageHeader,
  PageContent,
  PageSection,
  EmptyState,
} from '@/components/dashboard';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-01-20',
    status: 'delivered',
    total: 299.99,
    items: 3,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-01-18',
    status: 'shipped',
    total: 149.5,
    items: 2,
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    date: '2024-01-15',
    status: 'processing',
    total: 89.99,
    items: 1,
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    date: '2024-01-10',
    status: 'pending',
    total: 199.0,
    items: 4,
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    date: '2024-01-05',
    status: 'cancelled',
    total: 59.99,
    items: 1,
  },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'warning' as const },
  processing: { label: 'Processing', color: 'info' as const },
  shipped: { label: 'Shipped', color: 'info' as const },
  delivered: { label: 'Delivered', color: 'success' as const },
  cancelled: { label: 'Cancelled', color: 'error' as const },
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = order.orderNumber
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        title="My Orders"
        description="View and track your orders"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Orders' },
        ]}
      />
      <PageContent>
        <PageSection>
          <Card>
            <CardContent>
              <Box
                sx={{
                  mb: 3,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: { sm: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                  <TextField
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    sx={{ maxWidth: 300 }}
                  />
                  <TextField
                    select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </TextField>
                </Box>
              </Box>

              {filteredOrders.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          hover
                          sx={{ '&:last-child td': { borderBottom: 0 } }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            {new Date(order.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={statusConfig[order.status].label}
                              color={statusConfig[order.status].color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {order.items} item{order.items > 1 ? 's' : ''}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            ${order.total.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <Link href={`/member/orders/${order.id}`}>
                              <Button size="small" variant="text">
                                View Details
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <EmptyState
                  icon={<ReceiptLongIcon />}
                  title="No orders found"
                  description="Try adjusting your search or filter criteria."
                />
              )}
            </CardContent>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
