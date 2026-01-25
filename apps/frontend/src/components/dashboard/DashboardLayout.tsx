'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Drawer } from '../ui/Drawer';
import { DashboardSidebar, type SidebarNavItem } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { DashboardContent } from './DashboardContent';
import { DashboardFooter } from './DashboardFooter';

export interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarItems?: SidebarNavItem[];
  sidebarActiveKey?: string;
  onSidebarItemClick?: (key: string) => void;
  sidebarHeader?: ReactNode;
  sidebarFooter?: ReactNode;
  header?: ReactNode;
  headerLogo?: ReactNode;
  headerTitle?: string;
  headerActions?: ReactNode;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  footer?: ReactNode;
  footerCopyright?: string;
  footerLinks?: Array<{ label: string; href: string }>;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarCollapse?: (collapsed: boolean) => void;
  sidebarWidth?: number;
  collapsedWidth?: number;
  className?: string;
}

export function DashboardLayout({
  children,
  sidebar,
  sidebarItems = [],
  sidebarActiveKey,
  onSidebarItemClick,
  sidebarHeader,
  sidebarFooter,
  header,
  headerLogo,
  headerTitle,
  headerActions,
  showSearch = false,
  onSearch,
  footer,
  footerCopyright,
  footerLinks,
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  sidebarCollapsed: controlledCollapsed,
  onSidebarCollapse,
  sidebarWidth = 256,
  collapsedWidth = 64,
  className = '',
}: DashboardLayoutProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const collapsed = controlledCollapsed ?? internalCollapsed;
  const handleCollapse = onSidebarCollapse ?? setInternalCollapsed;

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      handleCollapse(!collapsed);
    }
  };

  const currentSidebarWidth = showSidebar
    ? isMobile
      ? 0
      : collapsed
        ? collapsedWidth
        : sidebarWidth
    : 0;

  const sidebarContent = sidebar || (
    <DashboardSidebar
      items={sidebarItems}
      collapsed={isMobile ? false : collapsed}
      onCollapse={isMobile ? undefined : handleCollapse}
      header={sidebarHeader}
      footer={sidebarFooter}
      activeKey={sidebarActiveKey}
      onItemClick={(key) => {
        onSidebarItemClick?.(key);
        if (isMobile) {
          setMobileMenuOpen(false);
        }
      }}
      width={sidebarWidth}
      collapsedWidth={collapsedWidth}
    />
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${className}`}>
      {/* Desktop Sidebar */}
      {showSidebar && !isMobile && sidebarContent}

      {/* Mobile Sidebar Drawer */}
      {showSidebar && isMobile && (
        <Drawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          position="left"
          size="md"
          showCloseButton={true}
        >
          <div className="h-full">
            {sidebar || (
              <DashboardSidebar
                items={sidebarItems}
                collapsed={false}
                header={sidebarHeader}
                footer={sidebarFooter}
                activeKey={sidebarActiveKey}
                onItemClick={(key) => {
                  onSidebarItemClick?.(key);
                  setMobileMenuOpen(false);
                }}
                width={sidebarWidth}
                collapsedWidth={collapsedWidth}
                className="relative border-0"
              />
            )}
          </div>
        </Drawer>
      )}

      {/* Main Content Area */}
      <div
        className="flex min-h-screen flex-col transition-all duration-300"
        style={{ marginLeft: currentSidebarWidth }}
      >
        {/* Header */}
        {showHeader &&
          (header || (
            <DashboardHeader
              logo={headerLogo}
              title={headerTitle}
              showMenuToggle={showSidebar}
              onMenuToggle={handleMenuToggle}
              actions={headerActions}
              showSearch={showSearch}
              onSearch={onSearch}
            />
          ))}

        {/* Content */}
        <DashboardContent>{children}</DashboardContent>

        {/* Footer */}
        {showFooter &&
          (footer || (
            <DashboardFooter copyright={footerCopyright} links={footerLinks} />
          ))}
      </div>
    </div>
  );
}
