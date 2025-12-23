import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
