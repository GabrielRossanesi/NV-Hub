'use client';

import React, { useState } from 'react';
import Sidebar from '../../components/layout/sidebar';
import Topbar from '../../components/layout/topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top administration bar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Main content route views */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
