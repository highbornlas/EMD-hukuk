'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-bg">
        <Sidebar open={sidebarOpen} onClose={closeSidebar} />
        <div className="lg:ml-[200px] ml-0 transition-[margin] duration-300">
          <Topbar onToggleSidebar={toggleSidebar} />
          <main className="px-3 sm:px-5 py-4">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
