'use client';

import { ReactNode } from 'react';
import Navigation from './Navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen gradient-bg">
      <div className="relative min-h-screen">
        {/* Background overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Main content */}
        <div className="relative z-10">
          {user && <Navigation />}
          <main className={`${user ? 'container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-8' : ''}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}