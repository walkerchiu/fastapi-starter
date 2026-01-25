'use client';

import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Link } from '@/i18n/routing';

export function Navbar() {
  const t = useTranslations('nav');
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          component={Link}
          href="/"
          variant="h6"
          color="primary"
          sx={{
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          {t('home')}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LanguageSwitcher />
          <ThemeToggle />

          {isLoading ? (
            <Skeleton variant="rectangular" width={80} height={32} />
          ) : session ? (
            <>
              <Button
                component={Link}
                href="/dashboard"
                color="inherit"
                size="small"
              >
                {t('dashboard')}
              </Button>
              <Button
                component={Link}
                href="/profile"
                color="inherit"
                size="small"
              >
                {t('profile')}
              </Button>
              <Typography variant="body2" color="text.secondary">
                {session.user?.name || session.user?.email}
              </Typography>
              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                variant="outlined"
                size="small"
              >
                {t('signOut')}
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                href="/login"
                color="inherit"
                size="small"
              >
                {t('signIn')}
              </Button>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="small"
              >
                {t('signUp')}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
