import type { Metadata } from 'next';

import { ThemeRegistry } from '@/theme';

import './globals.css';

export const metadata: Metadata = {
  title: 'FastAPI NextJS Starter (MUI)',
  description: 'A monorepo starter with FastAPI and Next.js using Material-UI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
