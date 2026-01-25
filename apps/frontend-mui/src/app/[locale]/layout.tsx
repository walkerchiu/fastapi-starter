import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';

import { Navbar } from '@/components/nav/navbar';
import { GraphQLProvider } from '@/components/providers/graphql-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { SessionProvider } from '@/components/providers/session-provider';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SessionProvider>
        <QueryProvider>
          <GraphQLProvider>
            <Navbar />
            <Box component="main">{children}</Box>
          </GraphQLProvider>
        </QueryProvider>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
