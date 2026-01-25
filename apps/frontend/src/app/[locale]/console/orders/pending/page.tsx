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
          <Button
            variant="primary"
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            Process All
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
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        <Badge variant="neutral">{order.items} items</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.amount}
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400">
                        {order.created}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2 border-amber-600 text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-500 dark:hover:bg-amber-900/20"
                        >
                          Process
                        </Button>
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
