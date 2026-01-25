'use client';

import { useState } from 'react';
import Link from 'next/link';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Badge, Button, Card, CardBody, Input, Select } from '@/components/ui';

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
  pending: { label: 'Pending', variant: 'warning' as const },
  processing: { label: 'Processing', variant: 'info' as const },
  shipped: { label: 'Shipped', variant: 'info' as const },
  delivered: { label: 'Delivered', variant: 'success' as const },
  cancelled: { label: 'Cancelled', variant: 'error' as const },
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
            <CardBody>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 gap-4">
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-40"
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'processing', label: 'Processing' },
                      { value: 'shipped', label: 'Shipped' },
                      { value: 'delivered', label: 'Delivered' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Order
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Items
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {order.orderNumber}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <Badge variant={statusConfig[order.status].variant}>
                            {statusConfig[order.status].label}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {order.items} item{order.items > 1 ? 's' : ''}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <Link href={`/member/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredOrders.length === 0 && (
                  <div className="py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No orders found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
