'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/auth/LandingPage';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;