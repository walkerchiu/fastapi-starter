'use client';

import BlockIcon from '@mui/icons-material/Block';
import { Box, Container, Paper, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Button, Spinner } from '@/components/ui';

function UnauthorizedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptedPath = searchParams.get('from');

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
            }}
          >
            <BlockIcon sx={{ fontSize: 32, color: 'error.main' }} />
          </Box>

          <Typography
            variant="h4"
            fontWeight="bold"
            color="text.primary"
            sx={{ mt: 3 }}
          >
            Access Denied
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You do not have permission to access this page.
          </Typography>

          {attemptedPath && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block' }}
            >
              Attempted to access:{' '}
              <Box
                component="code"
                sx={{
                  bgcolor: 'action.hover',
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 0.5,
                  fontFamily: 'monospace',
                }}
              >
                {attemptedPath}
              </Box>
            </Typography>
          )}

          <Box
            sx={{
              mt: 4,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              justifyContent: 'center',
            }}
          >
            <Button variant="secondary" onClick={handleGoBack}>
              Go Back
            </Button>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button>Go to Home</Button>
            </Link>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            If you believe this is an error, please contact your administrator.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner />
        </Box>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
