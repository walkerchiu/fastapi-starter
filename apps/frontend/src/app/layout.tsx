import type { Metadata } from 'next';

import { ThemeScript } from '@/components/providers/theme-script';

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
    <html suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
