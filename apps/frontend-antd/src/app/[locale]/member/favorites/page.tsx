'use client';

import { useState, useMemo } from 'react';
import { Card, Row, Col, Typography, Image, Empty, Flex, Modal } from 'antd';
import {
  HeartFilled,
  ShoppingCartOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const { Text, Title } = Typography;
const { confirm } = Modal;

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  addedAt: Date;
}

const mockFavorites: FavoriteProduct[] = [
  {
    id: '1',
    name: 'Wireless Noise-Canceling Headphones',
    price: 249.99,
    originalPrice: 299.99,
    image: 'https://via.placeholder.com/200',
    category: 'Electronics',
    inStock: true,
    rating: 4.8,
    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    name: 'Premium Leather Wallet',
    price: 89.99,
    image: 'https://via.placeholder.com/200',
    category: 'Accessories',
    inStock: true,
    rating: 4.5,
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    price: 199.99,
    originalPrice: 249.99,
    image: 'https://via.placeholder.com/200',
    category: 'Electronics',
    inStock: false,
    rating: 4.6,
    addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    name: 'Portable Bluetooth Speaker',
    price: 79.99,
    image: 'https://via.placeholder.com/200',
    category: 'Electronics',
    inStock: true,
    rating: 4.3,
    addedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    name: 'Organic Cotton T-Shirt',
    price: 34.99,
    image: 'https://via.placeholder.com/200',
    category: 'Clothing',
    inStock: true,
    rating: 4.7,
    addedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: '6',
    name: 'Stainless Steel Water Bottle',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://via.placeholder.com/200',
    category: 'Lifestyle',
    inStock: true,
    rating: 4.9,
    addedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>(mockFavorites);

  const stats = useMemo(() => {
    return {
      total: favorites.length,
      inStock: favorites.filter((f) => f.inStock).length,
      onSale: favorites.filter((f) => f.originalPrice).length,
    };
  }, [favorites]);

  const handleRemoveFavorite = (productId: string) => {
    confirm({
      title: 'Remove from Favorites?',
      icon: <ExclamationCircleOutlined />,
      content: 'This item will be removed from your favorites list.',
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setFavorites((prev) => prev.filter((f) => f.id !== productId));
      },
    });
  };

  const handleAddToCart = (product: FavoriteProduct) => {
    console.log('Adding to cart:', product.name);
    // TODO: Implement add to cart functionality
  };

  return (
    <>
      <PageHeader
        title="My Favorites"
        description="Products you've saved for later"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Favorites' },
        ]}
      />
      <PageContent>
        <PageSection title="Summary">
          <Row gutter={[16, 16]}>
            <Col xs={8}>
              <Card size="small">
                <Text type="secondary">Total Items</Text>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}
                >
                  {stats.total}
                </div>
              </Card>
            </Col>
            <Col xs={8}>
              <Card size="small">
                <Text type="secondary">In Stock</Text>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}
                >
                  {stats.inStock}
                </div>
              </Card>
            </Col>
            <Col xs={8}>
              <Card size="small">
                <Text type="secondary">On Sale</Text>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: '#fa541c' }}
                >
                  {stats.onSale}
                </div>
              </Card>
            </Col>
          </Row>
        </PageSection>

        <PageSection title="Saved Items">
          {favorites.length === 0 ? (
            <Card>
              <Empty
                image={
                  <HeartFilled style={{ fontSize: 64, color: '#d9d9d9' }} />
                }
                description={
                  <div>
                    <Title level={5} style={{ marginBottom: 8 }}>
                      No favorites yet
                    </Title>
                    <Text type="secondary">
                      Start adding products to your favorites list
                    </Text>
                  </div>
                }
              >
                <Button variant="primary">Browse Products</Button>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {favorites.map((product) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ position: 'relative' }}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          style={{
                            height: 200,
                            objectFit: 'cover',
                          }}
                          fallback="https://via.placeholder.com/200"
                          preview={false}
                        />
                        {product.originalPrice && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                            }}
                          >
                            <Badge variant="error">
                              {Math.round(
                                ((product.originalPrice - product.price) /
                                  product.originalPrice) *
                                  100,
                              )}
                              % OFF
                            </Badge>
                          </div>
                        )}
                        {!product.inStock && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text style={{ color: 'white', fontWeight: 600 }}>
                              Out of Stock
                            </Text>
                          </div>
                        )}
                      </div>
                    }
                    actions={[
                      <Button
                        key="cart"
                        variant="ghost"
                        size="sm"
                        disabled={!product.inStock}
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCartOutlined />
                      </Button>,
                      <Button
                        key="remove"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite(product.id)}
                      >
                        <DeleteOutlined style={{ color: '#ff4d4f' }} />
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Text
                          ellipsis={{ tooltip: product.name }}
                          style={{ fontSize: 14 }}
                        >
                          {product.name}
                        </Text>
                      }
                      description={
                        <Flex vertical gap={4}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {product.category}
                          </Text>
                          <Flex align="center" gap={8}>
                            <Text
                              strong
                              style={{ color: '#1890ff', fontSize: 16 }}
                            >
                              ${product.price.toFixed(2)}
                            </Text>
                            {product.originalPrice && (
                              <Text
                                delete
                                type="secondary"
                                style={{ fontSize: 12 }}
                              >
                                ${product.originalPrice.toFixed(2)}
                              </Text>
                            )}
                          </Flex>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Added {product.addedAt.toLocaleDateString()}
                          </Text>
                        </Flex>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </PageSection>
      </PageContent>
    </>
  );
}
