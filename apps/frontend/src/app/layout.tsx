import type { Metadata } from 'next';
import { Navbar } from '@/components/nav/navbar';
import { GraphQLProvider } from '@/components/providers/graphql-provider';
import { SessionProvider } from '@/components/providers/session-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'FastAPI NextJS Starter',
  description: 'A monorepo starter with FastAPI and Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <GraphQLProvider>
            <Navbar />
            <main>{children}</main>
          </GraphQLProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
