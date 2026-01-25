'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImageIcon from '@mui/icons-material/Image';
import FavoriteIcon from '@mui/icons-material/Favorite';

import {
  PageHeader,
  PageContent,
  PageSection,
  EmptyState,
} from '@/components/dashboard';

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
            <CardContent>
              {/* Filters */}
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
                    placeholder="Search favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    sx={{ maxWidth: 300 }}
                  />
                  <TextField
                    select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {filteredFavorites.length} item
                  {filteredFavorites.length !== 1 ? 's' : ''}
                </Typography>
              </Box>

              {/* Favorites Grid */}
              {filteredFavorites.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredFavorites.map((item) => (
                    <Grid item xs={12} sm={6} lg={4} key={item.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          transition: 'box-shadow 0.2s',
                          '&:hover': { boxShadow: 4 },
                        }}
                      >
                        {/* Image Placeholder */}
                        <Box
                          sx={{
                            aspectRatio: '1',
                            bgcolor: 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 64, color: 'grey.400' }} />

                          {/* Sale Badge */}
                          {item.originalPrice && (
                            <Chip
                              label="Sale"
                              color="error"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                              }}
                            />
                          )}

                          {/* Out of Stock Badge */}
                          {!item.inStock && (
                            <Chip
                              label="Out of Stock"
                              color="warning"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                              }}
                            />
                          )}
                        </Box>

                        {/* Content */}
                        <CardContent sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            gutterBottom
                          >
                            {item.category}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            fontWeight="medium"
                            gutterBottom
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {item.description}
                          </Typography>

                          {/* Price */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 2,
                            }}
                          >
                            <Typography variant="h6" fontWeight="bold">
                              ${item.price.toFixed(2)}
                            </Typography>
                            {item.originalPrice && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textDecoration: 'line-through' }}
                              >
                                ${item.originalPrice.toFixed(2)}
                              </Typography>
                            )}
                          </Box>

                          {/* Actions */}
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              size="small"
                              fullWidth
                              disabled={!item.inStock}
                            >
                              {item.inStock ? 'Add to Cart' : 'Notify Me'}
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => handleRemove(item.id)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyState
                  icon={<FavoriteIcon />}
                  title="No favorites found"
                  description={
                    searchQuery || categoryFilter !== 'All'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start adding items to your favorites!'
                  }
                  action={
                    <Link href="/products">
                      <Button variant="contained">Browse Products</Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>
        </PageSection>
      </PageContent>
    </>
  );
}
