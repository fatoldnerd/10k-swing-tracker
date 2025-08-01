import Analytics from '@/components/analytics/Analytics';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <Analytics />
    </ProtectedRoute>
  );
}