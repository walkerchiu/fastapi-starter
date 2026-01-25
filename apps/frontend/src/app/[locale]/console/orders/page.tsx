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
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
      case 'Completed':
        return 'success';
      default:
        return 'neutral';
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
          <div className="flex gap-2">
            <Button variant="outline">Export</Button>
            <Button variant="primary">New Order</Button>
          </div>
        }
      />
      <PageContent>
        <PageSection>
          <Card>
            <CardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            getStatusVariant(order.status) as
                              | 'warning'
                              | 'info'
                              | 'success'
                              | 'neutral'
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400">
                        {order.date}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
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
