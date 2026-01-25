import { type ReactNode } from 'react';
import Link from 'next/link';

export interface DashboardFooterProps {
  children?: ReactNode;
  copyright?: string;
  links?: Array<{ label: string; href: string }>;
  className?: string;
}

export function DashboardFooter({
  children,
  copyright,
  links,
  className = '',
}: DashboardFooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} Company. All rights reserved.`;

  if (children) {
    return (
      <footer
        className={`border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900 ${className}`}
      >
        {children}
      </footer>
    );
  }

  return (
    <footer
      className={`border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {copyright || defaultCopyright}
        </p>
        {links && links.length > 0 && (
          <nav className="flex flex-wrap items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
}
