'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Tag,
  List,
  Typography,
  Descriptions,
  Divider,
  Flex,
  Timeline as AntTimeline,
  Image,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  HomeOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';
import { useRouter } from '@/i18n/routing';

const { Text, Title } = Typography;

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface OrderTimeline {
  status: string;
  date: Date;
  description: string;
  completed: boolean;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: string;
  timeline: OrderTimeline[];
}

const mockOrderDetails: Record<string, OrderDetail> = {
  '1': {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'delivered',
    items: [
      {
        id: 'item-1',
        name: 'Wireless Headphones',
        quantity: 1,
        price: 129.99,
        image: 'https://via.placeholder.com/80',
      },
      {
        id: 'item-2',
        name: 'Phone Case',
        quantity: 2,
        price: 29.99,
        image: 'https://via.placeholder.com/80',
      },
      {
        id: 'item-3',
        name: 'USB-C Cable',
        quantity: 3,
        price: 19.99,
        image: 'https://via.placeholder.com/80',
      },
    ],
    subtotal: 249.94,
    shipping: 10.0,
    tax: 40.05,
    total: 299.99,
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'New York, NY',
      country: 'United States',
      postalCode: '10001',
    },
    paymentMethod: 'Credit Card (**** 4242)',
    timeline: [
      {
        status: 'Order Placed',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        description: 'Your order has been placed successfully',
        completed: true,
      },
      {
        status: 'Processing',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        description: 'Your order is being prepared',
        completed: true,
      },
      {
        status: 'Shipped',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        description: 'Your order has been shipped',
        completed: true,
      },
      {
        status: 'Delivered',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        description: 'Your order has been delivered',
        completed: true,
      },
    ],
  },
  '2': {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'shipped',
    items: [
      {
        id: 'item-4',
        name: 'Laptop Stand',
        quantity: 1,
        price: 89.99,
        image: 'https://via.placeholder.com/80',
      },
      {
        id: 'item-5',
        name: 'Mouse Pad',
        quantity: 1,
        price: 24.99,
        image: 'https://via.placeholder.com/80',
      },
    ],
    subtotal: 114.98,
    shipping: 15.0,
    tax: 19.52,
    total: 149.5,
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'New York, NY',
      country: 'United States',
      postalCode: '10001',
    },
    paymentMethod: 'PayPal',
    timeline: [
      {
        status: 'Order Placed',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        description: 'Your order has been placed successfully',
        completed: true,
      },
      {
        status: 'Processing',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        description: 'Your order is being prepared',
        completed: true,
      },
      {
        status: 'Shipped',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        description: 'Your order has been shipped',
        completed: true,
      },
      {
        status: 'Delivered',
        date: new Date(),
        description: 'Expected delivery',
        completed: false,
      },
    ],
  },
};

const statusColors: Record<OrderDetail['status'], string> = {
  pending: 'orange',
  processing: 'blue',
  shipped: 'cyan',
  delivered: 'green',
  cancelled: 'red',
};

const timelineIcons: Record<string, React.ReactNode> = {
  'Order Placed': <ClockCircleOutlined />,
  Processing: <ClockCircleOutlined />,
  Shipped: <CarOutlined />,
  Delivered: <HomeOutlined />,
  Cancelled: <CloseCircleOutlined />,
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params['id'] as string;

  const order = useMemo(() => {
    return mockOrderDetails[orderId] || mockOrderDetails['1']!;
  }, [orderId])!;

  const timelineItems = order.timeline.map((item) => ({
    color: item.completed ? '#52c41a' : '#d9d9d9',
    dot: item.completed ? (
      <CheckCircleOutlined style={{ color: '#52c41a' }} />
    ) : (
      timelineIcons[item.status]
    ),
    children: (
      <div>
        <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
          <Text strong>{item.status}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {item.date.toLocaleString()}
          </Text>
        </Flex>
        <Text type="secondary">{item.description}</Text>
      </div>
    ),
  }));

  return (
    <>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed on ${order.date.toLocaleDateString()}`}
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Orders', href: '/member/orders' },
          { label: order.orderNumber },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/member/orders')}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            Back to Orders
          </Button>
        }
      />
      <PageContent>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <PageSection title="Order Timeline">
              <Card>
                <AntTimeline items={timelineItems} />
              </Card>
            </PageSection>

            <div style={{ marginTop: 24 }}>
              <PageSection title="Order Items">
                <Card>
                  <List
                    dataSource={order.items}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              style={{
                                objectFit: 'cover',
                                borderRadius: 8,
                              }}
                              fallback="https://via.placeholder.com/64"
                              preview={false}
                            />
                          }
                          title={<Text strong>{item.name}</Text>}
                          description={`Quantity: ${item.quantity}`}
                        />
                        <Text strong>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </List.Item>
                    )}
                  />
                </Card>
              </PageSection>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <PageSection title="Order Summary">
              <Card>
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: 12 }}
                >
                  <Text>Status</Text>
                  <Tag color={statusColors[order.status]}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Tag>
                </Flex>
                <Divider style={{ margin: '12px 0' }} />
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Subtotal">
                    ${order.subtotal.toFixed(2)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Shipping">
                    ${order.shipping.toFixed(2)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tax">
                    ${order.tax.toFixed(2)}
                  </Descriptions.Item>
                </Descriptions>
                <Divider style={{ margin: '12px 0' }} />
                <Flex justify="space-between" align="center">
                  <Title level={5} style={{ margin: 0 }}>
                    Total
                  </Title>
                  <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
                    ${order.total.toFixed(2)}
                  </Title>
                </Flex>
              </Card>
            </PageSection>

            <div style={{ marginTop: 24 }}>
              <PageSection title="Shipping Address">
                <Card>
                  <Text strong>{order.shippingAddress.name}</Text>
                  <br />
                  <Text type="secondary">{order.shippingAddress.address}</Text>
                  <br />
                  <Text type="secondary">{order.shippingAddress.city}</Text>
                  <br />
                  <Text type="secondary">{order.shippingAddress.country}</Text>
                  <br />
                  <Text type="secondary">
                    {order.shippingAddress.postalCode}
                  </Text>
                </Card>
              </PageSection>
            </div>

            <div style={{ marginTop: 24 }}>
              <PageSection title="Payment Method">
                <Card>
                  <Text>{order.paymentMethod}</Text>
                </Card>
              </PageSection>
            </div>

            <div style={{ marginTop: 24 }}>
              <Flex gap={12} vertical>
                <Button variant="outline" fullWidth>
                  Download Invoice
                </Button>
                <Button variant="outline" fullWidth>
                  Contact Support
                </Button>
              </Flex>
            </div>
          </Col>
        </Row>
      </PageContent>
    </>
  );
}
