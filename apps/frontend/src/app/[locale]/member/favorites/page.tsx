'use client';

import { useState } from 'react';
import Link from 'next/link';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Badge, Button, Card, CardBody, Input, Select } from '@/components/ui';

interface FavoriteItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category: string;
  inStock: boolean;
  addedAt: string;
}

const mockFavorites: FavoriteItem[] = [
  {
    id: '1',
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium audio experience with active noise cancellation',
    price: 149.99,
    originalPrice: 199.99,
    category: 'Electronics',
    inStock: true,
    addedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Leather Messenger Bag',
    description: 'Handcrafted genuine leather bag for professionals',
    price: 89.99,
    category: 'Accessories',
    inStock: true,
    addedAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Smart Watch Pro',
    description: 'Advanced health tracking and notifications',
    price: 299.99,
    category: 'Electronics',
    inStock: false,
    addedAt: '2024-01-05',
  },
  {
    id: '4',
    name: 'Ergonomic Office Chair',
    description: 'Adjustable lumbar support for all-day comfort',
    price: 449.99,
    originalPrice: 599.99,
    category: 'Furniture',
    inStock: true,
    addedAt: '2024-01-01',
  },
  {
    id: '5',
    name: 'Portable Bluetooth Speaker',
    description: '360° sound with 20-hour battery life',
    price: 79.99,
    category: 'Electronics',
    inStock: true,
    addedAt: '2023-12-28',
  },
  {
    id: '6',
    name: 'Mechanical Keyboard',
    description: 'RGB backlit with customizable switches',
    price: 129.99,
    category: 'Electronics',
    inStock: true,
    addedAt: '2023-12-20',
  },
];

const categories = ['All', 'Electronics', 'Accessories', 'Furniture'];

export default function FavoritesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [favorites, setFavorites] = useState(mockFavorites);

  const filteredFavorites = favorites.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleRemove = (id: string) => {
    setFavorites(favorites.filter((item) => item.id !== id));
  };

  return (
    <>
      <PageHeader
        title="My Favorites"
        description="Items you've saved for later"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Favorites' },
        ]}
      />
      <PageContent>
        <PageSection>
          <Card>
            <CardBody>
              {/* Filters */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 gap-4">
                  <Input
                    placeholder="Search favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-40"
                    options={categories.map((cat) => ({
                      value: cat,
                      label: cat,
                    }))}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredFavorites.length} item
                  {filteredFavorites.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Favorites Grid */}
              {filteredFavorites.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredFavorites.map((item) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                    >
                      {/* Image Placeholder */}
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <svg
                            className="h-16 w-16"
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

                      {/* Sale Badge */}
                      {item.originalPrice && (
                        <div className="absolute left-2 top-2">
                          <Badge variant="error">Sale</Badge>
                        </div>
                      )}

                      {/* Stock Badge */}
                      {!item.inStock && (
                        <div className="absolute right-2 top-2">
                          <Badge variant="warning">Out of Stock</Badge>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4">
                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                          {item.category}
                        </div>
                        <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.name}
                        </h3>
                        <p className="mb-3 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                          {item.description}
                        </p>

                        {/* Price */}
                        <div className="mb-4 flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            ${item.price.toFixed(2)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through dark:text-gray-400">
                              ${item.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={!item.inStock}
                          >
                            {item.inStock ? 'Add to Cart' : 'Notify Me'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(item.id)}
                            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No favorites found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery || categoryFilter !== 'All'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start adding items to your favorites!'}
                  </p>
                  <div className="mt-6">
                    <Link href="/products">
                      <Button>Browse Products</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
