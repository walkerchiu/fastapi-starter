'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import CreditCardIcon from '@mui/icons-material/CreditCard';

import {
  PageHeader,
  PageContent,
  PageSection,
  Timeline,
} from '@/components/dashboard';

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
  pending: { label: 'Pending', color: 'warning' as const },
  processing: { label: 'Processing', color: 'info' as const },
  shipped: { label: 'Shipped', color: 'info' as const },
  delivered: { label: 'Delivered', color: 'success' as const },
  cancelled: { label: 'Cancelled', color: 'error' as const },
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

  const timelineItems = order.timeline.map((event) => ({
    id: event.id,
    title: event.description,
    timestamp: event.date,
    status: 'success' as const,
    icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
  }));

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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Link href="/member/orders">
              <Button variant="outlined">Back to Orders</Button>
            </Link>
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Button variant="outlined" color="error">
                Cancel Order
              </Button>
            )}
          </Box>
        }
      />
      <PageContent>
        <Grid container spacing={3}>
          {/* Order Items and Timeline */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Order Status */}
              <PageSection title="Order Status">
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 3,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Current Status
                        </Typography>
                        <Chip
                          label={statusConfig[order.status].label}
                          color={statusConfig[order.status].color}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>

                    {/* Timeline */}
                    <Timeline items={timelineItems} />
                  </CardContent>
                </Card>
              </PageSection>

              {/* Order Items */}
              <PageSection title="Order Items">
                <Card>
                  <List disablePadding>
                    {order.items.map((item, index) => (
                      <Box key={item.id}>
                        <ListItem sx={{ py: 2 }}>
                          <ListItemAvatar>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 64,
                                height: 64,
                                bgcolor: 'grey.100',
                                color: 'grey.400',
                              }}
                            >
                              <ImageIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            sx={{ ml: 2 }}
                            primary={
                              <Typography fontWeight="medium">
                                {item.name}
                              </Typography>
                            }
                            secondary={`Qty: ${item.quantity} × $${item.price.toFixed(2)}`}
                          />
                          <Typography fontWeight="medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </ListItem>
                        {index < order.items.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </Card>
              </PageSection>
            </Box>
          </Grid>

          {/* Order Summary and Details */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Order Summary */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Subtotal
                      </Typography>
                      <Typography variant="body2">
                        ${order.subtotal.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Shipping
                      </Typography>
                      <Typography variant="body2">
                        ${order.shipping.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Tax
                      </Typography>
                      <Typography variant="body2">
                        ${order.tax.toFixed(2)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography fontWeight="medium">Total</Typography>
                      <Typography fontWeight="medium">
                        ${order.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Shipping Address
                  </Typography>
                  <Box
                    component="address"
                    sx={{ fontStyle: 'normal', color: 'text.secondary' }}
                  >
                    <Typography fontWeight="medium" color="text.primary">
                      {order.shippingAddress.name}
                    </Typography>
                    <Typography variant="body2">
                      {order.shippingAddress.address}
                    </Typography>
                    <Typography variant="body2">
                      {order.shippingAddress.city},{' '}
                      {order.shippingAddress.postalCode}
                    </Typography>
                    <Typography variant="body2">
                      {order.shippingAddress.country}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment Method
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCardIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {order.paymentMethod.type} ending in{' '}
                      {order.paymentMethod.last4}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </PageContent>
    </>
  );
}
