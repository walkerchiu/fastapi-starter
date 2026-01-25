'use client';

import { use } from 'react';
import Link from 'next/link';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Badge, Button, Card, CardBody, CardHeader } from '@/components/ui';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderTimeline {
  id: string;
  status: string;
  date: string;
  description: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItem[];
  timeline: OrderTimeline[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: {
    type: string;
    last4: string;
  };
}

const mockOrder: OrderDetail = {
  id: '1',
  orderNumber: 'ORD-2024-001',
  date: '2024-01-20',
  status: 'delivered',
  subtotal: 279.99,
  shipping: 10.0,
  tax: 10.0,
  total: 299.99,
  items: [
    { id: '1', name: 'Wireless Headphones', quantity: 1, price: 149.99 },
    { id: '2', name: 'Phone Case', quantity: 2, price: 29.99 },
    { id: '3', name: 'USB-C Cable', quantity: 3, price: 19.99 },
  ],
  timeline: [
    {
      id: '1',
      status: 'ordered',
      date: '2024-01-20 10:00',
      description: 'Order placed',
    },
    {
      id: '2',
      status: 'confirmed',
      date: '2024-01-20 10:15',
      description: 'Order confirmed',
    },
    {
      id: '3',
      status: 'processing',
      date: '2024-01-20 14:00',
      description: 'Order is being processed',
    },
    {
      id: '4',
      status: 'shipped',
      date: '2024-01-21 09:00',
      description: 'Order shipped via Express Delivery',
    },
    {
      id: '5',
      status: 'delivered',
      date: '2024-01-23 14:30',
      description: 'Order delivered',
    },
  ],
  shippingAddress: {
    name: 'John Doe',
    address: '123 Main Street',
    city: 'New York',
    postalCode: '10001',
    country: 'United States',
  },
  paymentMethod: {
    type: 'Credit Card',
    last4: '4242',
  },
};

const statusConfig = {
  pending: { label: 'Pending', variant: 'warning' as const },
  processing: { label: 'Processing', variant: 'info' as const },
  shipped: { label: 'Shipped', variant: 'info' as const },
  delivered: { label: 'Delivered', variant: 'success' as const },
  cancelled: { label: 'Cancelled', variant: 'error' as const },
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // In real app, fetch order by id using: useOrder(id)
  console.log('Order ID:', id);
  const order = mockOrder;

  return (
    <>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed on ${new Date(order.date).toLocaleDateString()}`}
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Orders', href: '/member/orders' },
          { label: order.orderNumber },
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/member/orders">
              <Button variant="outline">Back to Orders</Button>
            </Link>
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Cancel Order
              </Button>
            )}
          </div>
        }
      />
      <PageContent>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items and Timeline */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Status */}
            <PageSection title="Order Status">
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Current Status
                      </p>
                      <Badge
                        variant={statusConfig[order.status].variant}
                        className="mt-1"
                      >
                        {statusConfig[order.status].label}
                      </Badge>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-6">
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {order.timeline.map((event, eventIdx) => (
                          <li key={event.id}>
                            <div className="relative pb-8">
                              {eventIdx !== order.timeline.length - 1 ? (
                                <span
                                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                                  aria-hidden="true"
                                />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-900">
                                    <svg
                                      className="h-4 w-4 text-primary-600 dark:text-primary-400"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                  <div>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                      {event.description}
                                    </p>
                                  </div>
                                  <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                                    {event.date}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </PageSection>

            {/* Order Items */}
            <PageSection title="Order Items">
              <Card>
                <CardBody className="p-0">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex px-6 py-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <svg
                              className="h-8 w-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div className="flex justify-between text-base font-medium text-gray-900 dark:text-gray-100">
                            <h3>{item.name}</h3>
                            <p className="ml-4">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </PageSection>
          </div>

          {/* Order Summary and Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Order Summary
                </h3>
              </CardHeader>
              <CardBody className="pt-0">
                <dl className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500 dark:text-gray-400">
                      Subtotal
                    </dt>
                    <dd className="text-gray-900 dark:text-gray-100">
                      ${order.subtotal.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500 dark:text-gray-400">
                      Shipping
                    </dt>
                    <dd className="text-gray-900 dark:text-gray-100">
                      ${order.shipping.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500 dark:text-gray-400">Tax</dt>
                    <dd className="text-gray-900 dark:text-gray-100">
                      ${order.tax.toFixed(2)}
                    </dd>
                  </div>
                  <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                    <div className="flex justify-between text-base font-medium">
                      <dt className="text-gray-900 dark:text-gray-100">
                        Total
                      </dt>
                      <dd className="text-gray-900 dark:text-gray-100">
                        ${order.total.toFixed(2)}
                      </dd>
                    </div>
                  </div>
                </dl>
              </CardBody>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Shipping Address
                </h3>
              </CardHeader>
              <CardBody className="pt-0">
                <address className="not-italic text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {order.shippingAddress.name}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </address>
              </CardBody>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Payment Method
                </h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>
                    {order.paymentMethod.type} ending in{' '}
                    {order.paymentMethod.last4}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </PageContent>
    </>
  );
}
